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
    
    let development = null;
    let microApp = null;

    if(supportedUrl.length > 0) {
      const { host } = parsedUrl;
      const split = host.split('.');

      switch(supportedUrl[0]) {
        case "https://duckduckgo.com": {
          microApp = `${split[0]}-browsing-utility`;
          // http://localhost:8080/duckduckgo-browsing-utility/static/js/app.bundle.js
          break;
        }
        case "https://www.google.com": {
          development = 'http://localhost:3000';
          microApp = `${split[1]}-browsing-utility`;
          // http://localhost:8080/google-browsing-utility/static/js/app.bundle.js
          break;
        }
      };
    } else {
      development = 'http://localhost:8080';
      microApp = `chrome-web-browser-adapter`;
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
    async function injectMicroAppRoot() {
      const root = await window.document.createElement('div');
      root.id = "root";
      
      await window.document.body.appendChild(root);
    };
    async function injectMicroAppJS() {
      switch(microApp) {
        case "chrome-web-browser-adapter": {
          // TODO: Publish local app into a github repo with 'gh-pages'.
          const script = await window.document.createElement('script');
          script.src = `${development}/${microApp}/static/js/app.bundle.js`;
          await window.document.body.appendChild(script);
          break;
        }
        case "google-browsing-utility": {
          // NOTE: Using the "ejected" CRA js scripts that are published in github repo.
          // NOTE: Ensure to use 'local host' scripts when in development.

          /* Local host scripts */
          const script1 = await window.document.createElement('script');
          const script2 = await window.document.createElement('script');
          const script3 = await window.document.createElement('script');

          script1.src = `${development}/${microApp}/static/js/bundle.js`;
          script2.src = `${development}/${microApp}/static/js/0.chunk.js`;
          script3.src = `${development}/${microApp}/static/js/main.chunk.js`;

          await window.document.body.appendChild(script1);
          await window.document.body.appendChild(script2);
          await window.document.body.appendChild(script3);

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
      }
    };
    async function injectMicroAppStore() {
      // NOTE: This will only attach to the extension adapter window, not accessible to other windows. Consider other solutions.
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