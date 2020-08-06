import actions from './actions';

const initialState = {
  activeTabId: null,
  activeWindowId: null,
  activeWindows: [],
  supportedUrls: []
};

const backgroundReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.SET_ACTIVE_TAB_ID: {
      return {
        ...state,
        activeTabId: payload.tabId
      }
    };
    case actions.SET_ACTIVE_WINDOW_ID: {
      return {
        ...state,
        activeWindowId: payload.windowId
      }
    };
    case actions.SET_SUPPORTED_URLS: {
      return {
        ...state,
        supportedUrls: payload.urls
      }
    };
    case actions.CREATE_WINDOW: {
      return {
        ...state,
        activeWindows: [
          ...state.activeWindows,
          {
            parentWindowId: payload.parentWindowId,
            extensionWindowId: payload.extensionWindowId
          }
        ]
      };
    };
    case actions.DELETE_WINDOW: {
      return {
        ...state,
        activeWindows: [
          ...state.activeWindows.filter(windows => {
            windows.extensionWindowId !== payload.windowId
          })
        ]
      };
    };
  };

  return state;
};

export default backgroundReducer;
