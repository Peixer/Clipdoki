import 'webextension-polyfill';

import { scriptExecutor } from './script-executor.js';
import { createPageRefreshScript, exampleThemeStorage } from '@extension/storage';

// Initialize theme storage
exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});
scriptExecutor.startMonitoring();

// Initialize script executor (starts monitoring automatically)
console.log('Script executor initialized');

createPageRefreshScript();

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
