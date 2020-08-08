import actions from './actions';

const initialState = {
  activeBrowserTabId: null,
  activeBrowserWindowId: null,
  activeExtensionWindows: [],
  supportedUrls: []
};

const backgroundReducer = (state = initialState, { type, payload }) => {
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
        activeBrowserTabUrl: payload.url
      }
    };
    case actions.SET_ACTIVE_BROWSER_WINDOW_ID: {
      return {
        ...state,
        activeBrowserWindowId: payload.windowId
      }
    };
    case actions.SET_SUPPORTED_URLS: {
      return {
        ...state,
        supportedUrls: payload.urls
      }
    };
    case actions.CREATE_EXTENSION_WINDOW: {
      return {
        ...state,
        activeExtensionWindows: [
          ...state.activeExtensionWindows,
          {
            parentWindowId: payload.parentWindowId,
            extensionWindowId: payload.extensionWindowId
          }
        ]
      };
    };
    case actions.DELETE_EXTENSION_WINDOW: {
      return {
        ...state,
        activeExtensionWindows: [
          ...state.activeExtensionWindows.filter(windows => {
            windows.extensionWindowId !== payload.windowId
          })
        ]
      };
    };
  };

  return state;
};

export default backgroundReducer;
