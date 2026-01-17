/**
 * Vercel Serverless Function for PDF Generation
 */

import { validateResume } from '../dist/validators/resume-validator.js';
import { transformResumeToDocumentWithOrder } from '../dist/transformers/resume-to-document.transformer.js';
import { renderDocumentToPDFWithMetadata } from '../dist/renderer/pdf-renderer.js';
import type { Resume } from '../dist/types/resume.types.js';
import type { ValidationError } from '../dist/types/validation.types.js';

interface GeneratePDFRequest {
  resume: unknown;
  sectionOrder?: string[];
  fontProfile?: 'sans' | 'serif' | 'mono';
  densityPreset?: 'normal' | 'compact' | 'ultra-compact';
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as GeneratePDFRequest;

    // Validate resume data
    const validationResult = validateResume(body.resume);

    if (!validationResult.isValid) {
      const errors = validationResult.errors.map((err: ValidationError) => ({
        field: err.field,
        message: err.message,
        type: err.type,
      }));

      return res.status(400).json({
        error: 'Resume validation failed',
        validationErrors: errors,
      });
    }

    const resume = body.resume as Resume;
    const sectionOrder = body.sectionOrder;
    const fontProfile = body.fontProfile || 'sans';
    const densityPreset = body.densityPreset || 'normal';

    // Transform resume to document
    const document = transformResumeToDocumentWithOrder(resume, sectionOrder);

    // Render to PDF
    const { buffer: pdfBuffer, pageCount } = await renderDocumentToPDFWithMetadata(
      document,
      fontProfile,
      densityPreset
    );

    // Return PDF with page count header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('X-PDF-Page-Count', pageCount.toString());
    
    return res.status(200).send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('PDF generation error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
