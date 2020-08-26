import 'chrome-extension-async';

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

  return value;
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
      firstChildHref,
      outerHTML,
      outerText,
      textContent
    });
  });

  return DOMNodes;
};

export {
  getDOMNodes,
  getDOMNodeText,
  getDOMNodeValue,
};