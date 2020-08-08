import React, { Fragment } from 'react';
import { render } from 'react-dom';

function App() {
  const { activeBrowserTabUrl, extensionWindowId } = window.__CHROME_WEB_BROWSER_ADAPTER__;

  if(activeBrowserTabUrl) {
    return (
      <Fragment>
        <h1>Hello, World!</h1>
        <p>{`I am Chrome Extension Adapter: ${extensionWindowId}.`}</p>
        <p>{`The current browser context is: ${activeBrowserTabUrl}.`}</p>
      </Fragment>
    );
  } else {
    return null;
  };
};

render(
  <App />,
  document.getElementById('o-app-root')
);