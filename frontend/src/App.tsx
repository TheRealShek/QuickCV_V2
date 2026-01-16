import { useState, useEffect, useRef } from 'react';
import { CircleEllipsis } from 'lucide-react';
import { ContactForm } from './components/ContactForm';
import { SummaryForm } from './components/SummaryForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ProjectsForm } from './components/ProjectsForm';
import { SectionReorder } from './components/SectionReorder';
import { validateResume } from '@backend/validators/resume-validator';
import type { Resume, ContactInfo, ProfessionalSummary, WorkExperience, Education, Skills, Project, SectionKey, FontProfile, DensityPreset } from './types';
import './App.css';

const STORAGE_KEY = 'quickcv_resume_data';
const SAVE_INTERVAL = 10000; // 10 seconds

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

  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(() =>
    loadFromStorage('sectionOrder', [
      'contact',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
    ])
  );

  const [fontProfile, setFontProfile] = useState<FontProfile>(() =>
    loadFromStorage('fontProfile', 'sans')
  );

  const [densityPreset, setDensityPreset] = useState<DensityPreset>(() =>
    loadFromStorage('densityPreset', 'normal')
  );

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
  const [isPreviewOutdated, setIsPreviewOutdated] = useState(false);
  const [previewPageCount, setPreviewPageCount] = useState<number | null>(null);
  const lastPreviewDataRef = useRef<string>('');

  // Mark as changed whenever state updates
  useEffect(() => {
    hasChangesRef.current = true;
    // Mark preview as outdated if data changes after preview was generated
    if (previewState === 'ready') {
      setIsPreviewOutdated(true);
    }
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

  const handleGeneratePDF = async () => {
    // Build resume JSON (matching v1 schema)
    const resume: Resume = {
      contact,
      summary,
      experience,
      education,
      skills,
      projects,
    };

    try {
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          sectionOrder,
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

  const handleRefreshPreview = async () => {
    // Build resume JSON
    const resume: Resume = {
      contact,
      summary,
      experience,
      education,
      skills,
      projects,
    };

    const requestData = {
      resume,
      sectionOrder,
      fontProfile,
      densityPreset,
    };

    const currentDataString = JSON.stringify(requestData);

    setPreviewState('loading');
    setPreviewError(null);

    try {
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: currentDataString,
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
      const pageCount = pageCountHeader ? parseInt(pageCountHeader, 10) : null;

      // Create new preview
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewPageCount(pageCount);
      lastPreviewDataRef.current = currentDataString;
      setIsPreviewOutdated(false);
      setPreviewState('ready');
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError('Failed to connect to backend. Make sure the server is running.');
      setPreviewState('error');
    }
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

      // Validate using shared validator (single source of truth)
      const validationResult = validateResume(data);

      if (!validationResult.isValid) {
        const errorMsg = validationResult.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join('\n');
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
        setSectionOrder(data.sectionOrder);
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

      <header>
        <h1>QuickCV - Resume Builder</h1>
        <p className="subtitle">ATS-friendly resume generator</p>
      </header>

      <div className="main-grid">
        <main className="form-container">
          <ContactForm data={contact} onChange={setContact} />
          <SummaryForm data={summary} onChange={setSummary} />
          <ExperienceForm data={experience} onChange={setExperience} />
          <EducationForm data={education} onChange={setEducation} />
          <SkillsForm data={skills} onChange={setSkills} />
          <ProjectsForm data={projects} onChange={setProjects} />
        </main>

        <aside className="sidebar-center">
          <div className="sidebar-sticky">
            <SectionReorder sectionOrder={sectionOrder} onChange={setSectionOrder} />
            
            <div className="font-selector">
              <h3>Font Style</h3>
              <div className="font-options">
                <label className={`font-option ${fontProfile === 'sans' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="fontProfile"
                    value="sans"
                    checked={fontProfile === 'sans'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Sans-Serif</span>
                  <span className="font-example">Modern & Clean</span>
                </label>
                <label className={`font-option ${fontProfile === 'serif' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="fontProfile"
                    value="serif"
                    checked={fontProfile === 'serif'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Serif</span>
                  <span className="font-example">Traditional & Formal</span>
                </label>
                <label className={`font-option ${fontProfile === 'mono' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="fontProfile"
                    value="mono"
                    checked={fontProfile === 'mono'}
                    onChange={(e) => setFontProfile(e.target.value as FontProfile)}
                  />
                  <span>Monospace</span>
                  <span className="font-example">Tech & Precise</span>
                </label>
              </div>
            </div>

            <div className="density-selector">
              <h3>Layout Density</h3>
              <div className="density-options">
                <label className={`density-option ${densityPreset === 'normal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="densityPreset"
                    value="normal"
                    checked={densityPreset === 'normal'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Normal</span>
                  <span className="density-hint">Comfortable spacing</span>
                </label>
                <label className={`density-option ${densityPreset === 'compact' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="densityPreset"
                    value="compact"
                    checked={densityPreset === 'compact'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Compact</span>
                  <span className="density-hint">Tighter spacing</span>
                </label>
                <label className={`density-option ${densityPreset === 'ultra-compact' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="densityPreset"
                    value="ultra-compact"
                    checked={densityPreset === 'ultra-compact'}
                    onChange={(e) => setDensityPreset(e.target.value as DensityPreset)}
                  />
                  <span>Ultra-Compact</span>
                  <span className="density-hint">Maximum density</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <aside className="sidebar-right">
          <div className="sidebar-sticky">
            <div className="preview-actions">
              <button
                className="btn-primary btn-generate-pdf"
                onClick={handleGeneratePDF}
                disabled={!contact.fullName || !contact.email || !contact.phone || !contact.location || !summary.summary}
              >
                Generate PDF
              </button>
            </div>
            
            <div className="preview-container">
              <div className="preview-header">
                <h3>Preview</h3>
                <button
                  className="btn-preview-refresh"
                  onClick={handleRefreshPreview}
                  disabled={previewState === 'loading'}
                >
                  {previewState === 'loading' ? 'Loading...' : 'Refresh Preview'}
                </button>
              </div>

              {isPreviewOutdated && previewState === 'ready' && (
                <div className="preview-outdated-notice">
                  Preview may be outdated
                </div>
              )}

              {previewState === 'ready' && previewPageCount !== null && (
                <div className={`preview-page-status ${previewPageCount === 1 ? 'status-success' : 'status-warning'}`}>
                  {previewPageCount === 1 ? (
                    <>
                      <span className="status-icon">✓</span>
                      <span>Fits on 1 page — Ready for ATS systems</span>
                    </>
                  ) : (
                    <>
                      <div className="status-header">
                        <span className="status-icon">⚠</span>
                        <span>Resume spans {previewPageCount} pages</span>
                      </div>
                      <div className="status-guidance">
                        <strong>How to fit on one page:</strong>
                        <ul>
                          <li><strong>Quick fix:</strong> Try "Compact" or "Ultra-Compact" density (left panel)</li>
                          <li><strong>Content:</strong> Trim older experience bullets to 2-3 per role</li>
                          <li><strong>Sections:</strong> Reduce projects list or combine short bullet points</li>
                          <li><strong>Skills:</strong> List only most relevant skills (8-12 max)</li>
                        </ul>
                        <p className="status-tip">💡 Most recruiters prefer one-page resumes for roles with &lt;10 years experience</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="preview-content">
                {previewState === 'idle' && (
                  <div className="preview-empty-state">
                    <p>No preview yet</p>
                    <p className="preview-hint">Click "Refresh Preview" to generate</p>
                  </div>
                )}

                {previewState === 'loading' && (
                  <div className="preview-loading-state">
                    <div className="preview-spinner"></div>
                    <p>Generating preview...</p>
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

      <footer>
        <p>QuickCV v2 - Complete with section reordering</p>
      </footer>
    </div>
  );
}

export default App;
