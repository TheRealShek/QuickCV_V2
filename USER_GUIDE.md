# QuickCV v2 - User Guide

Practical guide for developers using QuickCV programmatically.

## Resume JSON Structure

### Complete Schema

```typescript
{
  "contact": {
    "fullName": string,           // Required
    "email": string,              // Required
    "phone": string,              // Required
    "location": string,           // Required
    "linkedin"?: string,          // Optional
    "github"?: string,            // Optional
    "portfolio"?: string,         // Optional
    "twitter"?: string            // Optional
  },
  "summary": {
    "summary": string             // Required (2-4 sentences)
  },
  "experience": [                 // Array of work experiences
    {
      "company": string,          // Required
      "role": string,             // Required
      "startDate": string,        // Required (flexible format)
      "endDate"?: string,         // Optional
      "location"?: string,        // Optional
      "description": string[]     // Required (bullet points)
    }
  ],
  "education": [                  // Array of education entries
    {
      "institution": string,      // Required
      "degree": string,           // Required
      "startDate": string,        // Required (flexible format)
      "endDate"?: string,         // Optional
      "fieldOfStudy"?: string     // Optional
    }
  ],
  "skills": {
    "skills": string[]            // Required (flat list)
  },
  "projects": [                   // Array of projects
    {
      "name": string,             // Required
      "description": string[],    // Required (bullet points)
      "techStack"?: string[],     // Optional
      "link"?: string             // Optional
    }
  ]
}
```

### Minimal Example

```json
{
  "contact": {
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/janedoe",
    "github": "github.com/janedoe"
  },
  "summary": {
    "summary": "Software engineer with 5 years of experience building scalable web applications. Specialized in TypeScript, React, and Node.js."
  },
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "startDate": "Jan 2021",
      "endDate": "Present",
      "description": [
        "Led development of microservices architecture serving 1M+ users",
        "Reduced API response time by 40% through optimization",
        "Mentored 3 junior developers"
      ]
    }
  ],
  "education": [
    {
      "institution": "University of California",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2015",
      "endDate": "2019"
    }
  ],
  "skills": {
    "skills": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"]
  },
  "projects": [
    {
      "name": "Open Source Library",
      "description": [
        "Built and maintained TypeScript library with 10k+ downloads",
        "Implemented comprehensive test suite with 95% coverage"
      ],
      "techStack": ["TypeScript", "Jest", "GitHub Actions"],
      "link": "github.com/janedoe/project"
    }
  ]
}
```

## Workflow

### Step 1: Validate Resume Data

Always validate data before rendering:

```typescript
import { validateResume } from './src/index';

const resumeData = { /* your resume JSON */ };

const validationResult = validateResume(resumeData);

if (!validationResult.isValid) {
  // Handle validation errors
  validationResult.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
  throw new Error('Resume validation failed');
}

// Data is now safe to use
```

### Step 2: Generate PDF

After validation, generate the PDF:

```typescript
import { generatePDFFromResume } from './src/index';
import { writeFile } from 'fs/promises';

// Assumes resumeData is already validated
const pdfBuffer = await generatePDFFromResume(resumeData);

// Save to file
await writeFile('output/resume.pdf', pdfBuffer);

// Or send as HTTP response (Express example)
// res.setHeader('Content-Type', 'application/pdf');
// res.send(pdfBuffer);
```

### Complete Example

```typescript
import { validateResume, generatePDFFromResume } from './src/index';
import { writeFile } from 'fs/promises';
import { readFile } from 'fs/promises';

async function generateResumePDF(jsonPath: string, outputPath: string) {
  try {
    // Load resume data
    const jsonData = await readFile(jsonPath, 'utf-8');
    const resumeData = JSON.parse(jsonData);
    
    // Validate
    const validationResult = validateResume(resumeData);
    
    if (!validationResult.isValid) {
      console.error('Validation failed:');
      validationResult.errors.forEach(err => {
        console.error(`  - ${err.field}: ${err.message}`);
      });
      return false;
    }
    
    console.log('✓ Validation passed');
    
    // Generate PDF
    const pdfBuffer = await generatePDFFromResume(resumeData);
    
    // Save
    await writeFile(outputPath, pdfBuffer);
    console.log(`✓ PDF saved to ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Usage
