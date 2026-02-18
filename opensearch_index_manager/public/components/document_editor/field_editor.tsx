import React from 'react';
import {
  EuiFieldText,
  EuiFieldNumber,
  EuiSwitch,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from '@elastic/eui';
import { JsonValue, FlattenedField, FieldType } from '../../../common/types';

interface FieldEditorProps {
  field: FlattenedField;
  onChange: (path: string, value: JsonValue) => void;
  onDelete: (path: string) => void;
  onAddField?: (parentPath: string) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onChange,
  onDelete,
  onAddField,
}) => {
  const handleValueChange = (newValue: JsonValue) => {
    onChange(field.path, newValue);
  };

  const renderValueInput = () => {
    switch (field.type) {
      case FieldType.STRING:
        return (
          <EuiFieldText
            value={String(field.value || '')}
            onChange={(e) => handleValueChange(e.target.value)}
            fullWidth
          />
        );

      case FieldType.NUMBER:
        return (
          <EuiFieldNumber
            value={Number(field.value || 0)}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            fullWidth
          />
        );

      case FieldType.BOOLEAN:
        return (
          <EuiSwitch
            label={String(field.value)}
            checked={Boolean(field.value)}
            onChange={(e) => handleValueChange(e.target.checked)}
          />
        );

      case FieldType.NULL:
        return <EuiText color="subdued">null</EuiText>;

      case FieldType.OBJECT:
        return (
          <EuiButtonIcon
            iconType="plus"
            aria-label="Add nested field"
            onClick={() => onAddField?.(field.path)}
          />
        );

      case FieldType.ARRAY:
        return (
          <EuiText color="subdued">
            Array ({Array.isArray(field.value) ? field.value.length : 0} items)
          </EuiText>
        );

      default:
        return (
          <EuiFieldText
            value={String(field.value || '')}
            onChange={(e) => handleValueChange(e.target.value)}
            fullWidth
          />
        );
    }
  };

  const indentation = field.depth * 24;

  return (
    <EuiFlexGroup
      gutterSize="s"
      alignItems="center"
      style={{ marginLeft: `${indentation}px`, marginBottom: '8px' }}
    >
      <EuiFlexItem grow={false} style={{ minWidth: '150px' }}>
        <EuiText size="s">
          <code>{field.key}</code>
          <span style={{ marginLeft: '8px', color: '#666' }}>
            ({field.type})
          </span>
        </EuiText>
      </EuiFlexItem>

      <EuiFlexItem>{renderValueInput()}</EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          iconType="trash"
          color="danger"
          aria-label="Delete field"
          onClick={() => onDelete(field.path)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
