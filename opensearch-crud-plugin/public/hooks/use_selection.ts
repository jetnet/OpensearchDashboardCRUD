/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * useSelection Hook - Manages entity selection state for bulk operations.
 * Provides selection state management with select all functionality.
 */

import React, { useState, useCallback, useMemo } from 'react';

/**
 * Hook return type
 */
export interface UseSelectionResult {
  /** Set of selected entity IDs */
  selectedIds: Set<string>;
  /** Toggle selection for a single entity */
  toggleSelection: (id: string) => void;
  /** Select multiple entities */
  selectMultiple: (ids: string[]) => void;
  /** Deselect multiple entities */
  deselectMultiple: (ids: string[]) => void;
  /** Select all entities in the current list */
  selectAll: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if an entity is selected */
  isSelected: (id: string) => boolean;
  /** Check if all entities in the list are selected */
  allSelected: (ids: string[]) => boolean;
  /** Check if some (but not all) entities are selected */
  someSelected: (ids: string[]) => boolean;
  /** Number of selected entities */
  selectedCount: number;
  /** Check if there are any selections */
  hasSelection: boolean;
}

/**
 * Custom hook for managing entity selection
 * @returns Selection state and controls
 */
export function useSelection(): UseSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds.size]);

  const hasSelection = useMemo(() => selectedIds.size > 0, [selectedIds.size]);

  const isSelected = useCallback(
    (id: string): boolean => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const allSelected = useCallback(
    (ids: string[]): boolean => {
      if (ids.length === 0) return false;
      return ids.every((id) => selectedIds.has(id));
    },
    [selectedIds]
  );

  const someSelected = useCallback(
    (ids: string[]): boolean => {
      if (ids.length === 0) return false;
      const selectedInList = ids.filter((id) => selectedIds.has(id));
      return selectedInList.length > 0 && selectedInList.length < ids.length;
    },
    [selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds((prev: Set<string>) => {
      const newSet = new Set(prev);
      ids.forEach((id) => newSet.add(id));
      return newSet;
    });
  }, []);

  const deselectMultiple = useCallback((ids: string[]) => {
    setSelectedIds((prev: Set<string>) => {
      const newSet = new Set(prev);
      ids.forEach((id) => newSet.delete(id));
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev: Set<string>) => {
      const newSet = new Set(prev);
      ids.forEach((id) => newSet.add(id));
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    toggleSelection,
    selectMultiple,
    deselectMultiple,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
    selectedCount,
    hasSelection,
  };
}

export default useSelection;
