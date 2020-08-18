import React, { Fragment, useEffect, useState } from 'react';
import { render } from 'react-dom';

function App() {
  const adapter = window.__CHROME_WEB_BROWSER_ADAPTER__;
  const { activeBrowserTabUrl, extensionWindowId } = adapter;
  
  const [ contextUrl, setContextUrl ] = useState();
  const [ pageType, setPageType ] = useState();

  // Effect to set the active `contextUrl`.
  useEffect(() => {
    let effectAborted = false;
  
    if (!effectAborted && adapter) {
      const { activeBrowserTabUrl } = adapter;

      const url = new URL(activeBrowserTabUrl);

      setContextUrl(url);
    };
  
    return (() => {
      effectAborted = true;
    });
  }, []);

  // Effect to set the active context `pageType`.
  useEffect(() => {
    let effectAborted = false;
  
    if (!effectAborted && adapter && contextUrl && !pageType) {
      if(contextUrl.href === 'chrome://extensions/' && pageType !== 'chromeExt') {
        setPageType("chromeExt");
      } else if(contextUrl.href === 'chrome://newtab/' && pageType !== 'newTab') {
        setPageType("newTab");
      } else if((contextUrl.href === 'http://localhost:3000/google-browsing-utility' || contextUrl.href === 'http://localhost:3000/') && pageType !== 'googleUtil') {
        setPageType("googleUtil");
      } else {
        setPageType("notSupported");
      };
    };
  
    return (() => {
      effectAborted = true;
    });
  }, [contextUrl, pageType]);
  
  if(adapter && pageType === 'chromeExt') {
    return (
      <Fragment>
        <h1>Hello, World!</h1>
        <p>{`I am Chrome Extension Adapter: ${extensionWindowId}.`}</p>
        <p>{`The current browser context is: ${activeBrowserTabUrl}.`}</p>
        <p>You are viewing Google's Extensions page. You can edit settings for this extension adapter there.</p>
      </Fragment>
    );
  } else if(adapter && pageType === 'googleUtil') {
    return (
      <Fragment>
        <h1>Hello, World!</h1>
        <p>{`I am Chrome Extension Adapter: ${extensionWindowId}.`}</p>
        <p>{`The current browser context is: ${activeBrowserTabUrl}.`}</p>
        <p>You are viewing the Google Utility in your localhost. To see more, please visit a supported site!</p>
      </Fragment>
    )
  } else if(adapter && pageType === 'newTab') {
    return (
      <Fragment>
        <h1>Hello, World!</h1>
        <p>{`I am Chrome Extension Adapter: ${extensionWindowId}.`}</p>
        <p>{`The current browser context is: ${activeBrowserTabUrl}.`}</p>
        <p>You Have opened a new Tab!</p>
      </Fragment>
    )
  } else if(adapter && pageType === 'notSupported') {
    return (
      <Fragment>
        <h1>Hello, World!</h1>
        <p>{`I am Chrome Extension Adapter: ${extensionWindowId}.`}</p>
        <p>{`The current browser context is: ${activeBrowserTabUrl}.`}</p>
        <p>Hmmm... this site is not amongst the list of supported urls for this extension. Would you like to add this page?</p>
      </Fragment>
    )
  } else {
    return null;
  };
};

render(
  <App />,
  document.getElementById('root')
);