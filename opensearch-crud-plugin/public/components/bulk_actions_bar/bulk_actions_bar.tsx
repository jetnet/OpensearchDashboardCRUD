/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bulk Actions Bar Component - Bulk operation controls for selected entities.
 * Provides buttons for bulk operations like edit and delete.
 */

import React, { type ReactNode } from 'react';
import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiButton,
  OuiButtonEmpty,
  OuiSpacer,
  OuiText,
  OuiToolTip,
} from '@opensearch-project/oui';

/**
 * Props for BulkActionsBar component
 */
export interface BulkActionsBarProps {
  /** Number of selected entities */
  selectedCount: number;
  /** Total entities count */
  totalCount: number;
  /** Bulk edit handler */
  onBulkEdit?: () => void;
  /** Bulk delete handler */
  onBulkDelete: () => void;
  /** Clear selection handler */
  onClearSelection: () => void;
  /** Whether operations are loading */
  isLoading?: boolean;
  /** Whether bulk edit is enabled */
  enableBulkEdit?: boolean;
  /** Whether bulk delete is enabled */
  enableBulkDelete?: boolean;
}

/**
 * Bulk Actions Bar Component
 * Provides bulk operation controls for selected entities
 */
export function BulkActionsBar({
  selectedCount,
  totalCount,
  onBulkEdit,
  onBulkDelete,
  onClearSelection,
  isLoading = false,
  enableBulkEdit = true,
  enableBulkDelete = true,
}: BulkActionsBarProps): ReactNode {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <OuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="s"
        responsive
      >
        <OuiFlexItem grow={false}>
          <OuiFlexGroup alignItems="center" gutterSize="s">
            <OuiFlexItem grow={false}>
              <OuiText size="s">
                <strong>
                  {selectedCount} of {totalCount} selected
                </strong>
              </OuiText>
            </OuiFlexItem>
            <OuiFlexItem grow={false}>
              <OuiButtonEmpty
                size="xs"
                onClick={onClearSelection}
                disabled={isLoading}
              >
                Clear selection
              </OuiButtonEmpty>
            </OuiFlexItem>
          </OuiFlexGroup>
        </OuiFlexItem>

        <OuiFlexItem grow={false}>
          <OuiFlexGroup alignItems="center" gutterSize="s">
            {enableBulkEdit && onBulkEdit && (
              <OuiFlexItem grow={false}>
                <OuiToolTip content="Edit selected entities">
                  <OuiButton
                    size="s"
                    onClick={onBulkEdit}
                    disabled={isLoading}
                    iconType="pencil"
                  >
                    Edit
                  </OuiButton>
                </OuiToolTip>
              </OuiFlexItem>
            )}
            {enableBulkDelete && (
              <OuiFlexItem grow={false}>
                <OuiToolTip content="Delete selected entities">
                  <OuiButton
                    size="s"
                    color="danger"
                    onClick={onBulkDelete}
                    disabled={isLoading}
                    iconType="trash"
                    fill
                  >
                    Delete
                  </OuiButton>
                </OuiToolTip>
              </OuiFlexItem>
            )}
          </OuiFlexGroup>
        </OuiFlexItem>
      </OuiFlexGroup>
      <OuiSpacer size="s" />
    </>
  );
}

export default BulkActionsBar;
