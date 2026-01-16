/**
 * Sanitization Utilities
 * 
 * Provides XSS-safe string sanitization for user input
 */

/**
 * Characters that need to be escaped for basic XSS protection
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize a string by escaping HTML special characters
 * 
 * @param input - Raw string input
 * @returns Sanitized string safe for display
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Sanitize an array of strings
 * 
 * @param input - Array of raw strings
 * @returns Array of sanitized strings
 */
export function sanitizeStringArray(input: string[]): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  
  return input.map(sanitizeString);
}

/**
 * Check if a string contains only safe, printable characters
 * Allows letters, numbers, spaces, and common punctuation
 * 
 * @param input - String to check
 * @returns True if string is safe
 */
export function isSafeString(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Allow: alphanumeric, spaces, common punctuation, newlines
  // Block: control characters (except newline/tab), null bytes
  const safePattern = /^[\p{L}\p{N}\s.,;:!?()\-_@#$%&+=\[\]{}'"\/\\\n\t]*$/u;
  
  return safePattern.test(input) && !input.includes('\0');
}

/**
 * Trim and normalize whitespace in a string
 * 
 * @param input - String to normalize
 * @returns Normalized string
 */
export function normalizeWhitespace(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.trim().replace(/\s+/g, ' ');
}
