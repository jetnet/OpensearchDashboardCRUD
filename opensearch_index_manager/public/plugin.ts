import { CoreSetup, CoreStart, Plugin } from 'opensearch-dashboards/public';
import { PLUGIN_NAME, PLUGIN_ID } from '../common/constants';
import { AppPluginSetupDependencies, AppPluginStartDependencies } from './types';

export class OpenSearchIndexManagerPlugin
  implements Plugin<void, void, AppPluginSetupDependencies, AppPluginStartDependencies>
{
  public setup(core: CoreSetup<AppPluginStartDependencies>) {
    // Register the application
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      order: 4000,
      euiIconType: 'managementApp',
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      async mount(params: any) {
        // Dynamically import for code splitting
        const { renderApp } = await import('./application');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart, params);
      },
    });

    // Register navigation link
    core.chrome.navGroup.addNavLinksToGroup('management', [
      {
        id: PLUGIN_ID,
        title: PLUGIN_NAME,
        order: 4000,
      },
    ]);
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
