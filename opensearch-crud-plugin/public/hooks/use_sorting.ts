/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * useSorting Hook - Manages multi-column sorting state.
 * Provides sorting state management for entity lists.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { SortField } from '../../common';
import { MAX_SORT_FIELDS } from '../../common';

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort option for column headers
 */
export interface SortOption {
  /** Field name */
  field: string;
  /** Display label */
  label: string;
  /** Whether this field is sortable */
  sortable: boolean;
}

/**
 * Sort options configuration
 */
export const SORT_OPTIONS: SortOption[] = [
  { field: 'title', label: 'Title', sortable: true },
  { field: 'name', label: 'Name', sortable: true },
  { field: 'description', label: 'Description', sortable: true },
  { field: 'status', label: 'Status', sortable: true },
  { field: 'priority', label: 'Priority', sortable: true },
  { field: 'createdAt', label: 'Created At', sortable: true },
  { field: 'updatedAt', label: 'Updated At', sortable: true },
];

/**
 * Hook return type
 */
export interface UseSortingResult {
  /** Current sort fields */
  sort: SortField[];
  /** Available sort options */
  sortOptions: SortOption[];
  /** Set sort array */
  setSort: (sort: SortField[]) => void;
  /** Add a sort field */
  addSort: (field: string, direction?: SortDirection) => void;
  /** Remove a sort field */
  removeSort: (field: string) => void;
  /** Toggle sort direction for a field */
  toggleSort: (field: string) => void;
  /** Set sort direction for a field */
  setSortDirection: (field: string, direction: SortDirection) => void;
  /** Clear all sorting */
  clearSort: () => void;
  /** Check if max sort fields reached */
  isMaxSortFields: boolean;
  /** Check if a field is sorted */
  isSorted: (field: string) => boolean;
  /** Get sort direction for a field */
  getSortDirection: (field: string) => SortDirection | undefined;
  /** Get sort priority for a field */
  getSortPriority: (field: string) => number | undefined;
  /** Convert sort to string for API */
  sortToString: () => string;
}

/**
 * Custom hook for managing multi-column sorting
 * @param initialSort - Initial sort values
 * @returns Sort state and controls
 */
export function useSorting(initialSort: SortField[] = []): UseSortingResult {
  const [sort, setSort] = useState<SortField[]>(initialSort);

  const isMaxSortFields = useMemo(() => {
    return sort.length >= MAX_SORT_FIELDS;
  }, [sort.length]);

  const isSorted = useCallback(
    (field: string): boolean => {
      return sort.some((s: SortField) => s.field === field);
    },
    [sort]
  );

  const getSortDirection = useCallback(
    (field: string): SortDirection | undefined => {
      const sortField = sort.find((s: SortField) => s.field === field);
      return sortField?.direction;
    },
    [sort]
  );

  const getSortPriority = useCallback(
    (field: string): number | undefined => {
      const sortField = sort.find((s: SortField) => s.field === field);
      return sortField?.priority;
    },
    [sort]
  );

  const addSort = useCallback((field: string, direction: SortDirection = 'asc') => {
    setSort((prev: SortField[]) => {
      // Check if already sorted
      const existing = prev.find((s: SortField) => s.field === field);
      if (existing) {
        return prev.map((s: SortField) =>
          s.field === field ? { ...s, direction } : s
        );
      }
      // Check max limit
      if (prev.length >= MAX_SORT_FIELDS) {
        return prev;
      }
      // Add new sort field
      return [...prev, { field, direction, priority: prev.length }];
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSort((prev: SortField[]) => {
      const filtered = prev.filter((s: SortField) => s.field !== field);
      // Re-prioritize remaining fields
      return filtered.map((s: SortField, index: number) => ({
        ...s,
        priority: index,
      }));
    });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev: SortField[]) => {
      const existing = prev.find((s: SortField) => s.field === field);
      
      if (!existing) {
        // Add new sort field
        if (prev.length >= MAX_SORT_FIELDS) {
          return prev;
        }
        return [...prev, { field, direction: 'asc' as const, priority: prev.length }];
      }
      
      if (existing.direction === 'asc') {
        // Toggle to desc
        return prev.map((s: SortField) =>
          s.field === field ? { ...s, direction: 'desc' as const } : s
        );
      }
      
      // Remove sort (cycle through asc -> desc -> none)
      const filtered = prev.filter((s: SortField) => s.field !== field);
      return filtered.map((s: SortField, index: number) => ({
        ...s,
        priority: index,
      }));
    });
  }, []);

  const setSortDirection = useCallback((field: string, direction: SortDirection) => {
    setSort((prev: SortField[]) => {
      const existing = prev.find((s: SortField) => s.field === field);
      if (!existing) {
        return prev;
      }
      return prev.map((s: SortField) =>
        s.field === field ? { ...s, direction } : s
      );
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort([]);
  }, []);

  const sortToString = useCallback((): string => {
    return sort
      .sort((a: SortField, b: SortField) => a.priority - b.priority)
      .map((s: SortField) => `${s.field}:${s.direction}`)
      .join(',');
  }, [sort]);

  return {
    sort,
    sortOptions: SORT_OPTIONS,
    setSort,
    addSort,
    removeSort,
    toggleSort,
    setSortDirection,
    clearSort,
    isMaxSortFields,
    isSorted,
    getSortDirection,
    getSortPriority,
    sortToString,
  };
}

export default useSorting;
