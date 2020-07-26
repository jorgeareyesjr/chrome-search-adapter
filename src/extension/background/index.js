import 'chrome-extension-async';
import {
  createMenu,
  openAdapterWindow
} from './utils';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await createMenu();
  } catch (error) {
    console.log(error);
  }
});

chrome.contextMenus.onClicked.addListener(async ({ menuItemId }, tab) => {
  await chrome.system.display.getInfo({ singleUnified: true }, async (displayInfo) => {
      await openAdapterWindow(menuItemId, tab, displayInfo);
  });
});