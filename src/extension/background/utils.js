import 'chrome-extension-async';

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
 * Identify and return the display device that contains the active chrome window the user is interacting with.
 * @param {array} displayInfo - An array of objects that contains the information for all attached display devices. 
 * @param {object} window - The active chrome window the user is interacting with.
 */
async function getActiveDisplay(displayInfo, window) {
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
      }
    }

    if (index !== -1) {
      activeDisplay = displayInfo[index];
    }


  } catch(error) {
    console.log(error);
  }

  return activeDisplay;
};

/**
 * Calculate the "snapping" positions of the active chrome window and extension window, within the active display device bounds.
 * @param {string} command - User-selected position to open the extension popup window.
 * @param {object} displayDevice - The detected display device that contains the active chrome window the user is interacting with.
 */
async function getWindowSnapPositions(command, displayDevice) {
  const { workArea } = displayDevice;

  const chromeWindow = {
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

  switch (command) {
    case 'right':
      extensionWindow.left = Math.floor(workArea.left + (workArea.width /2));
      extensionWindow.width = Math.floor(workArea.width / 2);
      chromeWindow.left = Math.floor(workArea.left);
      chromeWindow.width = Math.floor(workArea.width / 2);;
      break;
    case 'bottom':
      extensionWindow.height = Math.floor(extensionWindow.height / 2);
      extensionWindow.top = Math.floor(extensionWindow.top + extensionWindow.height);
      chromeWindow.top = Math.floor(workArea.top - workArea.height);
      chromeWindow.height = Math.floor(workArea.height / 2);
      break;
    case 'left':
      extensionWindow.left = Math.floor(workArea.left);
      extensionWindow.width = Math.floor(workArea.width / 2);
      chromeWindow.left = Math.floor(extensionWindow.left + extensionWindow.width);
      chromeWindow.width = Math.floor(workArea.width / 2);
      break;
  }

  let chromeWindowPosition = chromeWindow;
  let extensionWindowPosition = extensionWindow;

  return { chromeWindowPosition, extensionWindowPosition };
};

/**
 * Open the extension popup window with the specified parameters below.
 * @param {string} action - The behavior of the extensions popup window.
 * @param {number} tabId - The id value of the Chrome tab that the user is interacting with.
 * @param {string} view - The path of the extension popup window html template.
 * @param {object} windowSize - The size parameters of the extension popup window.
 * @param {number} parentChromeWindowId - The id of the active chrome window the user is interacting with.
 */
async function openExtensionWindow(action, tabId, view, windowSize, parentChromeWindowId) {
  // TODO: Create a store to track 
  const existingWindow = null;
  const hash = btoa(JSON.stringify({ tabId }));

  if (existingWindow) {
    // Reselects the `existingWindow` if one is already open.
    await chrome.windows.update(existingWindow, { focused: true, ...windowSize });
  } else if (action === 'open') {
    // If no `existingWindow` is detected, open a new one.
    const url = await chrome.extension.getURL(`${view}#${hash}`);
    const newExtensionWindow = await chrome.windows.create({ type: 'popup', url, ...windowSize });
    await chrome.windows.update(newExtensionWindow.id, { focused: true, ...windowSize });
  }

  return existingWindow;
};

/**
 * Open the extension popup window and resize/reposition the active chrome window accordingly.
 * @param {string} command - The the user's selected `contentMenu` item value.
 * @param {object} tab - The chrome tab the user is interacting with.
 * @param {object} displayInfo - An array of objects that contains the information for all attached display devices. 
 */
async function snapWindows(command, tab, displayInfo) {
  const activeChromeWindow = await chrome.windows.get(tab.windowId);
  const activeDisplay = await getActiveDisplay(displayInfo, activeChromeWindow);
  const position = command.split('-').pop();
  const view = 'views/window.html';
  const windowSnapPositions = await getWindowSnapPositions(position, activeDisplay);
  const { chromeWindowPosition, extensionWindowPosition } = windowSnapPositions;

  if (activeChromeWindow && activeChromeWindow.state === 'fullscreen') {
    await chrome.windows.update(activeChromeWindow.id, { state: 'normal' });
    await setTimeout(async () => {
      await chrome.windows.update(activeChromeWindow.id, { focused: true, ...chromeWindowPosition });
      await openExtensionWindow('open', tab.id, view, extensionWindowPosition, activeChromeWindow.id);
    }, 0);
  } else {
    await chrome.windows.update(activeChromeWindow.id, { focused: true, ...chromeWindowPosition });
    await openExtensionWindow('open', tab.id, view, extensionWindowPosition, activeChromeWindow.id);
  }
};

export {
  createMenu,
  snapWindows
};