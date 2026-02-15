/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Public components module.
 * Exports all React components used by the CRUD plugin.
 */

// Entity List View - Main data grid component
export { EntityListView, type EntityListViewProps } from './entity_list_view';

// Entity Form - Create/Edit form component
export { EntityForm, type EntityFormProps, type FormMode } from './entity_form';

// Filter Bar - Filter controls component
export { FilterBar, type FilterBarProps } from './filter_bar';

// Pagination Bar - Pagination controls component
export { PaginationBar, type PaginationBarProps } from './pagination_bar';

// Bulk Actions Bar - Bulk operation controls component
export { BulkActionsBar, type BulkActionsBarProps } from './bulk_actions_bar';

// Confirm Modal - Confirmation dialog component
export {
  ConfirmModal,
  DeleteConfirmModal,
  type ConfirmModalProps,
  type DeleteConfirmModalProps,
} from './confirm_modal';
