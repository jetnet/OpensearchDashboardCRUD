import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from 'opensearch-dashboards/public';
import { Main } from './components/Main';

export const renderApp = (
  coreStart: CoreStart,
  { element }: AppMountParameters,
) => {
  ReactDOM.render(
    <Main
      coreStart={coreStart}
    />,
    element
  );

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  };
};
