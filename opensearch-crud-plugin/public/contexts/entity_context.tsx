/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity Context - React context for global entity state management.
 * Provides entity state and actions to all child components.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Entity, CreateEntityRequest, UpdateEntityRequest } from '../types';
import type { ActiveFilter, SortField, ApiError } from '../../common';
import type { EntityService } from '../services';

// ============================================================================
// State Types
// ============================================================================

/**
 * Entity context state interface
 */
export interface EntityState {
  /** Array of entities */
  entities: Entity[];
  /** Currently selected entity for editing */
  selectedEntity: Entity | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: ApiError | null;
  /** Total count of entities */
  totalCount: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Active filters */
  filters: ActiveFilter[];
  /** Active sort fields */
  sort: SortField[];
  /** Selected entity IDs for bulk operations */
  selectedIds: Set<string>;
  /** Whether there are more entities */
  hasMore: boolean;
  /** Form modal state */
  isFormOpen: boolean;
  /** Form mode (create or edit) */
  formMode: 'create' | 'edit';
  /** Delete confirmation modal state */
  isDeleteModalOpen: boolean;
  /** Entity IDs to delete */
  entitiesToDelete: string[];
}

/**
 * Initial state
 */
const initialState: EntityState = {
  entities: [],
  selectedEntity: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  page: 1,
  pageSize: 25,
  filters: [],
  sort: [],
  selectedIds: new Set(),
  hasMore: false,
  isFormOpen: false,
  formMode: 'create',
  isDeleteModalOpen: false,
  entitiesToDelete: [],
};

// ============================================================================
// Action Types
// ============================================================================

type EntityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'SET_ENTITIES'; payload: { entities: Entity[]; total: number; hasMore: boolean } }
  | { type: 'ADD_ENTITY'; payload: Entity }
  | { type: 'UPDATE_ENTITY'; payload: Entity }
  | { type: 'REMOVE_ENTITIES'; payload: string[] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_FILTERS'; payload: ActiveFilter[] }
  | { type: 'ADD_FILTER'; payload: ActiveFilter }
  | { type: 'REMOVE_FILTER'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SortField[] }
  | { type: 'TOGGLE_SORT'; payload: string }
  | { type: 'CLEAR_SORT' }
  | { type: 'SET_SELECTED_IDS'; payload: Set<string> }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_ENTITY'; payload: Entity | null }
  | { type: 'OPEN_FORM'; payload: { mode: 'create' | 'edit'; entity?: Entity } }
  | { type: 'CLOSE_FORM' }
  | { type: 'OPEN_DELETE_MODAL'; payload: string[] }
  | { type: 'CLOSE_DELETE_MODAL' }
  | { type: 'RESET_STATE' };

// ============================================================================
// Reducer
// ============================================================================

/**
 * Entity state reducer
 */
function entityReducer(state: EntityState, action: EntityAction): EntityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_ENTITIES':
      return {
        ...state,
        entities: action.payload.entities,
        totalCount: action.payload.total,
        hasMore: action.payload.hasMore,
        isLoading: false,
      };

    case 'ADD_ENTITY':
      return {
        ...state,
        entities: [action.payload, ...state.entities],
        totalCount: state.totalCount + 1,
      };

    case 'UPDATE_ENTITY':
      return {
        ...state,
        entities: state.entities.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'REMOVE_ENTITIES':
      return {
        ...state,
        entities: state.entities.filter((e) => !action.payload.includes(e.id)),
        totalCount: state.totalCount - action.payload.length,
        selectedIds: new Set(
          Array.from(state.selectedIds).filter((id) => !action.payload.includes(id))
        ),
      };

    case 'SET_PAGE':
      return { ...state, page: action.payload };

    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 };

    case 'SET_FILTERS':
      return { ...state, filters: action.payload, page: 1 };

    case 'ADD_FILTER':
      return { ...state, filters: [...state.filters, action.payload], page: 1 };

    case 'REMOVE_FILTER':
      return {
        ...state,
        filters: state.filters.filter((f) => f.id !== action.payload),
        page: 1,
      };

    case 'CLEAR_FILTERS':
      return { ...state, filters: [], page: 1 };

    case 'SET_SORT':
      return { ...state, sort: action.payload };

    case 'TOGGLE_SORT': {
      const existing = state.sort.find((s) => s.field === action.payload);
      if (!existing) {
        return {
          ...state,
          sort: [...state.sort, { field: action.payload, direction: 'asc', priority: state.sort.length }],
        };
      }
      if (existing.direction === 'asc') {
        return {
          ...state,
          sort: state.sort.map((s) =>
            s.field === action.payload ? { ...s, direction: 'desc' } : s
          ),
        };
      }
      return {
        ...state,
        sort: state.sort.filter((s) => s.field !== action.payload),
      };
    }

    case 'CLEAR_SORT':
      return { ...state, sort: [] };

    case 'SET_SELECTED_IDS':
      return { ...state, selectedIds: action.payload };

    case 'TOGGLE_SELECTION': {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return { ...state, selectedIds: newSet };
    }

    case 'SELECT_ALL':
      return { ...state, selectedIds: new Set(action.payload) };

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set() };

    case 'SET_SELECTED_ENTITY':
      return { ...state, selectedEntity: action.payload };

    case 'OPEN_FORM':
      return {
        ...state,
        isFormOpen: true,
        formMode: action.payload.mode,
        selectedEntity: action.payload.entity || null,
      };

    case 'CLOSE_FORM':
      return { ...state, isFormOpen: false, selectedEntity: null };

    case 'OPEN_DELETE_MODAL':
      return { ...state, isDeleteModalOpen: true, entitiesToDelete: action.payload };

    case 'CLOSE_DELETE_MODAL':
      return { ...state, isDeleteModalOpen: false, entitiesToDelete: [] };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Entity context value interface
 */
