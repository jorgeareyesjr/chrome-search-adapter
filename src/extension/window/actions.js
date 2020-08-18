const actions = {
  SET_ACTIVE_BROWSER_TAB_ID: 'SET_ACTIVE_TAB_ID',
  SET_ACTIVE_BROWSER_TAB_URL: 'SET_ACTIVE_TAB_URL',
  SET_ACTIVE_BROWSER_WINDOW_ID: 'SET_ACTIVE_WINDOW_ID',
  SET_DOM_SEARCH_RESULTS: 'SET_DOM_SEARCH_RESULTS',
  SET_EXTENSION_WINDOW_ID: 'SET_EXTENSION_WINDOW_ID',
  SET_PARENT_TAB_ID: 'SET_PARENT_TAB_ID',
  SET_PARENT_WINDOW_ID: 'SET_PARENT_WINDOW_ID',
  SET_SUPPORTED_URLS: 'SET_SUPPORTED_URLS',
};

const actionCreators = {
  setActiveBrowserTabId(tabId) {
    return {
      type: actions.SET_ACTIVE_BROWSER_TAB_ID,
      payload: {
        tabId
      }
    };
  },
  setActiveBrowserTabUrl(tabUrl) {
    return {
      type: actions.SET_ACTIVE_BROWSER_TAB_URL,
      payload: {
        tabUrl
      }
    };
  },
  setActiveBrowserWindowId(windowId) {
    return {
      type: actions.SET_ACTIVE_BROWSER_WINDOW_ID,
      payload: {
        windowId
      }
    };
  },
  setDOMSearchResults(DOMElements) {
    return {
      type: actions.SET_DOM_SEARCH_RESULTS,
      payload: {
        DOMElements
      }
    };
  },
  setExtensionWindowId(windowId) {
    return {
      type: actions.SET_EXTENSION_WINDOW_ID,
      payload: {
        windowId
      }
    };
  },
  setParentTabId(tabId) {
    return {
      type: actions.SET_PARENT_TAB_ID,
      payload: {
        tabId
      }
    };
  },
  setParentWindowId(windowId) {
    return {
      type: actions.SET_PARENT_WINDOW_ID,
      payload: {
        windowId
      }
    };
  },
  setSupportedUrls(supportedUrls) {
    return {
      type: actions.SET_SUPPORTED_URLS,
      payload: {
        supportedUrls
      }
    };
  }
};

export default { ...actions, ...actionCreators };
