# QuickCV - User Guide

I built QuickCV to generate clean, ATS-friendly resumes from JSON. This guide shows you exactly what you need to know.

## Testing the API

To verify the API is working on your deployed instance:

**Test Endpoint:** `https://your-deployment.vercel.app/api/test`

This will return a JSON response with status information. If working correctly, you should see:
```json
{
  "status": "ok",
  "message": "Serverless function works",
  "canImportValidator": true,
  "nodeVersion": "v18.x.x",
  "cwd": "/var/task"
}
```

If you get an error response, check the deployment logs for more details.

## Quick Start

I validate your data, transform it to a document model, then render it as PDF. Here's how:

```typescript
import { validateResume, generatePDFFromResume } from './src/index';
import { writeFile } from 'fs/promises';

const resumeData = { /* your JSON */ };

// Step 1: Validate
const result = validateResume(resumeData);
if (!result.isValid) {
  console.error('Fix these:', result.errors);
  process.exit(1);
}

// Step 2: Generate PDF
const pdfBuffer = await generatePDFFromResume(resumeData);

// Step 3: Save
await writeFile('resume.pdf', pdfBuffer);
```

That's it. Now let me show you what your JSON should look like.

## Resume Structure

I need six sections from you. Here's what each one looks like:

## Resume Structure

I need six sections from you. Here's what each one looks like:

### Contact (required fields only)

```json
{
  "contact": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/janedoe",  // optional
    "github": "github.com/janedoe",         // optional
    "portfolio": "janedoe.com"              // optional
  }
}
```

### Summary (2-4 sentences)

```json
{
  "summary": {
    "summary": "Software engineer with 5 years building scalable web apps. I specialize in TypeScript, React, and Node.js. Currently focused on microservices and cloud infrastructure."
  }
}
```

### Experience

```json
{
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Senior Software Engineer",
      "location": "San Francisco, CA",        // optional
      "startDate": "Jan 2021",
      "endDate": "Present",                   // or leave empty for current
      "description": [
        "Led development of microservices serving 1M+ users",
        "Reduced API latency by 40% through caching",
        "Mentored 3 junior developers"
      ]
    }
  ]
}
```

**About dates:** I don't validate format. Use whatever reads well: "Jan 2024", "2024", "January 2024". Use "Present" for current roles.

### Education

```json
{
  "education": [
    {
      "institution": "UC Berkeley",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",     // optional
      "startDate": "2015",
      "endDate": "2019"                       // optional
    }
  ]
}
```

### Skills

```json
{
  "skills": {
    "skills": ["TypeScript", "React", "AWS", "PostgreSQL", "Docker"]
  }
}
```

**I auto-categorize these for you.** I'll group React under "Frontend", PostgreSQL under "Database", AWS under "Cloud & DevOps", etc. If I don't recognize something, it goes to "Other".

**Want control?** Prefix with category: `"Frontend: Elm"`. I'll strip the prefix in the PDF output.

### Projects

```json
{
  "projects": [
    {
      "name": "CLI Tool",
      "description": [
        "Built command-line tool with 5k+ downloads",
        "Comprehensive test suite with 95% coverage"
      ],
      "techStack": ["Go", "Cobra", "GitHub Actions"],  // optional
      "link": "github.com/you/project"                  // optional
    }
  ]
}
```

## Custom Section Order

By default, I render sections in this order: Contact → Summary → Experience → Education → Skills → Projects.

Want a different order? Pass it as the second argument:

```typescript
import { transformResumeToDocumentWithOrder, generatePDFFromResume } from './src/index';

const customOrder = ['contact', 'skills', 'experience', 'projects', 'education', 'summary'];

// Option 1: Transform with order, then render
const document = transformResumeToDocumentWithOrder(resumeData, customOrder);
const pdfBuffer = await generatePDFFromDocument(document);

// Option 2: Direct generation (uses default order)
const pdfBuffer = await generatePDFFromResume(resumeData);
```

**Rules:**
- Contact is always first (I enforce this)
- Any missing sections get added at the end in default order
- Invalid section names are ignored

## What I Validate

I check these limits to keep your resume reasonable and safe:

- **Max experience entries:** 20
- **Max education entries:** 10  
- **Max projects:** 15
- **Max skills:** 100
- **Max bullets per section:** 10
- **Max string length:** 1000 characters
- **Max JSON size:** 1MB
- **Max nesting depth:** 5 levels

I also strip dangerous characters (null bytes, control chars) to prevent XSS.

## Common Errors

**"REQUIRED_FIELD_MISSING"** → You left out a required field (name, email, phone, etc.)

**"STRING_TOO_LONG"** → One of your text fields exceeds 1000 characters

**"ARRAY_TOO_LARGE"** → Too many items (e.g., 25 experience entries when max is 20)

**"UNSAFE_CONTENT"** → Your text has null bytes or control characters. Check encoding.

## What I Don't Support

I'm optimized for ATS compatibility, so I intentionally skip:

- Multiple columns or table layouts
- Images, logos, icons
- Rich text (bold, italic, colors)
- Custom fonts (I use Helvetica)
- Custom spacing or margins
- Page headers/footers

If you need these, QuickCV isn't the right tool.

## PDF Output

Here's what you get:

- **Format:** US Letter (8.5" × 11"), 0.75" margins
- **Font:** Helvetica family (sans-serif)
- **Layout:** Single column, top-to-bottom
- **Text:** Fully selectable and searchable
- **ATS-safe:** No parsing tricks, no complex structures

## Tips

**Bullet points:** Keep them under 100 characters. I enforce 1000 char max, but shorter is better.

**Dates:** "Jan 2024", "2024-01", "January 2024" all work. I don't parse dates.

**Links:** Include full URLs (`https://github.com/user`) or protocol-less (`github.com/user`). Both work.

**Skills:** List them flat. I'll categorize them automatically. Override with `"Category: Skill"` if needed.

## Need More Control?

If you want to inspect or modify the document before rendering:

```typescript
import { transformResumeToDocumentWithOrder, generatePDFFromDocument } from './src/index';

// Get the document model
const document = transformResumeToDocumentWithOrder(resumeData);

// Inspect it
console.log(`Document has ${document.elements.length} elements`);

// Modify if needed (advanced)
// ... your custom logic ...

// Render to PDF
const pdfBuffer = await generatePDFFromDocument(document);
```

## Questions?

Read `README.md` for architecture details. Check the source code in `src/` if you need to understand how I transform or render specific sections.

That's everything you need to know.
