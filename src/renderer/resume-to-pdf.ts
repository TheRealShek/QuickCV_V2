/**
 * Resume to PDF Pipeline
 * 
 * Complete end-to-end pipeline: Resume JSON -> Document Model -> PDF
 * 
 * IMPORTANT: Rendering functions assume already-validated input.
 * Validation must be performed separately before calling these functions.
 */

import type { Resume } from '../types/resume.types';
import type { Document } from '../types/document.types';
import { transformResumeToDocument } from '../transformers/document-transformer';
import { renderDocumentToPDF } from './pdf-renderer';

/**
 * Generate PDF from validated Resume data
 * 
 * Assumes the Resume has already been validated.
 * Use validateResume() before calling this function.
 * 
 * @param resume - Validated Resume object
 * @param fontProfile - Font profile to use ('sans', 'serif', or 'mono')
 * @returns Promise that resolves to PDF buffer
 */
export async function generatePDFFromResume(
  resume: Resume,
  fontProfile: 'sans' | 'serif' | 'mono' = 'sans'
): Promise<Buffer> {
  // Transform to document model
  const document = transformResumeToDocument(resume);
  
  // Render to PDF
  return renderDocumentToPDF(document, fontProfile);
}

/**
 * Generate PDF from Document model directly
 * 
 * Assumes the Document has been created from validated data.
 * 
 * @param document - Document model to render
 * @param fontProfile - Font profile to use ('sans', 'serif', or 'mono')
 * @returns Promise that resolves to PDF buffer
 */
export async function generatePDFFromDocument(
  document: Document,
  fontProfile: 'sans' | 'serif' | 'mono' = 'sans'
): Promise<Buffer> {
  return renderDocumentToPDF(document, fontProfile);
}
