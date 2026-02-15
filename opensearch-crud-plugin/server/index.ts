/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from 'opensearch-dashboards/server';
import { CrudPluginServer } from './plugin';
import type { CrudPluginConfig } from './types';

/**
 * Plugin initialization function.
 * Called by OpenSearch Dashboards to instantiate the server-side plugin.
 *
 * @param initializerContext - Plugin initialization context with config and logger
 * @returns Plugin instance
 */
export default function (initializerContext: PluginInitializerContext<CrudPluginConfig>) {
  return new CrudPluginServer(initializerContext);
}

// Export types for external use
export * from './types';