/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Public contexts module.
 * Exports all React contexts used by the CRUD plugin.
 */

// Entity context for global entity state management
export {
  EntityProvider,
  useEntityContext,
  type EntityState,
  type EntityContextValue,
  type EntityProviderProps,
} from './entity_context';

// Re-export the default context for advanced usage
export { default as EntityContext } from './entity_context';
