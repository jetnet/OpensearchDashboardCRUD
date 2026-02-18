/**
 * Utility functions for flattening and unflattening nested objects
 * Supports arbitrarily nested JSON structures including arrays
 */

/**
 * Flatten a nested object into a flat object with dot-notation keys
 * @param obj - The object to flatten
 * @param prefix - The prefix for keys (used for recursion)
 * @returns A flattened object with dot-notation keys
 */
export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(result, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Handle arrays
        value.forEach((item, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (item !== null && typeof item === 'object') {
            Object.assign(result, flattenObject(item, arrayKey));
          } else {
            result[arrayKey] = item;
          }
        });
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

/**
 * Unflatten a flat object with dot-notation keys back into a nested object
 * @param obj - The flattened object
 * @returns A nested object
 */
export function unflattenObject(obj: Record<string, any>): any {
  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        
        // Handle array notation like "items[0]"
        const arrayMatch = k.match(/^(.+)\[(\d+)\]$/);
        
        if (arrayMatch) {
          const arrayKey = arrayMatch[1];
          const index = parseInt(arrayMatch[2], 10);
          
          if (!current[arrayKey]) {
            current[arrayKey] = [];
          }
          
          if (!current[arrayKey][index]) {
            current[arrayKey][index] = {};
          }
          
          current = current[arrayKey][index];
        } else {
          if (!current[k]) {
            current[k] = {};
          }
          current = current[k];
        }
      }

      const lastKey = keys[keys.length - 1];
      const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
      
      if (arrayMatch) {
        const arrayKey = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        
        if (!current[arrayKey]) {
          current[arrayKey] = [];
        }
        
        current[arrayKey][index] = value;
      } else {
        current[lastKey] = value;
      }
    }
  }

  return result;
}
