/**
 * Resume to Document Transformer
 * 
 * Converts validated Resume data to intermediate Document model
 * for ATS-safe PDF rendering.
 */

import type { Resume, WorkExperience, Education, Project } from '../types/resume.types';
import type {
  Document,
  DocumentElement,
  DocumentWithMetadata,
  HeadingElement,
  ParagraphElement,
  TextLineElement,
  ListElement,
  SectionBreakElement,
} from '../types/document.types';

/**
 * Create a heading element
 */
function createHeading(text: string, level: 1 | 2 | 3 = 1): HeadingElement {
  return {
    type: 'HEADING',
    level,
    text,
  };
}

/**
 * Create a paragraph element
 */
function createParagraph(text: string): ParagraphElement {
  return {
    type: 'PARAGRAPH',
    text,
  };
}

/**
 * Create a text line element
 */
function createTextLine(text: string): TextLineElement {
  return {
    type: 'TEXT_LINE',
    text,
  };
}

/**
 * Create a list element
 */
function createList(items: string[]): ListElement {
  return {
    type: 'LIST',
    items: items.map((text) => ({ text })),
  };
}

/**
 * Create a section break element
 */
function createSectionBreak(): SectionBreakElement {
  return {
    type: 'SECTION_BREAK',
  };
}

/**
 * Transform contact information to document elements
 */
function transformContact(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  const { contact } = resume;
  
  // Full name as main heading
  elements.push(createHeading(contact.fullName, 1));
  
  // Contact details as text lines
  elements.push(createTextLine(contact.email));
  elements.push(createTextLine(contact.phone));
  elements.push(createTextLine(contact.location));
  
  // Optional links
  if (contact.linkedin) {
    elements.push(createTextLine(contact.linkedin));
  }
  if (contact.github) {
    elements.push(createTextLine(contact.github));
  }
  if (contact.portfolio) {
    elements.push(createTextLine(contact.portfolio));
  }
  if (contact.twitter) {
    elements.push(createTextLine(contact.twitter));
  }
  
  return elements;
}

/**
 * Transform professional summary to document elements
 */
function transformSummary(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  elements.push(createHeading('Professional Summary', 2));
  elements.push(createParagraph(resume.summary.summary));
  
  return elements;
}

/**
 * Transform work experience to document elements
 */
function transformExperience(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.experience.length === 0) {
    return elements;
  }
  
  elements.push(createHeading('Work Experience', 2));
  
  resume.experience.forEach((exp: WorkExperience, index: number) => {
    // Role as subheading
    elements.push(createHeading(exp.role, 3));
    
    // Company and location
    const companyLine = exp.location 
      ? `${exp.company} - ${exp.location}`
      : exp.company;
    elements.push(createTextLine(companyLine));
    
    // Dates
    const dateLine = exp.endDate 
      ? `${exp.startDate} - ${exp.endDate}`
      : `${exp.startDate} - Present`;
    elements.push(createTextLine(dateLine));
    
    // Description as list
    if (exp.description.length > 0) {
      elements.push(createList(exp.description));
    }
    
    // Add space between entries (except after last)
    if (index < resume.experience.length - 1) {
      elements.push(createTextLine(''));
    }
  });
  
  return elements;
}

/**
 * Transform education to document elements
 */
function transformEducation(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.education.length === 0) {
    return elements;
  }
  
  elements.push(createHeading('Education', 2));
  
  resume.education.forEach((edu: Education, index: number) => {
    // Degree as subheading
    const degreeText = edu.fieldOfStudy 
      ? `${edu.degree} in ${edu.fieldOfStudy}`
      : edu.degree;
    elements.push(createHeading(degreeText, 3));
    
    // Institution
    elements.push(createTextLine(edu.institution));
    
    // Dates
    const dateLine = edu.endDate 
      ? `${edu.startDate} - ${edu.endDate}`
      : `${edu.startDate} - Present`;
    elements.push(createTextLine(dateLine));
    
    // Add space between entries (except after last)
    if (index < resume.education.length - 1) {
      elements.push(createTextLine(''));
    }
  });
  
  return elements;
}

/**
 * Transform skills to document elements
 */
function transformSkills(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.skills.skills.length === 0) {
    return elements;
  }
  
  elements.push(createHeading('Skills', 2));
  
  // Skills as comma-separated text line (ATS-friendly)
  const skillsText = resume.skills.skills.join(', ');
  elements.push(createTextLine(skillsText));
  
  return elements;
}

/**
 * Transform projects to document elements
 */
function transformProjects(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.projects.length === 0) {
    return elements;
  }
  
  elements.push(createHeading('Projects', 2));
  
  resume.projects.forEach((project: Project, index: number) => {
    // Project name as subheading
    elements.push(createHeading(project.name, 3));
    
    // Tech stack (if provided)
    if (project.techStack && project.techStack.length > 0) {
      const techStackText = project.techStack.join(', ');
      elements.push(createTextLine(techStackText));
    }
    
    // Link (if provided)
    if (project.link) {
      elements.push(createTextLine(project.link));
    }
    
    // Description as list
    if (project.description.length > 0) {
      elements.push(createList(project.description));
    }
    
    // Add space between entries (except after last)
    if (index < resume.projects.length - 1) {
      elements.push(createTextLine(''));
    }
  });
  
  return elements;
}

/**
 * Transform validated Resume to Document model
 * 
 * Fixed section order:
 * 1. Contact Information
 * 2. Professional Summary
 * 3. Work Experience
 * 4. Education
 * 5. Skills
 * 6. Projects
 * 
 * @param resume - Validated resume data
 * @returns Document model ready for PDF rendering
 */
export function transformResumeToDocument(resume: Resume): Document {
  const elements: DocumentElement[] = [];
  
  // 1. Contact Information
  elements.push(...transformContact(resume));
  elements.push(createSectionBreak());
  
  // 2. Professional Summary
  elements.push(...transformSummary(resume));
  elements.push(createSectionBreak());
  
  // 3. Work Experience
  if (resume.experience.length > 0) {
    elements.push(...transformExperience(resume));
    elements.push(createSectionBreak());
  }
  
  // 4. Education
  if (resume.education.length > 0) {
    elements.push(...transformEducation(resume));
    elements.push(createSectionBreak());
  }
  
  // 5. Skills
  if (resume.skills.skills.length > 0) {
    elements.push(...transformSkills(resume));
    elements.push(createSectionBreak());
  }
  
  // 6. Projects
  if (resume.projects.length > 0) {
    elements.push(...transformProjects(resume));
  }
  
  return { elements };
}

/**
 * Transform Resume to Document with metadata
 * 
 * @param resume - Validated resume data
 * @param sourceResumeId - Optional identifier for the source resume
 * @returns Document with metadata
 */
export function transformResumeToDocumentWithMetadata(
  resume: Resume,
  sourceResumeId?: string
): DocumentWithMetadata {
  const document = transformResumeToDocument(resume);
  
  return {
    document,
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceResumeId,
    },
  };
}
