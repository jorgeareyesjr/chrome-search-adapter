import 'chrome-extension-async';
import { store } from './index';
import actions from './actions';

/**
 * Check if extension actions that can be taken on the current browser tab by inspecting the URL - update the page action icon accordingly.
 * @param {number} tabId - The active tab id.
 * @param {string} url - The active tab url.
 */
async function checkTabUrl(tabId, url) {
  const { supportedUrls } = store.getState();
  const tabUrl = new URL(url);
  const supportedUrl = supportedUrls.filter((url) => url.includes(tabUrl.origin));
  
  supportedUrl.length > 0 ? await chrome.pageAction.show(tabId) : await chrome.pageAction.hide(tabId);;

  const tab = await chrome.tabs.get(tabId);
  const window = await chrome.windows.get(tab.windowId);
  
  await store.dispatch(actions.setActiveBrowserTabId(tab.id));
  await store.dispatch(actions.setActiveBrowserTabUrl(tab.url));
  await store.dispatch(actions.setActiveBrowserWindowId(window.id));
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
 * Identify and return the display device that contains the  active browser window.
 * @param {array} displayInfo - An array of objects that contains the information for all attached display devices. 
 * @param {object} window - The active browser window.
 */
async function getActiveDisplayDevice(displayInfo, window) {
  let activeDisplayDevice = null;
    
  try {
    let device = -1; 
    let activeCoordinateSpace = -1;

    // Note: When working with multiple (non-mirrored) monitors, the OS creates a "combined" coordinate space between all connected display devices.
    // Check each connected display device to map out the combined coordinate space, then check each mapped coordinate space to see if it contains the active browser window.
    for(let i = 0; i < displayInfo.length; i++) {
      const workArea = displayInfo[i].workArea;

      const windowTop = window.top;
      const windowRight = window.left + window.width;
      const windowBottom = window.top + window.height;
      const windowLeft = window.left;

      const workAreaTop = workArea.top;
      const workAreaRight = workArea.left + workArea.width;
      const workAreaBottom = workArea.top + workArea.height;
      const workAreaLeft = workArea.left;

      // Calculate the active browser window position within the active coordinate space.
      const left = windowLeft > workAreaLeft ? windowLeft : workAreaLeft;
      const right = windowRight < workAreaRight ? windowRight : workAreaRight;
      const top = windowTop > workAreaTop ? windowTop : workAreaTop;
      const bottom =  windowBottom < workAreaBottom ? windowBottom : workAreaBottom;
      const position = (right - left) * (bottom - top);

      // Check each display device coordinate space for the active browser window, if one contains, return the display device.
      if(position > activeCoordinateSpace) {
        activeCoordinateSpace = position;
        device = i;
      };
    };

    if(device !== -1) {
      activeDisplayDevice = displayInfo[device];
    };
  } catch(error) {
    console.log(error);
  };

  return activeDisplayDevice;
};

/**
 * Check for a previously opened extension adapter window associated with the active browser window id - If one exists, return it.
 * @param {number} windowId - The active browser window id.
 */
async function getActiveExtensionWindow(windowId) {
  const { activeExtensionWindows } = store.getState();

  if(activeExtensionWindows.length > 0) {
    for(let i = 0; i < activeExtensionWindows.length; i++) {
      let { parentWindowId, extensionWindowId } = activeExtensionWindows[i];

      if(windowId === parentWindowId) {
        return activeExtensionWindows[i];
      };

      if(windowId === extensionWindowId) {
        return activeExtensionWindows[i];
      };
    };
  };

  return null;
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

  switch(position) {
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

/**
 * Open the extension window - If one already exists, refocus it, otherwise, open a new one.
 * @param {number} activeTabId - The active browser tab id.
 * @param {number} activeWindowId - The active browser window id.
 * @param {object} activeExtensionWindow - The active extension window, if applicable.
 * @param {object} windowSize - The window's size.
 */
async function openExtensionWindow(activeTabId, activeWindowId, activeExtensionWindow, windowSize) {
  async function openNewWindow() {
    const hash = btoa(JSON.stringify({ activeTabId }));
    const view = 'views/window.html';
    const url = await chrome.extension.getURL(`${view}#${hash}`);
    const extensionWindow = await chrome.windows.create({ type: 'popup', url, ...windowSize });
    const { id } = extensionWindow;

    await chrome.windows.update(id, { focused: true, ...windowSize });

    await store.dispatch(actions.createExtensionWindow(activeWindowId, id));
  };

  if(activeExtensionWindow) {
    // Refocus the `activeExtensionWindow`, if applicable.
    const { parentWindowId, extensionWindowId } = activeExtensionWindow;

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
    // TODO
    // `https://duckduckgo.com`,
    `https://www.google.com`
  ];

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
 * Simultaneously open the extension window and resize/reposition the active chrome window, according to the user-selected position.
 * @param {string} command - The user's selected position.
 * @param {object} displayInfo - An array of objects that contains the information for all attached display devices. 
 */
async function snapWindows(command, displayInfo) {
  const { activeBrowserTabId, activeBrowserWindowId } = store.getState();
  const activeBrowserWindow = await chrome.windows.get(activeBrowserWindowId);
  const activeDisplayDevice = await getActiveDisplayDevice(displayInfo, activeBrowserWindow);
  const activeExtensionWindow = await getActiveExtensionWindow(activeBrowserWindowId);

  const position = command.split('-').pop();
  const { parentWindowPosition, extensionWindowPosition } = await getWindowSnapPositions(position, activeDisplayDevice);

  if(activeBrowserWindow && activeBrowserWindow.state === 'fullscreen') {
    await chrome.windows.update(activeBrowserWindowId, { state: 'normal' });
    await setTimeout(async () => {
      await chrome.windows.update(activeBrowserWindowId, { focused: true, ...parentWindowPosition });
      await openExtensionWindow(activeBrowserTabId, activeBrowserWindowId, activeExtensionWindow, extensionWindowPosition);
    }, 0);
  } else {
    await chrome.windows.update(activeBrowserWindowId, { focused: true, ...parentWindowPosition });
    await openExtensionWindow(activeBrowserTabId, activeBrowserWindowId, activeExtensionWindow, extensionWindowPosition);
  };
};

export {
  checkTabUrl,
  createMenu,
  getActiveExtensionWindow,
  setDefaultSettings,
  snapWindows
};