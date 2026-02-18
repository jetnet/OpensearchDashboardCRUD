import React, { useState, useEffect } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
} from '@elastic/eui';
import { CoreStart } from 'opensearch-dashboards/public';
import { IEntity, ICreateEntityRequest, IUpdateEntityRequest } from '../../common/types';

interface EntityFlyoutProps {
  entity?: IEntity;
  onClose: () => void;
  onSuccess: () => void;
  coreStart: CoreStart;
  addToast: (title: string, color?: 'success' | 'danger' | 'warning' | 'primary', text?: string) => void;
}

export const EntityFlyout: React.FC<EntityFlyoutProps> = ({
  entity,
  onClose,
  onSuccess,
  coreStart,
  addToast,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<string>('default');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (entity) {
      setName(entity.name);
      setDescription(entity.description || '');
      setType(entity.type);
    }
  }, [entity]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      addToast('Name is required', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      if (entity?.id) {
        const updateRequest: IUpdateEntityRequest = { name, description, type };
        await coreStart.http.put(`/api/osd_crud/entities/${entity.id}`, {
          body: JSON.stringify(updateRequest),
        });
      } else {
        const createRequest: ICreateEntityRequest = { name, description, type };
        await coreStart.http.post('/api/osd_crud/entities', {
          body: JSON.stringify(createRequest),
        });
      }
      onSuccess();
    } catch (error) {
      addToast('Error saving entity', 'danger', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'default', text: 'Default' },
    { value: 'custom', text: 'Custom' },
    { value: 'system', text: 'System' },
  ];

  return (
    <EuiFlyout onClose={onClose} ownFocus maxWidth={400}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>{entity ? 'Edit Entity' : 'Create Entity'}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm>
          <EuiFormRow label="Name" helpText="Enter a unique name for the entity">
            <EuiFieldText
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entity Name"
            />
          </EuiFormRow>
          <EuiFormRow label="Description">
            <EuiTextArea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entity Description"
            />
          </EuiFormRow>
          <EuiFormRow label="Type">
            <EuiSelect
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={onClose} color="ghost">
              Cancel
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={handleSubmit} fill isLoading={submitting}>
              {entity ? 'Update' : 'Create'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
