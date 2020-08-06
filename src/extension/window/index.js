import 'chrome-extension-async';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import actions from './actions';
import reducer from './reducer';
import { render } from 'react-dom';
import Adapter from './Adapter';
import * as utils from './utils';

const store = createStore(reducer);
// store.subscribe(async () => {
//   await console.log('state\n', store.getState());
// });

/** 
 * This section is in charge of monitoring URL changes. 
 * SEE: https://developer.chrome.com/extensions/tabs
*/

// Detect when a tab is updated.
// NOTE: This will automatically activate after a new tab or window is created.
chrome.tabs.onUpdated.addListener(async (tabId, { status, url }, tab) => {
  // NOTE: The `url` parameter will only return a value if the tab's URL has changed, otherwise it will return `undefined`.
  try {
    if (status === 'complete') {
      const activeTab = await chrome.tabs.get(tabId);
      const { id, url } = activeTab;

      if (activeTab.url) {
        await utils.setActiveContext(id, url);
      };
    }
  } catch (error) {
    console.log(error);
  };
});

// Detect when the active tab in a window changes.
// NOTE: This will automatically activate after a tab is attached/detached from a window.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const activeTab = await chrome.tabs.get(tabId);
    const { id, url } = activeTab;

    if (activeTab.url) {
      await utils.setActiveContext(id, url);
    };
  } catch (error) {
    console.log(error)
  };
});

utils.connectToBackgroundScript();


// Initialize the extension adapter.
const main = document.createElement('div');
document.body.appendChild(main);

render(
  <Provider store={store}>
    <Adapter />
  </Provider>,
  main
);

export { store };
