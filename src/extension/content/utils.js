import 'chrome-extension-async';

async function getDOMElements() {
  // TODO - add mutation observer to track returned search results.
  // TODO: Create an "options" page to handle adding/removing `selectors`/`supportedUrls`/`attributes`/`mutation-observers`
  const selector = "div.r";
  const selectors = Array.from(document.querySelectorAll(selector));

  const DOMElements = selectors.map((element) => {
    const { firstChild, outerHTML, outerText, textContent } = element;
    const firstChildHref = firstChild.href;

    return ({
      firstChildHref,
      outerHTML,
      outerText,
      textContent
    });
  });

  return DOMElements;
};

export {
  getDOMElements
};