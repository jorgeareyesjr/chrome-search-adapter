import actions from './actions';

const initialState = {};

const windowReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.CLEAR_DOM_DATA: {
      return {
        ...state,
        DOMFlightDestination: payload.value,
        DOMFlightOrigin: payload.value,
        DOMSearchInputTerm: payload.value,
        DOMSearchResults: payload.value
      }
    };
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
    case actions.SET_DOM_FLIGHT_DESTINATION: {
      return {
        ...state,
        DOMFlightDestination: payload.DOMElement
      }
    };
    case actions.SET_DOM_FLIGHT_ORIGIN: {
      return {
        ...state,
        DOMFlightOrigin: payload.DOMElement
      }
    };
    case actions.SET_DOM_SEARCH_INPUT_TERM: {
      return {
        ...state,
        DOMSearchInputTerm: payload.DOMElement
      }
    };
    case actions.SET_DOM_SEARCH_RESULTS: {
      return {
        ...state,
        DOMSearchResults: payload.DOMElements
      }
    };
    case actions.SET_DOM_SELECTED_FLIGHTS: {
      return {
        ...state,
        DOMSelectedFlights: payload.DOMElements
      }
    };
    case actions.SET_EXTENSION_WINDOW_ID: {
      return {
        ...state,
        extensionWindowId: payload.windowId
      }
    };
    case actions.SET_PAGETYPE: {
      return {
        ...state,
        pageType: payload.pageType
      }
    };
    case actions.SET_PARENT_TAB_ID: {
      return {
        ...state,
        parentTabId: payload.tabId
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