generateResumePDF('resume.json', 'output/resume.pdf');
```

## Advanced Usage

### Custom Validation Limits

```typescript
import { validateResume, DEFAULT_VALIDATION_LIMITS } from './src/index';

const customLimits = {
  ...DEFAULT_VALIDATION_LIMITS,
  maxExperienceEntries: 10,
  maxSkillsCount: 50,
};

const result = validateResume(resumeData, customLimits);
```

### Document Model Access

For custom processing or inspection:

```typescript
import { transformResumeToDocument, generatePDFFromDocument } from './src/index';

// Transform to document model
const document = transformResumeToDocument(validatedResume);

// Inspect or modify document structure
console.log(`Document has ${document.elements.length} elements`);

// Generate PDF from document
const pdfBuffer = await generatePDFFromDocument(document);
```

## Field Guidelines

### Dates
- No strict format required
- Accept human-readable strings: "Jan 2024", "2024-01", "January 2024"
- Use "Present" for current positions

### Descriptions
- Keep bullet points concise (under 100 characters recommended)
- Maximum 10 bullets per experience/project (enforced by validation)
- Plain text only (no formatting)

### Skills
- Flat list only (no categories)
- Comma-separated in PDF output
- Maximum 100 skills (enforced by validation)

### Links
- Include protocol-less URLs: "github.com/user" or full "https://github.com/user"
- Rendered as plain text in PDF (clickable if full URL)

## Validation Errors

Common validation error types:

- `REQUIRED_FIELD_MISSING`: Required field is empty or undefined
- `INVALID_TYPE`: Field has wrong data type
- `STRING_TOO_LONG`: Text exceeds maximum length
- `ARRAY_TOO_LARGE`: Array exceeds maximum size
- `UNSAFE_CONTENT`: String contains unsafe characters
- `DEPTH_EXCEEDED`: Object nesting too deep
- `SIZE_EXCEEDED`: Total JSON size too large

## Limitations

### What is NOT Supported (v1)

**Schema:**
- Custom sections beyond the defined 6 sections
- Nested skills categories or grouping
- Multiple summary sections
- Rich text or formatting in any field
- Metadata (IDs, timestamps in rendered output)

**PDF Rendering:**
- Custom fonts or font embedding
- Configurable spacing, margins, or sizes
- Multiple columns or table layouts
- Images, logos, or graphics
- Custom bullet styles
- Page headers/footers
- Custom templates or themes

**Functionality:**
- Browser-based rendering (server-side only)
- Real-time preview
- PDF editing or updates
- Multiple output formats (only PDF)

### By Design

**Date Flexibility:**
- Dates are plain text (not parsed or formatted)
- No date validation or standardization
- Allows "Present", "Current", or any readable format

**Fixed Layout:**
- All spacing and sizing is non-configurable
- Single column, top-to-bottom order
- Helvetica font family only
- US Letter page size only

**Security:**
- Maximum JSON size: 1MB
- Maximum object depth: 5 levels
- XSS protection via HTML escaping
- Prototype pollution prevention

## Troubleshooting

**Validation fails with "unsafe content":**
- Check for null bytes or control characters
- Ensure UTF-8 encoding
- Remove any embedded scripts or HTML

**PDF text not selectable:**
- This should not happen with QuickCV (text-based rendering)
- Report as bug if encountered

**Large JSON rejected:**
- Default limit is 1MB
- Reduce content or increase limits via custom validation config

**Page breaks in wrong places:**
- Renderer uses minimum space logic to prevent orphaned lines
- Page breaks occur between logical units (paragraphs, list items)

## Version

1.0.0
