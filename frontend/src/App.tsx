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
import type { Resume, ContactInfo, ProfessionalSummary, WorkExperience, Education, Skills, Project, SectionKey } from './types';
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

  // Keep refs in sync with state
  useEffect(() => { contactRef.current = contact; }, [contact]);
  useEffect(() => { summaryRef.current = summary; }, [summary]);
  useEffect(() => { experienceRef.current = experience; }, [experience]);
  useEffect(() => { educationRef.current = education; }, [education]);
  useEffect(() => { skillsRef.current = skills; }, [skills]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { sectionOrderRef.current = sectionOrder; }, [sectionOrder]);

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

  // Mark as changed whenever state updates
  useEffect(() => {
    hasChangesRef.current = true;
  }, [contact, summary, experience, education, skills, projects, sectionOrder]);

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
          .map((err) => `${err.field}: ${err.message}`)
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

          <div className="actions">
            <button
              className="btn-primary"
              onClick={handleGeneratePDF}
              disabled={!contact.fullName || !contact.email || !contact.phone || !contact.location || !summary.summary}
            >
              Generate PDF
            </button>
          </div>
        </main>

        <aside className="sidebar-center">
          <div className="sidebar-sticky">
            <SectionReorder sectionOrder={sectionOrder} onChange={setSectionOrder} />
          </div>
        </aside>

        <aside className="sidebar-right">
          <div className="sidebar-sticky">
            <div className="preview-placeholder">
              <h3>PDF Preview</h3>
              <p className="coming-soon">Coming Soon</p>
              <p className="preview-note">
                Future preview will display the exact PDF output to ensure ATS compatibility.
                No visual editing - what you see will be what you get.
              </p>
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
