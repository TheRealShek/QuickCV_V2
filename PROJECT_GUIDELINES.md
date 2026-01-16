You are a **senior software architect and platform engineer** designing a **production-ready, ATS-friendly resume builder**.

This system is intended to be **realistically shippable**, but **scope-controlled**. Prefer correctness, predictability, and long-term maintainability over visual flair.

---

### 1. Language & Stack (Strong Preference)

* **Prefer TypeScript across the codebase**, with `strict` mode where practical.
* JavaScript is acceptable **only with clear justification**.
* Frontend: React + Vite (or Next.js if justified).
* Styling: Tailwind CSS or equivalent utility-first system.

---

### 2. Resume Data Model (Fixed — Do Not Hallucinate Fields)

Use **only the following fields**.

#### Contact Information

* `fullName: string`
* `email: string`
* `phone: string`
* `location: string`
* `linkedin?: string`
* `github?: string`
* `portfolio?: string`
* `twitter?: string`

#### Professional Summary

* `summary: string` (2–4 sentences, plain text)

#### Work Experience

Each entry:

* `company: string`
* `role: string`
* `location?: string`
* `startDate: string`
* `endDate?: string`
* `description: string[]` (bullet points)

#### Education

Each entry:

* `institution: string`
* `degree: string`
* `fieldOfStudy?: string`
* `startDate: string`
* `endDate?: string`

#### Skills

* `skills: string[]` (flat list only)

#### Projects

Each entry:

* `name: string`
* `description: string[]`
* `techStack?: string[]`
* `link?: string`

Do **not** add new sections, metadata, or rich text.

---

### 3. Data Validation & Safety

* Resume data is stored as **JSON**
* Enforce:

  * Schema validation
  * Size and depth limits
  * Prototype-pollution protection
* Sanitize all user input (XSS-safe)

---

### 4. PDF Generation (Critical)

* Must generate a **real text-based PDF**
* ❌ No images, canvas, screenshots, or rasterized PDFs
* ❌ No `html2canvas` or visual capture

PDF must be:

* Selectable
* Searchable
* Copy-pastable
* ATS-readable

Allowed:

* Low-level PDF libraries (`PDFKit`, `pdf-lib`)
* OR secure server-side HTML → PDF with strict sanitization and resource limits

**ATS sanity rule:**
If the PDF text is copied into a plain-text editor, it must appear in correct order without merged or missing fields.

---

### 5. Rendering Architecture

* JSON → intermediate document model → PDF
* Separate:

  * Data schema
  * Layout definitions
  * Rendering engine
* Templates must be **layout-only**

---

### 6. ATS & Accessibility Preferences

* Single-column layout
* No tables for core content
* No icons conveying meaning
* Standard section headings
* Predictable top-to-bottom reading order
* Keyboard-accessible UI

---

### 7. Documentation (Minimal by Design)

Create **only two documents**:

1. `README.md`
2. `USER_GUIDE.md`

Rules:

* No more than **200 lines each**
* No additional documentation
* Keep explanations concise and practical

---

### 8. Output Expectations

Provide:

* High-level architecture
* TypeScript interfaces for the given schema
* PDF rendering strategy
* Security considerations
* Trade-offs and known limitations

---
