import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/** Inject the appropriate app/UI, based off the active browsing context. */
async function injectApp() {
  try {
    let appName = null;
    let appHost = null;

    const { activeBrowserTabId, activeBrowserTabUrl, activeBrowserWindowId, DOMSearchResults, extensionWindowId, parentTabId, parentWindowId, supportedUrls } = store.getState();

    // Check if the active tab context url is amongst the list of supported urls.
    const { host, origin } = new URL(activeBrowserTabUrl);
    const filteredUrls = supportedUrls.filter((url) => url.includes(origin));

    // Inject the appropriate app if a supported url is detected.
    if(filteredUrls.length) {
      const hostComponent = host.split('.');

      switch(origin) {
        // TODO
        // case "https://duckduckgo.com": {
        //   appName = `${hostComponent[0]}-browsing-utility`;
        //   appHost = `http://localhost:3000`;
          
        //   break;
        // }
        case "https://www.google.com": {
          appName = `${hostComponent[1]}-browsing-utility`;
          appHost = `http://localhost:3000`;

          break;
        }
      };
    } else {
      appName = `chrome-web-browser-adapter`;
      appHost = `http://localhost:8080`;
    };

    async function clearAdapterWindowDOMBody() {
      // Remove all existing child nodes from the DOM body.
      await window.document.body.childNodes.forEach((node) => {
        node.parentNode.removeChild(node)
      });
      // Remove any injected <script> nodes.
      // NOTE: `textContent` gets the content of all elements, including <script> and <style> elements.
      window.document.body.textContent = '';
    };
    async function injectAppRoot() {
      const root = await window.document.createElement('div');
      root.id = "root";

      await window.document.body.appendChild(root);;
    };
    async function injectAppScripts() {
      // NOTE: Ensure to use 'localhost' scripts when in development.
      // NOTE: Ensure to use the gh-pages published js scripts when in production.
      // SEE: https://jorgeareyesjr.github.io/google-browsing-utility/
      switch(appName) {
        case "chrome-web-browser-adapter": {
          /* Localhost scripts */
          const script = await window.document.createElement('script');

          script.src = `${appHost}/${appName}/static/js/app.bundle.js`;

          await window.document.body.appendChild(script);

          // TODO: Publish into a github repo using 'gh-pages'.
          /* Published scripts */
          break;
        }
        case "google-browsing-utility": {
          /* Localhost scripts */
          const script1 = await window.document.createElement('script');
          const script2 = await window.document.createElement('script');
          const script3 = await window.document.createElement('script');
          const script4 = await window.document.createElement('script');

          script1.src = `${appHost}/${appName}/static/js/bundle.js`;
          script2.src = `${appHost}/${appName}/static/js/0.chunk.js`;
          script3.src = `${appHost}/${appName}/static/js/1.chunk.js`;
          script4.src = `${appHost}/${appName}/static/js/main.chunk.js`;

          await window.document.body.appendChild(script1);
          await window.document.body.appendChild(script2);
          await window.document.body.appendChild(script3);
          await window.document.body.appendChild(script4);

          /* Published scripts */
          // const script1 = await window.document.createElement('script');
          // const script2 = await window.document.createElement('script');
          // const script3 = await window.document.createElement('script');

          // // This inline script is required to run published app.
          // script1.text = `!function(e){function t(t){for(var n,i,l=t[0],f=t[1],a=t[2],c=0,s=[];c<l.length;c++)i=l[c],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&s.push(o[i][0]),o[i]=0;for(n in f)Object.prototype.hasOwnProperty.call(f,n)&&(e[n]=f[n]);for(p&&p(t);s.length;)s.shift()();return u.push.apply(u,a||[]),r()}function r(){for(var e,t=0;t<u.length;t++){for(var r=u[t],n=!0,l=1;l<r.length;l++){var f=r[l];0!==o[f]&&(n=!1)}n&&(u.splice(t--,1),e=i(i.s=r[0]))}return e}var n={},o={1:0},u=[];function i(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=e,i.c=n,i.d=function(e,t,r){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)i.d(r,n,function(t){return e[t]}.bind(null,n));return r},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/google-browsing-utility/";var l=this["webpackJsonpgoogle-browsing-utility"]=this["webpackJsonpgoogle-browsing-utility"]||[],f=l.push.bind(l);l.push=t,l=l.slice();for(var a=0;a<l.length;a++)t(l[a]);var p=f;r()}([])`;
          // script2.src = `https://jorgeareyesjr.github.io/google-browsing-utility/static/js/2.29e963e1.chunk.js`;
          // script3.src = `https://jorgeareyesjr.github.io/google-browsing-utility/static/js/main.e9cdc71b.chunk.js`;

          // await window.document.body.appendChild(script1);
          // await window.document.body.appendChild(script2);
          // await window.document.body.appendChild(script3);

          break;
        }
      };
    };
    async function injectAppStore() {
      // NOTE: This will only attach to the extension adapter window, not accessible to other windows. Consider other possible solutions.
      // TODO: Consider a broadcast channel to communicate between adapter window and injected micro-app.
      // SEE: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
      // Make current store data global, to let all scripts access it.
      // SEE: https://javascript.info/global-object
      window.__CHROME_WEB_BROWSER_ADAPTER__ = {
        activeBrowserTabId,
        activeBrowserTabUrl,
        activeBrowserWindowId,
        DOMSearchResults,
        extensionWindowId,
        parentTabId,
        parentWindowId,
        supportedUrls
      };
    };

    await clearAdapterWindowDOMBody();
    await injectAppRoot();
    await injectAppScripts();
    await injectAppStore();
  } catch(error) {
    console.log(error);
  };
};

