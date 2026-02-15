/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Filter Bar Component - Filter controls for entity filtering.
 * Uses OUI filter components for building filter queries.
 */

import React, { useState, useCallback, type ReactNode, type MouseEvent } from 'react';
import {
  OuiFilterGroup,
  OuiFilterButton,
  OuiPopover,
  OuiForm,
  OuiFormField,
  OuiFieldText,
  OuiSelect,
  OuiButton,
  OuiButtonEmpty,
  OuiSpacer,
  OuiFlexGroup,
  OuiFlexItem,
  OuiBadge,
  type OuiSelectOption,
} from '@opensearch-project/oui';
import type { ActiveFilter, FilterOperator, FilterValue } from '../../../common';
import { FILTER_OPTIONS, OPERATOR_LABELS } from '../../hooks/use_filters';

/**
 * Props for FilterBar component
 */
export interface FilterBarProps {
  /** Active filters */
  filters: ActiveFilter[];
  /** Add filter handler */
  onAddFilter: (filter: ActiveFilter) => void;
  /** Remove filter handler */
  onRemoveFilter: (id: string) => void;
  /** Clear all filters handler */
  onClearFilters: () => void;
  /** Whether filters are loading */
  isLoading?: boolean;
}

/**
 * Operator options for select dropdown
 */
const OPERATOR_OPTIONS: OuiSelectOption[] = [
  { value: 'eq', text: 'Equals' },
  { value: 'neq', text: 'Not Equals' },
  { value: 'contains', text: 'Contains' },
  { value: 'startsWith', text: 'Starts With' },
  { value: 'endsWith', text: 'Ends With' },
  { value: 'gt', text: 'Greater Than' },
  { value: 'gte', text: 'Greater Than or Equal' },
  { value: 'lt', text: 'Less Than' },
  { value: 'lte', text: 'Less Than or Equal' },
  { value: 'in', text: 'Is In' },
  { value: 'notIn', text: 'Is Not In' },
  { value: 'exists', text: 'Exists' },
  { value: 'notExists', text: 'Does Not Exist' },
];

/**
 * Generates a unique ID for filters
 */
function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets display label for a filter
 */
function getFilterLabel(filter: ActiveFilter): string {
  const fieldOption = FILTER_OPTIONS.find((opt) => opt.field === filter.field);
  const operatorLabel = OPERATOR_LABELS[filter.operator] || filter.operator;
  const valueLabel = Array.isArray(filter.value)
    ? filter.value.join(', ')
    : String(filter.value);

  return `${fieldOption?.label || filter.field} ${operatorLabel} ${valueLabel}`;
}

/**
 * Filter Bar Component
 * Provides filter controls for entity filtering
 */
