/**
 * Validation Configuration
 * 
 * Defines limits and constraints for resume data validation
 */

/**
 * Size and depth limits for security
 */
export interface ValidationLimits {
  // String length limits
  maxStringLength: number;
  maxSummaryLength: number;
  
  // Array size limits
  maxArrayLength: number;
  maxDescriptionPoints: number;
  maxSkillsCount: number;
  
  // Collection limits
  maxExperienceEntries: number;
  maxEducationEntries: number;
  maxProjectEntries: number;
  
  // Depth limits (prevent nested object attacks)
  maxObjectDepth: number;
  
  // Total JSON size limit (bytes)
  maxJsonSize: number;
}

/**
 * Validation error types
 */
export type ValidationErrorType =
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_TYPE'
  | 'STRING_TOO_LONG'
  | 'ARRAY_TOO_LARGE'
  | 'INVALID_FORMAT'
  | 'UNSAFE_CONTENT'
  | 'DEPTH_EXCEEDED'
  | 'SIZE_EXCEEDED';

/**
 * Validation error detail
 */
export interface ValidationError {
  type: ValidationErrorType;
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Default validation limits
 */
export const DEFAULT_VALIDATION_LIMITS: ValidationLimits = {
  maxStringLength: 1000,
  maxSummaryLength: 500,
  maxArrayLength: 50,
  maxDescriptionPoints: 10,
  maxSkillsCount: 100,
  maxExperienceEntries: 20,
  maxEducationEntries: 10,
  maxProjectEntries: 15,
  maxObjectDepth: 5,
  maxJsonSize: 1024 * 1024, // 1MB
};
