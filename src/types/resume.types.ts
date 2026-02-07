/**
 * Resume Data Model
 * 
 * This schema is fixed and must not be extended.
 * All fields are defined in PROJECT_GUIDELINES.md
 */

/**
 * Font Profile for ATS-safe typography
 * Uses only PDF standard fonts to ensure compatibility
 */
export type FontProfile = 'sans' | 'serif' | 'mono';

/**
 * Contact Information
 */
export interface ContactInfo {
  fullName: string;
  jobTitle?: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

/**
 * Professional Summary
 * 2-4 sentences, plain text only
 */
export interface ProfessionalSummary {
  summary: string;
}

/**
 * Work Experience Entry
 */
export interface WorkExperience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string[]; // bullet points
}

/**
 * Education Entry
 */
export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

/**
 * Skills
 * Flat list only - no categorization
 */
export interface Skills {
  skills: string[];
}

/**
 * Project Entry
 */
export interface Project {
  name: string;
  description: string[];
  techStack?: string[];
  link?: string;
}

/**
 * Complete Resume Data Structure
 */
export interface Resume {
  contact: ContactInfo;
  summary: ProfessionalSummary;
  experience: WorkExperience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  combinedExperienceProjects?: boolean;
}
