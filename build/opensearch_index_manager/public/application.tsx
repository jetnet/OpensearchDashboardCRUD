import React from 'react';
import ReactDOM from 'react-dom';
import { CoreStart } from 'opensearch-dashboards/public';
import { AppRoot } from './components/app_root';
import { AppPluginStartDependencies } from './types';

export const renderApp = (
  core: CoreStart,
  deps: AppPluginStartDependencies,
  { element, history }: any
) => {
  // Set document title
  core.chrome.docTitle.change('Index Manager');
  
  // Render application
  ReactDOM.render(
    <AppRoot core={core} deps={deps} history={history} />,
    element
  );

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  };
};