export interface EntityContextValue {
  /** Current state */
  state: EntityState;
  /** Fetch entities */
  fetchEntities: () => Promise<void>;
  /** Create entity */
  createEntity: (data: CreateEntityRequest) => Promise<Entity>;
  /** Update entity */
  updateEntity: (id: string, data: UpdateEntityRequest) => Promise<Entity>;
  /** Delete entities */
  deleteEntities: (ids: string[]) => Promise<void>;
  /** Refresh entity list */
  refresh: () => Promise<void>;
  /** Go to page */
  goToPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Add filter */
  addFilter: (filter: ActiveFilter) => void;
  /** Remove filter */
  removeFilter: (id: string) => void;
  /** Clear filters */
  clearFilters: () => void;
  /** Toggle sort */
  toggleSort: (field: string) => void;
  /** Clear sort */
  clearSort: () => void;
  /** Toggle selection */
  toggleSelection: (id: string) => void;
  /** Select all */
  selectAll: () => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Open create form */
  openCreateForm: () => void;
  /** Open edit form */
  openEditForm: (entity: Entity) => void;
  /** Close form */
  closeForm: () => void;
  /** Open delete modal */
  openDeleteModal: (ids: string[]) => void;
  /** Close delete modal */
  closeDeleteModal: () => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const EntityContext = createContext<EntityContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Props for EntityProvider component
 */
export interface EntityProviderProps {
  /** Child components */
  children: ReactNode;
  /** Entity service instance */
  entityService: EntityService;
  /** Initial page size */
  initialPageSize?: number;
}

/**
 * Entity Provider component
 * Provides entity state and actions to all child components
 */
export function EntityProvider({
  children,
  entityService,
  initialPageSize = 25,
}: EntityProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(entityReducer, {
    ...initialState,
    pageSize: initialPageSize,
  });

  /**
   * Fetches entities from the API
   */
  const fetchEntities = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const sortString = state.sort
        .sort((a, b) => a.priority - b.priority)
        .map((s) => `${s.field}:${s.direction}`)
        .join(',');

      const filtersString = JSON.stringify(
        state.filters.map(({ id, ...filter }) => filter)
      );

      const result = await entityService.fetchEntities({
        page: state.page,
        pageSize: state.pageSize,
        sort: sortString || undefined,
        filters: filtersString || undefined,
      });

      dispatch({
        type: 'SET_ENTITIES',
        payload: {
          entities: result.entities,
          total: result.total,
          hasMore: result.hasMore,
        },
      });
    } catch (err) {
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch entities',
        statusCode: 500,
      };
      dispatch({ type: 'SET_ERROR', payload: apiError });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [entityService, state.page, state.pageSize, state.filters, state.sort]);

  /**
   * Creates a new entity
   */
  const createEntity = useCallback(
    async (data: CreateEntityRequest): Promise<Entity> => {
      const entity = await entityService.createEntity(data);
      dispatch({ type: 'ADD_ENTITY', payload: entity });
      dispatch({ type: 'CLOSE_FORM' });
      return entity;
    },
    [entityService]
  );

  /**
   * Updates an existing entity
   */
  const updateEntity = useCallback(
    async (id: string, data: UpdateEntityRequest): Promise<Entity> => {
      const entity = await entityService.updateEntity(id, data);
      dispatch({ type: 'UPDATE_ENTITY', payload: entity });
      dispatch({ type: 'CLOSE_FORM' });
      return entity;
    },
    [entityService]
  );

  /**
   * Deletes entities
   */
  const deleteEntities = useCallback(
    async (ids: string[]): Promise<void> => {
      if (ids.length === 1) {
        await entityService.deleteEntity(ids[0]);
      } else {
        await entityService.bulkDelete(ids);
      }
      dispatch({ type: 'REMOVE_ENTITIES', payload: ids });
      dispatch({ type: 'CLOSE_DELETE_MODAL' });
    },
    [entityService]
  );

  /**
   * Refreshes the entity list
   */
  const refresh = useCallback(async () => {
    await fetchEntities();
  }, [fetchEntities]);

  /**
   * Pagination controls
   */
  const goToPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setPageSize = useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: size });
  }, []);

  /**
   * Filter controls
   */
  const addFilter = useCallback((filter: ActiveFilter) => {
    dispatch({ type: 'ADD_FILTER', payload: filter });
  }, []);

  const removeFilter = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FILTER', payload: id });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  /**
   * Sort controls
   */
  const toggleSort = useCallback((field: string) => {
    dispatch({ type: 'TOGGLE_SORT', payload: field });
  }, []);

  const clearSort = useCallback(() => {
    dispatch({ type: 'CLEAR_SORT' });
  }, []);

  /**
   * Selection controls
   */
  const toggleSelection = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SELECTION', payload: id });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL', payload: state.entities.map((e) => e.id) });
  }, [state.entities]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  /**
   * Form controls
   */
  const openCreateForm = useCallback(() => {
    dispatch({ type: 'OPEN_FORM', payload: { mode: 'create' } });
  }, []);

  const openEditForm = useCallback((entity: Entity) => {
    dispatch({ type: 'OPEN_FORM', payload: { mode: 'edit', entity } });
  }, []);

  const closeForm = useCallback(() => {
    dispatch({ type: 'CLOSE_FORM' });
  }, []);

  /**
   * Delete modal controls
   */
  const openDeleteModal = useCallback((ids: string[]) => {
    dispatch({ type: 'OPEN_DELETE_MODAL', payload: ids });
  }, []);

  const closeDeleteModal = useCallback(() => {
    dispatch({ type: 'CLOSE_DELETE_MODAL' });
  }, []);

  // Fetch entities on mount and when dependencies change
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const value: EntityContextValue = {
    state,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntities,
    refresh,
    goToPage,
    setPageSize,
    addFilter,
    removeFilter,
    clearFilters,
    toggleSort,
    clearSort,
    toggleSelection,
    selectAll,
    clearSelection,
    openCreateForm,
    openEditForm,
    closeForm,
    openDeleteModal,
    closeDeleteModal,
  };

  return (
    <EntityContext.Provider value={value}>{children}</EntityContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access the entity context
 * @returns Entity context value
 * @throws Error if used outside of EntityProvider
 */
export function useEntityContext(): EntityContextValue {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntityContext must be used within an EntityProvider');
  }
  return context;
}

export default EntityContext;
