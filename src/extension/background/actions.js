const actions = {
  SET_ACTIVE_TAB_ID: 'SET_ACTIVE_TAB_ID',
  SET_ACTIVE_WINDOW_ID: 'SET_ACTIVE_WINDOW_ID',
  SET_SUPPORTED_URLS: 'SET_SUPPORTED_URLS',
  CREATE_WINDOW: 'CREATE_WINDOW',
  DELETE_WINDOW: 'DELETE_WINDOW'
};

const actionCreators = {
  setActiveTabId(tabId) {
    return {
      type: actions.SET_ACTIVE_TAB_ID,
      payload: {
        tabId
      }
    };
  },
  setActiveWindowId(windowId) {
    return {
      type: actions.SET_ACTIVE_WINDOW_ID,
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
  createWindow(parentWindowId, extensionWindowId) {
    return {
      type: actions.CREATE_WINDOW,
      payload: {
        parentWindowId,
        extensionWindowId
      }
    }
  },
  deleteWindow(windowId) {
    return {
      type: actions.DELETE_WINDOW,
      payload: {
        windowId
      }
    }
  }
};

export default { ...actions, ...actionCreators };
