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
          files: ['shake.js'],
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

        // Create a safe execution context
        const scriptFunction = new Function(scriptCode);
        const result = scriptFunction();

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

  private async showErrorNotification(script: ScheduledScript, error: any): Promise<void> {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'Script Execution Failed',
        message: `Failed to execute scheduled script "${script.name}": ${error.message || 'Unknown error'}`,
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
