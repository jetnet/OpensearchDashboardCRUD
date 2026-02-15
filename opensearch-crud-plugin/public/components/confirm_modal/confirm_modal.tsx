/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Confirm Modal Component - Confirmation dialog for destructive actions.
 * Uses OUI modal components.
 */

import React, { type ReactNode } from 'react';
import {
  OuiConfirmModal,
  OuiOverlayMask,
} from '@opensearch-project/oui';

/**
 * Props for ConfirmModal component
 */
export interface ConfirmModalProps {
  /** Modal title */
  title: string;
  /** Modal message */
  message: string;
  /** Confirm button text */
  confirmButtonText?: string;
  /** Cancel button text */
  cancelButtonText?: string;
  /** Confirm button color */
  buttonColor?: 'primary' | 'danger' | 'warning' | 'ghost' | 'text';
  /** Whether the action is loading */
  isLoading?: boolean;
  /** Whether to show the cancel button */
  showCancelButton?: boolean;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
}

/**
 * Confirm Modal Component
 * Provides confirmation dialog for destructive actions
 */
export function ConfirmModal({
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  buttonColor = 'danger',
  isLoading = false,
  showCancelButton = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps): ReactNode {
  return (
    <OuiOverlayMask>
      <OuiConfirmModal
        title={title}
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelButtonText={showCancelButton ? cancelButtonText : undefined}
        confirmButtonText={confirmButtonText}
        buttonColor={buttonColor}
        defaultFocusedButton="confirm"
        isLoading={isLoading}
      >
        <p>{message}</p>
      </OuiConfirmModal>
    </OuiOverlayMask>
  );
}

/**
 * Props for DeleteConfirmModal component
 */
export interface DeleteConfirmModalProps {
  /** Entity name to delete */
  entityName?: string;
  /** Number of entities to delete */
  count?: number;
  /** Whether the delete is loading */
  isLoading?: boolean;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
}

/**
 * Delete Confirm Modal Component
 * Specialized confirm modal for delete operations
 */
export function DeleteConfirmModal({
  entityName,
  count = 1,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps): ReactNode {
  const title = count === 1
    ? 'Delete Entity'
    : `Delete ${count} Entities`;
  
  const message = count === 1
    ? `Are you sure you want to delete "${entityName || 'this entity'}"? This action cannot be undone.`
    : `Are you sure you want to delete ${count} entities? This action cannot be undone.`;

  return (
    <ConfirmModal
      title={title}
      message={message}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      buttonColor="danger"
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default ConfirmModal;
