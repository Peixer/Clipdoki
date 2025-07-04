import { createStorage, StorageEnum } from '../base/index.js';
import type { ThemeStateType, ThemeStorageType } from '../base/index.js';

const storage = createStorage<ThemeStateType>(
  'theme-storage-key',
  {
    theme: 'light',
    isLight: true,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const exampleThemeStorage: ThemeStorageType = {
  ...storage,
  toggle: async () => {
    await storage.set(currentState => {
      const newTheme = currentState.theme === 'light' ? 'dark' : 'light';

      return {
        theme: newTheme,
        isLight: newTheme === 'light',
      };
    });

    // Inject shake script into current active tab
    try {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:')) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['shake.js'],
        });
      }
    } catch (error) {
      console.log('Failed to inject shake script:', error);
    }
  },
};
