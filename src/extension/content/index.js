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

        const origin = await utils.getOriginInputData("GOOGLE_FLIGHTS_SEARCH");
        const destination = await utils.getDestinationInputData("GOOGLE_FLIGHTS_SEARCH");

        let resultsSelector, searchResults;

        if(splitHash.length < 3) {
          resultsSelector = ".gws-flights-results__originless .gws-flights-results__destination-name";
        } else if(splitHash.length >= 3) {
          resultsSelector = `.gws-flights-results__destination-result-button .flt-subhead1`;
        };

        searchResults = await utils.getDOMNodes(resultsSelector);

        if(searchResults.length === 0) {
          const textContent = "No available flights detected.";
          
          searchResults.push({ textContent });
        };

        port.postMessage({
          type: "GOOGLE_FLIGHTS_SEARCH_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_SEARCH",
          payload: { origin, destination, searchResults }
        });

        break;     
      };
      case "GOOGLE_FLIGHTS_SELECTION_DETAILS_REQUEST": {
        const { hash } = message;
        const splitHash = hash.split(".");

        const origin = await utils.getOriginInputData("GOOGLE_FLIGHTS_SELECTION");

        const destination = await utils.getDestinationInputData("GOOGLE_FLIGHTS_SELECTION");

        let resultsSelector, searchResults;

        if(splitHash.length >= 5) {
          resultsSelector = `.gws-flights-results__itinerary-card-summary.gws-flights-results__result-item-summary`;
        };

        searchResults = await utils.getDOMNodes(resultsSelector);

        if(searchResults.length === 0) {
          const textContent = "No available flights detected.";
          
          searchResults.push({ textContent });
        };

        port.postMessage({
          type: "GOOGLE_FLIGHTS_SELECTION_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_SELECTION",
          payload: { origin, destination, searchResults }
        });
        break;     
      };
      case "GOOGLE_FLIGHTS_BOOKING_DETAILS_REQUEST": {
        const origin = await utils.getOriginInputData("GOOGLE_FLIGHTS_BOOKING");
        const destination = await utils.getDestinationInputData("GOOGLE_FLIGHTS_BOOKING");

        const resultsSelector = `.gws-flights-book__booking-options tr`;
        const selectedFlightsSelector = `.gws-flights-results__selections-list .gws-flights-results__slice-selection`;

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
        const { hash } = message;
        const splitHash = hash.split(".");

        const origin = await utils.getOriginInputData("GOOGLE_FLIGHTS_CHECKOUT");
        const destination = await utils.getDestinationInputData("GOOGLE_FLIGHTS_CHECKOUT");

        const splitHashSubString = splitHash[10].split(":");
        const bookingProvider = splitHashSubString[1];

        // let resultsSelector, searchResults;

        port.postMessage({
          type: "GOOGLE_FLIGHTS_CHECKOUT_DETAILS_RESPONSE",
          pageType: "GOOGLE_FLIGHTS_CHECKOUT",
          payload: { bookingProvider, origin, destination }
        });
        break;  
      };
    }
  };

  port.onMessage.addListener(handleMessages);
  port.onDisconnect.addListener(handleDisconnect);
};

chrome.runtime.onConnect.addListener(connectToWindowScript);