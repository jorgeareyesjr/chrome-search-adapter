import actions from './actions';

const initialState = {};

const windowReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.SET_ACTIVE_BROWSER_TAB_ID: {
      return {
        ...state,
        activeBrowserTabId: payload.tabId
      }
    };
    case actions.SET_ACTIVE_BROWSER_TAB_URL: {
      return {
        ...state,
        activeBrowserTabUrl: payload.tabUrl
      }
    };
    case actions.SET_ACTIVE_BROWSER_WINDOW_ID: {
      return {
        ...state,
        activeBrowserWindowId: payload.windowId
      }
    };
    case actions.SET_EXTENSION_WINDOW_ID: {
      return {
        ...state,
        extensionWindowId: payload.windowId
      }
    };
    case actions.SET_PARENT_TAB_ID: {
      return {
        ...state,
        parentTabId: payload.tabId
      }
    };
    case actions.SET_PARENT_TAB_URL: {
      return {
        ...state,
        parentTabUrl: payload.tabUrl
      }
    };
    case actions.SET_PARENT_WINDOW_ID: {
      return {
        ...state,
        parentWindowId: payload.windowId
      }
    };
    case actions.SET_SUPPORTED_URLS: {
      return {
        ...state,
        supportedUrls: payload.supportedUrls
      }
    };
  };

  return state;
};

export default windowReducer;
