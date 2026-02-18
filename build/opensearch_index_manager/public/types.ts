import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../src/plugins/data/public';

// Plugin setup dependencies (from requiredPlugins)
export interface AppPluginSetupDependencies {
  // No setup dependencies needed
}

// Plugin start dependencies (from requiredPlugins)
export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

// Services exposed by this plugin (if any)
export interface AppPluginStart {
  // This plugin doesn't expose external services
}
