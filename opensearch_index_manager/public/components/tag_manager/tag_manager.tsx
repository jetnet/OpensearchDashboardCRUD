import React, { useState, useCallback } from "react";
import {
  EuiBadge,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from "@elastic/eui";
import { JsonValue } from "../../../common/types";

interface TagManagerProps {
  values: JsonValue[];
  fieldName: string;
  onValuesChange: (fieldName: string, values: JsonValue[]) => void;
  readOnly?: boolean;
}

// Format a single value for display
const formatTagValue = (value: JsonValue): string => {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

// Parse input value to appropriate type
const parseInputValue = (input: string): JsonValue => {
  if (input === "null" || input === "") return null;
  if (input === "true") return true;
  if (input === "false") return false;
  const num = Number(input);
  if (!isNaN(num)) return num;
  return input;
};

export const TagManager: React.FC<TagManagerProps> = ({
  values,
  fieldName,
  onValuesChange,
  readOnly = false,
}) => {
  const [newTagValue, setNewTagValue] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Handle tag deletion
  const handleDeleteTag = useCallback(
    (index: number) => {
      const newValues = [...values];
      newValues.splice(index, 1);
      onValuesChange(fieldName, newValues);
    },
    [values, fieldName, onValuesChange]
  );

  // Handle adding new tag
  const handleAddTag = useCallback(() => {
    if (newTagValue.trim() === "") {
      setIsAdding(false);
      return;
    }

    const parsedValue = parseInputValue(newTagValue.trim());
    const newValues = [...values, parsedValue];
    onValuesChange(fieldName, newValues);
    setNewTagValue("");
    setIsAdding(false);
  }, [newTagValue, values, fieldName, onValuesChange]);

  // Handle key press in input
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleAddTag();
      } else if (e.key === "Escape") {
        setNewTagValue("");
        setIsAdding(false);
      }
    },
    [handleAddTag]
  );

  // Start adding mode
  const startAdding = useCallback(() => {
    setIsAdding(true);
  }, []);

  // Cancel adding
  const cancelAdding = useCallback(() => {
    setNewTagValue("");
    setIsAdding(false);
  }, []);

  // Determine badge color based on value type
  const getBadgeColor = (value: JsonValue): string => {
    if (value === null) return "default";
    if (typeof value === "boolean") return value ? "success" : "warning";
    if (typeof value === "number") return "primary";
    if (typeof value === "string") return "accent";
    return "hollow";
  };

  if (!Array.isArray(values)) {
    return (
      <EuiText size="s" color="subdued">
        Not an array field
      </EuiText>
    );
  }

  return (
    <div data-test-subj="tag-manager">
      <EuiFlexGroup wrap responsive={false} gutterSize="xs">
        {values.map((value, index) => (
          <EuiFlexItem key={index} grow={false}>
            <EuiBadge
              color={getBadgeColor(value)}
              data-test-subj={`tag-${fieldName}-${index}`}
              closeButtonProps={
                readOnly
                  ? undefined
                  : {
                      "aria-label": `Remove ${formatTagValue(value)}`,
                      onClick: () => handleDeleteTag(index),
                      "data-test-subj": `tag-delete-${index}`,
                    }
              }
            >
              {formatTagValue(value)}
            </EuiBadge>
          </EuiFlexItem>
        ))}
        
        {/* Add new tag input */}
        {isAdding && !readOnly ? (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="xs" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiFieldText
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Value..."
                  autoFocus
                  compressed
                  data-test-subj="tag-input"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  iconType="check"
                  onClick={handleAddTag}
                  aria-label="Add tag"
                  color="primary"
                  size="s"
                  data-test-subj="tag-add-confirm"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  iconType="cross"
                  onClick={cancelAdding}
                  aria-label="Cancel"
                  color="danger"
                  size="s"
                  data-test-subj="tag-add-cancel"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ) : !readOnly ? (
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="plus"
              onClick={startAdding}
              aria-label="Add new tag"
              color="primary"
              size="s"
              data-test-subj="tag-add-button"
            />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>

      {/* Empty state */}
      {values.length === 0 && !isAdding && !readOnly && (
        <EuiText size="s" color="subdued">
          Empty array - click + to add values
        </EuiText>
      )}
    </div>
  );
};