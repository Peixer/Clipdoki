/**
 * Shared utility functions for shaking pages and playing sounds
 */

export const shakePage = async (tabId: number): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['shake.js'],
    });
  } catch (error) {
    console.error('Error shaking page:', error);
  }
};

export const playNudgeSound = async (tabId: number): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const audio = new Audio(chrome.runtime.getURL('nudge.mp3'));
        audio.play().catch(e => console.log('Audio play failed:', e));
      },
    });
  } catch (error) {
    console.error('Error playing nudge sound:', error);
  }
};

export const shakeAndPlaySound = async (tabId: number): Promise<void> => {
  await Promise.all([shakePage(tabId), playNudgeSound(tabId)]);
};
