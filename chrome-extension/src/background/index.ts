import 'webextension-polyfill';

import { scriptExecutor } from './script-executor.js';
import { exampleThemeStorage } from '@extension/storage';

// Initialize theme storage
exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});
scriptExecutor.startMonitoring();

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
