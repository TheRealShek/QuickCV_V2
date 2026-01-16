/**
 * V2 Document Transformer with Section Ordering
 * 
 * Extends v1 transformation with configurable section ordering.
 * Does not modify v1 transformResumeToDocument() function.
 */

import type { Resume } from '../types/resume.types';
import type { Document, DocumentElement } from '../types/document.types';

/**
 * Valid section keys for ordering
 */
export const VALID_SECTION_KEYS = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
] as const;

export type SectionKey = typeof VALID_SECTION_KEYS[number];

/**
 * Default section order (v1 order)
 */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
];

/**
 * Validate and normalize section order
 * 
 * @param sectionOrder - User-provided section order
 * @returns Validated and complete section order with contact first
 */
export function validateSectionOrder(sectionOrder?: string[]): SectionKey[] {
  if (!sectionOrder || !Array.isArray(sectionOrder)) {
    return DEFAULT_SECTION_ORDER;
  }
  
  // Filter to valid, unique keys only
  const validKeys = new Set<SectionKey>();
  const orderedKeys: SectionKey[] = [];
  
  for (const key of sectionOrder) {
    if (VALID_SECTION_KEYS.includes(key as SectionKey) && !validKeys.has(key as SectionKey)) {
      validKeys.add(key as SectionKey);
      orderedKeys.push(key as SectionKey);
    }
  }
  
  // Ensure contact is first
  const finalOrder: SectionKey[] = [];
  
  if (orderedKeys.includes('contact')) {
    finalOrder.push('contact');
    orderedKeys.splice(orderedKeys.indexOf('contact'), 1);
  } else {
    finalOrder.push('contact');
  }
  
  // Add remaining ordered keys
  finalOrder.push(...orderedKeys);
  
  // Add any missing sections at the end (in default order)
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!finalOrder.includes(key)) {
      finalOrder.push(key);
    }
  }
  
  return finalOrder;
}

/**
 * Transform contact section to document elements
 */
function transformContactSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  const { contact } = resume;
  
  elements.push({ type: 'HEADING', level: 1, text: contact.fullName });
  elements.push({ type: 'TEXT_LINE', text: contact.email });
  elements.push({ type: 'TEXT_LINE', text: contact.phone });
  elements.push({ type: 'TEXT_LINE', text: contact.location });
  
  if (contact.linkedin) elements.push({ type: 'TEXT_LINE', text: contact.linkedin });
  if (contact.github) elements.push({ type: 'TEXT_LINE', text: contact.github });
  if (contact.portfolio) elements.push({ type: 'TEXT_LINE', text: contact.portfolio });
  if (contact.twitter) elements.push({ type: 'TEXT_LINE', text: contact.twitter });
  
  return elements;
}

/**
 * Transform summary section to document elements
 */
function transformSummarySection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  elements.push({ type: 'HEADING', level: 2, text: 'Professional Summary' });
  elements.push({ type: 'PARAGRAPH', text: resume.summary.summary });
  
  return elements;
}

/**
 * Transform experience section to document elements
 */
function transformExperienceSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.experience.length === 0) return elements;
  
  elements.push({ type: 'HEADING', level: 2, text: 'Work Experience' });
  
  resume.experience.forEach((exp, index) => {
    elements.push({ type: 'HEADING', level: 3, text: exp.role });
    
    const companyLine = exp.location ? `${exp.company} - ${exp.location}` : exp.company;
    elements.push({ type: 'TEXT_LINE', text: companyLine });
    
    const dateLine = exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;
    elements.push({ type: 'TEXT_LINE', text: dateLine });
    
    if (exp.description.length > 0) {
      elements.push({ type: 'LIST', items: exp.description.map(text => ({ text })) });
    }
    
    if (index < resume.experience.length - 1) {
      elements.push({ type: 'TEXT_LINE', text: '' });
    }
  });
  
  return elements;
}

/**
 * Transform education section to document elements
 */
function transformEducationSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.education.length === 0) return elements;
  
  elements.push({ type: 'HEADING', level: 2, text: 'Education' });
  
  resume.education.forEach((edu, index) => {
    const degreeText = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;
    elements.push({ type: 'HEADING', level: 3, text: degreeText });
    elements.push({ type: 'TEXT_LINE', text: edu.institution });
    
    const dateLine = edu.endDate ? `${edu.startDate} - ${edu.endDate}` : `${edu.startDate} - Present`;
    elements.push({ type: 'TEXT_LINE', text: dateLine });
    
    if (index < resume.education.length - 1) {
      elements.push({ type: 'TEXT_LINE', text: '' });
    }
  });
  
  return elements;
}

/**
 * Transform skills section to document elements
 */
function transformSkillsSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.skills.skills.length === 0) return elements;
  
  elements.push({ type: 'HEADING', level: 2, text: 'Skills' });
  
  const skillsText = resume.skills.skills.join(', ');
  elements.push({ type: 'TEXT_LINE', text: skillsText });
  
  return elements;
}

/**
 * Transform projects section to document elements
 */
function transformProjectsSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.projects.length === 0) return elements;
  
  elements.push({ type: 'HEADING', level: 2, text: 'Projects' });
  
  resume.projects.forEach((project, index) => {
    elements.push({ type: 'HEADING', level: 3, text: project.name });
    
    if (project.techStack && project.techStack.length > 0) {
      const techStackText = project.techStack.join(', ');
      elements.push({ type: 'TEXT_LINE', text: techStackText });
    }
    
    if (project.link) {
      elements.push({ type: 'TEXT_LINE', text: project.link });
    }
    
    if (project.description.length > 0) {
      elements.push({ type: 'LIST', items: project.description.map(text => ({ text })) });
    }
    
    if (index < resume.projects.length - 1) {
      elements.push({ type: 'TEXT_LINE', text: '' });
    }
  });
  
  return elements;
}

/**
 * Transform Resume to Document with custom section ordering
 * 
 * @param resume - Validated resume data
 * @param sectionOrder - Optional custom section order
 * @returns Document model with sections in specified order
 */
export function transformResumeToDocumentWithOrder(
  resume: Resume,
  sectionOrder?: string[]
): Document {
  const order = validateSectionOrder(sectionOrder);
  const elements: DocumentElement[] = [];
  
  const sectionTransformers: Record<SectionKey, () => DocumentElement[]> = {
    contact: () => transformContactSection(resume),
    summary: () => transformSummarySection(resume),
    experience: () => transformExperienceSection(resume),
    education: () => transformEducationSection(resume),
    skills: () => transformSkillsSection(resume),
    projects: () => transformProjectsSection(resume),
  };
  
  // Transform sections in specified order
  order.forEach((sectionKey, index) => {
    const sectionElements = sectionTransformers[sectionKey]();
    
    if (sectionElements.length > 0) {
      elements.push(...sectionElements);
      
      // Add section break after each section except the last
      if (index < order.length - 1) {
        elements.push({ type: 'SECTION_BREAK' });
      }
    }
  });
  
  return { elements };
}
