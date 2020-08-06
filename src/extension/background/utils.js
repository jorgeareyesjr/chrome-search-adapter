import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/**
 * Check if extension actions that can be taken on the current page by inspecting the active tab URL - update the page action icon accordingly.
 * @param {number} tabId - The active tab id.
 * @param {string} url - The active tab URL.
 */
async function checkTabUrl(tabId, url) {
  const state = store.getState();
  const { supportedUrls } = state;
  const tabUrl = new URL(url);
  const supportedUrl = supportedUrls.filter(( url ) => url.includes(tabUrl.origin));
  
  supportedUrl.length > 0 ? await chrome.pageAction.show(tabId) : await chrome.pageAction.hide(tabId);;

  const tab = await chrome.tabs.get(tabId);
  const window = await chrome.windows.get(tab.windowId);
  
  // Update store
  await store.dispatch(actions.setActiveTabId(tab.id));
  await store.dispatch(actions.setActiveWindowId(window.id));
};

/**
 * Check for previously opened extension windows associated with the active window id - If one exists, return it.
 * @param {number} windowId - The active window id.
 */
async function checkActiveWindows(windowId) {
  const state = store.getState();
  const { activeWindows } = state;

  if (activeWindows.length > 0) {
    for (let i = 0; i < activeWindows.length; i++) {
      let { parentWindowId, extensionWindowId } = activeWindows[i];

      if (windowId === parentWindowId) {
        return activeWindows[i];
      };

      if (windowId === extensionWindowId) {
        return activeWindows[i];
      };
    };
  };

  return null;
};

/** Create the extension's `contextMenu`. */
async function createMenu() {
  const commands = await chrome.commands.getAll();

  await commands.forEach((menu) => {
    chrome.contextMenus.create({
      id: menu.name,
      title: menu.description,
      contexts: ['all']
    });
  });
};

/**
 * Identify and return the display device that contains the  active window.
 * @param {array} displayInfo - An array of objects that contains the information for all attached display devices. 
 * @param {object} window - The active window.
 */
async function getActiveDisplayDevice(displayInfo, window) {
  let activeDisplay = null;
    
  try {
    let index = -1; 
    let outerBounds = -1;

    // Note: When working with multiple (non-mirrored) monitors, the OS creates a "combined" coordinate space between all connected display devices.
    // Calculate the `window` position within the "combined" coordinate space and get the logical boundaries of the display device.
    for (let i = 0; i < displayInfo.length; i++) {
      const workArea = displayInfo[i].workArea;

      const windowTop = window.top;
      const windowRight = window.left + window.width;
      const windowBottom = window.top + window.height;
      const windowLeft = window.left;

      const workAreaTop = workArea.top;
      const workAreaRight = workArea.left + workArea.width;
      const workAreaBottom = workArea.top + workArea.height;
      const workAreaLeft = workArea.left;

      // Calculate left bound.
      const left = windowLeft > workAreaLeft ? windowLeft : workAreaLeft;

      // Calculate right bound.
      const right = windowRight < workAreaRight ? windowRight : workAreaRight;

      // Calculate top bound.
      const top = windowTop > workAreaTop ? windowTop : workAreaTop;

      // Calculate bottom bound.
      const bottom =  windowBottom < workAreaBottom ? windowBottom : workAreaBottom;

      // Calculate the display device size.
      const size = (right - left) * (bottom - top); 

      if (size > outerBounds) {
        outerBounds = size;
        index = i;
      };
    };

    if (index !== -1) {
      activeDisplay = displayInfo[index];
    };
  } catch(error) {
    console.log(error);
  };

  return activeDisplay;
};

/**
 * Calculate the "snapping" positions of both the extension window and it's associated parent within the active display device.
 * @param {string} position - The position to open the extension window.
 * @param {object} displayDevice - The active display device.
 */
async function getWindowSnapPositions(position, displayDevice) {
  const { workArea } = displayDevice;

  const parentWindow = {
    left: workArea.left,
    top: workArea.top,
    width: workArea.width,
    height: workArea.height,
  };

  const extensionWindow = {
    left: workArea.left,
    top: workArea.top,
    width: workArea.width,
    height: workArea.height,
  };

  switch (position) {
    case 'right':
      extensionWindow.left = Math.floor(workArea.left + (workArea.width /2));
      extensionWindow.width = Math.floor(workArea.width / 2);
      parentWindow.left = Math.floor(workArea.left);
      parentWindow.width = Math.floor(workArea.width / 2);;
      break;
    case 'bottom':
      extensionWindow.height = Math.floor(extensionWindow.height / 2);
      extensionWindow.top = Math.floor(extensionWindow.top + extensionWindow.height);
      parentWindow.top = Math.floor(workArea.top - workArea.height);
      parentWindow.height = Math.floor(workArea.height / 2);
      break;
    case 'left':
      extensionWindow.left = Math.floor(workArea.left);
      extensionWindow.width = Math.floor(workArea.width / 2);
      parentWindow.left = Math.floor(extensionWindow.left + extensionWindow.width);
      parentWindow.width = Math.floor(workArea.width / 2);
      break;
  };

  let parentWindowPosition = parentWindow;
  let extensionWindowPosition = extensionWindow;

  return { parentWindowPosition, extensionWindowPosition };
};

