const actions = {
  SET_ACTIVE_PARENT_WINDOW_ID: 'SET_ACTIVE_PARENT_WINDOW_ID',
  SET_ACTIVE_TAB_ID: 'SET_ACTIVE_TAB_ID',
  SET_ACTIVE_TAB_URL: 'SET_ACTIVE_TAB_URL',
  SET_ACTIVE_WINDOW_ID: 'SET_ACTIVE_WINDOW_ID',
  SET_ACTIVE_WINDOWS: 'SET_ACTIVE_WINDOWS',
  SET_ADAPTER_WINDOW_ID: 'SET_ADAPTER_WINDOW_ID',
  SET_SUPPORTED_URLS: 'SET_SUPPORTED_URLS',
};

const actionCreators = {
  setActiveParentWindowId(activeParentWindowId) {
    return {
      type: actions.SET_ACTIVE_PARENT_WINDOW_ID,
      payload: {
        activeParentWindowId
      }
    };
  },
  setActiveTabId(activeTabId) {
    return {
      type: actions.SET_ACTIVE_TAB_ID,
      payload: {
        activeTabId
      }
    };
  },
  setActiveTabUrl(activeTabUrl) {
    return {
      type: actions.SET_ACTIVE_TAB_URL,
      payload: {
        activeTabUrl
      }
    };
  },
  setActiveWindowId(activeWindowId) {
    return {
      type: actions.SET_ACTIVE_WINDOW_ID,
      payload: {
        activeWindowId
      }
    };
  },
  setActiveWindows(activeWindows) {
    return {
      type: actions.SET_ACTIVE_WINDOWS,
      payload: {
        activeWindows
      }
    };
  },
  setAdapterWindowId(adapterWindowId) {
    return {
      type: actions.SET_ADAPTER_WINDOW_ID,
      payload: {
        adapterWindowId
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
