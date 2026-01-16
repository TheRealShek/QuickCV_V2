import { useState } from 'react';
import { ContactForm } from './components/ContactForm';
import { SummaryForm } from './components/SummaryForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ProjectsForm } from './components/ProjectsForm';
import { SectionReorder } from './components/SectionReorder';
import type { Resume, ContactInfo, ProfessionalSummary, WorkExperience, Education, Skills, Project, SectionKey } from './types';
import './App.css';

function App() {
  const [contact, setContact] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    twitter: '',
  });

  const [summary, setSummary] = useState<ProfessionalSummary>({
    summary: '',
  });

  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skills>({ skills: [] });
  const [projects, setProjects] = useState<Project[]>([]);

  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>([
    'contact',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
  ]);

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

  return (
    <div className="app">
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
