/**
 * QuickCV - ATS-Friendly Resume Builder
 * 
 * Public API exports
 */

// Validation
export { validateResume, isValidResume } from './validators/resume-validator.js';
export {
  validateContactInfo,
  validateProfessionalSummary,
  validateWorkExperience,
  validateEducation,
  validateSkills,
  validateProject,
} from './validators/field-validators.js';

export { sanitizeString, sanitizeStringArray, isSafeString } from './utils/sanitization.js';
export { isStructureSafe, getObjectDepth } from './utils/depth-check.js';

// Document Transformation
export {
  transformResumeToDocumentWithOrder,
  validateSectionOrder,
  VALID_SECTION_KEYS,
  DEFAULT_SECTION_ORDER,
} from './transformers/resume-to-document.transformer.js';

export type { SectionKey } from './transformers/resume-to-document.transformer.js';

// PDF Rendering
export {
  generatePDFFromResume,
  generatePDFFromDocument,
} from './renderer/resume-to-pdf.js';

export { renderDocumentToPDF } from './renderer/pdf-renderer.js';

// Types - Resume Schema
export type {
  Resume,
  ContactInfo,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skills,
  Project,
} from './types/resume.types.js';

// Types - Validation
export type {
  ValidationLimits,
  ValidationError,
  ValidationErrorType,
  ValidationResult,
} from './types/validation.types.js';

export { DEFAULT_VALIDATION_LIMITS } from './types/validation.types.js';

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
} from './types/document.types.js';
