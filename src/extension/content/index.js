import * as utils from './utils';

/**
 * Establish a long-lived connection to the extension's window script, whenever the content script is successfully injected.
 * @param {object} port - The connection channel used to pass messages between the extension window script and injected content script.
 * NOTE: The content script will initialize an event handler to receive messages from the extension's window script.
 * SEE: https://developer.chrome.com/extensions/runtime#event-onConnect
 */
async function connectToWindowScript(port) {
  const handleDisconnect = () => {
    port.onMessage.removeListener(handleMessages);
    chrome.runtime.onConnect.removeListener(connectToWindowScript)
  };
  const handleMessages = async (message) => {
    // TODO: Set up mutation observers to monitor DOM nodes and update them if changes are detected.
    // TODO: Create an "options" page to handle adding/removing `selectors`.
    // TODO: Get flight date(s).
    switch (message.type) {
      case "CONTEXT_URL_REQUEST": {
        const contextUrl = window.location.href;

        port.postMessage({
          type: "CONTEXT_URL_RESPONSE",
          payload: { contextUrl }
        });      
        break;
      };
      case "GOOGLE_SEARCH_INPUT_REQUEST": {
        const inputSelector = `input.gsfi`;
        const searchInput = await utils.getDOMNodeValue(inputSelector);

        port.postMessage({
          type: "GOOGLE_SEARCH_INPUT_RESPONSE",
          pageType: "GOOGLE_SEARCH",
          payload: { searchInput }
        });
        break;     
      };
      case "GOOGLE_SEARCH_RESULTS_REQUEST": {
        const inputSelector = `input.gsfi`;
        const resultsSelector = `.r`;
        const searchInput = await utils.getDOMNodeValue(inputSelector);
        const searchResults = await utils.getDOMNodes(resultsSelector);

        port.postMessage({
          type: "GOOGLE_SEARCH_RESULTS_RESPONSE",
          pageType: "GOOGLE_SEARCH_RESULTS",
          payload: { searchInput, searchResults }
        });

        break;     
      };
      case "GOOGLE_FLIGHTS_SEARCH_DETAILS_REQUEST": {
        const { hash } = message;
        const splitHash = hash.split("/m/");

        const originSelector = `[data-flt-ve="origin_airport"]`;
        const destinationSelector = `[data-flt-ve="destination_airport"]`;

        const origin = await utils.getDOMNodeText(originSelector);
        const destination = await utils.getDOMNodeText(destinationSelector);

        let resultsSelector;
        let searchResults;

        if(splitHash.length < 3) {
          resultsSelector = ".gws-flights-results__originless";
          searchResults = await utils.getDOMNodes(resultsSelector);
        } else if(splitHash.length === 3) {
          if(origin && (destination.includes("Try") || destination === "Where to?")) {
            resultsSelector = `.gws-flights-results__destination-result-button`;
            searchResults = await utils.getDOMNodes(resultsSelector);
          } else {
            resultsSelector = `.gws-flights-results__select-header.gws-flights__flex-filler`;
            searchResults = await utils.getDOMNodes(resultsSelector);
          };
        };

        port.postMessage({
          type: "GOOGLE_FLIGHTS_SEARCH_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_SEARCH",
          payload: { origin, destination, searchResults }
        });

        break;     
      };
      case "GOOGLE_FLIGHTS_SELECTION_DETAILS_REQUEST": {
        const originSelector = `[data-flt-ve="origin_airport"]`;
        const destinationSelector = `[data-flt-ve="destination_airport"]`;

        const origin = await utils.getDOMNodeText(originSelector);
        const destination = await utils.getDOMNodeText(destinationSelector);

        let resultsSelector;
        let searchResults;

        if(origin && (destination.includes("Try") || destination === "Where to?")) {
          resultsSelector = `.gws-flights-results__destination-result-button`;
          searchResults = await utils.getDOMNodes(resultsSelector);
        } else {
          resultsSelector = `.gws-flights-results__select-header.gws-flights__flex-filler`;
          searchResults = await utils.getDOMNodes(resultsSelector);
        };

        port.postMessage({
          type: "GOOGLE_FLIGHTS_SELECTION_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_SELECTION",
          payload: { origin, destination, searchResults }
        });
        break;     
      };
      case "GOOGLE_FLIGHTS_BOOKING_DETAILS_REQUEST": {
        const originSelector = `.gws-flights__flex-box .gws-flights-book__round-trip .gws-flights__flex-shrink`;
        const destinationSelector = `.gws-flights__flex-box .gws-flights-book__round-trip .gws-flights-book__destination-airport`;
        const resultsSelector = `.gws-flights-book__booking-options tr`;
        const selectedFlightsSelector = `.gws-flights-results__selections-list .gws-flights-results__slice-selection`;

        const origin = await utils.getDOMNodeText(originSelector);
        const destination = await utils.getDOMNodeText(destinationSelector);
        const searchResults = await utils.getDOMNodes(resultsSelector);
        const selectedFlights = await utils.getDOMNodes(selectedFlightsSelector);

        port.postMessage({
          type: "GOOGLE_FLIGHTS_BOOKING_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_BOOKING",
          payload: { origin, destination, searchResults, selectedFlights }
        });
        break;  
      };
      case "GOOGLE_FLIGHTS_CHECKOUT_DETAILS_REQUEST": {
        // TODO
        // console.log("IN FLIGHTS CHECKOUT");

        port.postMessage({
          type: "GOOGLE_FLIGHTS_CHECKOUT_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_CHECKOUT",
        });
        break;  
      };
    };
  };

  port.onMessage.addListener(handleMessages);
  port.onDisconnect.addListener(handleDisconnect);
};

chrome.runtime.onConnect.addListener(connectToWindowScript);