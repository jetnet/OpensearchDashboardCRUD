/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Public hooks module.
 * Exports all custom React hooks used by the CRUD plugin.
 */

// Entity list management hook
export {
  useEntityList,
  type EntityListState,
  type PaginationControls,
  type FilterControls,
  type SortControls,
  type UseEntityListResult,
} from './use_entity_list';

// Filter management hook
export {
  useFilters,
  type FilterOption,
  FILTER_OPTIONS,
  OPERATOR_LABELS,
  type UseFiltersResult,
} from './use_filters';

// Sorting management hook
export {
  useSorting,
  type SortDirection,
  type SortOption,
  SORT_OPTIONS,
  type UseSortingResult,
} from './use_sorting';

// Selection management hook
export {
  useSelection,
  type UseSelectionResult,
} from './use_selection';
