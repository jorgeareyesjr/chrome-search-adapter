import 'chrome-extension-async';
import { createStore } from 'redux';
import actions from './actions';
import reducer from './reducer';
import * as utils from './utils';

const store = createStore(reducer);

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await utils.setDefaultSettings();
    await utils.createMenu();
  } catch (error) {
    console.log(error);
  };
});

chrome.contextMenus.onClicked.addListener(async ({ menuItemId }) => {
  await chrome.system.display.getInfo({ singleUnified: true }, async (displayInfo) => {
    await utils.snapWindows(menuItemId, displayInfo);
  });
});

/** 
 * This section is in charge of checking if extension actions that can be taken on the current page. 
 * SEE: https://developer.chrome.com/extensions/tabs
 * SEE: https://developer.chrome.com/extensions/windows
*/

// Check when a tab is updated.
// NOTE: This will automatically activate after a new tab or window is created.
chrome.tabs.onUpdated.addListener(async (tabId, { status }) => {
  try {
    if (status === 'complete') {
      const activeTab = await chrome.tabs.get(tabId);
      const { id, url } = activeTab;

      if (activeTab.url) {
        await utils.checkTabUrl(id, url);
      };
    }
  } catch (error) {
    console.log(error);
  };
});

// Check when the active tab in a window changes.
// NOTE: This will automatically activate after a tab is attached/detached from a window.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const activeTab = await chrome.tabs.get(tabId);
    const { id, url } = activeTab;

    if (activeTab.url) {
      await utils.checkTabUrl(id, url);
    };
  } catch (error) {
    console.log(error)
  };
});

// Check when the currently focused window changes.
// NOTE: This will automatically activate after a window is created/destroyed.
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // NOTE: When preceding a switch from one chrome window to another, the `windowId` value is -1.
  if (windowId !== -1) {
    try {
      const activeWindow = await chrome.windows.get(windowId, { populate: true });
      const activeTab = activeWindow.tabs.find((tab) => tab.active);
      const { id, url } = activeTab;

      if (activeTab.url) {
        await utils.checkTabUrl(id, url);
      };
    } catch (error) {
      console.log(error);
    };
  };
});

// Remove closed extension windows from `store`.
chrome.windows.onRemoved.addListener(async (windowId) => {
  const activeWindowSet = await utils.checkActiveWindows(windowId);

  if (activeWindowSet) {
    const { parentWindowId, extensionWindowId } = activeWindowSet;
    
    if (windowId === parentWindowId) {
      // If an extension window's associated parent chrome window is closed, remove the extension window from the `store`.
      await chrome.windows.remove(extensionWindowId);
      await store.dispatch(actions.deleteWindow(extensionWindowId));
    } else if (windowId === extensionWindowId) {
      // If an extension window is closed, remove the extension window entry from the `store`.
      await store.dispatch(actions.deleteWindow(extensionWindowId));
    };
  };
});

/** 
 * This section is in charge of connecting and passing data between the extension's window and background scripts.
 * SEE: https://developer.chrome.com/extensions/messaging
 */
chrome.runtime.onConnect.addListener(async (port) => {
  try {
    if (port.name === 'extension-window-script') {
      utils.handleWindowScriptConnection(port);
    };
  } catch(error) {
    console.log(error);
  };
});

export { store };