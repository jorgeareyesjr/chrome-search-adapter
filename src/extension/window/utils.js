import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/** Inject the appropriate app/UI, based off the active browsing context. */
async function injectApp() {
  try {
    let appName = null;
    let appHost = null;

    const appState = store.getState();
    const { activeBrowserTabUrl, supportedUrls } = appState;
    
    // Check if the active tab context url is amongst the list of supported urls.
    const { host, origin } = new URL(activeBrowserTabUrl);
    const filteredUrls = supportedUrls.filter((url) => url.includes(origin));

    // Inject the appropriate app if a supported url is detected.
    if(filteredUrls.length) {
      const hostComponent = host.split('.');

      switch(origin) {
        // TODO
        case "https://duckduckgo.com": {
          // appName = `${hostComponent[0]}-browsing-utility`;
          appName = `google-browsing-utility`;
          appHost = `http://localhost:3000`;
          
          break;
        }
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
    async function injectAppState() {
      // NOTE: This will only attach to the extension adapter window, not accessible to other windows. Consider other possible solutions to communicate/broadcast updates.
      // TODO: Consider a broadcast channel to communicate between adapter window and injected micro-app.
      // SEE: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
      // Make current store data global, to let all scripts access it.
      // SEE: https://javascript.info/global-object
      window.__CHROME_WEB_BROWSER_ADAPTER__ = {
        ...appState
      };
    };

    await clearAdapterWindowDOMBody();
    await injectAppRoot();
    await injectAppScripts();
    await injectAppState();
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
            
      const handleMessages = async (message) => {
        switch(message.type) {
          case "CONTEXT_URL_RESPONSE": {
            // Determine if the current `contextUrl` will yield relevant DOM nodes.
            const { payload } = message;
            const { contextUrl } = payload;
            const { origin, pathname, hash } = new URL(contextUrl);
            
            if(origin === 'https://www.google.com') {
              const splitHash = hash.split("/m/");
              // Split the url hash to determine the context for the Google flights search support.
              // The `splitHash` will have either 1, 3 or 5 substring(s):
              // If 1 substring, the user is in the `GOOGLE FLIGHTS SEARCH` page, without an origin airport input.
              // If 3 substrings, the user is in the `GOOGLE FLIGHTS SEARCH` page, with an origin airport input.
              // If 5 substrings, the user may be in either the `GOOGLE FLIGHTS SEARCH` or `GOOGLE FLIGHTS SELECTION` page - another check is necessary to assign a `pageType`.

              if(pathname === '/') {
                await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                  type: "GOOGLE_SEARCH_INPUT_REQUEST"
                });
              } else if(pathname === '/search') {
                await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                  type: "GOOGLE_SEARCH_RESULTS_REQUEST"
                });
              } else if((pathname === '/flights/' || pathname === '/flights') && splitHash.length < 5) {
               await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                 type: "GOOGLE_FLIGHTS_SEARCH_DETAILS_REQUEST",
                 hash
                });
              } else if(pathname === '/flights' && splitHash.length === 5) {
                // The user may be in either the `GOOGLE FLIGHTS SELECTION`, `GOOGLE FLIGHTS BOOKING`, or `GOOGLE FLIGHTS CHECKOUT` page - check the `splitHash` substrings to assign the proper `pageType`.
                // The 2nd `splitHash` substring contains departing flight data (date and flight selection details).
                // The 4th `splitHash` substring contains returning flight data (date and flight selection details).
                const departingFlight = splitHash[2].split(".");
                const returningFlight = splitHash[4].split(".");
                
                if(returningFlight[6]) {
                  // If flights have been selected and booked, the 4th `splitHash` substring will contain flight checkout data and can be split.
                  // Split the flight checkout data to extract the `bookedFlights` checkout details.
                  const bookedFlights = returningFlight[6].split(":");

                  if(bookedFlights[2]) {
                     // In the `GOOGLE FLIGHTS CHECKOUT` page.
                    await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                      type: "GOOGLE_FLIGHTS_CHECKOUT_DETAILS_REQUEST",
                      hash
                    });
                  } else {
                    // If a departing or returning flight has been selected, the 2nd and 4th `splitHash` substrings can be split with "~", otherwise, the flights have not been selected.
                    const departingFlightData = departingFlight[2].split("~");
                    const returningFlightData = returningFlight[2].split("~");
                    
                    if(departingFlightData[1] && returningFlightData[1]) {
                      await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                        type: "GOOGLE_FLIGHTS_BOOKING_DETAILS_REQUEST",
                        hash
                      });
                    } else {
                      await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                        type: "GOOGLE_FLIGHTS_SELECTION_DETAILS_REQUEST",
                        hash
                      });
                    };
                  };
                } else if(departingFlight[2] && returningFlight[2]) {
                  // If a departing or returning flight has been selected.
                  // The 2nd and 4th `splitHash` substrings can be split with "~".
                  const departingFlightData = departingFlight[2].split("~");
                  const returningFlightData = returningFlight[2].split("~");
                  
                  if(departingFlightData[1] && returningFlightData[1]) {
                    // Both the departing flight and returning flight has been selected.
                    await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                      type: "GOOGLE_FLIGHTS_BOOKING_DETAILS_REQUEST",
                      hash
                    });
                  } else {
                    // Flights are being selected.
                    await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                      type: "GOOGLE_FLIGHTS_SELECTION_DETAILS_REQUEST",
                      hash
                    });
                  };
                } else {
                  // Flights have not been selected.
                  await window.__CHROME_WEB_BROWSER_ADAPTER_PORT__.postMessage({
                    type: "GOOGLE_FLIGHTS_SELECTION_DETAILS_REQUEST",
                    hash
                  });
                };
              };
              // TODO
              // else if (url.pathname === '/travel/explore') {}
            } else {
              // This context will not yield any DOM search result nodes - clean up any previously set DOM data.
              await store.dispatch(actions.clearDOMData(null));
              await injectApp();
            };

            break;
          };
          case "GOOGLE_SEARCH_INPUT_RESPONSE": {
            const { pageType, payload } = message;
            const { searchInput } = payload;
            
            await store.dispatch(actions.setPageType(pageType));
            await store.dispatch(actions.setDOMSearchInputTerm(searchInput));
            await injectApp();

            break;
          };
          case "GOOGLE_SEARCH_RESULTS_RESPONSE": {
            const { pageType, payload } = message;
            const { searchInput, searchResults } = payload;

            await store.dispatch(actions.setPageType(pageType));
            await store.dispatch(actions.setDOMSearchInputTerm(searchInput));
            await store.dispatch(actions.setDOMSearchResults(searchResults));
            await injectApp();

            break;
          };
          case "GOOGLE_FLIGHTS_SEARCH_DETAILS_RESPONSE": {
            const { pageType, payload } = message;
            const { origin, destination, searchResults } = payload;

            await store.dispatch(actions.setPageType(pageType));
            await store.dispatch(actions.setDOMFlightOrigin(origin));
            await store.dispatch(actions.setDOMFlightDestination(destination));
            await store.dispatch(actions.setDOMSearchResults(searchResults));
            await injectApp();

            break;
          };
          case "GOOGLE_FLIGHTS_SELECTION_DETAILS_RESPONSE": {
            const { pageType, payload } = message;
            const { origin, destination, searchResults } = payload;

            await store.dispatch(actions.setPageType(pageType));
            await store.dispatch(actions.setDOMFlightOrigin(origin));
            await store.dispatch(actions.setDOMFlightDestination(destination));
            await store.dispatch(actions.setDOMSearchResults(searchResults));
            await injectApp();

            break;
          };
          case "GOOGLE_FLIGHTS_BOOKING_DETAILS_RESPONSE": {
            const { pageType, payload } = message;
            const { origin, destination, selectedFlights, searchResults } = payload;

            await store.dispatch(actions.setPageType(pageType));
            await store.dispatch(actions.setDOMFlightOrigin(origin));
            await store.dispatch(actions.setDOMFlightDestination(destination));
            await store.dispatch(actions.setDOMSearchResults(searchResults));
            await store.dispatch(actions.setDOMSelectedFlights(selectedFlights));

            await injectApp();

            break;
          };
          case "GOOGLE_FLIGHTS_CHECKOUT_DETAILS_RESPONSE": {
            // TODO
            const { pageType } = message;

            await store.dispatch(actions.setPageType(pageType));
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
      type: "CONTEXT_URL_REQUEST"
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