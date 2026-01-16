import { useState } from 'react';
import { ContactForm } from './components/ContactForm';
import { SummaryForm } from './components/SummaryForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { ProjectsForm } from './components/ProjectsForm';
import type { Resume, ContactInfo, ProfessionalSummary, WorkExperience, Education, Skills, Project } from './types';
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
          sectionOrder: ['contact', 'summary', 'experience', 'education', 'skills', 'projects'],
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

      <footer>
        <p>QuickCV v2 - All sections available. Section reordering coming soon.</p>
      </footer>
    </div>
  );
}

export default App;
