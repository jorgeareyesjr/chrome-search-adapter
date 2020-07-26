import 'chrome-extension-async';

import {
  createMenu
} from './utils';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await createMenu();
  } catch (error) {
    console.log(error);
  }
});