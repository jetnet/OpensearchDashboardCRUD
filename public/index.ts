import { OsdCrudPlugin } from './plugin';

export function plugin() {
  return new OsdCrudPlugin();
}

export { OsdCrudPluginSetup, OsdCrudPluginStart } from './plugin';
