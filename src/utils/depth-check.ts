/**
 * Object Depth and Structure Validation
 * 
 * Prevents prototype pollution and excessive nesting attacks
 */

/**
 * Check if a value is a plain object (not null, array, or class instance)
 * 
 * @param value - Value to check
 * @returns True if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  
  // Check if it's a plain object (not an array or other special object)
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Calculate the maximum depth of an object structure
 * 
 * @param obj - Object to measure
 * @param currentDepth - Current recursion depth (internal)
 * @returns Maximum depth found
 */
export function getObjectDepth(obj: unknown, currentDepth = 0): number {
  if (!isPlainObject(obj) && !Array.isArray(obj)) {
    return currentDepth;
  }
  
  let maxDepth = currentDepth;
  
  const values = Array.isArray(obj) ? obj : Object.values(obj);
  
  for (const value of values) {
    if (isPlainObject(value) || Array.isArray(value)) {
      const depth = getObjectDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  
  return maxDepth;
}

/**
 * Check if object depth exceeds a limit
 * 
 * @param obj - Object to check
 * @param maxDepth - Maximum allowed depth
 * @returns True if depth is within limit
 */
export function isDepthSafe(obj: unknown, maxDepth: number): boolean {
  return getObjectDepth(obj) <= maxDepth;
}

/**
 * Dangerous property names that could lead to prototype pollution
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Check if an object contains dangerous property names
 * 
 * @param obj - Object to check
 * @returns True if object is safe
 */
export function hasNoDangerousKeys(obj: unknown): boolean {
  if (!isPlainObject(obj) && !Array.isArray(obj)) {
    return true;
  }
  
  if (isPlainObject(obj)) {
    const keys = Object.keys(obj);
    
    // Check for dangerous keys
    for (const key of keys) {
      if (DANGEROUS_KEYS.includes(key)) {
        return false;
      }
    }
    
    // Recursively check nested objects
    for (const value of Object.values(obj)) {
      if (!hasNoDangerousKeys(value)) {
        return false;
      }
    }
  } else if (Array.isArray(obj)) {
    // Check array elements
    for (const value of obj) {
      if (!hasNoDangerousKeys(value)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate object structure for security
 * 
 * @param obj - Object to validate
 * @param maxDepth - Maximum allowed depth
 * @returns True if object structure is safe
 */
export function isStructureSafe(obj: unknown, maxDepth: number): boolean {
  return isDepthSafe(obj, maxDepth) && hasNoDangerousKeys(obj);
}
