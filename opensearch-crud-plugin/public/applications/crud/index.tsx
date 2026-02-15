/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Main CRUD Application Component.
 * Provides the complete CRUD UI with entity list, forms, and bulk operations.
 */

import React, { useState, useCallback, type ReactNode } from 'react';
import type { CoreStart } from 'opensearch-dashboards/public';
import type { CrudPluginStartDeps } from '../../types';
import {
  OuiPage,
  OuiPageBody,
  OuiPageHeader,
  OuiPageHeaderSection,
  OuiPageContent,
  OuiPageContentBody,
  OuiTitle,
  OuiSpacer,
  OuiModal,
  OuiModalBody,
  OuiModalFooter,
  OuiButton,
  OuiCallOut,
  OuiLoadingSpinner,
} from '@opensearch-project/oui';

import { EntityListView } from '../../components/entity_list_view';
import { EntityForm } from '../../components/entity_form';
import { FilterBar } from '../../components/filter_bar';
import { PaginationBar } from '../../components/pagination_bar';
import { BulkActionsBar } from '../../components/bulk_actions_bar';
import { DeleteConfirmModal } from '../../components/confirm_modal';
import { useEntityList } from '../../hooks/use_entity_list';
import { useSelection } from '../../hooks/use_selection';
import { EntityService, ValidationService } from '../../services';
import type { Entity, CreateEntityRequest, UpdateEntityRequest } from '../../types';
import type { ActiveFilter, SortField } from '../../../common';

/**
 * Props for the CrudApp component.
 */
export interface CrudAppProps {
  core: CoreStart;
  deps: CrudPluginStartDeps;
}

/**
 * Main CRUD application component.
 * Provides the root UI for the CRUD plugin with full functionality.
 */
export const CrudApp: React.FC<CrudAppProps> = (props: CrudAppProps) => {
  const { core } = props;

  // Create services
  const entityService = React.useMemo(() => {
    return new EntityService({
      get: async <T,>(path: string, options?: { query?: Record<string, unknown> }) => {
        return core.http.get(path, options) as Promise<T>;
      },
      post: async <T,>(path: string, options?: { body?: string; query?: Record<string, unknown> }) => {
        return core.http.post(path, options) as Promise<T>;
      },
      put: async <T,>(path: string, options?: { body?: string; query?: Record<string, unknown> }) => {
        return core.http.put(path, options) as Promise<T>;
      },
      delete: async <T,>(path: string, options?: { body?: string; query?: Record<string, unknown> }) => {
        return core.http.delete(path, options) as Promise<T>;
      },
    });
  }, [core.http]);

  const validationService = React.useMemo(() => new ValidationService(), []);

  // Entity list state
  const {
    entities,
    isLoading,
    error,
    totalCount,
    hasMore,
    pagination,
    goToPage,
    setPageSize,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    sort,
    setSort,
    toggleSort,
    clearSort,
    refresh,
  } = useEntityList(entityService);

  // Selection state
  const {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
    selectedCount,
    hasSelection,
  } = useSelection();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form handlers
  const handleOpenCreateForm = useCallback(() => {
    setFormMode('create');
    setSelectedEntity(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((entity: Entity) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedEntity(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateEntityRequest | UpdateEntityRequest) => {
      setIsSubmitting(true);
      try {
        if (formMode === 'create') {
          await entityService.createEntity(data as CreateEntityRequest);
        } else if (selectedEntity) {
          await entityService.updateEntity(selectedEntity.id, data as UpdateEntityRequest);
        }
        setIsFormModalOpen(false);
        setSelectedEntity(null);
        await refresh();
      } catch (err) {
        console.error('Form submission error:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityService, formMode, selectedEntity, refresh]
  );

  // Delete handlers
  const handleOpenDeleteModal = useCallback((id: string) => {
    const entity = entities.find((e) => e.id === id);
    setEntityToDelete(entity || null);
    setIsDeleteModalOpen(true);
  }, [entities]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setEntityToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!entityToDelete) return;
    
    setIsSubmitting(true);
    try {
      await entityService.deleteEntity(entityToDelete.id);
      setIsDeleteModalOpen(false);
      setEntityToDelete(null);
      await refresh();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [entityToDelete, entityService, refresh]);

  // Bulk delete handler
  const handleBulkDelete = useCallback(() => {
    setEntityToDelete(null);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedCount === 0) return;
    
    setIsSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      await entityService.bulkDelete(ids);
      setIsDeleteModalOpen(false);
      clearSelection();
      await refresh();
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCount, selectedIds, entityService, clearSelection, refresh]);

  // Sort handler
  const handleSortChange = useCallback(
    (newSort: SortField[]) => {
      setSort(newSort);
    },
    [setSort]
  );

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    selectAll(entities.map((e) => e.id));
  }, [selectAll, entities]);

  return (
    <OuiPage paddingSize="l">
      <OuiPageBody>
        {/* Header */}
        <OuiPageHeader>
          <OuiPageHeaderSection>
            <OuiTitle size="l">
              <h1>Entity Management</h1>
            </OuiTitle>
          </OuiPageHeaderSection>
        </OuiPageHeader>

        {/* Main Content */}
        <OuiPageContent>
          <OuiPageContentBody>
            {/* Error Display */}
            {error && (
              <>
                <OuiCallOut
                  title="Error loading entities"
                  color="danger"
                  iconType="alert"
                >
                  <p>{error.message}</p>
                </OuiCallOut>
                <OuiSpacer size="m" />
              </>
            )}

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onClearFilters={clearFilters}
              isLoading={isLoading}
            />
            <OuiSpacer size="m" />

            {/* Bulk Actions Bar */}
            {hasSelection && (
              <BulkActionsBar
                selectedCount={selectedCount}
                totalCount={entities.length}
                onBulkDelete={handleBulkDelete}
                onClearSelection={clearSelection}
                isLoading={isLoading}
              />
            )}

            {/* Entity List */}
            <EntityListView
              entities={entities}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              page={pagination.page}
              pageSize={pagination.pageSize}
              sort={sort}
              selectedIds={selectedIds}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              onSortChange={handleSortChange}
              onSelectionToggle={toggleSelection}
              onSelectAll={handleSelectAll}
              onClearSelection={clearSelection}
              onEdit={handleOpenEditForm}
              onDelete={handleOpenDeleteModal}
              onRefresh={refresh}
              onCreate={handleOpenCreateForm}
            />

            <OuiSpacer size="m" />

            {/* Pagination */}
            <PaginationBar
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={totalCount}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              isLoading={isLoading}
            />
          </OuiPageContentBody>
        </OuiPageContent>

        {/* Form Modal */}
        {isFormModalOpen && (
          <OuiModal onClose={handleCloseForm}>
            <OuiModalBody>
              <EntityForm
                mode={formMode}
                entity={selectedEntity || undefined}
                validationService={validationService}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isLoading={isSubmitting}
              />
            </OuiModalBody>
          </OuiModal>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <DeleteConfirmModal
            entityName={entityToDelete?.attributes?.name}
            count={hasSelection && !entityToDelete ? selectedCount : 1}
            isLoading={isSubmitting}
            onConfirm={hasSelection && !entityToDelete ? handleConfirmBulkDelete : handleConfirmDelete}
            onCancel={handleCloseDeleteModal}
          />
        )}
      </OuiPageBody>
    </OuiPage>
  );
};

export default CrudApp;
