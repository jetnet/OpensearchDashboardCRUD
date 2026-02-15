/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Entity Form Component - Form for creating and editing entities.
 * Uses OUI form components with validation.
 */

import React, { useState, useCallback, useEffect, type ReactNode, type ChangeEvent } from 'react';
import {
  OuiForm,
  OuiFormField,
  OuiFieldText,
  OuiTextArea,
  OuiSelect,
  OuiButton,
  OuiButtonEmpty,
  OuiSpacer,
  OuiFlexGroup,
  OuiFlexItem,
  OuiCallOut,
  OuiLoadingSpinner,
  type OuiSelectOption,
} from '@opensearch-project/oui';
import type { Entity, CreateEntityRequest, UpdateEntityRequest } from '../../types';
import type { ValidationResult, ValidationError } from '../../../common';
import type { ValidationService } from '../../services';

/**
 * Form mode type
 */
export type FormMode = 'create' | 'edit';

/**
 * Form field values interface
 */
interface FormValues {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  tags: string;
}

/**
 * Initial form values
 */
const INITIAL_FORM_VALUES: FormValues = {
  name: '',
  description: '',
  status: 'active',
  tags: '',
};

/**
 * Status options for select dropdown
 */
const STATUS_OPTIONS: OuiSelectOption[] = [
  { value: 'active', text: 'Active' },
  { value: 'inactive', text: 'Inactive' },
  { value: 'archived', text: 'Archived' },
];

/**
 * Props for EntityForm component
 */
export interface EntityFormProps {
  /** Form mode (create or edit) */
  mode: FormMode;
  /** Entity to edit (only for edit mode) */
  entity?: Entity;
  /** Validation service instance */
  validationService: ValidationService;
  /** Submit handler */
  onSubmit: (data: CreateEntityRequest | UpdateEntityRequest) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** External validation errors */
  externalErrors?: ValidationError[];
}

/**
 * Entity Form Component
 * Provides form for creating and editing entities with validation
 */
