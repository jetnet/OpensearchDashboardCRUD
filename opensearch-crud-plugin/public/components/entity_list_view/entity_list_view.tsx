/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity List View Component - Main data grid component for displaying entities.
 * Uses OuiDataGrid for rendering with sorting, selection, and actions.
 */

import React, { useMemo, useCallback, type ReactNode } from 'react';
import {
  OuiDataGrid,
  OuiLoadingSpinner,
  OuiCallOut,
  OuiButton,
  OuiButtonIcon,
  OuiSpacer,
  OuiFlexGroup,
  OuiFlexItem,
  OuiEmptyPrompt,
  type OuiDataGridSorting,
  type OuiDataGridPagination,
  type OuiDataGridColumn,
  type OuiDataGridRowHeightsOptions,
} from '@opensearch-project/oui';
import type { Entity } from '../../types';
import type { SortField } from '../../../common';

/**
 * Props for EntityListView component
 */
export interface EntityListViewProps {
  /** Array of entities to display */
  entities: Entity[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: { message: string } | null;
  /** Total count of entities */
  totalCount: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Sort fields */
  sort: SortField[];
  /** Selected entity IDs */
  selectedIds: Set<string>;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange: (size: number) => void;
  /** Sort change handler */
  onSortChange: (sort: SortField[]) => void;
  /** Selection toggle handler */
  onSelectionToggle: (id: string) => void;
  /** Select all handler */
  onSelectAll: () => void;
  /** Clear selection handler */
  onClearSelection: () => void;
  /** Edit entity handler */
  onEdit: (entity: Entity) => void;
  /** Delete entity handler */
  onDelete: (id: string) => void;
  /** Refresh handler */
  onRefresh: () => void;
  /** Create new entity handler */
  onCreate: () => void;
  /** Toolbar visibility controls */
  toolbarVisibility?: {
    showDisplaySelector?: boolean;
    showSortSelector?: boolean;
    showFullScreenSelector?: boolean;
  };
}

/**
 * Column definitions for the entity data grid
 */
const COLUMN_DEFINITIONS: OuiDataGridColumn[] = [
  {
    id: 'id',
    display: 'ID',
    displayAsText: 'ID',
    schema: 'string',
    defaultSortDirection: 'asc',
  },
  {
    id: 'title',
    display: 'Title',
    displayAsText: 'Title',
    schema: 'string',
    defaultSortDirection: 'asc',
  },
  {
    id: 'description',
    display: 'Description',
    displayAsText: 'Description',
    schema: 'string',
  },
  {
    id: 'status',
    display: 'Status',
    displayAsText: 'Status',
    schema: 'string',
  },
  {
    id: 'priority',
    display: 'Priority',
    displayAsText: 'Priority',
    schema: 'numeric',
  },
  {
    id: 'tags',
    display: 'Tags',
    displayAsText: 'Tags',
    schema: 'string',
  },
  {
    id: 'createdAt',
    display: 'Created At',
    displayAsText: 'Created At',
    schema: 'datetime',
  },
  {
    id: 'updatedAt',
    display: 'Updated At',
    displayAsText: 'Updated At',
    schema: 'datetime',
  },
  {
    id: 'actions',
    display: 'Actions',
    displayAsText: 'Actions',
    isSortable: false,
  },
];

/**
 * Formats a date string for display
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats tags array for display
 */
function formatTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return '-';
  return tags.slice(0, 3).join(', ') + (tags.length > 3 ? ` +${tags.length - 3}` : '');
}

/**
 * Entity List View Component
 * Displays entities in an OuiDataGrid with sorting, pagination, and actions
 */
