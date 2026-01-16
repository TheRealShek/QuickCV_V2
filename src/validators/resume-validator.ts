/**
 * Main Resume Validator
 * 
 * Orchestrates all validation checks for complete resume data
 */

import type { Resume } from '../types/resume.types';
import type {
  ValidationResult,
  ValidationError,
  ValidationLimits,
} from '../types/validation.types';
import { DEFAULT_VALIDATION_LIMITS } from '../types/validation.types';
import { isStructureSafe } from '../utils/depth-check';
import {
  validateContactInfo,
  validateProfessionalSummary,
  validateWorkExperience,
  validateEducation,
  validateSkills,
  validateProject,
} from './field-validators';

/**
 * Calculate the size of JSON data in bytes
 */
function getJsonSize(data: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  } catch {
    return 0;
  }
}

/**
 * Validate complete resume data structure
 * 
 * @param data - Resume data to validate
 * @param limits - Validation limits (optional, uses defaults if not provided)
 * @returns Validation result with all errors
 */
export function validateResume(
  data: unknown,
  limits: ValidationLimits = DEFAULT_VALIDATION_LIMITS
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Check if data exists
  if (data === null || data === undefined) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: 'resume',
      message: 'Resume data is required',
    });
    return { isValid: false, errors };
  }
  
  // Check if data is an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'resume',
      message: 'Resume data must be an object',
      value: data,
    });
    return { isValid: false, errors };
  }
  
  // Check JSON size limit
  const jsonSize = getJsonSize(data);
  if (jsonSize > limits.maxJsonSize) {
    errors.push({
      type: 'SIZE_EXCEEDED',
      field: 'resume',
      message: `Resume data exceeds maximum size of ${limits.maxJsonSize} bytes`,
      value: jsonSize,
    });
    return { isValid: false, errors };
  }
  
  // Check object depth and structure (prototype pollution protection)
  if (!isStructureSafe(data, limits.maxObjectDepth)) {
    errors.push({
      type: 'DEPTH_EXCEEDED',
      field: 'resume',
      message: `Resume data structure is unsafe or exceeds maximum depth of ${limits.maxObjectDepth}`,
    });
    return { isValid: false, errors };
  }
  
  const resume = data as Partial<Resume>;
  
  // Validate contact information
  if (resume.contact === undefined) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: 'contact',
      message: 'Contact information is required',
    });
  } else {
    const contactResult = validateContactInfo(resume.contact, limits);
    errors.push(...contactResult.errors);
  }
  
  // Validate professional summary
  if (resume.summary === undefined) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: 'summary',
      message: 'Professional summary is required',
    });
  } else {
    const summaryResult = validateProfessionalSummary(resume.summary, limits);
    errors.push(...summaryResult.errors);
  }
  
  // Validate work experience (array)
  if (!Array.isArray(resume.experience)) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'experience',
      message: 'Work experience must be an array',
      value: resume.experience,
    });
  } else {
    if (resume.experience.length > limits.maxExperienceEntries) {
      errors.push({
        type: 'ARRAY_TOO_LARGE',
        field: 'experience',
        message: `Work experience exceeds maximum of ${limits.maxExperienceEntries} entries`,
        value: resume.experience.length,
      });
    } else {
      resume.experience.forEach((exp, index) => {
        const expResult = validateWorkExperience(exp, index, limits);
        errors.push(...expResult.errors);
      });
    }
  }
  
  // Validate education (array)
  if (!Array.isArray(resume.education)) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'education',
      message: 'Education must be an array',
      value: resume.education,
    });
  } else {
    if (resume.education.length > limits.maxEducationEntries) {
      errors.push({
        type: 'ARRAY_TOO_LARGE',
        field: 'education',
        message: `Education exceeds maximum of ${limits.maxEducationEntries} entries`,
        value: resume.education.length,
      });
    } else {
      resume.education.forEach((edu, index) => {
        const eduResult = validateEducation(edu, index, limits);
        errors.push(...eduResult.errors);
      });
    }
  }
  
  // Validate skills
  if (resume.skills === undefined) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: 'skills',
      message: 'Skills section is required',
    });
  } else {
    const skillsResult = validateSkills(resume.skills, limits);
    errors.push(...skillsResult.errors);
  }
  
  // Validate projects (array)
  if (!Array.isArray(resume.projects)) {
    errors.push({
      type: 'INVALID_TYPE',
      field: 'projects',
      message: 'Projects must be an array',
      value: resume.projects,
    });
  } else {
    if (resume.projects.length > limits.maxProjectEntries) {
      errors.push({
        type: 'ARRAY_TOO_LARGE',
        field: 'projects',
        message: `Projects exceeds maximum of ${limits.maxProjectEntries} entries`,
        value: resume.projects.length,
      });
    } else {
      resume.projects.forEach((project, index) => {
        const projectResult = validateProject(project, index, limits);
        errors.push(...projectResult.errors);
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard to check if data is a valid Resume
 * 
 * @param data - Data to check
 * @param limits - Validation limits
 * @returns True if data is a valid Resume, with type assertion
 */
export function isValidResume(
  data: unknown,
  limits: ValidationLimits = DEFAULT_VALIDATION_LIMITS
): data is Resume {
  const result = validateResume(data, limits);
  return result.isValid;
}
