# QuickCV v2

Production-ready, ATS-friendly resume builder with text-based PDF generation.

## Overview

QuickCV v2 is a TypeScript library for generating ATS-compliant PDF resumes from JSON data. It emphasizes correctness, predictability, and ATS compatibility over visual complexity.

**Key Features:**
- Strict schema validation with XSS protection
- Text-based PDF output (selectable, searchable, copy-pastable)
- Single-column layout for maximum ATS compatibility
- Deterministic rendering (no configuration knobs)
- Server-side only (Node.js)

## Architecture

The system follows a three-layer pipeline:

```
Resume JSON → Validation → Document Model → PDF Rendering
```

### Layer 1: Validation (`src/validators/`)
- Schema validation against fixed resume structure
- Size and depth limits (prototype pollution protection)
- String sanitization (XSS-safe)
- Returns structured validation errors

### Layer 2: Document Transformation (`src/transformers/`)
- Converts validated Resume to intermediate Document model
- Layout-oriented (headings, paragraphs, lists)
- Preserves content structure without styling
- Fixed section ordering

### Layer 3: PDF Rendering (`src/renderer/`)
- Consumes Document model (assumes pre-validated input)
- Uses PDFKit for text-based PDF generation
- Fixed spacing, fonts, and layout
- Automatic pagination with logical breaks

## Installation

### Prerequisites
- Node.js >= 18.0.0
- Bun package manager

### Local Setup

```bash
# Clone or navigate to project directory
cd QuickCV_V2

# Install dependencies
bun install

# Build TypeScript
bun run build

# Type check (optional)
bun run type-check
```

### Project Structure

```
src/
├── types/              # TypeScript type definitions
│   ├── resume.types.ts       # Resume schema
│   ├── validation.types.ts   # Validation configuration
│   └── document.types.ts     # Document model
├── validators/         # Validation layer
│   ├── field-validators.ts   # Section validators
│   └── resume-validator.ts   # Main validator
├── transformers/       # Document transformation
│   └── document-transformer.ts
├── renderer/           # PDF generation
│   ├── renderer-config.ts    # Fixed layout settings
│   ├── pdf-renderer.ts       # PDFKit renderer
│   └── resume-to-pdf.ts      # Public API
├── utils/              # Utilities
│   ├── sanitization.ts       # XSS protection
│   └── depth-check.ts        # Security checks
└── index.ts            # Public exports
```

## API Overview

### Core Functions

**Validation**
```typescript
import { validateResume, isValidResume } from './src/index';

const result = validateResume(data);
if (!result.isValid) {
  console.error(result.errors);
}
```

**Document Transformation**
```typescript
import { transformResumeToDocument } from './src/index';

const document = transformResumeToDocument(validatedResume);
```

**PDF Generation**
```typescript
import { generatePDFFromResume } from './src/index';

const pdfBuffer = await generatePDFFromResume(validatedResume);
```

**Complete Pipeline**
```typescript
import { validateResume, generatePDFFromResume } from './src/index';
import { writeFile } from 'fs/promises';

const result = validateResume(resumeData);
if (result.isValid) {
  const pdfBuffer = await generatePDFFromResume(resumeData);
  await writeFile('resume.pdf', pdfBuffer);
}
```

## Resume Schema

The resume data model is **fixed** and includes only:

- **Contact Information**: name, email, phone, location, links
- **Professional Summary**: 2-4 sentence plain text
- **Work Experience**: company, role, dates, description bullets
- **Education**: institution, degree, field, dates
- **Skills**: flat list (no categorization)
- **Projects**: name, description, tech stack, link

See `USER_GUIDE.md` for detailed schema and examples.

## PDF Output Specifications

**Format:**
- US Letter (8.5" × 11")
- 0.75" margins
- Helvetica font family
- Single-column layout

**ATS Guarantees:**
- Text-based (not image/canvas)
- Selectable and searchable text
- Predictable top-to-bottom reading order
- No tables, icons, or complex layouts

## Development

**Build Commands:**
```bash
bun run build       # Compile TypeScript
bun run dev         # Watch mode
bun run type-check  # Type checking only
```

**TypeScript Configuration:**
- Strict mode enabled
- ES2022 target
- ESM modules

## Limitations (v1)

**Not Supported:**
- Custom templates or themes
- Rich text formatting (bold, italic)
- Multiple columns or tables
- Images, logos, or icons
- Configurable fonts or spacing
- Browser-based rendering
- Custom sections beyond defined schema

**By Design:**
- Date fields accept flexible human-readable strings (not validated for format)
- All layout values are fixed and non-configurable
- Rendering assumes pre-validated input

## License

MIT

## Version

1.0.0
