const actions = {
  CLEAR_DOM_DATA: "CLEAR_DOM_DATA",
  SET_ACTIVE_BROWSER_TAB_ID: 'SET_ACTIVE_TAB_ID',
  SET_ACTIVE_BROWSER_TAB_URL: 'SET_ACTIVE_TAB_URL',
  SET_ACTIVE_BROWSER_WINDOW_ID: 'SET_ACTIVE_WINDOW_ID',
  SET_DOM_FLIGHT_DESTINATION: 'SET_DOM_FLIGHT_DESTINATION',
  SET_DOM_FLIGHT_ORIGIN: 'SET_DOM_FLIGHT_ORIGIN',
  SET_DOM_SEARCH_INPUT_TERM: "SET_DOM_SEARCH_INPUT_TERM",
  SET_DOM_SEARCH_RESULTS: 'SET_DOM_SEARCH_RESULTS',
  SET_DOM_SELECTED_FLIGHTS: 'SET_DOM_SELECTED_FLIGHTS',
  SET_EXTENSION_WINDOW_ID: 'SET_EXTENSION_WINDOW_ID',
  SET_PAGETYPE: "SET_PAGETYPE",
  SET_PARENT_TAB_ID: 'SET_PARENT_TAB_ID',
  SET_PARENT_WINDOW_ID: 'SET_PARENT_WINDOW_ID',
  SET_SUPPORTED_URLS: 'SET_SUPPORTED_URLS',
};

const actionCreators = {
  clearDOMData(value) {
    return {
      type: actions.CLEAR_DOM_DATA,
      payload: {
        value
      }
    };
  },
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
  setDOMFlightDestination(DOMElement) {
    return {
      type: actions.SET_DOM_FLIGHT_DESTINATION,
      payload: {
        DOMElement
      }
    };
  },
  setDOMFlightOrigin(DOMElement) {
    return {
      type: actions.SET_DOM_FLIGHT_ORIGIN,
      payload: {
        DOMElement
      }
    };
  },
  setDOMSearchInputTerm(DOMElement) {
    return {
      type: actions.SET_DOM_SEARCH_INPUT_TERM,
      payload: {
        DOMElement
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
  setDOMSelectedFlights(DOMElements) {
    return {
      type: actions.SET_DOM_SELECTED_FLIGHTS,
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
  setPageType(pageType) {
    return {
      type: actions.SET_PAGETYPE,
      payload: {
        pageType
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
