import { JsonValue, FlattenedField, FieldType } from './types';

/**
 * Get the type of a JSON value
 */
export function getValueType(value: JsonValue): FieldType {
  if (value === null) return FieldType.NULL;
  if (Array.isArray(value)) return FieldType.ARRAY;
  const typeofValue = typeof value;
  switch (typeofValue) {
    case 'string': return FieldType.STRING;
    case 'number': return FieldType.NUMBER;
    case 'boolean': return FieldType.BOOLEAN;
    case 'object': return FieldType.OBJECT;
    default: return FieldType.STRING;
  }
}

/**
 * Flatten a nested object into an array of fields
 */
export function flattenObject(
  obj: Record<string, JsonValue>,
  parentPath = '',
  depth = 0
): FlattenedField[] {
  const fields: FlattenedField[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const type = getValueType(value);

    const field: FlattenedField = {
      path: currentPath,
      key,
      value,
      type,
      depth,
      parentPath: parentPath || undefined,
    };

    fields.push(field);

    // Recursively flatten objects and arrays
    if (type === FieldType.OBJECT && value !== null) {
      fields.push(...flattenObject(value as Record<string, JsonValue>, currentPath, depth + 1));
    } else if (type === FieldType.ARRAY) {
      (value as JsonValue[]).forEach((item, index) => {
        const arrayPath = `${currentPath}[${index}]`;
        const itemType = getValueType(item);
        
        fields.push({
          path: arrayPath,
          key: `[${index}]`,
          value: item,
          type: itemType,
          depth: depth + 1,
          parentPath: currentPath,
          isArrayItem: true,
          arrayIndex: index,
        });

        if (itemType === FieldType.OBJECT && item !== null) {
          fields.push(...flattenObject(item as Record<string, JsonValue>, arrayPath, depth + 2));
        }
      });
    }
  }

  return fields;
}

/**
 * Unflatten fields back into a nested object
 */
export function unflattenObject(fields: FlattenedField[]): Record<string, JsonValue> {
  const result: Record<string, JsonValue> = {};

  // Sort by depth to build from leaves up
  const sortedFields = [...fields].sort((a, b) => a.depth - b.depth);

  for (const field of sortedFields) {
    if (field.parentPath) {
      // This is a nested field
      setNestedValue(result, field.path, field.value);
    } else {
      // Root level field
      result[field.key] = field.value;
    }
  }

  return result;
}

/**
 * Set a value at a nested path
 */
function setNestedValue(obj: Record<string, JsonValue>, path: string, value: JsonValue): void {
  const parts = path.split('.');
  let current: any = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    // Handle array notation like "items[0]"
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    
    if (arrayMatch) {
      const arrayKey = arrayMatch[1];
      const indexStr = arrayMatch[2];
      const index = parseInt(indexStr, 10);
      
      if (!current[arrayKey]) {
        current[arrayKey] = [];
      }
      
      if (!current[arrayKey][index]) {
        current[arrayKey][index] = {};
      }
      
      current = current[arrayKey][index];
    } else {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  const arrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
  
  if (arrayMatch) {
    const arrayKey = arrayMatch[1];
    const indexStr = arrayMatch[2];
    const index = parseInt(indexStr, 10);
    
    if (!current[arrayKey]) {
      current[arrayKey] = [];
    }
    
    current[arrayKey][index] = value;
  } else {
    current[lastPart] = value;
  }
}
