import 'chrome-extension-async';

async function createMenu() {
  const commands = await chrome.commands.getAll();

  await commands.forEach((menu) => {
    chrome.contextMenus.create({
      id: menu.name,
      title: menu.description,
      contexts: ['all']
    });
  });
}

export {
  createMenu
};