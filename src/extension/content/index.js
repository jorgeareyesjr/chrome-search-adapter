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
    switch (message.type) {
      case "REQUEST CURRENT URL CONTEXT": {
        port.postMessage({
          type: "CURRENT URL CONTEXT RESPONSE",
          contextUrl: window.location.href
        });      
        break;
      };
      case "REQUEST SEARCH RESULTS": {
        const DOMElements = await utils.getDOMElements();

        port.postMessage({
          type: "SEARCH RESULT RESPONSE",
          DOMElements
        });

        break;     
      };
    };
  };

  port.onMessage.addListener(handleMessages);
  port.onDisconnect.addListener(handleDisconnect);
};

chrome.runtime.onConnect.addListener(connectToWindowScript);