export function EntityListView({
  entities,
  isLoading,
  error,
  totalCount,
  page,
  pageSize,
  sort,
  selectedIds,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSelectionToggle,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  onRefresh,
  onCreate,
  toolbarVisibility,
}: EntityListViewProps): ReactNode {
  // Convert entities to row data
  const rowData = useMemo(() => {
    return entities.map((entity) => ({
      id: entity.id,
      title: entity.attributes?.name || '-',
      description: entity.attributes?.description || '-',
      status: entity.attributes?.status || 'active',
      priority: '-',
      tags: formatTags(entity.attributes?.tags),
      createdAt: formatDate(entity.created_at),
      updatedAt: formatDate(entity.updated_at),
      actions: entity,
    }));
  }, [entities]);

  // Convert sort to OuiDataGrid format
  const gridSorting: OuiDataGridSorting = useMemo(() => {
    if (sort.length === 0) {
      return { columns: [] };
    }
    return {
      columns: sort.map((s) => ({
        id: s.field,
        direction: s.direction,
      })),
    };
  }, [sort]);

  // Pagination configuration
  const pagination: OuiDataGridPagination = useMemo(
    () => ({
      pageIndex: page - 1, // OuiDataGrid uses 0-indexed pages
      pageSize,
      pageSizeOptions: [10, 25, 50, 100],
      totalItemCount: totalCount,
    }),
    [page, pageSize, totalCount]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSorting: OuiDataGridSorting) => {
      const newSort: SortField[] = newSorting.columns.map((col, index) => ({
        field: col.id,
        direction: col.direction as 'asc' | 'desc',
        priority: index,
      }));
      onSortChange(newSort);
    },
    [onSortChange]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      onPageChange(newPageIndex + 1); // Convert to 1-indexed
    },
    [onPageChange]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      onPageSizeChange(newPageSize);
    },
    [onPageSizeChange]
  );

  // Render cell content
  const renderCellValue = useCallback(
    ({ rowIndex, columnId }: { rowIndex: number; columnId: string }) => {
      const row = rowData[rowIndex];
      if (!row) return null;

      if (columnId === 'actions') {
        const entity = row.actions as Entity;
        return (
          <OuiFlexGroup gutterSize="xs" alignItems="center">
            <OuiFlexItem grow={false}>
              <OuiButtonIcon
                iconType="pencil"
                onClick={() => onEdit(entity)}
                aria-label="Edit entity"
                title="Edit"
              />
            </OuiFlexItem>
            <OuiFlexItem grow={false}>
              <OuiButtonIcon
                iconType="trash"
                color="danger"
                onClick={() => onDelete(entity.id)}
                aria-label="Delete entity"
                title="Delete"
              />
            </OuiFlexItem>
          </OuiFlexGroup>
        );
      }

      const value = row[columnId as keyof typeof row];
      return value ?? '-';
    },
    [rowData, onEdit, onDelete]
  );

  // Row height options
  const rowHeightsOptions: OuiDataGridRowHeightsOptions = useMemo(
    () => ({
      defaultHeight: {
        lineCount: 2,
      },
    }),
    []
  );

  // Loading state
  if (isLoading && entities.length === 0) {
    return (
      <OuiEmptyPrompt
        icon={<OuiLoadingSpinner size="xl" />}
        title={<h2>Loading entities...</h2>}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <OuiCallOut title="Error loading entities" color="danger" iconType="alert">
        <p>{error.message}</p>
        <OuiSpacer size="s" />
        <OuiButton onClick={onRefresh} size="s">
          Retry
        </OuiButton>
      </OuiCallOut>
    );
  }

  // Empty state
  if (!isLoading && entities.length === 0) {
    return (
      <OuiEmptyPrompt
        iconType="indexClose"
        title={<h2>No entities found</h2>}
        body={<p>Create your first entity to get started.</p>}
        actions={
          <OuiButton onClick={onCreate} iconType="plusInCircle" fill>
            Create Entity
          </OuiButton>
        }
      />
    );
  }

  return (
    <OuiDataGrid
      aria-label="Entity list"
      columns={COLUMN_DEFINITIONS}
      columnVisibility={{
        visibleColumns: COLUMN_DEFINITIONS.map((col) => col.id),
        setVisibleColumns: () => {},
      }}
      rowCount={rowData.length}
      renderCellValue={renderCellValue}
      sorting={gridSorting}
      onSort={handleSortChange}
      pagination={pagination}
      onPaginationChange={(newPagination) => {
        if (newPagination.pageIndex !== undefined) {
          handlePageChange(newPagination.pageIndex);
        }
        if (newPagination.pageSize !== undefined) {
          handlePageSizeChange(newPagination.pageSize);
        }
      }}
      rowHeightsOptions={rowHeightsOptions}
      toolbarVisibility={{
        showDisplaySelector: toolbarVisibility?.showDisplaySelector ?? true,
        showSortSelector: toolbarVisibility?.showSortSelector ?? true,
        showFullScreenSelector: toolbarVisibility?.showFullScreenSelector ?? true,
        additionalControls: {
          left: {
            append: (
              <OuiButton
                onClick={onCreate}
                iconType="plusInCircle"
                size="s"
                fill
              >
                Create Entity
              </OuiButton>
            ),
          },
          right: {
            append: (
              <OuiButtonIcon
                onClick={onRefresh}
                iconType="refresh"
                aria-label="Refresh"
              />
            ),
          },
        },
      }}
      gridStyle={{
        border: 'horizontal',
        stripes: true,
        header: 'shade',
      }}
    />
  );
}

export default EntityListView;
