/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pagination Bar Component - Pagination controls for entity lists.
 * Uses OUI pagination components.
 */

import React, { useCallback, type ReactNode, type MouseEvent } from 'react';
import {
  OuiPagination,
  OuiFlexGroup,
  OuiFlexItem,
  OuiButtonEmpty,
  OuiToolTip,
} from '@opensearch-project/oui';
import { PAGE_SIZE_OPTIONS } from '../../../common';

/**
 * Props for PaginationBar component
 */
export interface PaginationBarProps {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total item count */
  total: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange: (size: number) => void;
  /** Whether pagination is loading */
  isLoading?: boolean;
}

/**
 * Pagination Bar Component
 * Provides pagination controls for entity lists
 */
export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationBarProps): ReactNode {
  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Handle page change
  const handlePageClick = useCallback(
    (pageIndex: number) => {
      if (!isLoading) {
        onPageChange(pageIndex + 1); // Convert to 1-indexed
      }
    },
    [isLoading, onPageChange]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (!isLoading) {
        onPageSizeChange(size);
      }
    },
    [isLoading, onPageSizeChange]
  );

  // Calculate display range
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <OuiFlexGroup
      justifyContent="spaceBetween"
      alignItems="center"
      responsive
      wrap
    >
      <OuiFlexItem grow={false}>
        <OuiFlexGroup alignItems="center" gutterSize="s">
          <OuiFlexItem grow={false}>
            <span className="oui-textTruncate">
              Showing {startItem} - {endItem} of {total} items
            </span>
          </OuiFlexItem>
          <OuiFlexItem grow={false}>
            <OuiToolTip content="Select items per page">
              <select
                value={pageSize}
                onChange={(e: MouseEvent<HTMLSelectElement>) => {
                  const target = e.target as HTMLSelectElement;
                  handlePageSizeChange(Number(target.value));
                }}
                disabled={isLoading}
                className="ouiSelect"
                style={{ width: 'auto' }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </OuiToolTip>
          </OuiFlexItem>
        </OuiFlexGroup>
      </OuiFlexItem>

      <OuiFlexItem grow={false}>
        <OuiPagination
          pageCount={totalPages}
          activePage={page - 1} // Convert to 0-indexed for OuiPagination
          onPageClick={handlePageClick}
          compressed
          disabled={isLoading}
        />
      </OuiFlexItem>
    </OuiFlexGroup>
  );
}

export default PaginationBar;
