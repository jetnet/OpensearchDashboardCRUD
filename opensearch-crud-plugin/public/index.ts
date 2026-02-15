/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from 'opensearch-dashboards/public';
import { CrudPluginClient } from './plugin';

/**
 * Plugin initialization function.
 * Called by OpenSearch Dashboards to instantiate the client-side plugin.
 *
 * @param initializerContext - Plugin initialization context
 * @returns Plugin instance
 */
export default function (initializerContext: PluginInitializerContext) {
  return new CrudPluginClient(initializerContext);
}

// Export types for external use
export * from './types';