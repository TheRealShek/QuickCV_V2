/**
 * V2 Document Transformer with Section Ordering
 * 
 * Extends v1 transformation with configurable section ordering.
 * Does not modify v1 transformResumeToDocument() function.
 */

import type { Resume } from '../types/resume.types.js';
import type { Document, DocumentElement } from '../types/document.types.js';

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
  'experienceProjects',
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
  
  // Only add missing sections if experienceProjects is NOT in the order
  // If experienceProjects is present, experience and projects should not be added
  const hasExperienceProjects = finalOrder.includes('experienceProjects');
  
  for (const key of DEFAULT_SECTION_ORDER) {
    // Skip experience and projects if experienceProjects is present
    if (hasExperienceProjects && (key === 'experience' || key === 'projects')) {
      continue;
    }
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
  
  // Name as H1 heading
  elements.push({ type: 'HEADING', level: 1, text: contact.fullName });
  
  // Job title (if provided) directly under name
  if (contact.jobTitle) {
    elements.push({ type: 'TEXT_LINE', text: contact.jobTitle });
  }
  
  // Line 1: email | phone | location
  const line1Parts: string[] = [];
  if (contact.email) line1Parts.push(contact.email);
  if (contact.phone) line1Parts.push(contact.phone);
  if (contact.location) line1Parts.push(contact.location);
  
  if (line1Parts.length > 0) {
    elements.push({ type: 'TEXT_LINE', text: line1Parts.join(' | ') });
  }
  
  // Line 2: linkedin | github | portfolio | twitter
  const line2Parts: string[] = [];
  if (contact.linkedin) line2Parts.push(contact.linkedin);
  if (contact.github) line2Parts.push(contact.github);
  if (contact.portfolio) line2Parts.push(contact.portfolio);
  if (contact.twitter) line2Parts.push(contact.twitter);
  
  if (line2Parts.length > 0) {
    elements.push({ type: 'TEXT_LINE', text: line2Parts.join(' | ') });
  }
  
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
    
    const meta: string[] = [];
    const dateLine = edu.endDate ? `${edu.startDate} - ${edu.endDate}` : `${edu.startDate} - Present`;
    meta.push(dateLine);
    
    if (edu.cgpa) {
      meta.push(`CGPA: ${edu.cgpa}`);
    }
    
    elements.push({ type: 'TEXT_LINE', text: meta.join(' • ') });
    
    // Add relevant coursework if provided
    if (edu.relevantCourseWork && edu.relevantCourseWork.length > 0) {
      elements.push({ type: 'TEXT_LINE', text: `Relevant Coursework: ${edu.relevantCourseWork.join(', ')}` });
    }
    
    if (index < resume.education.length - 1) {
      elements.push({ type: 'TEXT_LINE', text: '' });
    }
  });
  
  return elements;
}

/**
 * Skill category mapping (deterministic, keyword-based)
 */
const SKILL_CATEGORIES = {
  'Frontend': [
    'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby',
    'typescript', 'javascript', 'html', 'css', 'sass', 'scss', 'tailwind',
    'redux', 'mobx', 'webpack', 'vite', 'babel', 'jest', 'testing-library'
  ],
  'Backend': [
    'node', 'express', 'fastify', 'nest', 'koa',
    'python', 'django', 'flask', 'fastapi',
    'java', 'spring', 'kotlin',
    'go', 'golang', 'gin',
    'ruby', 'rails',
    'php', 'laravel',
    'graphql', 'rest', 'api', 'grpc'
  ],
  'Database': [
    'postgres', 'postgresql', 'mysql', 'sqlite', 'mariadb',
    'mongodb', 'dynamodb', 'redis', 'elasticsearch',
    'sql', 'nosql', 'prisma', 'typeorm', 'sequelize', 'mongoose'
  ],
  'Cloud': [
    'aws', 'azure', 'gcp', 'google cloud',
    'docker', 'kubernetes', 'k8s',
    'terraform', 'serverless', 'lambda', 'cloudformation'
  ],
  'DevOps': [
    'jenkins', 'github actions', 'gitlab ci', 'circleci',
    'ci/cd', 'ansible', 'argocd', 'prometheus', 'grafana'
  ],
  'Tools': [
    'git', 'github', 'gitlab', 'bitbucket',
    'jira', 'confluence', 'slack',
    'vscode', 'vim', 'postman', 'figma',
    'linux', 'bash', 'shell'
  ]
} as const;

/**
 * Category name normalization for user-provided prefixes
 * Maps case-insensitive variations to canonical category names
 */
const CATEGORY_ALIASES: Record<string, string> = {
  'frontend': 'Frontend',
  'backend': 'Backend',
  'database': 'Database',
  'cloud': 'Cloud',
  'devops': 'DevOps',
  'ci/cd': 'DevOps',
  'cicd': 'DevOps',
  'mobile': 'Mobile',
  'ios': 'Mobile',
  'android': 'Mobile',
  'api': 'API',
  'apis': 'API',
  'testing': 'Testing',
  'qa': 'Testing',
  'security': 'Security',
  'auth': 'Security',
  'data': 'Data',
  'analytics': 'Data',
  'ml': 'AI & ML',
  'ai': 'AI & ML',
  'ai & ml': 'AI & ML',
  'ai&ml': 'AI & ML',
  'devtools': 'Tools',
  'cli': 'Tools',
  'tools': 'Tools',
  'os': 'Operating Systems',
  'linux': 'Operating Systems',
  'windows': 'Operating Systems',
  'operating systems': 'Operating Systems',
  'networking': 'Networking',
  'architecture': 'Architecture',
  'system design': 'Architecture',
  'cms': 'CMS',
  'game': 'Game Development',
  'gamedev': 'Game Development',
  'game development': 'Game Development',
  'other': 'Other'
};

