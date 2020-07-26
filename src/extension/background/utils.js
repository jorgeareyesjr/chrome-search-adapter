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
 * Identify and return the active display from the list of attached display devices.
 * @param {array} displayInfo - An array of objects that contains the information for all attached display devices. 
 * @param {object} activeWindow - The active tab's parent window.
 */
async function getActiveDisplay(displayInfo, activeWindow) {
  let activeDisplay = null;

  try {
    let highestAreaDisplay = -1;
    let highestAreaDisplayIndex = -1;

    for (let i = 0; i < displayInfo.length; i++) {
      const currentWorkArea = displayInfo[i].workArea;

      // Calculate the current display's left logical bound.
      const leftBound = activeWindow.left > currentWorkArea.left ? activeWindow.left : currentWorkArea.left;

      // Calculate the current display's right logical bound.
      const rightBound = activeWindow.left + activeWindow.width < currentWorkArea.left + currentWorkArea.width ?
      activeWindow.left + activeWindow.width : currentWorkArea.left + currentWorkArea.width;

      // Calculate the current display's top logical bound.
      const topBound = activeWindow.top > currentWorkArea.top ? activeWindow.top : currentWorkArea.top;

      // Calculate the current display's bottom logical bound.
      const bottomBound = activeWindow.top + activeWindow.height < currentWorkArea.top + currentWorkArea.height ?
      activeWindow.top + activeWindow.height : currentWorkArea.top + currentWorkArea.height;
      
      // Calculate the current display's `area`.
      const width = (rightBound - leftBound); 
      const height = (bottomBound - topBound);
      const area = width * height;

      if (area > highestAreaDisplay) {
        highestAreaDisplay = area;
        highestAreaDisplayIndex = i;
      }
    }

    if (highestAreaDisplayIndex !== -1) {
      activeDisplay = displayInfo[highestAreaDisplayIndex];
    }
  } catch(error) {
    console.log(error);
  }

  return activeDisplay;
}

async function openAdapterWindow(command, activeTab, displayInfo) {
  const activeWindow = await chrome.windows.get(activeTab.windowId);
  const activeDisplay = await getActiveDisplay(displayInfo, activeWindow);;

  // TODO: Calculate new window sizes for `adapterWindow` and `parentWindow`, based off `activeDisplay.workArea` and `position`.
  const adapterWindow = {
    left: activeDisplay.workArea.left,
    top: activeDisplay.workArea.top,
    width: activeDisplay.workArea.width,
    height: activeDisplay.workArea.height
  };
  const parentWindow = {
    left: activeDisplay.workArea.left,
    top: activeDisplay.workArea.top,
    width: activeDisplay.workArea.width,
    height: activeDisplay.workArea.height,
  };

  const position = command.split('-').pop();
  
  // await console.log("adapterWindow: ", adapterWindow);
  // await console.log("parentWindow: ", parentWindow);
  // await console.log("position: ", position);
}

export {
  createMenu,
  openAdapterWindow
};