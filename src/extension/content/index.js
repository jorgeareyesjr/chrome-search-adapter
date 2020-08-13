/**
 * Connect to the extension adapter's window script, whenever the content script is successfully injected.
 * @param {object} port - The connection channel used to pass messages between two separate scripts running in different browsing contexts - In this case, the extension window script and injected content script.
 * SEE: https://developer.chrome.com/extensions/runtime#event-onConnect
 */
async function connectToAdapterWindow(port) {
  const handleDisconnect = () => {
    port.onMessage.removeListener(handleMessages);
    chrome.runtime.onConnect.removeListener(connectToAdapterWindow)
  };
  const handleMessages = async (message) => {
    switch (message.type) {
      case "TEST CONNECTION": {
        console.log('CONNECTED TO WINDOW SCRIPT.');
        port.postMessage({
          type: "TEST CONNECTION SUCCESS"
        });      
        break;
      };
    };
  };

  port.onMessage.addListener(handleMessages);
  port.onDisconnect.addListener(handleDisconnect);
};

chrome.runtime.onConnect.addListener(connectToAdapterWindow);