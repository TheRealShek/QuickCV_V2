# QuickCV v2

Generate ATS-friendly, text-based PDF resumes from JSON data.

## Features

Text-based PDF output (selectable, searchable, ATS-compatible)  
Strict validation with XSS protection  
Job title field under name  
Combined Experience & Projects section toggle  
Custom section ordering  
Automatic skills categorization  
Multiple font profiles (Sans, Serif, Mono)  
Three density presets (Normal, Compact, Ultra-Compact)

## Quick Start

```bash
npm install
npm run build
npm run dev
```

Open http://localhost:5173

## JSON Schema

```json
{
  "contact": {
    "fullName": "Your Name",
    "jobTitle": "Backend Developer",
    "email": "you@example.com",
    "phone": "+1-555-0100",
    "location": "City, State",
    "linkedin": "linkedin.com/in/you",
    "github": "github.com/you",
    "portfolio": "your-site.com"
  },
  "summary": {
    "summary": "Professional summary..."
  },
  "experience": [...],
  "education": [...],
  "skills": { "skills": ["React", "Node.js"] },
  "projects": [...],
  "combinedExperienceProjects": false
}
```

## Key Features

**Job Title**  
Optional field in contact section. Displays under your name in the resume header.

**Combined Sections**  
Set `combinedExperienceProjects: true` to merge experience and projects into one section. Toggle available in UI under Appearance → Sections.

**Contact Format**  
Line 1: email | phone | location  
Line 2: LinkedIn | GitHub | Portfolio

**Section Ordering**  
Drag to reorder sections in the UI, or modify `sectionOrder` array in JSON.

**Customization**  
Font profile, density, margins, and line spacing configurable via `style` object.

## API Usage

```typescript
import { validateResume, generatePDFFromResume } from './src/index';

const result = validateResume(resumeData);
if (result.isValid) {
  const pdfBuffer = await generatePDFFromResume(resumeData);
}
```

## Deployment

Configured for Vercel. API endpoint: `/api/generate-pdf`

## Documentation

USER_GUIDE.md - Complete schema reference  
PROJECT_GUIDELINES.md - Architecture overview

Test endpoint: `https://your-app.vercel.app/api/test`

## License

MIT

