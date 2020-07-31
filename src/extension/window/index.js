import React from 'react';
import ReactDOM from 'react-dom';

const main = document.createElement('div');
document.body.appendChild(main);

(async () => {
  // TODO: Handshake connection with extension's `background script`.
  // TODO: Handshake connection with extension's `content script`.
  console.log("windowScript INIT");
  
  try {
    ReactDOM.render(
      <div>Window UI</div>,
      main
    );
  } catch (err) {
    console.error(chrome.runtime.lastError);
  };
})();