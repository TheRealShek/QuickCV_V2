/**
 * V2 Backend Server
 * 
 * Minimal HTTP server for PDF generation with section ordering.
 * Built on Bun's native server API.
 */

import { validateResume } from './dist/validators/resume-validator.js';
import { transformResumeToDocumentWithOrder } from './dist/transformers/document-transformer-v2.js';
import { renderDocumentToPDF } from './dist/renderer/pdf-renderer.js';
import type { Resume } from './dist/types/resume.types.js';
import type { ValidationError } from './dist/types/validation.types.js';

const PORT = 3000;
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB

/**
 * Request body interface
 */
interface GeneratePDFRequest {
  resume: unknown;
  sectionOrder?: string[];
}

/**
 * CORS headers
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle POST /generate-pdf endpoint
 */
async function handleGeneratePDF(request: Request): Promise<Response> {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    // Parse request body
    let body: GeneratePDFRequest;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    const { resume, sectionOrder } = body;
    
    if (!resume) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: resume' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    // Step 1: Validate resume (v1 validation)
    const validationResult = validateResume(resume);
    
    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({
          error: 'Resume validation failed',
          validationErrors: validationResult.errors.map((err: ValidationError) => ({
            type: err.type,
            field: err.field,
            message: err.message,
          })),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    // Step 2: Transform with section ordering (v2 feature)
    const document = transformResumeToDocumentWithOrder(resume as Resume, sectionOrder);
    
    // Step 3: Render to PDF (v1 renderer, unchanged)
    const pdfBuffer = await renderDocumentToPDF(document);
    
    // Step 4: Return PDF (convert Buffer to Uint8Array for Response)
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        ...CORS_HEADERS,
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Main request handler
 */
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Handle OPTIONS for CORS
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // Handle POST /generate-pdf
  if (request.method === 'POST' && url.pathname === '/generate-pdf') {
    return handleGeneratePDF(request);
  }
  
  // Handle 404
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
  );
}

/**
 * Start server
 */
const server = Bun.serve({
  port: PORT,
  async fetch(request: Request) {
    // Enforce request size limit
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request too large (max 1MB)' }),
        { status: 413, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
    
    return handleRequest(request);
  },
});

console.log(`🚀 V2 Backend Server running on http://localhost:${PORT}`);
console.log(`📌 Endpoint: POST /generate-pdf`);
console.log(`📏 Max request size: 1MB`);
console.log(`🔒 CORS enabled for all origins`);
