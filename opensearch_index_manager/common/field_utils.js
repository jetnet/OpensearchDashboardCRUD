"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueType = getValueType;
exports.flattenObject = flattenObject;
exports.unflattenObject = unflattenObject;
const types_1 = require("./types");
/**
 * Get the type of a JSON value
 */
function getValueType(value) {
    if (value === null)
        return types_1.FieldType.NULL;
    if (Array.isArray(value))
        return types_1.FieldType.ARRAY;
    const typeofValue = typeof value;
    switch (typeofValue) {
        case 'string': return types_1.FieldType.STRING;
        case 'number': return types_1.FieldType.NUMBER;
        case 'boolean': return types_1.FieldType.BOOLEAN;
        case 'object': return types_1.FieldType.OBJECT;
        default: return types_1.FieldType.STRING;
    }
}
/**
 * Flatten a nested object into an array of fields
 */
function flattenObject(obj, parentPath = '', depth = 0) {
    const fields = [];
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        const type = getValueType(value);
        const field = {
            path: currentPath,
            key,
            value,
            type,
            depth,
            parentPath: parentPath || undefined,
        };
        fields.push(field);
        // Recursively flatten objects and arrays
        if (type === types_1.FieldType.OBJECT && value !== null) {
            fields.push(...flattenObject(value, currentPath, depth + 1));
        }
        else if (type === types_1.FieldType.ARRAY) {
            value.forEach((item, index) => {
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
                if (itemType === types_1.FieldType.OBJECT && item !== null) {
                    fields.push(...flattenObject(item, arrayPath, depth + 2));
                }
            });
        }
    }
    return fields;
}
/**
 * Unflatten fields back into a nested object
 */
function unflattenObject(fields) {
    const result = {};
    // Sort by depth to build from leaves up
    const sortedFields = [...fields].sort((a, b) => a.depth - b.depth);
    for (const field of sortedFields) {
        if (field.parentPath) {
            // This is a nested field
            setNestedValue(result, field.path, field.value);
        }
        else {
            // Root level field
            result[field.key] = field.value;
        }
    }
    return result;
}
/**
 * Set a value at a nested path
 */
function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
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
        }
        else {
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
    }
    else {
        current[lastPart] = value;
    }
}