/**
 * Parse skill with optional category prefix (e.g., "Cloud: OpenTelemetry")
 * Returns { category, skill } where category is either user-provided or auto-detected
 */
function parseSkillWithCategory(skillInput: string): { category: string; skill: string } {
  const trimmed = skillInput.trim();
  
  // Check for category prefix pattern "Category: Skill"
  const colonIndex = trimmed.indexOf(': ');
  
  if (colonIndex > 0) {
    const rawCategory = trimmed.substring(0, colonIndex).trim();
    const skillName = trimmed.substring(colonIndex + 2).trim();
    
    // Validate both parts are non-empty
    if (rawCategory.length > 0 && skillName.length > 0) {
      // Normalize category name via aliases
      const normalizedCategory = CATEGORY_ALIASES[rawCategory.toLowerCase()] || 'Other';
      return { category: normalizedCategory, skill: skillName };
    }
  }
  
  // No valid prefix found - use keyword-based categorization
  return { category: categorizeSkillByKeyword(trimmed), skill: trimmed };
}

/**
 * Categorize a skill based on keyword matching (internal helper)
 */
function categorizeSkillByKeyword(skill: string): string {
  const normalizedSkill = skill.toLowerCase().trim();
  
  for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
    for (const keyword of keywords) {
      if (normalizedSkill.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

/**
 * Transform skills section to document elements with categorization
 * Supports both automatic keyword-based categorization and user-provided category prefixes
 */
function transformSkillsSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  if (resume.skills.skills.length === 0) return elements;
  
  elements.push({ type: 'HEADING', level: 2, text: 'Skills' });
  
  // Group skills by category
  const categorizedSkills = new Map<string, string[]>();
  
  for (const skillInput of resume.skills.skills) {
    const { category, skill } = parseSkillWithCategory(skillInput);
    
    if (!categorizedSkills.has(category)) {
      categorizedSkills.set(category, []);
    }
    categorizedSkills.get(category)!.push(skill);
  }
  
  // Stable category order
  const categoryOrder = [
    'Frontend',
    'Backend',
    'Mobile',
    'Database',
    'Cloud',
    'DevOps',
    'API',
    'Testing',
    'Security',
    'Data',
    'AI & ML',
    'Tools',
    'Operating Systems',
    'Networking',
    'Architecture',
    'CMS',
    'Game Development',
    'Other'
  ];
  
  // Emit one TEXT_LINE per category
  for (const category of categoryOrder) {
    if (categorizedSkills.has(category)) {
      const skills = categorizedSkills.get(category)!;
      const categoryLine = `${category}: ${skills.join(', ')}`;
      elements.push({ type: 'TEXT_LINE', text: categoryLine });
    }
  }
  
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
 * Transform combined experience and projects section
 * User controls the order via form, so we simply show experience first, then projects
 */
function transformCombinedExperienceProjectsSection(resume: Resume): DocumentElement[] {
  const elements: DocumentElement[] = [];
  
  elements.push({ type: 'HEADING', level: 2, text: 'Experience & Projects' });
  
  // Add experience entries
  resume.experience.forEach((exp, index) => {
    elements.push({ type: 'HEADING', level: 3, text: `${exp.role} at ${exp.company}` });
    
    const meta: string[] = [];
    if (exp.location) meta.push(exp.location);
    
    const dateRange =
      exp.endDate && exp.endDate.trim() !== ''
        ? `${exp.startDate} – ${exp.endDate}`
        : exp.startDate;
    meta.push(dateRange);
    
    if (meta.length > 0) {
      elements.push({ type: 'TEXT_LINE', text: meta.join(' • ') });
    }
    
    elements.push({ type: 'LIST', items: exp.description.map(text => ({ text })) });
    
    // Add spacing between entries
    if (index < resume.experience.length - 1 || resume.projects.length > 0) {
      elements.push({ type: 'TEXT_LINE', text: '' });
    }
  });
  
  // Add project entries
  resume.projects.forEach((project, index) => {
    elements.push({ type: 'HEADING', level: 3, text: project.name });
    
    const meta: string[] = [];
    if (project.techStack && project.techStack.length > 0) {
      meta.push(project.techStack.join(', '));
    }
    if (project.link) {
      meta.push(project.link);
    }
    
    if (meta.length > 0) {
      elements.push({ type: 'TEXT_LINE', text: meta.join(' • ') });
    }
    
    elements.push({ type: 'LIST', items: project.description.map(text => ({ text })) });
    
    // Add spacing between projects
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
    experienceProjects: () => transformCombinedExperienceProjectsSection(resume),
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
