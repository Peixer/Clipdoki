import 'webextension-polyfill';

import { scriptExecutor } from './script-executor.js';
import { shakeAndPlaySound } from './shake-utils.js';
import { exampleThemeStorage } from '@extension/storage';

// Initialize theme storage
exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});
scriptExecutor.startMonitoring();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEND_NUDGE') {
    handleNudgeRequest();
    sendResponse({ success: true });
  }
});

const handleNudgeRequest = async () => {
  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });

    if (!activeTab?.id || !activeTab.url) {
      console.warn('No active tab found for nudge');
      return;
    }

    // Check if the tab URL is valid for script injection
    if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('about:')) {
      console.warn('Cannot inject nudge script into chrome:// or about: pages');
      return;
    }

    // Use shared utility to shake and play sound
    await shakeAndPlaySound(activeTab.id);

    console.log('Nudge sent successfully');
  } catch (error) {
    console.error('Error sending nudge:', error);
  }
};

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
