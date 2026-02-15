/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * useFilters Hook - Manages filter state for entity filtering.
 * Provides filter state management with filter options generation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { ActiveFilter, FilterOperator } from '../../common';
import { MAX_FILTERS } from '../../common';

/**
 * Filter option for dropdown display
 */
export interface FilterOption {
  /** Field name */
  field: string;
  /** Display label */
  label: string;
  /** Available operators for this field */
  operators: FilterOperator[];
  /** Field type */
  type: 'text' | 'number' | 'date' | 'boolean' | 'keyword';
}

/**
 * Filter options configuration
 */
export const FILTER_OPTIONS: FilterOption[] = [
  {
    field: 'title',
    label: 'Title',
    operators: ['eq', 'neq', 'contains', 'startsWith', 'endsWith'],
    type: 'text',
  },
  {
    field: 'name',
    label: 'Name',
    operators: ['eq', 'neq', 'contains', 'startsWith', 'endsWith'],
    type: 'text',
  },
  {
    field: 'description',
    label: 'Description',
    operators: ['contains', 'startsWith', 'endsWith'],
    type: 'text',
  },
  {
    field: 'status',
    label: 'Status',
    operators: ['eq', 'neq', 'in', 'notIn'],
    type: 'keyword',
  },
  {
    field: 'priority',
    label: 'Priority',
    operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
    type: 'number',
  },
  {
    field: 'tags',
    label: 'Tags',
    operators: ['in', 'notIn', 'contains'],
    type: 'keyword',
  },
  {
    field: 'createdAt',
    label: 'Created At',
    operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
    type: 'date',
  },
  {
    field: 'updatedAt',
    label: 'Updated At',
    operators: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
    type: 'date',
  },
];

/**
 * Operator display labels
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'Equals',
  neq: 'Not Equals',
  gt: 'Greater Than',
  gte: 'Greater Than or Equal',
  lt: 'Less Than',
  lte: 'Less Than or Equal',
  contains: 'Contains',
  startsWith: 'Starts With',
  endsWith: 'Ends With',
  in: 'Is In',
  notIn: 'Is Not In',
  between: 'Between',
  exists: 'Exists',
  notExists: 'Does Not Exist',
};

/**
 * Hook return type
 */
export interface UseFiltersResult {
  /** Current filters */
  filters: ActiveFilter[];
  /** Available filter options */
  filterOptions: FilterOption[];
  /** Add a filter */
  addFilter: (filter: Omit<ActiveFilter, 'id'>) => void;
  /** Remove a filter by ID */
  removeFilter: (id: string) => void;
  /** Update a filter */
  updateFilter: (id: string, updates: Partial<ActiveFilter>) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set all filters */
  setFilters: (filters: ActiveFilter[]) => void;
  /** Check if max filters reached */
  isMaxFilters: boolean;
  /** Get filter by ID */
  getFilter: (id: string) => ActiveFilter | undefined;
  /** Get operator label */
  getOperatorLabel: (operator: FilterOperator) => string;
}

/**
 * Generates a unique ID for filters
 */
function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom hook for managing filter state
 * @param initialFilters - Initial filter values
 * @returns Filter state and controls
 */
export function useFilters(initialFilters: ActiveFilter[] = []): UseFiltersResult {
  const [filters, setFilters] = useState<ActiveFilter[]>(initialFilters);

  const isMaxFilters = useMemo(() => {
    return filters.length >= MAX_FILTERS;
  }, [filters.length]);

  const addFilter = useCallback((filter: Omit<ActiveFilter, 'id'>) => {
    setFilters((prev: ActiveFilter[]) => {
      if (prev.length >= MAX_FILTERS) {
        return prev;
      }
      const newFilter: ActiveFilter = {
        ...filter,
        id: generateFilterId(),
      };
      return [...prev, newFilter];
    });
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev: ActiveFilter[]) => prev.filter((f: ActiveFilter) => f.id !== id));
  }, []);

  const updateFilter = useCallback((id: string, updates: Partial<ActiveFilter>) => {
    setFilters((prev: ActiveFilter[]) =>
      prev.map((f: ActiveFilter) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const getFilter = useCallback(
    (id: string): ActiveFilter | undefined => {
      return filters.find((f: ActiveFilter) => f.id === id);
    },
    [filters]
  );

  const getOperatorLabel = useCallback((operator: FilterOperator): string => {
    return OPERATOR_LABELS[operator] || operator;
  }, []);

  return {
    filters,
    filterOptions: FILTER_OPTIONS,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setFilters,
    isMaxFilters,
    getFilter,
    getOperatorLabel,
  };
}

export default useFilters;
