const actions = {
  SET_ACTIVE_BROWSER_TAB_ID: 'SET_ACTIVE_BROWSER_TAB_ID',
  SET_ACTIVE_BROWSER_TAB_URL: 'SET_ACTIVE_BROWSER_TAB_URL',
  SET_ACTIVE_BROWSER_WINDOW_ID: 'SET_ACTIVE_BROWSER_WINDOW_ID',
  SET_SUPPORTED_URLS: 'SET_SUPPORTED_URLS',
  CREATE_EXTENSION_WINDOW: 'CREATE_EXTENSION_WINDOW',
  DELETE_EXTENSION_WINDOW: 'DELETE_EXTENSION_WINDOW'
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
  setActiveBrowserTabUrl(url) {
    return {
      type: actions.SET_ACTIVE_BROWSER_TAB_URL,
      payload: {
        url
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
  setSupportedUrls(urls) {
    return {
      type: actions.SET_SUPPORTED_URLS,
      payload: {
        urls
      }
    };
  },
  createExtensionWindow(parentWindowId, extensionWindowId) {
    return {
      type: actions.CREATE_EXTENSION_WINDOW,
      payload: {
        parentWindowId,
        extensionWindowId
      }
    }
  },
  deleteExtensionWindow(windowId) {
    return {
      type: actions.DELETE_EXTENSION_WINDOW,
      payload: {
        windowId
      }
    }
  }
};

export default { ...actions, ...actionCreators };