/** Establish a long-lived connection with the extension's window script. */
async function handleWindowScriptConnection(port) {
  const handleDisconnect = (port) => {
    port.onMessage.removeListener(handleMessages);
  };
  const handleMessages = (message) => {
    switch (message.type) {
      // Pass initial data to extension window script when it initializes.
      case "REQUEST_DATA": {
        const state = store.getState();
        const { activeWindows, supportedUrls } = state;

        port.postMessage({
          type: "DATA_RESPONSE",
          activeWindows,
          supportedUrls
        });
        break;
      };
    };
  };

  port.onDisconnect.addListener(handleDisconnect);port.onMessage.addListener(handleMessages);
};

/**
 * Open the extension window - If one already exists, refocus it, otherwise, open a new one.
 * @param {number} activeTabId - The active tab id.
 * @param {number} activeWindowId - The active window id.
 * @param {object} activeWindowSet - The active extension windows, if applicable.
 * @param {object} windowSize - The size parameters for opening the window.
 */
async function openExtensionWindow(activeTabId, activeWindowId, activeWindowSet, windowSize) {
  async function openNewWindow() {
    // If no `activeExtensionWindow` exists, open a `newExtensionWindow`.
    const hash = btoa(JSON.stringify({ activeTabId }));
    const view = 'views/window.html';
    const url = await chrome.extension.getURL(`${view}#${hash}`);
    const newExtensionWindow = await chrome.windows.create({ type: 'popup', url, ...windowSize });
    const { id } = newExtensionWindow;

    await chrome.windows.update(id, { focused: true, ...windowSize });

    // Update store
    await store.dispatch(actions.createWindow(activeWindowId, id));
  }

  if (activeWindowSet) {
    // Refocus the `activeExtensionWindow`, if applicable.
    const { parentWindowId, extensionWindowId } = activeWindowSet;

    if (activeWindowId === parentWindowId) {
      await chrome.windows.update(extensionWindowId, { focused: true, ...windowSize });
    } else {
      openNewWindow();
    }
  } else {
    openNewWindow();
  };
};

/** Set the default settings for the extension. */
async function setDefaultSettings() {
  // TODO: Handle URL from other geolocations (in case user is running a VPN that the browser reflects in the URL).
  
  // IDEA: Fetch these from external API, then sync to localStorage.
  const supportedUrls = [
    `https://duckduckgo.com`,
    `https://www.google.com`
  ];

  // Update store
  await store.dispatch(actions.setSupportedUrls(supportedUrls));

  // Inspect the active tab URL to check if extension actions that can be taken on the current page.
  await chrome.tabs.query({ currentWindow: true, active : true }, async (tabArray) => {
    const { id, url } = tabArray[0];
    await checkTabUrl(id, url);
  });
  
  store.subscribe(async () => {
    await console.log('state\n', store.getState());
  });
};

/**
 * Simultaneously open the extension popup window and resize/reposition the active chrome window, according to the user-selected position.
 * @param {string} command - The user's selected position.
 * @param {object} displayInfo - An array of objects that contains the information for all attached display devices. 
 */
async function snapWindows(command, displayInfo) {
  const state = store.getState();
  const { activeTabId, activeWindowId } = state;
  const activeWindow = await chrome.windows.get(activeWindowId);
  const activeDisplayDevice = await getActiveDisplayDevice(displayInfo, activeWindow);
  const activeWindowSet = await checkActiveWindows(activeWindowId);

  const position = command.split('-').pop();
  const { parentWindowPosition, extensionWindowPosition } = await getWindowSnapPositions(position, activeDisplayDevice);

  if (activeWindow && activeWindow.state === 'fullscreen') {
    await chrome.windows.update(activeWindowId, { state: 'normal' });
    await setTimeout(async () => {
      await chrome.windows.update(activeWindowId, { focused: true, ...parentWindowPosition });
      await openExtensionWindow(activeTabId, activeWindowId, activeWindowSet, extensionWindowPosition);
    }, 0);
  } else {
    await chrome.windows.update(activeWindowId, { focused: true, ...parentWindowPosition });
    await openExtensionWindow(activeTabId, activeWindowId, activeWindowSet, extensionWindowPosition);
  };
};

export {
  checkTabUrl,
  checkActiveWindows,
  createMenu,
  handleWindowScriptConnection,
  setDefaultSettings,
  snapWindows
};