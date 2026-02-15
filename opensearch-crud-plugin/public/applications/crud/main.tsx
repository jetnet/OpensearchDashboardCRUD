/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CoreStart } from 'opensearch-dashboards/public';
import type { CrudPluginStartDeps } from '../../types';
import React from 'react';
import ReactDOM from 'react-dom';
import { CrudApp } from './index';

/**
 * Renders the CRUD application into the DOM.
 *
 * @param params - Application mount parameters
 * @returns Unmount function to clean up the application
 */
export const renderApp = (params: {
  element: HTMLElement;
  core: CoreStart;
  deps: CrudPluginStartDeps;
}): (() => void) => {
  const { element, core, deps } = params;

  ReactDOM.render(
    <CrudApp
      core={core}
      deps={deps}
    />,
    element
  );

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  };
};