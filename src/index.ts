/**
 * QuickCV - ATS-Friendly Resume Builder
 * 
 * Public API exports
 */

// Validation
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

// Document Transformation
export {
  transformResumeToDocumentWithOrder,
  validateSectionOrder,
  VALID_SECTION_KEYS,
  DEFAULT_SECTION_ORDER,
} from './transformers/resume-to-document.transformer';

export type { SectionKey } from './transformers/resume-to-document.transformer';

// PDF Rendering
export {
  generatePDFFromResume,
  generatePDFFromDocument,
} from './renderer/resume-to-pdf';

export { renderDocumentToPDF } from './renderer/pdf-renderer';

// Types - Resume Schema
export type {
  Resume,
  ContactInfo,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skills,
  Project,
} from './types/resume.types';

// Types - Validation
export type {
  ValidationLimits,
  ValidationError,
  ValidationErrorType,
  ValidationResult,
} from './types/validation.types';

export { DEFAULT_VALIDATION_LIMITS } from './types/validation.types';

// Types - Document Model
export type {
  Document,
  DocumentElement,
  DocumentElementType,
  DocumentWithMetadata,
  DocumentMetadata,
  HeadingElement,
  HeadingLevel,
  ParagraphElement,
  TextLineElement,
  ListElement,
  ListItem,
  SectionBreakElement,
} from './types/document.types';
