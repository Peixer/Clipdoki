import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface ScheduledScript {
  id: string;
  name: string;
  script: string;
  scheduledTime: number; // Unix timestamp
  isActive: boolean;
  lastExecuted?: number; // Unix timestamp
  executionCount: number;
  maxExecutions?: number; // Optional limit on executions
  repeatInterval?: number; // Optional repeat interval in milliseconds
  createdAt: number;
  updatedAt: number;
}

interface ScheduledScriptState {
  scripts: ScheduledScript[];
  nextExecutionTime?: number; // For optimization - next script to execute
}

type ScheduledScriptStorageType = BaseStorageType<ScheduledScriptState> & {
  addScript: (script: Omit<ScheduledScript, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>) => Promise<string>;
  removeScript: (id: string) => Promise<void>;
  updateScript: (id: string, updates: Partial<Omit<ScheduledScript, 'id' | 'createdAt'>>) => Promise<void>;
  getScript: (id: string) => Promise<ScheduledScript | null>;
  getActiveScripts: () => Promise<ScheduledScript[]>;
  getScriptsDueForExecution: () => Promise<ScheduledScript[]>;
  markScriptExecuted: (id: string) => Promise<void>;
  toggleScript: (id: string) => Promise<void>;
  clearCompletedScripts: () => Promise<void>;
};

const storage = createStorage<ScheduledScriptState>(
  'scheduled-script-storage-key',
  {
    scripts: [],
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const generateId = (): string => `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentTimestamp = (): number => Date.now();

const scheduledScriptStorage: ScheduledScriptStorageType = {
  ...storage,

  addScript: async scriptData => {
    const id = generateId();
    const now = getCurrentTimestamp();

    const newScript: ScheduledScript = {
      ...scriptData,
      id,
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
    };

    await storage.set(currentState => ({
      ...currentState,
      scripts: [...currentState.scripts, newScript],
    }));

    return id;
  },

  removeScript: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      scripts: currentState.scripts.filter(script => script.id !== id),
    }));
  },

  updateScript: async (id: string, updates: Partial<Omit<ScheduledScript, 'id' | 'createdAt'>>) => {
    await storage.set(currentState => ({
      ...currentState,
      scripts: currentState.scripts.map(script =>
        script.id === id ? { ...script, ...updates, updatedAt: getCurrentTimestamp() } : script,
      ),
    }));
  },

  getScript: async (id: string) => {
    const state = await storage.get();
    return state.scripts.find(script => script.id === id) || null;
  },

  getActiveScripts: async () => {
    const state = await storage.get();
    return state.scripts.filter(script => script.isActive);
  },

  getScriptsDueForExecution: async () => {
    console.log('staty');
    const state = await storage.get();
    console.log('state', state);

    const now = getCurrentTimestamp();
    console.log('now', now);

    return state.scripts.filter(script => {
      if (!script.isActive) return false;

      // Check if script is due for execution
      if (script.scheduledTime > now) return false;

      // Check if script has reached max executions
      if (script.maxExecutions && script.executionCount >= script.maxExecutions) return false;

      // Check if it's time for next execution (for repeating scripts)
      if (script.repeatInterval && script.lastExecuted) {
        const nextExecutionTime = script.lastExecuted + script.repeatInterval;
        if (nextExecutionTime > now) return false;
      }

      return true;
    });
  },

  markScriptExecuted: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      scripts: currentState.scripts.map(script => {
        if (script.id !== id) return script;

        const now = getCurrentTimestamp();
        const newExecutionCount = script.executionCount + 1;

        // If script has max executions and reached limit, deactivate it
        const isActive = script.maxExecutions ? newExecutionCount < script.maxExecutions : script.isActive;

        // Calculate next execution time for repeating scripts
        let nextScheduledTime = script.scheduledTime;
        if (script.repeatInterval && isActive) {
          nextScheduledTime = now + script.repeatInterval;
        }

        return {
          ...script,
          lastExecuted: now,
          executionCount: newExecutionCount,
          isActive,
          scheduledTime: nextScheduledTime,
          updatedAt: now,
        };
      }),
    }));
  },

  toggleScript: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      scripts: currentState.scripts.map(script =>
        script.id === id ? { ...script, isActive: !script.isActive, updatedAt: getCurrentTimestamp() } : script,
      ),
    }));
  },

  clearCompletedScripts: async () => {
    await storage.set(currentState => ({
      ...currentState,
      scripts: currentState.scripts.filter(script => {
        // Remove scripts that have reached max executions
        if (script.maxExecutions && script.executionCount >= script.maxExecutions) {
          return false;
        }

        // Remove one-time scripts that have been executed
        if (!script.repeatInterval && script.executionCount > 0) {
          return false;
        }

        return true;
      }),
    }));
  },
};

export type { ScheduledScript, ScheduledScriptState, ScheduledScriptStorageType };
export { scheduledScriptStorage };
