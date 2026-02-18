import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../src/plugins/data/public';

// Plugin setup dependencies (from requiredPlugins)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppPluginSetupDependencies {
  // No setup dependencies needed - intentional empty interface for future extension
}

// Plugin start dependencies (from requiredPlugins)
export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

// Services exposed by this plugin (if any)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppPluginStart {
  // This plugin doesn't expose external services - intentional empty interface
}
