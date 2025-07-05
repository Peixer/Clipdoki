import {
  createDelayedScript,
  createRepeatingScript,
  createDailyScript,
  createWeeklyScript,
} from './scheduled-script-helpers.js';
import { scheduledScriptStorage } from './scheduled-script-storage.js';

/**
 * Example usage patterns for scheduled script storage
 */
export class ScheduledScriptExamples {
  /**
   * Example: Create a script that shows an alert after 5 seconds
   */
  static async createAlertAfterDelay(): Promise<string> {
    const scriptId = await createDelayedScript({
      name: 'Delayed Alert',
      script: `
        alert('This alert was scheduled 5 seconds ago!');
        console.log('Scheduled alert executed at:', new Date().toISOString());
      `,
      delayMs: 5000, // 5 seconds
    });

    console.log('Created delayed alert script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that refreshes the page every 30 minutes
   */
  static async createPageRefreshScript(): Promise<string> {
    const scriptId = await createRepeatingScript({
      name: 'Auto Page Refresh',
      script: `
        alert('Good morning! Time to start your day!');
        console.log('Daily reminder executed at:', new Date().toISOString());
      `,
      intervalMs: 1 * 1000, // 30 minutes
      maxExecutions: 10, // Stop after 10 refreshes
    });

    console.log('Created page refresh script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that runs daily at 9 AM
   */
  static async createDailyReminder(): Promise<string> {
    const scriptId = await createDailyScript({
      name: 'Daily Morning Reminder',
      script: `
        alert('Good morning! Time to start your day!');
        console.log('Daily reminder executed at:', new Date().toISOString());
      `,
      hour: 9, // 9 AM
      minute: 0,
    });

    console.log('Created daily reminder script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that runs every Monday at 2 PM
   */
  static async createWeeklyMeetingReminder(): Promise<string> {
    const scriptId = await createWeeklyScript({
      name: 'Weekly Team Meeting',
      script: `
        alert('Weekly team meeting starts in 5 minutes!');
        console.log('Weekly meeting reminder executed at:', new Date().toISOString());
      `,
      dayOfWeek: 1, // Monday
      hour: 14, // 2 PM
      minute: 0,
    });

    console.log('Created weekly meeting reminder script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that changes page background color periodically
   */
  static async createBackgroundColorChanger(): Promise<string> {
    const scriptId = await createRepeatingScript({
      name: 'Background Color Changer',
      script: `
        const colors = ['#ffebee', '#e8f5e8', '#fff3e0', '#f3e5f5', '#e0f2f1'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.backgroundColor = randomColor;
        console.log('Changed background color to:', randomColor);
      `,
      intervalMs: 10 * 60 * 1000, // 10 minutes
    });

    console.log('Created background color changer script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that saves current page to bookmarks
   */
  static async createAutoBookmarkScript(): Promise<string> {
    const scriptId = await createRepeatingScript({
      name: 'Auto Bookmark Current Page',
      script: `
        const currentUrl = window.location.href;
        const currentTitle = document.title;
        
        // Create bookmark using Chrome extension API
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
          chrome.bookmarks.create({
            title: currentTitle,
            url: currentUrl
          }, (bookmark) => {
            console.log('Auto-bookmarked:', currentTitle, 'at', new Date().toISOString());
          });
        } else {
          console.log('Chrome bookmarks API not available');
        }
      `,
      intervalMs: 60 * 60 * 1000, // 1 hour
      maxExecutions: 5, // Only bookmark 5 times
    });

    console.log('Created auto bookmark script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that takes a screenshot
   */
  static async createScreenshotScript(): Promise<string> {
    const scriptId = await createRepeatingScript({
      name: 'Periodic Screenshot',
      script: `
        // This would require additional permissions and implementation
        console.log('Screenshot script executed at:', new Date().toISOString());
        alert('Screenshot functionality would be implemented here');
      `,
      intervalMs: 2 * 60 * 60 * 1000, // 2 hours
      maxExecutions: 3, // Take 3 screenshots
    });

    console.log('Created screenshot script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Create a script that fills out a form
   */
  static async createFormFillerScript(): Promise<string> {
    const scriptId = await createDelayedScript({
      name: 'Auto Form Filler',
      script: `
        // Example form filling script
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
        inputs.forEach((input, index) => {
          if (input.type === 'email') {
            input.value = 'test@example.com';
          } else {
            input.value = 'Auto-filled text ' + (index + 1);
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        console.log('Form filled automatically at:', new Date().toISOString());
      `,
      delayMs: 3000, // Wait 3 seconds for page to load
    });

    console.log('Created form filler script with ID:', scriptId);
    return scriptId;
  }

  /**
   * Example: Get all active scripts and their next execution times
   */
  static async listAllActiveScripts(): Promise<void> {
    const scripts = await scheduledScriptStorage.getActiveScripts();

    console.log('Active scheduled scripts:');
    scripts.forEach(script => {
      const nextExecution =
        script.repeatInterval && script.lastExecuted
          ? new Date(script.lastExecuted + script.repeatInterval)
          : new Date(script.scheduledTime);

      console.log(`- ${script.name} (ID: ${script.id})`);
      console.log(`  Next execution: ${nextExecution.toLocaleString()}`);
      console.log(`  Executions: ${script.executionCount}`);
      console.log(`  Active: ${script.isActive}`);
      console.log('---');
    });
  }

  /**
   * Example: Clean up completed scripts
   */
  static async cleanupCompletedScripts(): Promise<void> {
    const beforeCount = (await scheduledScriptStorage.getActiveScripts()).length;
    await scheduledScriptStorage.clearCompletedScripts();
    const afterCount = (await scheduledScriptStorage.getActiveScripts()).length;

    console.log(`Cleaned up ${beforeCount - afterCount} completed scripts`);
  }

  /**
   * Example: Toggle a specific script on/off
   */
  static async toggleScriptById(scriptId: string): Promise<void> {
    await scheduledScriptStorage.toggleScript(scriptId);
    const script = await scheduledScriptStorage.getScript(scriptId);

    if (script) {
      console.log(`Script "${script.name}" is now ${script.isActive ? 'active' : 'inactive'}`);
    }
  }
}

// Export individual example functions for easy access
export const createAlertAfterDelay = ScheduledScriptExamples.createAlertAfterDelay;
export const createPageRefreshScript = ScheduledScriptExamples.createPageRefreshScript;
export const createDailyReminder = ScheduledScriptExamples.createDailyReminder;
export const createWeeklyMeetingReminder = ScheduledScriptExamples.createWeeklyMeetingReminder;
export const createBackgroundColorChanger = ScheduledScriptExamples.createBackgroundColorChanger;
export const createAutoBookmarkScript = ScheduledScriptExamples.createAutoBookmarkScript;
export const createScreenshotScript = ScheduledScriptExamples.createScreenshotScript;
export const createFormFillerScript = ScheduledScriptExamples.createFormFillerScript;
export const listAllActiveScripts = ScheduledScriptExamples.listAllActiveScripts;
export const cleanupCompletedScripts = ScheduledScriptExamples.cleanupCompletedScripts;
export const toggleScriptById = ScheduledScriptExamples.toggleScriptById;
