/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for useEntityList hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useEntityList } from '../../../public/hooks/use_entity_list';
import type { EntityService } from '../../../public/services';
import type { Entity, ActiveFilter, SortField } from '../../../public/types';

describe('useEntityList', () => {
  let mockEntityService: {
    fetchEntities: jest.Mock;
  };

  const mockEntities: Entity[] = [
    {
      id: '1',
      title: 'Entity 1',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'user1',
    },
    {
      id: '2',
      title: 'Entity 2',
      status: 'inactive',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      createdBy: 'user2',
    },
  ];

  beforeEach(() => {
    mockEntityService = {
      fetchEntities: jest.fn().mockResolvedValue({
        entities: mockEntities,
        total: 25,
        page: 1,
        pageSize: 10,
        hasMore: true,
      }),
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useEntityList(mockEntityService as any));

      expect(result.current.entities).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25); // DEFAULT_PAGE_SIZE
    });

    it('should initialize with custom values', () => {
      const initialFilters: ActiveFilter[] = [
        { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
      ];
      const initialSort: SortField[] = [
        { field: 'createdAt', direction: 'desc', priority: 0 },
      ];

      const { result } = renderHook(() =>
        useEntityList(mockEntityService as any, {
          initialPage: 2,
          initialPageSize: 50,
          initialFilters,
          initialSort,
        })
      );

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.pageSize).toBe(50);
      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.sort).toEqual(initialSort);
    });
  });

  describe('fetching entities', () => {
    it('should fetch entities on mount', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.entities).toEqual(mockEntities);
      expect(result.current.totalCount).toBe(25);
      expect(result.current.hasMore).toBe(true);
    });

    it('should handle fetch errors', async () => {
      mockEntityService.fetchEntities.mockRejectedValue(new Error('Network error'));

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.code).toBe('FETCH_ERROR');
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.entities).toEqual([]);
    });

    it('should refresh entities', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      mockEntityService.fetchEntities.mockClear();
      mockEntityService.fetchEntities.mockResolvedValue({
        entities: [...mockEntities, { ...mockEntities[0], id: '3' }],
        total: 26,
        page: 1,
        pageSize: 10,
        hasMore: true,
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockEntityService.fetchEntities).toHaveBeenCalledTimes(1);
      expect(result.current.totalCount).toBe(26);
    });
  });

  describe('pagination controls', () => {
    it('should go to specific page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      mockEntityService.fetchEntities.mockClear();

      act(() => {
        result.current.goToPage(3);
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(3);
    });

    it('should not allow negative page numbers', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.goToPage(-1);
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should change page size and reset to first page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialPage: 3 })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.setPageSize(50);
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.pageSize).toBe(50);
      expect(result.current.pagination.page).toBe(1);
    });

    it('should navigate to next page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.nextPage();
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(2);
    });

    it('should navigate to previous page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialPage: 3 })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.previousPage();
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(2);
    });

    it('should navigate to first page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialPage: 5 })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.firstPage();
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should navigate to last page', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      // Total is 25, page size is 25 (default), so last page is 1
      act(() => {
        result.current.lastPage();
      });

      expect(result.current.pagination.page).toBe(1);
    });

    it('should calculate hasPreviousPage correctly', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialPage: 1 })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.goToPage(2);
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.hasPreviousPage).toBe(true);
    });
  });

  describe('filter controls', () => {
    it('should add a filter', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      const newFilter: ActiveFilter = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      };

      act(() => {
        result.current.addFilter(newFilter);
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toMatchObject({
        field: 'status',
        operator: 'eq',
        value: 'active',
      });
      expect(result.current.filters[0].id).toBeDefined();
    });

    it('should remove a filter', async () => {
      const initialFilters: ActiveFilter[] = [
        { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
        { id: 'filter-2', field: 'priority', operator: 'gt', value: 5 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialFilters })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.removeFilter('filter-1');
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].id).toBe('filter-2');
    });

    it('should update a filter', async () => {
      const initialFilters: ActiveFilter[] = [
        { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialFilters })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.updateFilter('filter-1', { value: 'inactive' });
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.filters[0].value).toBe('inactive');
    });

    it('should clear all filters', async () => {
      const initialFilters: ActiveFilter[] = [
        { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
        { id: 'filter-2', field: 'priority', operator: 'gt', value: 5 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialFilters })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.clearFilters();
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.filters).toHaveLength(0);
    });

    it('should reset to first page when filter changes', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialPage: 3 })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(3);

      act(() => {
        result.current.addFilter({
          field: 'status',
          operator: 'eq',
          value: 'active',
        });
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.pagination.page).toBe(1);
    });
  });

  describe('sort controls', () => {
    it('should add a sort field', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any)
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.addSort({
          field: 'createdAt',
          direction: 'desc',
          priority: 0,
        });
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.sort).toHaveLength(1);
      expect(result.current.sort[0]).toMatchObject({
        field: 'createdAt',
        direction: 'desc',
      });
    });

    it('should remove a sort field', async () => {
      const initialSort: SortField[] = [
        { field: 'createdAt', direction: 'desc', priority: 0 },
        { field: 'title', direction: 'asc', priority: 1 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialSort })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.removeSort('createdAt');
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.sort).toHaveLength(1);
      expect(result.current.sort[0].field).toBe('title');
    });

    it('should toggle sort direction', async () => {
      const initialSort: SortField[] = [
        { field: 'createdAt', direction: 'asc', priority: 0 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialSort })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      // Toggle from asc to desc
      act(() => {
        result.current.toggleSort('createdAt');
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.sort[0].direction).toBe('desc');

      // Toggle from desc to remove
      act(() => {
        result.current.toggleSort('createdAt');
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.sort).toHaveLength(0);
    });

    it('should clear all sort fields', async () => {
      const initialSort: SortField[] = [
        { field: 'createdAt', direction: 'desc', priority: 0 },
        { field: 'title', direction: 'asc', priority: 1 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, { initialSort })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sort).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const initialFilters: ActiveFilter[] = [
        { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
      ];
      const initialSort: SortField[] = [
        { field: 'createdAt', direction: 'desc', priority: 0 },
      ];

      const { result, waitForNextUpdate } = renderHook(() =>
        useEntityList(mockEntityService as any, {
          initialPage: 1,
          initialPageSize: 25,
          initialFilters,
          initialSort,
        })
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      // Modify state
      act(() => {
        result.current.goToPage(3);
        result.current.addFilter({
          field: 'priority',
          operator: 'gt',
          value: 5,
        });
      });

      await act(async () => {
        await waitForNextUpdate();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25);
      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.sort).toEqual(initialSort);
      expect(result.current.entities).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });
});
