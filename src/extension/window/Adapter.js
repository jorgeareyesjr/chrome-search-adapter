import React, { Fragment, useEffect } from 'react';
import * as utils from './utils';

/** The extension's adapter is in charge of monitoring the active browsing context to provide the user with context-aware UI. */
function Adapter() {
  useEffect(() => {
    let useEffectAborted = false;

    if (!useEffectAborted) {
      utils.injectApp();
    };

    return (() => {
      useEffectAborted = true;
    });
  }, []);

  return (
    <Fragment></Fragment>
  );
};

export default Adapter;