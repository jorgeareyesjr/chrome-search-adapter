import 'chrome-extension-async';
import * as iata from './IATACodes';

/**
 * Get the origin details from the selected origin airport.
 * @param {string} source - The pageType that is requesting the origin details.
 */
async function getOriginInputData(source) {
  let origin, originAirport;
  
  if(source === 'GOOGLE_FLIGHTS_SEARCH' || source === 'GOOGLE_FLIGHTS_SELECTION') {
    const originInputSelector = `[data-flt-ve="origin_airport"] .gws-flights-form__location-list`;
    // Parse the HTML string to extract origin data.
    const originInputInnerHTML = await getDOMNodeInnerHTML(originInputSelector);
    const parsedOriginInputInnerHTML = new DOMParser().parseFromString(originInputInnerHTML, "text/html");
    const originInputInnerSpanList = parsedOriginInputInnerHTML.querySelectorAll('span');

    // Check origin input for IATA codes.
    if(originInputInnerSpanList[2]) {
      // An IATA origin code has been detected, lookup city and country and assign the returned data to the message payload.
      originAirport = originInputInnerSpanList[2].innerText;
      
      const { city, country, state } = await iata.getAirportLocation(originAirport);

      if(state) {
        origin = `${city}, ${state}, ${country} - ${originAirport}`;
      } else {
        origin = `${city}, ${country} - ${originAirport}`;
      };
    } else {
      // No origin IATA code detected, fallback to the context origin placeholder.
      originAirport = null;
      origin = null;
    };
  } else if (source === 'GOOGLE_FLIGHTS_BOOKING') {
    const selectedAirportsSelector = `.gws-flights-results__airports`;
    // Parse the HTML string to extract origin data.
    const originInputInnerHTML = await getDOMNodeInnerHTML(selectedAirportsSelector);
    const parsedOriginInputInnerHTML = new DOMParser().parseFromString(originInputInnerHTML, "text/html");
    const originInputInnerSpanList = parsedOriginInputInnerHTML.querySelectorAll('span');

    // Check origin input for IATA codes.
    if(originInputInnerSpanList[0]) {
      // An IATA origin code has been detected, lookup city and country and assign the returned data to the message payload.
      originAirport = originInputInnerSpanList[0].innerText;
      
      const { city, country, state } = await iata.getAirportLocation(originAirport);

      if(state) {
        origin = `${city}, ${state}, ${country} - ${originAirport}`;
      } else {
        origin = `${city}, ${country} - ${originAirport}`;
      };
    } else {
      // No origin IATA code detected.
      originAirport = null;
      origin = null;
    };
  } else if (source === 'GOOGLE_FLIGHTS_CHECKOUT') {
    const { hash } = window.location;
    const splitHash = hash.split(".");

    originAirport = splitHash[4]; 
    const { city, country, state } = await iata.getAirportLocation(originAirport);

    if(state) {
      origin = `${city}, ${state}, ${country} - ${originAirport}`;
    } else {
      origin = `${city}, ${country} - ${originAirport}`;
    };
  };

  return origin;
};

/**
 * Get the destination details from the selected destination airport.
 * @param {string} source - The pageType that is requesting the origin details.
 */
