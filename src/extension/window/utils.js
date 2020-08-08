import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/**
 * Set relevant data required to initialize the extension adapter window.
 * @param {string} activeBrowserTabUrl - The current browsing context tab url.
 * @param {number} parentTabId -The adapter window's parent tab id.
 * @param {number} parentWindowId - The adapter window's parent window id.
 * @param {array} supportedUrls - An array of the supported urls.
 */
async function initExtensionAdapterWindow(activeBrowserTabUrl, parentTabId, parentWindowId, supportedUrls) {
  await store.dispatch(actions.setActiveBrowserTabUrl(activeBrowserTabUrl));
  await chrome.windows.getLastFocused({ populate: true }, async (window) => {
    const { id } = window;
    
    await store.dispatch(actions.setExtensionWindowId(id));
    await store.dispatch(actions.setParentTabId(parentTabId));
    await store.dispatch(actions.setParentWindowId(parentWindowId));
    await store.dispatch(actions.setSupportedUrls(supportedUrls));
  });
  await chrome.tabs.get(parentTabId, async (tab) => {
    const { url } = tab;
    await store.dispatch(actions.setParentTabUrl(url));
  });
};

/**
 * Inject and execute the content script into the current browsing tab context, if it is amongst the list of supported urls.
 * @param {number} tabId - The active browser tab id.
 * SEE: https://developer.chrome.com/extensions/content_scripts#programmatic
 * SEE: https://developer.chrome.com/extensions/tabs#method-executeScript
 */
async function injectContentScript(tabId) {
  const { parentWindowId, supportedUrls } = await store.getState();
  const { url , windowId } = await chrome.tabs.get(tabId);
  const parsedUrl = new URL(url);
  const supportedUrl = supportedUrls.includes(parsedUrl.origin) ? true : false;

  async function injectScript() {
    await injectMicroApp();
    await chrome.tabs.executeScript(tabId, {
      file: 'js/content.bundle.js',
      runAt: 'document_end'
    }, async () => {
      console.log('CONTENT SCRIPT INJECTED: ', parsedUrl, tabId);
      // TODO: Update store/broadcast channel/window, informing it that the content script has connected.
    });
  };

  if(parentWindowId === windowId && supportedUrl) {
    await injectScript();
  } else {
    await injectMicroApp();
  }
};

/** Inject the appropriate micro-app, based off the current browsing context. */
async function injectMicroApp() {
  try {
    const { activeBrowserTabUrl, parentTabId, parentTabUrl, parentWindowId, extensionWindowId, supportedUrls } = await store.getState();
    const parsedUrl = new URL(activeBrowserTabUrl);
    const supportedUrl = supportedUrls.filter(( url ) => url.includes(parsedUrl.origin));
    
    let microApp = null;

    microApp = 'chrome-search-adapter';

    // if(supportedUrl.length > 0) {
    //   const { host } = parsedUrl;
    //   const split = host.split('.');

    //   switch(supportedUrl[0]) {
    //     case "https://duckduckgo.com": {
    //       microApp = `${split[0]}-browsing-utility`;
    //       // http://localhost:8080/duckduckgo-browsing-utility/static/js/app.bundle.js
    //       break;
    //     }
    //     case "https://www.google.com": {
    //       microApp = `${split[1]}-browsing-utility`;
    //       // http://localhost:8080/google-browsing-utility/static/js/app.bundle.js
    //       break;
    //     }
    //   };
    // };

    async function clearAdapterWindowDOMBody() {
      // Remove all existing child nodes from the DOM body.
      await window.document.body.childNodes.forEach((node) => {
        node.parentNode.removeChild(node)
      });
      // Remove any injected <script> nodes.
      // NOTE: `textContent` gets the content of all elements, including <script> and <style> elements.
      window.document.body.textContent = '';
    };
    async function injectMicroAppRoot() {
      const root = await window.document.createElement('div');
      root.id = "o-app-root";
      
      await window.document.body.appendChild(root);
    };
    async function injectMicroAppJS() {
      // TODO: Test production micro-app. 
      const script = await window.document.createElement('script');
      const development = 'http://localhost:8080';
      script.src = `${development}/${microApp}/static/js/app.bundle.js`;

      await window.document.body.appendChild(script);
    };
    async function injectMicroAppStore() {
      // TODO: Consider a broadcast channel to communicate between adapter window and injected micro-app.
      // SEE: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
      // Make current store data global, to let all scripts access it.
      // SEE: https://javascript.info/global-object
      window.__CHROME_WEB_BROWSER_ADAPTER__ = {
        activeBrowserTabUrl,
        parentTabId,
        parentTabUrl,
        parentWindowId,
        extensionWindowId,
        supportedUrls
      };
    };

    await clearAdapterWindowDOMBody();
    await injectMicroAppRoot();
    await injectMicroAppJS();
    await injectMicroAppStore();
  } catch(error) {
    console.log(error);
  };
};

/**
 * Check the active tab URL and update the active browsing context.
 * @param {number} tabId - The active tab id.
 * @param {string} url - The active tab URL.
 * @param {string} action - The event listener that detected the browsing context update.
 */
async function setActiveBrowserContext(tabId, url, action) {
  const tab = await chrome.tabs.get(tabId);
  const window = await chrome.windows.get(tab.windowId);

  await store.dispatch(actions.setActiveBrowserTabId(tab.id));
  await store.dispatch(actions.setActiveBrowserTabUrl(url));
  await store.dispatch(actions.setActiveBrowserWindowId(window.id));

  await injectContentScript(tabId);
};

export {
  initExtensionAdapterWindow,
  injectMicroApp,
  setActiveBrowserContext,
};