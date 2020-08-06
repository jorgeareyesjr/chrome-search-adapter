import actions from './actions';

const initialState = {};

const windowReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.SET_ACTIVE_PARENT_WINDOW_ID: {
      return {
        ...state,
        activeParentWindowId: payload.activeParentWindowId
      }
    };
    case actions.SET_ACTIVE_TAB_ID: {
      return {
        ...state,
        activeTabId: payload.activeTabId
      }
    };
    case actions.SET_ACTIVE_TAB_URL: {
      return {
        ...state,
        activeTabUrl: payload.activeTabUrl
      }
    };
    case actions.SET_ACTIVE_WINDOW_ID: {
      return {
        ...state,
        activeWindowId: payload.activeWindowId
      }
    };
    case actions.SET_ACTIVE_WINDOWS: {
      return {
        ...state,
        activeWindows: payload.activeWindows
      }
    };
    case actions.SET_ADAPTER_WINDOW_ID: {
      return {
        ...state,
        adapterWindowId: payload.adapterWindowId
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
