import { scheduledScriptStorage } from '@extension/storage';
import type { ScheduledScript } from '@extension/storage';

class ScriptExecutor {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 1000; // Check every 1 second

  constructor() {
    // this.startMonitoring();
  }

  public startMonitoring(): void {
    // console.log('00000');
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    // console.log('1111');

    this.checkInterval = setInterval(async () => {
      await this.checkAndExecuteScripts();
    }, this.CHECK_INTERVAL_MS);

    // console.log('2222');

    // Also check immediately on startup
    this.checkAndExecuteScripts();
  }

  private async checkAndExecuteScripts(): Promise<void> {
    try {
      const scriptsToExecute = await scheduledScriptStorage.getScriptsDueForExecution();

      for (const script of scriptsToExecute) {
        await this.executeScript(script);
      }
    } catch (error) {
      console.error('Error checking for scheduled scripts:', error);
    }
  }

  private async executeScript(script: ScheduledScript): Promise<void> {
    try {
      console.log(`Executing scheduled script: ${script.name} (ID: ${script.id})`);

      // Get the current active tab
      const [activeTab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
      });

      if (!activeTab?.id || !activeTab.url) {
        console.warn('No active tab found for script execution');
        return;
      }

      // Check if the tab URL is valid for script injection
      if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('about:')) {
        console.warn('Cannot inject script into chrome:// or about: pages');
        return;
      }

      console.log('activeTab', activeTab);
      console.log('script', script);

      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:')) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (scriptName: string) => {
            // Your script logic here
            console.log('Executing script with argument:', scriptName);

            // Create and play notification sound with autoplay policy compliance
            const audio = new Audio(chrome.runtime.getURL('nudge.mp3'));
            audio.play().catch(e => console.log('Audio play failed:', e));

            // Get existing notifications container or create new one
            let container = document.getElementById('script-notifications');
            if (!container) {
              container = document.createElement('div');
              container.id = 'script-notifications';
              container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column-reverse;
                gap: 10px;
                z-index: 10000;
              `;
              document.body.appendChild(container);
            }

            // Create and style modal element
            const modal = document.createElement('div');
            modal.style.cssText = `
              background: white;
              padding: 15px 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 14px;
              max-width: 300px;
              animation: slideIn 0.3s ease-out;
            `;

            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `;
            document.head.appendChild(style);

            // Set modal content with unmute button
            modal.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                <span>${scriptName}</span> 
              </div>
            `;

            // Add to container and remove after delay
            container.appendChild(modal);
            setTimeout(() => {
              modal.style.animation = 'slideIn 0.3s ease-out reverse';
              setTimeout(() => modal.remove(), 300);
              // Remove container if empty
              if (!container.hasChildNodes()) {
                container.remove();
              }
            }, 5000);
          },
          args: ['Good morning! Time to start your day!'],
        });
      }

      // Mark the script as executed
      await scheduledScriptStorage.markScriptExecuted(script.id);

      console.log(`Successfully executed script: ${script.name}`);

      // Show a notification to the user
      await this.showNotification(script);
    } catch (error) {
      console.error(`Error executing script ${script.name}:`, error);

      // Show error notification
      await this.showErrorNotification(script, error);
    }
  }

  private createScriptFunction(scriptCode: string): (scriptName: string) => void {
    return (scriptName: string) => {
      try {
        console.log('scriptCode', scriptCode);

        // Execute the script code directly
        const result = eval(`(() => {alert('Good morning! Time to start your day!');})()`);

        // Log the execution
        console.log(`Scheduled script "${scriptName}" executed successfully`);

        // You can add more logging or result handling here
        if (result !== undefined) {
          console.log(`Script "${scriptName}" returned:`, result);
        }
      } catch (error) {
        console.error(`Error executing scheduled script "${scriptName}":`, error);
        throw error; // Re-throw to be caught by the background script
      }
    };
  }

  private async showNotification(script: ScheduledScript): Promise<void> {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'Script Executed',
        message: `Scheduled script "${script.name}" has been executed successfully.`,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private async showErrorNotification(script: ScheduledScript, error: unknown): Promise<void> {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'Script Execution Failed',
        message: `Failed to execute scheduled script "${script.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } catch (notificationError) {
      console.error('Error showing error notification:', notificationError);
    }
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public async addScript(scriptData: {
    name: string;
    script: string;
    scheduledTime: number;
    isActive?: boolean;
    maxExecutions?: number;
    repeatInterval?: number;
  }): Promise<string> {
    return await scheduledScriptStorage.addScript({
      ...scriptData,
      isActive: scriptData.isActive ?? true,
    });
  }

  public async removeScript(id: string): Promise<void> {
    await scheduledScriptStorage.removeScript(id);
  }

  public async getActiveScripts(): Promise<ScheduledScript[]> {
    return await scheduledScriptStorage.getActiveScripts();
  }

  public async toggleScript(id: string): Promise<void> {
    await scheduledScriptStorage.toggleScript(id);
  }
}

export const scriptExecutor = new ScriptExecutor();
