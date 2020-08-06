import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/** Establish and handle a long-lived connection with the background script. */
async function connectToBackgroundScript() {
  const handleDisconnect = (port) => {
    port.onMessage.removeListener(handleMessages);
  };
  
  const handleMessages = async (message) => {
    switch (message.type) {
      case "DATA_RESPONSE": {
        const { activeWindows, supportedUrls } =  await message;

        await store.dispatch(actions.setActiveWindows(activeWindows));
        await store.dispatch(actions.setSupportedUrls(supportedUrls));
        await setActiveParentWindowId();
        await setAdapterWindowId();
        
        break;
      };
    };
  };
  const port = chrome.runtime.connect({
    name: `extension-window-script`
  });

  port.onDisconnect.addListener(handleDisconnect);
  port.onMessage.addListener(handleMessages);

  // RFE: Establish some sort of handshake protocol?
  // REF: Perhaps a registry for tracking/syncing extension windows? 
  port.postMessage({
    type: "REQUEST_DATA"
  });
};

/**
 * Use the extension adapter to track the active tab URL and inject the appropriate micro-app.
 * @param {string} activeTabUrl - The active tab's URL.
 * @param {number} activeParentWindowId - The active tab's parent window id.
 * @param {object} supportedUrls - The list of supported URLs.
 */
async function injectMicroApp(activeTabUrl, parentWindowId, supportedUrls) {
  // TODO: Check if the active tab URL is amongst the list of supported urls, if so, render associated extension micro-app.
  let microApp;

  // RFE: Add some logic to filter and return current/future supported micro-apps. Perhaps a switch statement? A Router of some kind?
  microApp = 'chrome-search-adapter';

  async function clearAdapterWindowDOMBody() {
    await window.document.body.childNodes.forEach((node) => {
      node.parentNode.removeChild(node)
    });
  };
  async function injectMicroAppRoot() {
    const root = await window.document.createElement('div');
    root.id = "o-app-root";
    
    await window.document.body.appendChild(root);
  };
  async function injectMicroAppJS() {
    const script = await window.document.createElement('script');
    // TODO: Test production.
    const development = 'http://localhost:8080';
    script.src = `${development}/${microApp}/static/js/app.bundle.js`;
    
    await window.document.body.appendChild(script);
  };

  await clearAdapterWindowDOMBody();
  await injectMicroAppRoot();
  await injectMicroAppJS();
};

/**
 * Check the active tab URL and update the active context.
 * @param {number} tabId - The active tab id.
 * @param {string} url - The active tab URL.
 */
async function setActiveContext(tabId, url) {
  const tab = await chrome.tabs.get(tabId);
  const tabUrl = new URL(url);
  const window = await chrome.windows.get(tab.windowId);

  await store.dispatch(actions.setActiveTabId(tab.id));
  await store.dispatch(actions.setActiveTabUrl(url));
  await store.dispatch(actions.setActiveWindowId(window.id));
};

async function setActiveParentWindowId() {
  const { activeWindows, adapterWindowId } = store.getState();

  function getParentWindowId() {
    for(let i = 0; i < activeWindows.length; i++) {
      if (activeWindows[i].extensionWindowId === adapterWindowId) {
        return activeWindows[i].parentWindowId;
      };
      return null;
    };
  };

  const parentWindowId = getParentWindowId();

  await store.dispatch(actions.setActiveParentWindowId(parentWindowId));
};

/* Set the active Adapter window Id. */
async function setAdapterWindowId() {
  await chrome.windows.getLastFocused({ populate: true }, async (window) => {
    const { id } = window;

    await store.dispatch(actions.setAdapterWindowId(id));
  });
};

export {
  connectToBackgroundScript,
  injectMicroApp,
  setActiveContext,
  setActiveParentWindowId,
  setAdapterWindowId,
};