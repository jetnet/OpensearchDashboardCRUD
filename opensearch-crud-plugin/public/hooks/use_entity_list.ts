/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * useEntityList Hook - Manages entity list state with pagination, filtering, and sorting.
 * Provides a comprehensive interface for displaying and managing entity data.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Entity } from '../types';
import type { ActiveFilter, SortField, PaginationState, ApiError } from '../../common';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common';
import type { EntityService, SearchParams } from '../services';

/**
 * Entity list state interface
 */
export interface EntityListState {
  /** Array of entities for current page */
  entities: Entity[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: ApiError | null;
  /** Total count of entities */
  totalCount: number;
  /** Whether there are more entities */
  hasMore: boolean;
}

/**
 * Pagination controls interface
 */
export interface PaginationControls {
  /** Current pagination state */
  pagination: PaginationState;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Change page size */
  setPageSize: (size: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Check if can go to next page */
  hasNextPage: boolean;
  /** Check if can go to previous page */
  hasPreviousPage: boolean;
}

/**
 * Filter controls interface
 */
export interface FilterControls {
  /** Current filters */
  filters: ActiveFilter[];
  /** Add a filter */
  addFilter: (filter: ActiveFilter) => void;
  /** Remove a filter by ID */
  removeFilter: (id: string) => void;
  /** Update a filter */
  updateFilter: (id: string, filter: Partial<ActiveFilter>) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set all filters */
  setFilters: (filters: ActiveFilter[]) => void;
}

/**
 * Sort controls interface
 */
export interface SortControls {
  /** Current sort fields */
  sort: SortField[];
  /** Set sort */
  setSort: (sort: SortField[]) => void;
  /** Add a sort field */
  addSort: (field: SortField) => void;
  /** Remove a sort field */
  removeSort: (field: string) => void;
  /** Toggle sort direction for a field */
  toggleSort: (field: string) => void;
  /** Clear all sorting */
  clearSort: () => void;
}

/**
 * Hook return type
 */
export interface UseEntityListResult
  extends EntityListState,
    PaginationControls,
    FilterControls,
    SortControls {
  /** Refresh entity list */
  refresh: () => Promise<void>;
  /** Reset all state */
  reset: () => void;
}

/**
 * Generates a unique ID for filters
 */
function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts sort fields to sort string for API
 * @param sort - Array of sort fields
 * @returns Sort string
 */
function sortToString(sort: SortField[]): string {
  return sort
    .sort((a, b) => a.priority - b.priority)
    .map((s) => `${s.field}:${s.direction}`)
    .join(',');
}

/**
 * Converts filters to JSON string for API
 * @param filters - Array of active filters
 * @returns JSON string
 */
function filtersToString(filters: ActiveFilter[]): string {
  return JSON.stringify(filters.map(({ id, ...filter }) => filter));
}

/**
 * Custom hook for managing entity list with pagination, filtering, and sorting
 * @param entityService - Entity service instance for API calls
 * @param initialParams - Initial parameters
 * @returns Entity list state and controls
 */
export function useEntityList(
  entityService: EntityService,
  initialParams?: {
    initialPage?: number;
    initialPageSize?: number;
    initialFilters?: ActiveFilter[];
    initialSort?: SortField[];
  }
): UseEntityListResult {
  // Default values
  const initialPage = initialParams?.initialPage ?? 1;
  const initialPageSize = initialParams?.initialPageSize ?? DEFAULT_PAGE_SIZE;
  const initialFilters = initialParams?.initialFilters ?? [];
  const initialSort = initialParams?.initialSort ?? [];

  // Entity state
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<ActiveFilter[]>(initialFilters);

  // Sort state
  const [sort, setSort] = useState<SortField[]>(initialSort);

  /**
   * Fetches entities from the API
   */
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: SearchParams = {
        page: pagination.page,
        pageSize: Math.min(pagination.pageSize, MAX_PAGE_SIZE),
      };

      if (sort.length > 0) {
        params.sort = sortToString(sort);
      }

      if (filters.length > 0) {
        params.filters = filtersToString(filters);
      }

      const result = await entityService.fetchEntities(params);

      setEntities(result.entities);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (err) {
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch entities',
        statusCode: 500,
      };
      setError(apiError);
      setEntities([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [entityService, pagination.page, pagination.pageSize, filters, sort]);

  // Fetch entities when dependencies change
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, page);
    setPagination((prev) => ({ ...prev, page: validPage }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    const validSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    setPagination((prev) => ({ ...prev, pageSize: validSize, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => {
      const totalPages = Math.ceil(prev.total / prev.pageSize);
      const nextPageNum = Math.min(prev.page + 1, totalPages);
      return { ...prev, page: nextPageNum };
    });
  }, []);

  const previousPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  }, []);

  const firstPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const lastPage = useCallback(() => {
    setPagination((prev) => {
      const totalPages = Math.ceil(prev.total / prev.pageSize);
      return { ...prev, page: Math.max(1, totalPages) };
    });
  }, []);

  // Derived pagination values
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.total / pagination.pageSize);
  }, [pagination.total, pagination.pageSize]);

  const hasNextPage = useMemo(() => {
    return pagination.page < totalPages;
  }, [pagination.page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return pagination.page > 1;
  }, [pagination.page]);

  // Filter controls
  const addFilter = useCallback((filter: ActiveFilter) => {
    const newFilter = filter.id ? filter : { ...filter, id: generateFilterId() };
    setFilters((prev) => [...prev, newFilter]);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updateFilter = useCallback((id: string, updates: Partial<ActiveFilter>) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Sort controls
  const addSort = useCallback((field: SortField) => {
    setSort((prev) => {
      const existing = prev.find((s) => s.field === field.field);
      if (existing) {
        return prev.map((s) => (s.field === field.field ? field : s));
      }
      return [...prev, { ...field, priority: prev.length }];
    });
  }, []);

  const removeSortField = useCallback((field: string) => {
    setSort((prev) => {
      const filtered = prev.filter((s) => s.field !== field);
      // Re-prioritize remaining fields
      return filtered.map((s, index) => ({ ...s, priority: index }));
    });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (!existing) {
        // Add new sort field
        return [...prev, { field, direction: 'asc' as const, priority: prev.length }];
      }
      if (existing.direction === 'asc') {
        // Toggle to desc
        return prev.map((s) =>
          s.field === field ? { ...s, direction: 'desc' as const } : s
        );
      }
      // Remove sort
      const filtered = prev.filter((s) => s.field !== field);
      return filtered.map((s, index) => ({ ...s, priority: index }));
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort([]);
  }, []);

  // Refresh and reset
  const refresh = useCallback(async () => {
    await fetchEntities();
  }, [fetchEntities]);

  const reset = useCallback(() => {
    setEntities([]);
    setIsLoading(false);
    setError(null);
    setTotalCount(0);
    setHasMore(false);
    setPagination({ page: initialPage, pageSize: initialPageSize, total: 0 });
    setFilters(initialFilters);
    setSort(initialSort);
  }, [initialPage, initialPageSize, initialFilters, initialSort]);

  return {
    // Entity state
    entities,
    isLoading,
    error,
    totalCount,
    hasMore,
    // Pagination
    pagination,
    goToPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    hasNextPage,
    hasPreviousPage,
    // Filters
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setFilters,
    // Sort
    sort,
    setSort,
    addSort,
    removeSort: removeSortField,
    toggleSort,
    clearSort,
    // Actions
    refresh,
    reset,
  };
}

export default useEntityList;
