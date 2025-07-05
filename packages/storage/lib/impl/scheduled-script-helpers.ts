import { scheduledScriptStorage } from './scheduled-script-storage.js';
import type { ScheduledScript } from './scheduled-script-storage.js';

export interface CreateScriptOptions {
  name: string;
  script: string;
  isActive?: boolean;
  maxExecutions?: number;
}

export interface TimeBasedOptions extends CreateScriptOptions {
  delayMs?: number; // Execute after X milliseconds from now
  scheduledTime?: number; // Execute at specific timestamp
}

export interface RepeatingOptions extends CreateScriptOptions {
  intervalMs: number; // Repeat every X milliseconds
  maxExecutions?: number;
}

export class ScheduledScriptHelpers {
  /**
   * Create a script that executes once after a delay
   */
  static async createDelayedScript(options: TimeBasedOptions & { delayMs: number }): Promise<string> {
    const scheduledTime = Date.now() + options.delayMs;

    return await scheduledScriptStorage.addScript({
      name: options.name,
      script: options.script,
      scheduledTime,
      isActive: options.isActive ?? true,
      maxExecutions: options.maxExecutions,
    });
  }

  /**
   * Create a script that executes at a specific time
   */
  static async createScheduledScript(options: TimeBasedOptions & { scheduledTime: number }): Promise<string> {
    return await scheduledScriptStorage.addScript({
      name: options.name,
      script: options.script,
      scheduledTime: options.scheduledTime,
      isActive: options.isActive ?? true,
      maxExecutions: options.maxExecutions,
    });
  }

  /**
   * Create a script that repeats at regular intervals
   */
  static async createRepeatingScript(options: RepeatingOptions): Promise<string> {
    const scheduledTime = Date.now() + options.intervalMs;

    return await scheduledScriptStorage.addScript({
      name: options.name,
      script: options.script,
      scheduledTime,
      isActive: options.isActive ?? true,
      maxExecutions: options.maxExecutions,
      repeatInterval: options.intervalMs,
    });
  }

  /**
   * Create a script that executes every X minutes
   */
  static async createMinuteIntervalScript(options: CreateScriptOptions & { intervalMinutes: number }): Promise<string> {
    return this.createRepeatingScript({
      ...options,
      intervalMs: options.intervalMinutes * 60 * 1000,
    });
  }

  /**
   * Create a script that executes every X hours
   */
  static async createHourIntervalScript(options: CreateScriptOptions & { intervalHours: number }): Promise<string> {
    return this.createRepeatingScript({
      ...options,
      intervalMs: options.intervalHours * 60 * 60 * 1000,
    });
  }

  /**
   * Create a script that executes daily at a specific time
   */
  static async createDailyScript(options: CreateScriptOptions & { hour: number; minute?: number }): Promise<string> {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(options.hour, options.minute ?? 0, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return await scheduledScriptStorage.addScript({
      name: options.name,
      script: options.script,
      scheduledTime: scheduledTime.getTime(),
      isActive: options.isActive ?? true,
      maxExecutions: options.maxExecutions,
      repeatInterval: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  /**
   * Create a script that executes weekly on a specific day and time
   */
  static async createWeeklyScript(
    options: CreateScriptOptions & {
      dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
      hour: number;
      minute?: number;
    },
  ): Promise<string> {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(options.hour, options.minute ?? 0, 0, 0);

    // Calculate days until next occurrence
    const currentDay = now.getDay();
    let daysToAdd = options.dayOfWeek - currentDay;

    if (daysToAdd <= 0) {
      daysToAdd += 7; // Next week
    }

    scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);

    return await scheduledScriptStorage.addScript({
      name: options.name,
      script: options.script,
      scheduledTime: scheduledTime.getTime(),
      isActive: options.isActive ?? true,
      maxExecutions: options.maxExecutions,
      repeatInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Get all scripts with their next execution time
   */
  static async getScriptsWithNextExecution(): Promise<Array<ScheduledScript & { nextExecution: Date | null }>> {
    const scripts = await scheduledScriptStorage.getActiveScripts();

    return scripts.map(script => {
      let nextExecution: Date | null = null;

      if (script.isActive) {
        if (script.repeatInterval && script.lastExecuted) {
          // For repeating scripts, calculate next execution based on last execution
          nextExecution = new Date(script.lastExecuted + script.repeatInterval);
        } else {
          // For one-time scripts, use the scheduled time
          nextExecution = new Date(script.scheduledTime);
        }
      }

      return {
        ...script,
        nextExecution,
      };
    });
  }

  /**
   * Get scripts that are due for execution within the next X minutes
   */
  static async getScriptsDueWithinMinutes(minutes: number): Promise<ScheduledScript[]> {
    const scripts = await scheduledScriptStorage.getScriptsDueForExecution();
    const cutoffTime = Date.now() + minutes * 60 * 1000;

    return scripts.filter(script => {
      if (script.repeatInterval && script.lastExecuted) {
        return script.lastExecuted + script.repeatInterval <= cutoffTime;
      }
      return script.scheduledTime <= cutoffTime;
    });
  }
}

// Export convenience functions
export const createDelayedScript = ScheduledScriptHelpers.createDelayedScript;
export const createScheduledScript = ScheduledScriptHelpers.createScheduledScript;
export const createRepeatingScript = ScheduledScriptHelpers.createRepeatingScript;
export const createMinuteIntervalScript = ScheduledScriptHelpers.createMinuteIntervalScript;
export const createHourIntervalScript = ScheduledScriptHelpers.createHourIntervalScript;
export const createDailyScript = ScheduledScriptHelpers.createDailyScript;
export const createWeeklyScript = ScheduledScriptHelpers.createWeeklyScript;
export const getScriptsWithNextExecution = ScheduledScriptHelpers.getScriptsWithNextExecution;
export const getScriptsDueWithinMinutes = ScheduledScriptHelpers.getScriptsDueWithinMinutes;
