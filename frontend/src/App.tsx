import { useState, useEffect, useRef } from 'react';
import { CircleEllipsis, User, FileText, Briefcase, GraduationCap, Wrench, FolderKanban, ChevronDown, X, ChevronUp, Check, Pencil } from 'lucide-react';
import logoImage from './assets/file.png';
import { ContactForm } from './components/ContactForm';
import { SummaryForm } from './components/SummaryForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ProjectsForm } from './components/ProjectsForm';
import type { Resume, ContactInfo, ProfessionalSummary, WorkExperience, Education, Skills, Project, SectionKey, FontProfile, DensityPreset } from './types';
import './App.css';

const STORAGE_KEY = 'quickcv_resume_data';
const SAVE_INTERVAL = 10000; // 10 seconds
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Load from localStorage or return default
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data[key] !== undefined ? data[key] : defaultValue;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return defaultValue;
}

// Simple client-side validation for loaded JSON
function validateResumeStructure(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Resume data must be an object');
    return { isValid: false, errors };
  }
  
  // Check required fields
  if (!data.contact || typeof data.contact !== 'object') {
    errors.push('Contact information is required');
  } else {
    if (!data.contact.fullName) errors.push('Full name is required');
    if (!data.contact.email) errors.push('Email is required');
  }
  
  if (!data.summary || typeof data.summary !== 'object') {
    errors.push('Professional summary is required');
  }
  
  if (!Array.isArray(data.experience)) {
    errors.push('Experience must be an array');
  }
  
  if (!Array.isArray(data.education)) {
    errors.push('Education must be an array');
  }
  
  if (!data.skills || typeof data.skills !== 'object') {
    errors.push('Skills section is required');
  }
  
  if (!Array.isArray(data.projects)) {
    errors.push('Projects must be an array');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Get effective section order based on combined setting
function getEffectiveSectionOrder(baseOrder: SectionKey[], combined: boolean): string[] {
  console.log('getEffectiveSectionOrder called with:', { baseOrder, combined });
  if (!combined) {
    console.log('Returning baseOrder:', baseOrder);
    return baseOrder;
  }
  
  // Find where experience or projects appears first in the order
  const expIndex = baseOrder.indexOf('experience');
  const projIndex = baseOrder.indexOf('projects');
  
  // Determine insertion position (use whichever comes first)
  let insertPosition: number;
  if (expIndex >= 0 && projIndex >= 0) {
    insertPosition = Math.min(expIndex, projIndex);
  } else if (expIndex >= 0) {
    insertPosition = expIndex;
  } else if (projIndex >= 0) {
    insertPosition = projIndex;
  } else {
    // Neither exists, add at the end
    return [...baseOrder.filter(s => s !== 'experienceProjects'), 'experienceProjects'];
  }
  
  // Build new order: keep everything except experience, projects, and experienceProjects
  const result: string[] = [];
  for (let i = 0; i < baseOrder.length; i++) {
    const section = baseOrder[i];
    if (section === 'experience' || section === 'projects' || section === 'experienceProjects') {
      // Skip these, but if this is the first occurrence position, insert combined section
      if (i === insertPosition) {
        result.push('experienceProjects');
      }
    } else {
      result.push(section);
    }
  }
  
  console.log('Returning combined result:', result);
  return result;
}

function App() {
  const [contact, setContact] = useState<ContactInfo>(() => 
    loadFromStorage('contact', {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: '',
    })
  );

  const [summary, setSummary] = useState<ProfessionalSummary>(() =>
    loadFromStorage('summary', { summary: '' })
  );

  const [experience, setExperience] = useState<WorkExperience[]>(() =>
    loadFromStorage('experience', [])
  );

  const [education, setEducation] = useState<Education[]>(() =>
    loadFromStorage('education', [])
  );

  const [skills, setSkills] = useState<Skills>(() =>
    loadFromStorage('skills', { skills: [] })
  );

  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage('projects', [])
  );

  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(() => {
    const loadedOrder = loadFromStorage('sectionOrder', [
      'contact',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
    ] as SectionKey[]);
    // Ensure sectionOrder never contains 'experienceProjects'
    // Filter it out if present, and ensure experience/projects are present
    const sanitized = loadedOrder.filter(s => s !== 'experienceProjects') as SectionKey[];
    if (!sanitized.includes('experience')) sanitized.push('experience');
    if (!sanitized.includes('projects')) sanitized.push('projects');
    console.log('Initial sectionOrder after sanitization:', sanitized);
    return sanitized;
  });

  const [fontProfile, setFontProfile] = useState<FontProfile>(() =>
    loadFromStorage('fontProfile', 'sans')
  );

  const [densityPreset, setDensityPreset] = useState<DensityPreset>(() =>
    loadFromStorage('densityPreset', 'normal')
  );

  const [combinedExperienceProjects, setCombinedExperienceProjects] = useState<boolean>(() =>
    loadFromStorage('combinedExperienceProjects', false)
  );

  const [expandedAccordion, setExpandedAccordion] = useState<SectionKey | null>('contact');
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [appearanceTab, setAppearanceTab] = useState<'font' | 'density' | 'layout'>('font');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const hasChangesRef = useRef(false);
  const lastSavedDataRef = useRef<string>('');
  
  // Refs to always access current state in interval callback
  const contactRef = useRef(contact);
  const summaryRef = useRef(summary);
  const experienceRef = useRef(experience);
  const educationRef = useRef(education);
  const skillsRef = useRef(skills);
  const projectsRef = useRef(projects);
  const sectionOrderRef = useRef(sectionOrder);
  const fontProfileRef = useRef(fontProfile);
  const densityPresetRef = useRef(densityPreset);
  const combinedExperienceProjectsRef = useRef(combinedExperienceProjects);

  // Keep refs in sync with state
  useEffect(() => { contactRef.current = contact; }, [contact]);
  useEffect(() => { summaryRef.current = summary; }, [summary]);
  useEffect(() => { experienceRef.current = experience; }, [experience]);
  useEffect(() => { educationRef.current = education; }, [education]);
  useEffect(() => { skillsRef.current = skills; }, [skills]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { sectionOrderRef.current = sectionOrder; }, [sectionOrder]);
  useEffect(() => { fontProfileRef.current = fontProfile; }, [fontProfile]);
  useEffect(() => { densityPresetRef.current = densityPreset; }, [densityPreset]);
  useEffect(() => { combinedExperienceProjectsRef.current = combinedExperienceProjects; }, [combinedExperienceProjects]);

  // Handle appearance panel close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.appearance-btn') && !target.closest('.appearance-panel')) {
        setIsAppearanceOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAppearanceOpen(false);
      }
    };

    if (isAppearanceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isAppearanceOpen]);

  // Calculate relative time message
  const getRelativeTimeMessage = (): string => {
    if (saveStatus === 'saving') {
      return 'Saving…';
    }

    if (!lastSaveTime) {
      return 'Not saved yet';
    }

    const now = Date.now();
    const diffMs = now - lastSaveTime;
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 5) {
      return 'Saved just now';
    } else if (diffSeconds < 60) {
      return `Saved ${diffSeconds} seconds ago`;
    } else {
      return 'Saved 1+ minute ago';
    }
  };

  const [relativeTimeMessage, setRelativeTimeMessage] = useState<string>('Not saved yet');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state management
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPageCount, setPreviewPageCount] = useState<number | null>(null);

  // Mark as changed whenever state updates
  useEffect(() => {
    hasChangesRef.current = true;
  }, [contact, summary, experience, education, skills, projects, sectionOrder, fontProfile, previewState]);

  // Update relative time message every second (stop after 1 minute)
  useEffect(() => {
    const updateMessage = () => {
      setRelativeTimeMessage(getRelativeTimeMessage());
    };

    // Update immediately
    updateMessage();

    // Stop updating after 1 minute to avoid unnecessary re-renders
    if (lastSaveTime && Date.now() - lastSaveTime >= 60000) {
      return;
    }

    const intervalId = setInterval(updateMessage, 1000);
    return () => clearInterval(intervalId);
  }, [lastSaveTime, saveStatus]);

  // Auto-save interval (runs once on mount, uses refs to access current state)
  useEffect(() => {
    const saveData = () => {
      if (!hasChangesRef.current) {
        return;
      }

      try {
        const data = {
          contact: contactRef.current,
          summary: summaryRef.current,
          experience: experienceRef.current,
          education: educationRef.current,
          skills: skillsRef.current,
          projects: projectsRef.current,
          sectionOrder: sectionOrderRef.current,
          fontProfile: fontProfileRef.current,
          densityPreset: densityPresetRef.current,
          combinedExperienceProjects: combinedExperienceProjectsRef.current,
        };
        const dataString = JSON.stringify(data);

        // Only save if data actually changed
        if (dataString === lastSavedDataRef.current) {
          hasChangesRef.current = false;
          return;
        }

        setSaveStatus('saving');
        localStorage.setItem(STORAGE_KEY, dataString);
        lastSavedDataRef.current = dataString;
        hasChangesRef.current = false;

        // Update save time and switch to idle
        setTimeout(() => {
          setLastSaveTime(Date.now());
          setSaveStatus('idle');
        }, 500);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        setSaveStatus('idle');
      }
    };

    // Initialize lastSavedDataRef with current localStorage data (not current state)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      lastSavedDataRef.current = stored;
      setLastSaveTime(Date.now());
    }

    const intervalId = setInterval(saveData, SAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []); // Empty deps - runs once on mount

  // Live preview: regenerate on every state change
  useEffect(() => {
    const generateLivePreview = async () => {
      // Build resume JSON
      const resume: Resume = {
        contact,
        summary,
        experience,
        education,
        skills,
        projects,
        combinedExperienceProjects,
      };

      const effectiveOrder = getEffectiveSectionOrder(sectionOrder, combinedExperienceProjects);

      const requestData = {
        resume,
        sectionOrder: effectiveOrder,
        fontProfile,
        densityPreset,
      };

      setPreviewState('loading');
      setPreviewError(null);

      try {
        const response = await fetch(`${API_URL}/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Preview generation failed:', error);
          setPreviewError(error.error || 'Failed to generate preview');
          setPreviewState('error');
          return;
        }

        // Revoke old preview URL to free memory
        if (previewUrl) {
          window.URL.revokeObjectURL(previewUrl);
        }

        // Extract page count from response header
        const pageCountHeader = response.headers.get('X-PDF-Page-Count');
        const parsedCount = pageCountHeader ? parseInt(pageCountHeader, 10) : null;
        const pageCount = parsedCount && parsedCount > 0 ? parsedCount : null;

        // Create new preview
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewPageCount(pageCount);
        setPreviewState('ready');
      } catch (error) {
        console.error('Preview error:', error);
        setPreviewError('Failed to connect to backend. Make sure the server is running.');
        setPreviewState('error');
      }
    };

    generateLivePreview();
  }, [contact, summary, experience, education, skills, projects, sectionOrder, fontProfile, densityPreset, combinedExperienceProjects]);

  const handleGeneratePDF = async () => {
    // Build resume JSON (matching v1 schema)
    const resume: Resume = {
      contact,
      summary,
      experience,
      education,
      skills,
      projects,
      combinedExperienceProjects,
    };

    const effectiveOrder = getEffectiveSectionOrder(sectionOrder, combinedExperienceProjects);

    try {
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          sectionOrder: effectiveOrder,
          fontProfile,
          densityPreset,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PDF generation failed:', error);
        alert(`Error: ${error.error}\n${error.validationErrors ? JSON.stringify(error.validationErrors, null, 2) : ''}`);
        return;
      }

      // Trigger file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate PDF. Make sure the backend server is running.');
    }
  };

  const handleLoadJSON = () => {
    setIsMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleExportJSON = () => {
    setIsMenuOpen(false);

    // Build resume JSON matching v1 schema
    const resumeData = {
      contact,
      summary,
      experience,
      education,
      skills,
      projects,
      sectionOrder,
      combinedExperienceProjects,
      fontProfile,
      densityPreset,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(resumeData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickcv-resume.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-uploading same file
    event.target.value = '';

    if (!file.name.endsWith('.json')) {
      alert('Error: Please select a .json file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate using simple client-side check
      const validationResult = validateResumeStructure(data);

      if (!validationResult.isValid) {
        const errorMsg = validationResult.errors.join('\n');
        alert(`Validation failed:\n\n${errorMsg}`);
        return;
      }

      // Ask for confirmation before overwriting
      const confirmed = window.confirm(
        'This will replace all current resume data.\n\n' +
        'Are you sure you want to load this JSON file?'
      );

      if (!confirmed) {
        return;
      }

      // Load data into state
      const resume = data as Resume;
      setContact(resume.contact);
      setSummary(resume.summary);
      setExperience(resume.experience || []);
      setEducation(resume.education || []);
      setSkills(resume.skills || { skills: [] });
      setProjects(resume.projects || []);

      // Load section order if present, otherwise use default
      if (data.sectionOrder && Array.isArray(data.sectionOrder)) {
        // Ensure sectionOrder only contains base sections (no experienceProjects)
        const baseOrder = data.sectionOrder.filter((s: string) => s !== 'experienceProjects');
        // If experienceProjects was in order but experience/projects are missing, add them
        if (data.sectionOrder.includes('experienceProjects')) {
          if (!baseOrder.includes('experience')) baseOrder.push('experience');
          if (!baseOrder.includes('projects')) baseOrder.push('projects');
        }
        setSectionOrder(baseOrder);
      }

      // Load combinedExperienceProjects flag if present
      if (typeof data.combinedExperienceProjects === 'boolean') {
        setCombinedExperienceProjects(data.combinedExperienceProjects);
      }

      // Load font and density settings if present
      if (data.fontProfile && ['sans', 'serif', 'mono'].includes(data.fontProfile)) {
        setFontProfile(data.fontProfile);
      }
      if (data.densityPreset && ['normal', 'compact', 'ultra-compact'].includes(data.densityPreset)) {
        setDensityPreset(data.densityPreset);
      }

      alert('Resume loaded successfully!');
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert('Error: Invalid JSON file');
      } else {
        console.error('Error loading JSON:', error);
        alert('Error: Failed to load JSON file');
      }
    }
  };

  // Section reordering functions
  const moveSectionUp = (section: SectionKey) => {
    const currentIndex = sectionOrder.indexOf(section);
    if (currentIndex <= 1) return; // Can't move contact (0) or move above contact
    const newOrder = [...sectionOrder];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    setSectionOrder(newOrder);
  };

  const moveSectionDown = (section: SectionKey) => {
    const currentIndex = sectionOrder.indexOf(section);
    if (currentIndex === 0 || currentIndex >= sectionOrder.length - 1) return; // Can't move contact or last item
    const newOrder = [...sectionOrder];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    setSectionOrder(newOrder);
  };

  const canMoveUp = (section: SectionKey): boolean => {
    const index = sectionOrder.indexOf(section);
    return index > 1; // Can move if not contact and not second position
  };

  const canMoveDown = (section: SectionKey): boolean => {
    const index = sectionOrder.indexOf(section);
    return index > 0 && index < sectionOrder.length - 1; // Can move if not contact and not last
  };

  // Check if a section is completed
  const isSectionComplete = (section: SectionKey): boolean => {
    switch (section) {
      case 'contact':
        return !!(contact.fullName && contact.email && contact.phone && contact.location);
      case 'summary':
        return !!summary.summary && summary.summary.trim().length > 0;
      case 'experience':
        return experience.length > 0;
      case 'education':
        return education.length > 0;
      case 'skills':
        return skills.skills.length > 0;
      case 'projects':
        return projects.length > 0;
      case 'experienceProjects':
        return experience.length > 0 || projects.length > 0;
      default:
        return false;
    }
  };

  const getSectionIcon = (section: SectionKey) => {
    switch (section) {
      case 'contact': return User;
      case 'summary': return FileText;
      case 'experience': return Briefcase;
      case 'education': return GraduationCap;
      case 'skills': return Wrench;
      case 'projects': return FolderKanban;
      case 'experienceProjects': return Briefcase;
    }
  };

  const getSectionLabel = (section: SectionKey): string => {
    switch (section) {
      case 'contact': return 'Contact';
      case 'summary': return 'Summary';
      case 'experience': return 'Experience';
      case 'education': return 'Education';
      case 'skills': return 'Skills';
      case 'projects': return 'Projects';
      case 'experienceProjects': return 'Experience & Projects';
    }
  };

  return (
    <div className="app">
      <div className="top-toolbar">
        <div className="auto-save-indicator-top">
          {relativeTimeMessage}
        </div>
        
        <div className="more-options">
          <button
            className="more-options-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="More options"
          >
            <CircleEllipsis size={20} />
          </button>
          
          {isMenuOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLoadJSON}>
                Load JSON
              </button>
              <button className="dropdown-item" onClick={handleExportJSON}>
                Export JSON
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="main-grid">
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-steps">
            {/* Logo */}
            <div className="progress-step-wrapper">
              <div 
                className="progress-step progress-step-logo"
                onClick={() => window.location.reload()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.reload();
                  }
                }}
                aria-label="Reload application"
              >
                <img src={logoImage} alt="QuickCV Logo" className="progress-logo-image" />
              </div>
              <div className="progress-connector"></div>
            </div>
            
            {getEffectiveSectionOrder(sectionOrder, combinedExperienceProjects).map((section, index) => {
              const sectionKey = section as SectionKey;
              const Icon = getSectionIcon(sectionKey);
              const isComplete = isSectionComplete(sectionKey);
              const effectiveOrder = getEffectiveSectionOrder(sectionOrder, combinedExperienceProjects);
              const isLast = index === effectiveOrder.length - 1;
              
              return (
                <div key={section} className="progress-step-wrapper">
                  <div 
                    className={`progress-step ${isComplete ? 'complete' : 'incomplete'} ${expandedAccordion === sectionKey ? 'active' : ''}`}
                    title={getSectionLabel(sectionKey)}
                    onClick={() => setExpandedAccordion(sectionKey)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedAccordion(sectionKey);
                      }
                    }}
                    aria-label={`Open ${getSectionLabel(sectionKey)} section`}
                  >
                    <div className="progress-step-icon">
                      <Icon size={16} />
                    </div>
                    <div className="progress-step-label">
                      {getSectionLabel(sectionKey)}
                    </div>
                    <div className="progress-step-status">
                      {isComplete ? (
                        <Check size={14} className="status-check" />
                      ) : (
                        <X size={14} className="status-x" />
                      )}
                    </div>
                  </div>
                  {!isLast && <div className="progress-connector"></div>}
                </div>
              );
            })}
          </div>
        </div>

        <main className="form-container">
          {/* Accordion Sections */}
          <div className="accordion-wrapper">
            {(() => {
              const effectiveOrder = getEffectiveSectionOrder(sectionOrder, combinedExperienceProjects);
              console.log('DEBUG: sectionOrder =', sectionOrder);
              console.log('DEBUG: combinedExperienceProjects =', combinedExperienceProjects);
              console.log('DEBUG: effectiveOrder =', effectiveOrder);
              return effectiveOrder;
            })().map((sectionKey) => {
              const key = sectionKey as SectionKey;
              const getSectionConfig = (key: SectionKey) => {
                switch (key) {
                  case 'contact':
                    return {
                      icon: User,
                      title: 'Contact Information',
                      content: <ContactForm data={contact} onChange={setContact} />,
                      isEmpty: false,
                      emptyMessage: ''
                    };
                  case 'summary':
                    return {
                      icon: FileText,
                      title: 'Professional Summary',
                      content: <SummaryForm data={summary} onChange={setSummary} />,
                      isEmpty: false,
                      emptyMessage: ''
                    };
                  case 'experience':
                    return {
                      icon: Briefcase,
                      title: 'Work Experience',
                      content: <ExperienceForm data={experience} onChange={setExperience} />,
                      isEmpty: experience.length === 0,
                      emptyMessage: 'No experience entries yet'
                    };
                  case 'education':
                    return {
                      icon: GraduationCap,
                      title: 'Education',
                      content: <EducationForm data={education} onChange={setEducation} />,
                      isEmpty: education.length === 0,
                      emptyMessage: 'No education entries yet'
                    };
                  case 'skills':
                    return {
                      icon: Wrench,
                      title: 'Skills',
                      content: <SkillsForm data={skills} onChange={setSkills} />,
                      isEmpty: skills.skills.length === 0,
                      emptyMessage: 'No skills added yet'
                    };
                  case 'projects':
                    return {
                      icon: FolderKanban,
                      title: 'Projects',
                      content: <ProjectsForm data={projects} onChange={setProjects} />,
                      isEmpty: projects.length === 0,
                      emptyMessage: 'No projects added yet'
                    };
                  case 'experienceProjects':
                    return {
                      icon: Briefcase,
                      title: 'Experience & Projects',
                      content: (
                        <>
                          <ExperienceForm data={experience} onChange={setExperience} />
                          <ProjectsForm data={projects} onChange={setProjects} />
                        </>
                      ),
                      isEmpty: experience.length === 0 && projects.length === 0,
                      emptyMessage: 'No entries yet'
                    };
                }
              };

              const config = getSectionConfig(key);
              const Icon = config.icon;
              const isExpanded = expandedAccordion === key;

              return (
                <div key={key} className="accordion-card">
                  <div 
                    className="accordion-header"
                    onClick={() => setExpandedAccordion(isExpanded ? null : key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedAccordion(isExpanded ? null : key);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <div className="accordion-header-left">
                      <Icon size={20} className="accordion-icon" />
                      <h3>{config.title}</h3>
                      {config.isEmpty && !isExpanded && (
                        <span className="accordion-empty-badge">Empty</span>
                      )}
                    </div>
                    <div className="accordion-header-right">
                      <button
                        className="accordion-reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (key !== 'experienceProjects') moveSectionUp(key);
                        }}
                        disabled={key === 'experienceProjects' || !canMoveUp(key)}
                        aria-label="Move section up"
                        title={key === 'experienceProjects' ? 'Cannot reorder combined section' : 'Move up'}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        className="accordion-reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (key !== 'experienceProjects') moveSectionDown(key);
                        }}
                        disabled={key === 'experienceProjects' || !canMoveDown(key)}
                        aria-label="Move section down"
                        title={key === 'experienceProjects' ? 'Cannot reorder combined section' : 'Move down'}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <ChevronDown 
                        size={24} 
                        className={`accordion-chevron ${isExpanded ? 'expanded' : ''}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="accordion-content">
                      {config.content}
                    </div>
                  )}
                  {config.isEmpty && !isExpanded && (
                    <div className="accordion-empty-hint">{config.emptyMessage}</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="form-footer-actions">
            <button
              className="btn-primary btn-generate-pdf"
              onClick={handleGeneratePDF}
              disabled={!contact.fullName || !contact.email || !contact.phone || !contact.location || !summary.summary}
            >
              Generate PDF
            </button>
          </div>
        </main>

        <aside className="sidebar-right">
          <div className="sidebar-sticky">
            <div className="preview-container">
              <div className="preview-header">
                <h3>Preview</h3>
              </div>

              {previewState === 'ready' && previewPageCount && previewPageCount > 0 && (
                <div className={`preview-page-status ${previewPageCount === 1 ? 'status-success' : 'status-warning'}`}>
                  {previewPageCount === 1 ? (
                    <>
                      <span className="status-icon">✓</span>
                      <span>Fits on 1 page — Ready for ATS systems</span>
                    </>
                  ) : (
                    <>
                      <span className="status-icon">⚠</span>
                      <span>Resume spans {previewPageCount} pages</span>
                    </>
                  )}
                </div>
              )}

              <div className="preview-content">
                {previewState === 'loading' && (
                  <div className="preview-generating-text">
                    Generating preview…
                  </div>
                )}

                {previewState === 'ready' && previewUrl && (
                  <iframe
                    src={previewUrl}
                    className="preview-iframe"
                    title="PDF Preview"
                  />
                )}

                {previewState === 'error' && (
                  <div className="preview-error-state">
                    <p className="preview-error-title">Preview Failed</p>
                    <p className="preview-error-message">{previewError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Appearance Button */}
      <button
        className={`appearance-btn ${isAppearanceOpen ? 'active' : ''}`}
        onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
        title="Appearance"
        aria-label="Appearance"
      >
        <Pencil size={20} />
      </button>

      {/* Appearance Panel */}
      {isAppearanceOpen && (
        <div className="appearance-panel">
          <div className="appearance-header">
            <h3>Appearance</h3>
            <button
              className="appearance-close"
              onClick={() => setIsAppearanceOpen(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="appearance-tabs">
            <button
              className={`appearance-tab ${appearanceTab === 'font' ? 'active' : ''}`}
              onClick={() => setAppearanceTab('font')}
            >
              Font Style
            </button>
            <button
              className={`appearance-tab ${appearanceTab === 'density' ? 'active' : ''}`}
              onClick={() => setAppearanceTab('density')}
            >
              Layout Density
            </button>
            <button
              className={`appearance-tab ${appearanceTab === 'layout' ? 'active' : ''}`}
              onClick={() => setAppearanceTab('layout')}
            >
              Sections
            </button>
          </div>

          <div className="appearance-content">
            {appearanceTab === 'font' && (
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="fontProfile"
                    value="sans"
                    checked={fontProfile === 'sans'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Sans-Serif</span>
                  <span className="help-text-inline">Modern & Clean</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="fontProfile"
                    value="serif"
                    checked={fontProfile === 'serif'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Serif</span>
                  <span className="help-text-inline">Traditional & Formal</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="fontProfile"
                    value="mono"
                    checked={fontProfile === 'mono'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Monospace</span>
                  <span className="help-text-inline">Tech & Precise</span>
                </label>
              </div>
            )}

            {appearanceTab === 'density' && (
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="densityPreset"
                    value="normal"
                    checked={densityPreset === 'normal'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Normal</span>
                  <span className="help-text-inline">Comfortable spacing</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="densityPreset"
                    value="compact"
                    checked={densityPreset === 'compact'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Compact</span>
                  <span className="help-text-inline">Tighter spacing</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="densityPreset"
                    value="ultra-compact"
                    checked={densityPreset === 'ultra-compact'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Ultra-Compact</span>
                  <span className="help-text-inline">Maximum density</span>
                </label>
              </div>
            )}

            {appearanceTab === 'layout' && (
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={combinedExperienceProjects}
                    onChange={(e) => {
                      console.log('Toggle changed to:', e.target.checked);
                      setCombinedExperienceProjects(e.target.checked);
                    }}
                  />
                  <div>
                    <span>Combine Experience & Projects</span>
                    <p className="help-text-block">
                      Merge work experience and projects into a single "Experience & Projects" section.
                      You can reorder individual entries in each form.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
