import 'chrome-extension-async';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './reducer';
import { render } from 'react-dom';
import Adapter from './Adapter';
import * as utils from './utils';

const store = createStore(reducer);
// store.subscribe(async () => {
//   await console.log('state\n', store.getState());
//   // debugger;
// });

/** 
 * This section is in charge of updating the active browsing context for the extension's adapter window. 
 * SEE: https://developer.chrome.com/extensions/tabs
*/

// Detect when a tab is updated.
// NOTE: This will automatically activate after a new tab or window is created.
chrome.tabs.onUpdated.addListener(async (tabId, { url }) => {
  try {
    const { parentWindowId } = await store.getState();
    const activeTab = await chrome.tabs.get(tabId);
    const { id, windowId } = activeTab;

    // Update the active browsing context if the active tab is on the parent window.
    if(parentWindowId === windowId && url) {
      const action = 'tabs.onUpdated';
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
    const { parentWindowId } = await store.getState();
    const { id, url, windowId } = await chrome.tabs.get(tabId);
    
    // Update the active browsing context if the active tab is on the parent window.
    if(parentWindowId === windowId && url) {
      const action = 'tabs.onActivated';
      await utils.setActiveBrowserContext(id, url, action);
    };
  } catch (error) {
    console.log(error)
  };
});

const main = document.createElement('div');
document.body.appendChild(main);

// Initialize the extension's adapter window.
(async () => {
  try {
    await chrome.runtime.sendMessage({
      type: "INIT_EXTENSION_ADAPTER_WINDOW"
    }, async ({ activeBrowserTabId, activeBrowserTabUrl, activeBrowserWindowId, supportedUrls }) => {
      // Receive data from the background script and pass to the adapter as it initializes.
      await utils.setAdapterIdentity(activeBrowserTabId, activeBrowserWindowId);
      await utils.setSupportedUrls(supportedUrls);
      await utils.setActiveBrowserContext(activeBrowserTabId, activeBrowserTabUrl, "INIT");
      
      await render(
        <Provider store={store}>
          <Adapter />
        </Provider>,
        main
      );
    });
  } catch (err) {
    console.error(chrome.runtime.lastError);
  };
})();

export { store };
