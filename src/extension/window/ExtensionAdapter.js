import React, { Fragment, useEffect } from 'react';
import * as utils from './utils';

/** The extension adapter is in charge of monitoring the active browsing context, providing the user with context-aware UI. */
function ExtensionAdapter() {
  useEffect(() => {
    let useEffectAborted = false;

    if (!useEffectAborted) {
      utils.injectMicroApp();
    };

    return (() => {
      useEffectAborted = true;
    });
  }, []);

  return (
    <Fragment></Fragment>
  );
};

export default ExtensionAdapter;