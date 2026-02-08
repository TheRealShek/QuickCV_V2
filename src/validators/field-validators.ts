/**
 * Field-level Validators
 * 
 * Validates individual resume sections against schema and limits
 */

import type {
  ContactInfo,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skills,
  Project,
} from '../types/resume.types.js';
import type { ValidationError, ValidationLimits } from '../types/validation.types.js';
import { isSafeString } from '../utils/sanitization.js';

/**
 * Validate required string field
 */
function validateRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  errors: ValidationError[]
): value is string {
  if (typeof value !== 'string') {
    errors.push({
      type: 'INVALID_TYPE',
      field: fieldName,
      message: `${fieldName} must be a string`,
      value,
    });
    return false;
  }
  
  if (value.trim() === '') {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: fieldName,
      message: `${fieldName} is required and cannot be empty`,
    });
    return false;
  }
  
  if (value.length > maxLength) {
    errors.push({
      type: 'STRING_TOO_LONG',
      field: fieldName,
      message: `${fieldName} exceeds maximum length of ${maxLength} characters`,
      value: value.length,
    });
    return false;
  }
  
  if (!isSafeString(value)) {
    errors.push({
      type: 'UNSAFE_CONTENT',
      field: fieldName,
      message: `${fieldName} contains unsafe characters`,
    });
    return false;
  }
  
  return true;
}

/**
 * Validate optional string field
 */
function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  errors: ValidationError[]
): value is string | undefined {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  
  return validateRequiredString(value, fieldName, maxLength, errors);
}

/**
 * Validate string array field
 */
function validateStringArray(
  value: unknown,
  fieldName: string,
  maxItems: number,
  maxLength: number,
  errors: ValidationError[]
): value is string[] {
  if (!Array.isArray(value)) {
    errors.push({
      type: 'INVALID_TYPE',
      field: fieldName,
      message: `${fieldName} must be an array`,
      value,
    });
    return false;
  }
  
  if (value.length > maxItems) {
    errors.push({
      type: 'ARRAY_TOO_LARGE',
      field: fieldName,
      message: `${fieldName} exceeds maximum of ${maxItems} items`,
      value: value.length,
    });
    return false;
  }
  
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (!validateRequiredString(item, `${fieldName}[${i}]`, maxLength, errors)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate ContactInfo
 */
export function validateContactInfo(
  data: unknown,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'contact',
      message: 'Contact information must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const contact = data as Partial<ContactInfo>;
  
  validateRequiredString(contact.fullName, 'contact.fullName', limits.maxStringLength, errors);
  validateRequiredString(contact.email, 'contact.email', limits.maxStringLength, errors);
  validateRequiredString(contact.phone, 'contact.phone', limits.maxStringLength, errors);
  validateRequiredString(contact.location, 'contact.location', limits.maxStringLength, errors);
  
  validateOptionalString(contact.linkedin, 'contact.linkedin', limits.maxStringLength, errors);
  validateOptionalString(contact.github, 'contact.github', limits.maxStringLength, errors);
  validateOptionalString(contact.portfolio, 'contact.portfolio', limits.maxStringLength, errors);
  validateOptionalString(contact.twitter, 'contact.twitter', limits.maxStringLength, errors);
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate ProfessionalSummary
 */
export function validateProfessionalSummary(
  data: unknown,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'summary',
      message: 'Professional summary must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const summary = data as Partial<ProfessionalSummary>;
  
  validateRequiredString(summary.summary, 'summary.summary', limits.maxSummaryLength, errors);
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate WorkExperience entry
 */
export function validateWorkExperience(
  data: unknown,
  index: number,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prefix = `experience[${index}]`;
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: prefix,
      message: 'Work experience entry must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const exp = data as Partial<WorkExperience>;
  
  validateRequiredString(exp.company, `${prefix}.company`, limits.maxStringLength, errors);
  validateRequiredString(exp.role, `${prefix}.role`, limits.maxStringLength, errors);
  validateRequiredString(exp.startDate, `${prefix}.startDate`, limits.maxStringLength, errors);
  
  validateOptionalString(exp.location, `${prefix}.location`, limits.maxStringLength, errors);
  validateOptionalString(exp.endDate, `${prefix}.endDate`, limits.maxStringLength, errors);
  
  validateStringArray(
    exp.description,
    `${prefix}.description`,
    limits.maxDescriptionPoints,
    limits.maxStringLength,
    errors
  );
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Education entry
 */
export function validateEducation(
  data: unknown,
  index: number,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prefix = `education[${index}]`;
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: prefix,
      message: 'Education entry must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const edu = data as Partial<Education>;
  
  validateRequiredString(edu.institution, `${prefix}.institution`, limits.maxStringLength, errors);
  validateRequiredString(edu.degree, `${prefix}.degree`, limits.maxStringLength, errors);
  validateRequiredString(edu.startDate, `${prefix}.startDate`, limits.maxStringLength, errors);
  
  validateOptionalString(edu.fieldOfStudy, `${prefix}.fieldOfStudy`, limits.maxStringLength, errors);
  validateOptionalString(edu.endDate, `${prefix}.endDate`, limits.maxStringLength, errors);
  validateOptionalString(edu.cgpa, `${prefix}.cgpa`, limits.maxStringLength, errors);
  
  // Validate relevantCourseWorks as optional string array
  if (edu.relevantCourseWorks !== undefined) {
    if (!Array.isArray(edu.relevantCourseWorks)) {
      errors.push({
        type: 'INVALID_TYPE',
        field: `${prefix}.relevantCourseWorks`,
        message: 'Relevant courseworks must be an array',
        value: edu.relevantCourseWorks,
      });
    } else {
      edu.relevantCourseWorks.forEach((course, i) => {
        if (typeof course !== 'string') {
          errors.push({
            type: 'INVALID_TYPE',
            field: `${prefix}.relevantCourseWorks[${i}]`,
            message: 'Each coursework must be a string',
            value: course,
          });
        } else if (course.length > limits.maxStringLength) {
          errors.push({
            type: 'STRING_TOO_LONG',
            field: `${prefix}.relevantCourseWorks[${i}]`,
            message: `Coursework exceeds maximum length of ${limits.maxStringLength}`,
            value: course,
          });
        }
      });
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Skills
 */
export function validateSkills(
  data: unknown,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'skills',
      message: 'Skills must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const skills = data as Partial<Skills>;
  
  validateStringArray(
    skills.skills,
    'skills.skills',
    limits.maxSkillsCount,
    limits.maxStringLength,
    errors
  );
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Project entry
 */
export function validateProject(
  data: unknown,
  index: number,
  limits: ValidationLimits
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const prefix = `projects[${index}]`;
  
  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'INVALID_TYPE',
      field: prefix,
      message: 'Project entry must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  const project = data as Partial<Project>;
  
  validateRequiredString(project.name, `${prefix}.name`, limits.maxStringLength, errors);
  
  validateStringArray(
    project.description,
    `${prefix}.description`,
    limits.maxDescriptionPoints,
    limits.maxStringLength,
    errors
  );
  
  if (project.techStack !== undefined) {
    validateStringArray(
      project.techStack,
      `${prefix}.techStack`,
      limits.maxArrayLength,
      limits.maxStringLength,
      errors
    );
  }
  
  validateOptionalString(project.link, `${prefix}.link`, limits.maxStringLength, errors);
  
  return { isValid: errors.length === 0, errors };
}
