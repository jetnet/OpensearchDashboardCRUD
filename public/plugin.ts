import { CoreSetup, CoreStart, AppMountParameters, Plugin } from 'opensearch-dashboards/public';

export interface OsdCrudPluginSetup {}
export interface OsdCrudPluginStart {}

export class OsdCrudPlugin implements Plugin<OsdCrudPluginSetup, OsdCrudPluginStart> {
  public setup(core: CoreSetup): OsdCrudPluginSetup {
    core.application.register({
      id: 'osdCrud',
      title: 'Entity Management',
      async mount(params: AppMountParameters) {
        const [coreStart] = await core.getStartServices();
        const { renderApp } = await import('./application');
        return renderApp(coreStart, params);
      },
    });

    return {};
  }

  public start(core: CoreStart): OsdCrudPluginStart {
    return {};
  }

  public stop() {}
}
