/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for useFilters hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useFilters } from '../../../public/hooks/use_filters';
import type { ActiveFilter } from '../../../public/types';

describe('useFilters', () => {
  const mockInitialFilters: ActiveFilter[] = [
    { id: 'filter-1', field: 'status', operator: 'eq', value: 'active' },
    { id: 'filter-2', field: 'priority', operator: 'gt', value: 5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty filters by default', () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.filters).toEqual([]);
    });

    it('should initialize with provided filters', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      expect(result.current.filters).toEqual(mockInitialFilters);
    });
  });

  describe('addFilter', () => {
    it('should add a new filter', () => {
      const { result } = renderHook(() => useFilters());

      const newFilter: ActiveFilter = {
        field: 'status',
        operator: 'eq',
        value: 'inactive',
      };

      act(() => {
        result.current.addFilter(newFilter);
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toMatchObject({
        field: 'status',
        operator: 'eq',
        value: 'inactive',
      });
      expect(result.current.filters[0].id).toBeDefined();
    });

    it('should use provided ID if present', () => {
      const { result } = renderHook(() => useFilters());

      const newFilter: ActiveFilter = {
        id: 'custom-id',
        field: 'status',
        operator: 'eq',
        value: 'inactive',
      };

      act(() => {
        result.current.addFilter(newFilter);
      });

      expect(result.current.filters[0].id).toBe('custom-id');
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFilters([], onChange));

      act(() => {
        result.current.addFilter({
          field: 'status',
          operator: 'eq',
          value: 'active',
        });
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('removeFilter', () => {
    it('should remove a filter by ID', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.removeFilter('filter-1');
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].id).toBe('filter-2');
    });

    it('should not modify filters if ID not found', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.removeFilter('non-existent');
      });

      expect(result.current.filters).toEqual(mockInitialFilters);
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFilters(mockInitialFilters, onChange));

      act(() => {
        result.current.removeFilter('filter-1');
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('updateFilter', () => {
    it('should update a filter by ID', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.updateFilter('filter-1', { value: 'inactive' });
      });

      expect(result.current.filters[0].value).toBe('inactive');
      expect(result.current.filters[0].field).toBe('status'); // unchanged
    });

    it('should not modify filters if ID not found', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.updateFilter('non-existent', { value: 'new' });
      });

      expect(result.current.filters).toEqual(mockInitialFilters);
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFilters(mockInitialFilters, onChange));

      act(() => {
        result.current.updateFilter('filter-1', { value: 'inactive' });
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should remove all filters', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toHaveLength(0);
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFilters(mockInitialFilters, onChange));

      act(() => {
        result.current.clearFilters();
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('setFilters', () => {
    it('should replace all filters', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      const newFilters: ActiveFilter[] = [
        { id: 'new-1', field: 'title', operator: 'contains', value: 'test' },
      ];

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useFilters(mockInitialFilters, onChange));

      act(() => {
        result.current.setFilters([]);
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true when filters exist', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should return false when no filters', () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('filterCount', () => {
    it('should return correct count', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      expect(result.current.filterCount).toBe(2);
    });

    it('should return 0 when no filters', () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.filterCount).toBe(0);
    });
  });

  describe('getFilterById', () => {
    it('should return filter by ID', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      const filter = result.current.getFilterById('filter-1');

      expect(filter).toEqual(mockInitialFilters[0]);
    });

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      const filter = result.current.getFilterById('non-existent');

      expect(filter).toBeUndefined();
    });
  });

  describe('resetFilters', () => {
    it('should reset to initial filters', () => {
      const { result } = renderHook(() => useFilters(mockInitialFilters));

      act(() => {
        result.current.addFilter({
          field: 'new',
          operator: 'eq',
          value: 'test',
        });
      });

      expect(result.current.filters).toHaveLength(3);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(mockInitialFilters);
    });
  });
});
