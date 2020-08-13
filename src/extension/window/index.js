import 'chrome-extension-async';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducer';
import { render } from 'react-dom';
import ExtensionAdapter from './ExtensionAdapter';
import * as utils from './utils';

const store = createStore(reducer);
// store.subscribe(async () => {
//   await console.log('state\n', store.getState());
// });

/** 
 * This section is in charge of updating the active context for the extension's adapter window. 
 * SEE: https://developer.chrome.com/extensions/tabs
*/

// Detect when a tab is updated.
// NOTE: This will automatically activate after a new tab or window is created.
chrome.tabs.onUpdated.addListener(async (tabId) => {
  try {
    const action = 'tabs.onUpdated';
    const { parentWindowId } = await store.getState();
    const { id, url, windowId } = await chrome.tabs.get(tabId);

     // Check if active tab context is within the active adapter parent window, if so, update the active context.
    if(parentWindowId === windowId && url) {
      await utils.setActiveBrowserContext(id, url, action);
    };
  } catch (error) {
    console.log(error);
  };  
});

// Detect when the active tab in a window changes.
// NOTE: This will automatically activate after a tab is attached/detached from a window.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const action = 'tabs.onActivated';
    const { parentWindowId } = await store.getState();
    const { id, url, windowId } = await chrome.tabs.get(tabId);

     // Check if active tab context is within the active adapter parent window, if so, update the active context.
    if(parentWindowId === windowId && url) {
      await utils.setActiveBrowserContext(id, url, action);
    };
  } catch (error) {
    console.log(error)
  };
});

const main = document.createElement('div');
document.body.appendChild(main);

// Initialize the extension adapter.
(async () => {
  try {
    await chrome.runtime.sendMessage({
      type: "INIT_EXTENSION_ADAPTER_WINDOW"
    }, async ({ activeBrowserTabUrl, parentTabId, parentWindowId, supportedUrls }) => {
      await utils.initExtensionAdapterWindow(activeBrowserTabUrl, parentTabId, parentWindowId, supportedUrls);

      setTimeout(async () => {
        await render(
          <Provider store={store}>
            <ExtensionAdapter />
          </Provider>,
          main
        );
      }, 0);
    });
  } catch (err) {
    console.error(chrome.runtime.lastError);
  };
})();

export { store };