async function getDestinationInputData(source) {
  let destination, destinationAirport;

  if(source === 'GOOGLE_FLIGHTS_SEARCH' || source === 'GOOGLE_FLIGHTS_SELECTION') {
    const destinationInputSelector = `[data-flt-ve="destination_airport"] .gws-flights-form__location-list`;
    // Parse the HTML string to extract destination data.
    const destinationInputInnerHTML = await getDOMNodeInnerHTML(destinationInputSelector);
    const parsedDestinationInputInnerHTML = new DOMParser().parseFromString(destinationInputInnerHTML, "text/html");
    const destinationInputInnerSpanList = parsedDestinationInputInnerHTML.querySelectorAll('span');

    // Check destination input for IATA codes.
    if(destinationInputInnerSpanList[2]) {
      // An IATA code has been detected, lookup city and country and assign the returned data to the message payload.
      destinationAirport =  destinationInputInnerSpanList[2].innerText;
      
      const { city, country, state } = await iata.getAirportLocation(destinationAirport);

      if(state) {
        destination = `${city}, ${state}, ${country} - ${destinationAirport}`;
      } else {
        destination = `${city}, ${country} - ${destinationAirport}`;
      };
    } else {
      // No destination IATA code detected.
      destinationAirport = null;
      destination = null;
    };
  } else if (source === 'GOOGLE_FLIGHTS_BOOKING') {
    const selectedAirportsSelector = `.gws-flights-results__airports`;
    // Parse the HTML string to extract destination data.
    const destinationInputInnerHTML = await getDOMNodeInnerHTML(selectedAirportsSelector);
    const parsedDestinationInputInnerHTML = new DOMParser().parseFromString(destinationInputInnerHTML, "text/html");
    const destinationInputInnerSpanList = parsedDestinationInputInnerHTML.querySelectorAll('span');

    // Check destination input for IATA codes.
    if(destinationInputInnerSpanList[1]) {
      // An IATA origin code has been detected, lookup city and country and assign the returned data to the message payload.
      destinationAirport = destinationInputInnerSpanList[1].dataset.airportcode;
      
      const { city, country, state } = await iata.getAirportLocation(destinationAirport);

      if(state) {
        destination = `${city}, ${state}, ${country} - ${destinationAirport}`;
      } else {
        destination = `${city}, ${country} - ${destinationAirport}`;
      };
    } else {
      // No origin IATA code detected.
      destinationAirport = null;
      destination = null;
    };
  } else if (source === 'GOOGLE_FLIGHTS_CHECKOUT') {
    const { hash } = window.location;
    const splitHash = hash.split(".");

    destinationAirport = splitHash[1]; 
    const { city, country, state } = await iata.getAirportLocation(destinationAirport);

    if(state) {
      destination = `${city}, ${state}, ${country} - ${destinationAirport}`;
    } else {
      destination = `${city}, ${country} - ${destinationAirport}`;
    };
  };

  return destination;
};

/**
 * Get the specified DOM node list - returns a static (not live) node list.
 * @param {string} selector - A CSS selector used to identify an element from the DOM. 
 */
async function getDOMNodes(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));

  const DOMNodes = nodes.map((node) => {
    const { firstChild, outerHTML, outerText, textContent } = node;
    const firstChildHref = firstChild.href;

    return ({
      firstChild,
      firstChildHref,
      outerHTML,
      outerText,
      textContent
    });
  });

  return DOMNodes;
};

/**
 * Get the specified DOM node's innerHTML.
 * @param {string} selector - A CSS selector used to identify an element from the DOM.
 */
async function getDOMNodeInnerHTML(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  const filteredNodes = nodes.filter((node) => {
    return node.classList.length > 0;
  });
  const node = filteredNodes[0];
  const innerHTML = node.innerHTML;

  return innerHTML;
};

/**
 * Get the specified DOM node's innerText.
 * @param {string} selector - A CSS selector used to identify an element from the DOM.
 */
async function getDOMNodeText(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  const filteredNodes = nodes.filter((node) => {
    return node.classList.length > 0;
  });
  const node = filteredNodes[0];
  const innerText = node.innerText;

  return innerText;
};

/**
 * Get the specified DOM node's value.
 * @param {string} selector - A CSS selector used to identify an element from the DOM.
 */
async function getDOMNodeValue(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  const node = nodes[0];
  const value = node.value;

  if(!value) {
    return node.placeholder;
  } 

  return value;
};

export {
  getDestinationInputData,
  getDOMNodes,
  getDOMNodeInnerHTML,
  getDOMNodeText,
  getDOMNodeValue,
  getOriginInputData
};