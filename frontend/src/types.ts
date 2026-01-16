/**
 * Resume Types (matching v1 schema)
 */

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface ProfessionalSummary {
  summary: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface Skills {
  skills: string[];
}

export interface Project {
  name: string;
  description: string[];
  techStack?: string[];
  link?: string;
}

export interface Resume {
  contact: ContactInfo;
  summary: ProfessionalSummary;
  experience: WorkExperience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
}

export type SectionKey = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects';

export type FontProfile = 'sans' | 'serif' | 'mono';

export type DensityPreset = 'normal' | 'compact' | 'ultra-compact';