/**
 * Inject and execute the extension's content script into the current browser tab and establish a long-lived connection between the window script and content script.
 * @param {number} tabId - The active browser tab id.
 * SEE: https://developer.chrome.com/extensions/content_scripts#programmatic
 * SEE: https://developer.chrome.com/extensions/tabs#method-executeScript
 * SEE: https://developer.chrome.com/extensions/tabs#method-connect
 */
async function injectContentScript(tabId) {
  // NOTE: Attach the long-lived connection port to the extension adapter's window object as a global variable, this will allow the adapter to easily track existing port(s) and prevent creating duplicates.
  // SEE: https://javascript.info/global-object
  try {
    // Disconnect any existing adapter window port(s), if applicable, to prevent creating duplicates.
    if (window.__CHROME_WEB_BROWSER_ADAPTER_PORT__) {
      await  window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.disconnect();
      window.__CHROME_WEB_BROWSER_ADAPTER_PORT__ = null;
    };

    // Inject the content script into the current browsing tab context, initializing a long-lived communication port with the content script.
    await chrome.tabs.executeScript(tabId, {
      file: 'js/content.bundle.js',
      runAt: 'document_end'
    });

    async function handleAdapterPortConnection() {
      const handleDisconnect = () => {
        window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.onMessage.removeListener(handleMessages);
      };
            
      const handleMessages = async (message) => {;
        switch(message.type) {
          case "CURRENT URL CONTEXT RESPONSE": {
            const url = new URL(message.contextUrl);

            // Detect if the current context will yield DOM search result DOM nodes.
            if(url.pathname === '/search') {
              // Send a message to the content script requesting the search results from the current context DOM.
              await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                type: "REQUEST SEARCH RESULTS"
              });
            } else {
              // This context will not yield any DOM search result DOM nodes - clean up any previous node references on context changes.
              await store.dispatch(actions.setDOMSearchResults(null));

              await injectApp();
            };

            break;
          };
          case "SEARCH RESULT RESPONSE": {
            const { DOMElements } = message;

            await store.dispatch(actions.setDOMSearchResults(DOMElements));
            await injectApp();

            break;
          };
        };
      };

      window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.onDisconnect.addListener(handleDisconnect);
      window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.onMessage.addListener(handleMessages);
    };

    // Establish a long-lived connection to the content script.
    window.__CHROME_WEB_BROWSER_ADAPTER_PORT__ = await chrome.tabs.connect(tabId, { name: `chrome-web-browser-adapter-port` });

    await handleAdapterPortConnection();

    // Send a message to the content script requesting the active url context, using the long-lived connection port attached to the adapter window.
    await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
      type: "REQUEST CURRENT URL CONTEXT"
    });
  } catch (error) {
    console.log(error);
  };
};

/**
 * Check the active tab url and update the active browsing context - If a supported url is detected, inject the extension's content script.
 * @param {number} tabId - The active tab id.
 * @param {string} url - The active tab URL.
 * @param {string} action - The event listener that triggered the browsing context update.
 */
async function setActiveBrowserContext(tabId, url, action) {
  const { parentWindowId, supportedUrls } = await store.getState();
  const tab = await chrome.tabs.get(tabId);
  const window = await chrome.windows.get(tab.windowId);

  await store.dispatch(actions.setActiveBrowserTabId(tab.id));
  await store.dispatch(actions.setActiveBrowserTabUrl(url));
  await store.dispatch(actions.setActiveBrowserWindowId(window.id));

  const { origin } = new URL(url);
  const supportedUrlDetected = supportedUrls.includes(origin) ? true : false;

  if(parentWindowId === tab.windowId && supportedUrlDetected) {
    await injectContentScript(tabId);
  } else {
    await injectApp();
  };
};

/** Set the active browsing content tab id. */
async function setActiveBrowserTabId(id) {
  await store.dispatch(actions.setActiveBrowserTabId(id));
};

/** Set the active browsing content tab url. */
async function setActiveBrowserTabUrl(url) {
  await store.dispatch(actions.setActiveBrowserTabUrl(url));
};

/**
 * Set the active adapter window's "identity".
 * @param {number} tabId -The adapter window's parent tab id.
 * @param {number} windowId - The adapter window's parent window id.
 */
async function setAdapterIdentity(tabId, windowId) {
  // Identify the adapter window's own window id.
  await chrome.windows.getLastFocused({ populate: true }, async (window) => {
    const { id } = window;

    await store.dispatch(actions.setExtensionWindowId(id));
  });
  
  // Identify the adapter window's parent details.
  await store.dispatch(actions.setParentTabId(tabId));
  await store.dispatch(actions.setParentWindowId(windowId));
};

/**
 * Set the default supported urls for the extension adapter window.
 * @param {array} urls - An array of the supported urls.
 */
async function setSupportedUrls(urls) {
  await store.dispatch(actions.setSupportedUrls(urls));
};

export {
  injectApp,
  setActiveBrowserContext,
  setActiveBrowserTabId,
  setActiveBrowserTabUrl,
  setAdapterIdentity,
  setSupportedUrls
};