export function FilterBar({
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  isLoading = false,
}: FilterBarProps): ReactNode {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newFilterField, setNewFilterField] = useState<string>('');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterOperator>('eq');
  const [newFilterValue, setNewFilterValue] = useState<string>('');

  // Field options for select dropdown
  const fieldOptions: OuiSelectOption[] = FILTER_OPTIONS.map((opt) => ({
    value: opt.field,
    text: opt.label,
  }));

  // Get available operators for selected field
  const availableOperators: OuiSelectOption[] = React.useMemo(() => {
    const fieldOption = FILTER_OPTIONS.find((opt) => opt.field === newFilterField);
    if (!fieldOption) return OPERATOR_OPTIONS;

    return OPERATOR_OPTIONS.filter((opt) =>
      fieldOption.operators.includes(opt.value as FilterOperator)
    );
  }, [newFilterField]);

  // Check if operator needs a value
  const needsValue = !['exists', 'notExists'].includes(newFilterOperator);

  // Handle add filter
  const handleAddFilter = useCallback(() => {
    if (!newFilterField) return;
    if (needsValue && !newFilterValue) return;

    let value: FilterValue = newFilterValue;
    
    // Parse value for specific operators
    if (['in', 'notIn'].includes(newFilterOperator)) {
      value = newFilterValue.split(',').map((v) => v.trim());
    } else if (['gt', 'gte', 'lt', 'lte'].includes(newFilterOperator)) {
      const num = parseFloat(newFilterValue);
      if (!isNaN(num)) {
        value = num;
      }
    }

    const filter: ActiveFilter = {
      id: generateFilterId(),
      field: newFilterField,
      operator: newFilterOperator,
      value,
    };

    onAddFilter(filter);
    setIsPopoverOpen(false);
    setNewFilterField('');
    setNewFilterOperator('eq');
    setNewFilterValue('');
  }, [newFilterField, newFilterOperator, newFilterValue, needsValue, onAddFilter]);

  // Handle close popover
  const handleClosePopover = useCallback(() => {
    setIsPopoverOpen(false);
    setNewFilterField('');
    setNewFilterOperator('eq');
    setNewFilterValue('');
  }, []);

  // Filter button
  const filterButton = (
    <OuiFilterButton
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      isSelected={isPopoverOpen}
      hasActiveFilters={filters.length > 0}
      numActiveFilters={filters.length}
      grow
    >
      Add Filter
    </OuiFilterButton>
  );

  return (
    <OuiFlexGroup alignItems="center" gutterSize="s" wrap>
      <OuiFlexItem grow={false}>
        <OuiFilterGroup>
          <OuiPopover
            id="filter-popover"
            button={filterButton}
            isOpen={isPopoverOpen}
            closePopover={handleClosePopover}
            anchorPosition="downLeft"
          >
            <div style={{ width: 300 }}>
              <OuiForm component="form" onSubmit={(e: MouseEvent) => e.preventDefault()}>
                <OuiFormField label="Field" fullWidth>
                  <OuiSelect
                    value={newFilterField}
                    onChange={(e) => setNewFilterField(e.target.value)}
                    options={fieldOptions}
                    hasNoInitialSelection
                    placeholder="Select a field"
                    fullWidth
                  />
                </OuiFormField>

                <OuiSpacer size="s" />

                <OuiFormField label="Operator" fullWidth>
                  <OuiSelect
                    value={newFilterOperator}
                    onChange={(e) => setNewFilterOperator(e.target.value as FilterOperator)}
                    options={availableOperators}
                    fullWidth
                  />
                </OuiFormField>

                {needsValue && (
                  <>
                    <OuiSpacer size="s" />
                    <OuiFormField label="Value" fullWidth>
                      <OuiFieldText
                        value={newFilterValue}
                        onChange={(e) => setNewFilterValue(e.target.value)}
                        placeholder="Enter value..."
                        fullWidth
                      />
                    </OuiFormField>
                  </>
                )}

                <OuiSpacer size="m" />

                <OuiFlexGroup justifyContent="flexEnd" gutterSize="s">
                  <OuiFlexItem grow={false}>
                    <OuiButtonEmpty
                      size="s"
                      onClick={handleClosePopover}
                    >
                      Cancel
                    </OuiButtonEmpty>
                  </OuiFlexItem>
                  <OuiFlexItem grow={false}>
                    <OuiButton
                      size="s"
                      fill
                      onClick={handleAddFilter}
                      disabled={!newFilterField || (needsValue && !newFilterValue)}
                    >
                      Add
                    </OuiButton>
                  </OuiFlexItem>
                </OuiFlexGroup>
              </OuiForm>
            </div>
          </OuiPopover>
        </OuiFilterGroup>
      </OuiFlexItem>

      {/* Active filters */}
      {filters.map((filter) => (
        <OuiFlexItem grow={false} key={filter.id}>
          <OuiBadge
            iconType="cross"
            iconSide="right"
            onClick={() => onRemoveFilter(filter.id)}
            onClickAriaLabel="Remove filter"
            color="primary"
          >
            {getFilterLabel(filter)}
          </OuiBadge>
        </OuiFlexItem>
      ))}

      {/* Clear all button */}
      {filters.length > 1 && (
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty
            size="xs"
            onClick={onClearFilters}
            disabled={isLoading}
          >
            Clear all
          </OuiButtonEmpty>
        </OuiFlexItem>
      )}
    </OuiFlexGroup>
  );
}

export default FilterBar;