export function EntityForm({
  mode,
  entity,
  validationService,
  onSubmit,
  onCancel,
  isLoading = false,
  externalErrors = [],
}: EntityFormProps): ReactNode {
  const [formValues, setFormValues] = useState<FormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with entity data in edit mode
  useEffect(() => {
    if (mode === 'edit' && entity) {
      setFormValues({
        name: entity.attributes?.name || '',
        description: entity.attributes?.description || '',
        status: entity.attributes?.status || 'active',
        tags: entity.attributes?.tags?.join(', ') || '',
      });
    } else {
      setFormValues(INITIAL_FORM_VALUES);
    }
    setErrors(new Map());
  }, [mode, entity]);

  // Handle external errors
  useEffect(() => {
    const errorMap = new Map<string, string>();
    externalErrors.forEach((error) => {
      errorMap.set(error.field, error.message);
    });
    setErrors(errorMap);
  }, [externalErrors]);

  // Validate a single field
  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      const result: ValidationResult = validationService.validateField(field, value);
      if (!result.isValid && result.errors.length > 0) {
        return result.errors[0].message;
      }
      return null;
    },
    [validationService]
  );

  // Handle field change
  const handleFieldChange = useCallback(
    (field: keyof FormValues) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormValues((prev) => ({ ...prev, [field]: value }));

        // Validate on change
        const error = validateField(field, value);
        setErrors((prev) => {
          const newErrors = new Map(prev);
          if (error) {
            newErrors.set(field, error);
          } else {
            newErrors.delete(field);
          }
          return newErrors;
        });
      },
    [validateField]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors = new Map<string, string>();

    // Validate name
    const nameError = validateField('name', formValues.name);
    if (nameError) newErrors.set('name', nameError);

    // Validate description
    const descError = validateField('description', formValues.description);
    if (descError) newErrors.set('description', descError);

    // Validate status
    const statusError = validateField('status', formValues.status);
    if (statusError) newErrors.set('status', statusError);

    // Validate tags
    if (formValues.tags.trim()) {
      const tags = formValues.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
      const tagsError = validateField('tags', tags);
      if (tagsError) newErrors.set('tags', tagsError);
    }

    setErrors(newErrors);
    return newErrors.size === 0;
  }, [formValues, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse tags
      const tags = formValues.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const data: CreateEntityRequest | UpdateEntityRequest = {
        attributes: {
          name: formValues.name.trim(),
          description: formValues.description.trim() || undefined,
          status: formValues.status,
          tags: tags.length > 0 ? tags : undefined,
        },
      };

      await onSubmit(data);
    } catch (error) {
      // Handle submission error
      if (error instanceof Error) {
        setErrors((prev) => {
          const newErrors = new Map(prev);
          newErrors.set('submit', error.message);
          return newErrors;
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, validateForm, onSubmit]);

  // Check if form is valid
  const isValid = errors.size === 0 && formValues.name.trim().length > 0;

  return (
    <OuiForm component="form" onSubmit={(e) => e.preventDefault()}>
      {errors.has('submit') && (
        <>
          <OuiCallOut title="Submission Error" color="danger" iconType="alert">
            {errors.get('submit')}
          </OuiCallOut>
          <OuiSpacer size="m" />
        </>
      )}

      <OuiFormField
        label="Name"
        helpText="Enter a unique name for the entity"
        isInvalid={errors.has('name')}
        error={errors.get('name')}
        fullWidth
      >
        <OuiFieldText
          name="name"
          value={formValues.name}
          onChange={handleFieldChange('name')}
          isInvalid={errors.has('name')}
          disabled={isLoading || isSubmitting}
          placeholder="Entity name"
          fullWidth
          required
        />
      </OuiFormField>

      <OuiSpacer size="m" />

      <OuiFormField
        label="Description"
        helpText="Optional description for the entity"
        isInvalid={errors.has('description')}
        error={errors.get('description')}
        fullWidth
      >
        <OuiTextArea
          name="description"
          value={formValues.description}
          onChange={handleFieldChange('description')}
          isInvalid={errors.has('description')}
          disabled={isLoading || isSubmitting}
          placeholder="Enter a description..."
          fullWidth
          rows={3}
        />
      </OuiFormField>

      <OuiSpacer size="m" />

      <OuiFormField
        label="Status"
        helpText="Current status of the entity"
        isInvalid={errors.has('status')}
        error={errors.get('status')}
        fullWidth
      >
        <OuiSelect
          name="status"
          value={formValues.status}
          onChange={handleFieldChange('status')}
          options={STATUS_OPTIONS}
          isInvalid={errors.has('status')}
          disabled={isLoading || isSubmitting}
          fullWidth
        />
      </OuiFormField>

      <OuiSpacer size="m" />

      <OuiFormField
        label="Tags"
        helpText="Comma-separated list of tags"
        isInvalid={errors.has('tags')}
        error={errors.get('tags')}
        fullWidth
      >
        <OuiFieldText
          name="tags"
          value={formValues.tags}
          onChange={handleFieldChange('tags')}
          isInvalid={errors.has('tags')}
          disabled={isLoading || isSubmitting}
          placeholder="tag1, tag2, tag3"
          fullWidth
        />
      </OuiFormField>

      <OuiSpacer size="l" />

      <OuiFlexGroup justifyContent="flexEnd" gutterSize="s">
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
          >
            Cancel
          </OuiButtonEmpty>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiButton
            onClick={handleSubmit}
            fill
            disabled={!isValid || isLoading || isSubmitting}
            iconType={isSubmitting ? undefined : 'check'}
          >
            {isSubmitting ? (
              <OuiLoadingSpinner size="s" />
            ) : mode === 'create' ? (
              'Create Entity'
            ) : (
              'Save Changes'
            )}
          </OuiButton>
        </OuiFlexItem>
      </OuiFlexGroup>
    </OuiForm>
  );
}

export default EntityForm;
