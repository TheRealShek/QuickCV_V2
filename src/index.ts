/**
 * Validation Module
 * 
 * Public exports for resume validation
 */

export { validateResume, isValidResume } from './validators/resume-validator';
export {
  validateContactInfo,
  validateProfessionalSummary,
  validateWorkExperience,
  validateEducation,
  validateSkills,
  validateProject,
} from './validators/field-validators';

export { sanitizeString, sanitizeStringArray, isSafeString } from './utils/sanitization';
export { isStructureSafe, getObjectDepth } from './utils/depth-check';

export type {
  Resume,
  ContactInfo,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skills,
  Project,
} from './types/resume.types';

export type {
  ValidationLimits,
  ValidationError,
  ValidationErrorType,
  ValidationResult,
} from './types/validation.types';

export { DEFAULT_VALIDATION_LIMITS } from './types/validation.types';
