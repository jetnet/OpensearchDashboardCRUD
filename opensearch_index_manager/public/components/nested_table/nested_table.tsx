import React from "react";
import {
  EuiTable,
  EuiTableBody,
  EuiTableRow,
  EuiTableCell,
  EuiTitle,
  EuiText,
  EuiBadge,
  EuiSpacer,
} from "@elastic/eui";
import { JsonValue } from "../../../common/types";

interface NestedTableProps {
  data: Record<string, JsonValue>;
  depth?: number;
  maxDepth?: number;
}

// Helper to determine value type
const getValueType = (value: JsonValue): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value;
};

// Format value for display
const formatValue = (value: JsonValue): string => {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
};

// Render a single value with appropriate formatting
const RenderValue: React.FC<{ value: JsonValue; depth: number; maxDepth: number }> = ({
  value,
  depth,
  maxDepth,
}) => {
  const type = getValueType(value);

  // For arrays, render as badges or nested content
  if (Array.isArray(value)) {
    return (
      <ArrayValueRenderer
        value={value}
        depth={depth}
        maxDepth={maxDepth}
      />
    );
  }

  // For nested objects, render as nested table
  if (type === "object" && value !== null && depth < maxDepth) {
    return (
      <NestedTable
        data={value as Record<string, JsonValue>}
        depth={depth + 1}
        maxDepth={maxDepth}
      />
    );
  }

  // For primitive values, render with type-specific styling
  if (type === "null") {
    return (
      <EuiBadge color="default">
        null
      </EuiBadge>
    );
  }

  if (type === "boolean") {
    return (
      <EuiBadge color={value ? "success" : "warning"}>
        {String(value)}
      </EuiBadge>
    );
  }

  if (type === "number") {
    return (
      <EuiText size="s" style={{ fontFamily: "monospace" }}>
        {String(value)}
      </EuiText>
    );
  }

  if (type === "string") {
    const strValue = String(value);
    if (strValue.length > 100) {
      return (
        <EuiText size="s" style={{ wordBreak: "break-word" }}>
          {strValue.slice(0, 100)}...
        </EuiText>
      );
    }
    return (
      <EuiText size="s" style={{ wordBreak: "break-word" }}>
        {strValue}
      </EuiText>
    );
  }

  // Fallback for deeply nested objects
  return (
    <EuiText size="s" style={{ fontFamily: "monospace" }}>
      {JSON.stringify(value)}
    </EuiText>
  );
};

// Render array values
const ArrayValueRenderer: React.FC<{
  value: JsonValue[];
  depth: number;
  maxDepth: number;
}> = ({ value, depth, maxDepth }) => {
  // Check if array contains primitives only
  const hasOnlyPrimitives = value.every(
    (item) => item === null || typeof item !== "object"
  );

  if (hasOnlyPrimitives && value.length <= 10) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {value.map((item, index) => (
          <EuiBadge key={index} color="hollow">
            {formatValue(item)}
          </EuiBadge>
        ))}
      </div>
    );
  }

  // For complex arrays or large arrays, render as nested table
  if (depth < maxDepth) {
    return (
      <div style={{ marginTop: "8px" }}>
        {value.map((item, index) => {
          if (typeof item === "object" && item !== null && !Array.isArray(item)) {
            return (
              <div key={index} style={{ marginBottom: "8px" }}>
                <EuiTitle size="xxs">
                  <span>Item {index + 1}</span>
                </EuiTitle>
                <NestedTable
                  data={item as Record<string, JsonValue>}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              </div>
            );
          }
          return (
            <div key={index} style={{ marginLeft: "16px" }}>
              <EuiText size="s">
                [{index}]: {formatValue(item)}
              </EuiText>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback for deeply nested
  return (
    <EuiText size="s" style={{ fontFamily: "monospace" }}>
      {JSON.stringify(value)}
    </EuiText>
  );
};

export const NestedTable: React.FC<NestedTableProps> = ({
  data,
  depth = 0,
  maxDepth = 5,
}) => {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <EuiText size="s" color="subdued">
        Empty object
      </EuiText>
    );
  }

  // Calculate indentation based on depth
  const indentStyle = {
    marginLeft: `${depth * 24}px`,
    borderLeft: depth > 0 ? "2px solid #D3DAE6" : "none",
    paddingLeft: depth > 0 ? "12px" : "0",
  };

  return (
    <div style={indentStyle} data-test-subj={`nested-table-depth-${depth}`}>
      <EuiTable compressed>
        <EuiTableBody>
          {entries.map(([key, value]) => (
            <EuiTableRow key={key}>
              <EuiTableCell
                style={{ width: "30%", fontWeight: "bold", verticalAlign: "top" }}
              >
                <EuiText size="s">{key}</EuiText>
              </EuiTableCell>
              <EuiTableCell style={{ verticalAlign: "top" }}>
                <RenderValue value={value} depth={depth} maxDepth={maxDepth} />
              </EuiTableCell>
            </EuiTableRow>
          ))}
        </EuiTableBody>
      </EuiTable>
      {depth > 0 && <EuiSpacer size="s" />}
    </div>
  );
};