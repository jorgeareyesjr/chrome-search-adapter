import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as utils from './utils';

/**
 *  The extension's adapter is in charge of monitoring the browser for URL changes and providing the user with context-aware UI.
 */
function Adapter() {
  const activeTabUrl = useSelector(state => state.activeTabUrl);
  const activeParentWindowId = useSelector(state => state.activeParentWindowId);
  const adapterWindowId = useSelector(state => state.adapterWindowId);
  const supportedUrls = useSelector(state => state.supportedUrls);
  
  useEffect(() => {
    let useEffectAborted = false;

    if (!useEffectAborted && activeTabUrl && activeParentWindowId && adapterWindowId && supportedUrls) {
      /* Inject the appropriate micro-app, given the active tab URL and supported URLs. */
      utils.injectMicroApp(activeTabUrl, activeParentWindowId, adapterWindowId, supportedUrls);
    };

    return (() => {
      useEffectAborted = true;
    });
  }, [activeTabUrl, activeParentWindowId, adapterWindowId, supportedUrls]);

  return (
    <Fragment></Fragment>
  );
};

export default Adapter;