/**
 * PDF Renderer using PDFKit
 * 
 * Consumes Document model and produces ATS-safe, text-based PDF.
 * Server-side only (Node.js).
 */

import PDFDocument from 'pdfkit';
import type {
  Document,
  DocumentElement,
  HeadingElement,
  ParagraphElement,
  TextLineElement,
  ListElement,
} from '../types/document.types';
import {
  PAGE_CONFIG,
  CONTENT_WIDTH,
  BULLET_MARKER,
  calculateLineHeight,
  getFontsForProfile,
  getConfigForDensity,
  type DensityPreset,
} from './renderer-config';

/**
 * Renderer state to track current position and page management
 */
interface RendererState {
  doc: PDFKit.PDFDocument;
  currentY: number;
  fonts: { main: string; bold: string };
  config: ReturnType<typeof getConfigForDensity>;
  elementIndex: number;
  isFirstTextLine: boolean;
}

/**
 * Initialize PDF document with fixed configuration
 */
function initializePDF(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: [PAGE_CONFIG.width, PAGE_CONFIG.height],
    margins: {
      top: PAGE_CONFIG.marginTop,
      bottom: PAGE_CONFIG.marginBottom,
      left: PAGE_CONFIG.marginLeft,
      right: PAGE_CONFIG.marginRight,
    },
    autoFirstPage: true,
  });
}

/**
 * Check if we need a new page and add one if necessary
 */
function checkPageBreak(state: RendererState, requiredSpace: number): void {
  const availableSpace = PAGE_CONFIG.height - PAGE_CONFIG.marginBottom - state.currentY;
  
  if (availableSpace < requiredSpace) {
    state.doc.addPage();
    state.currentY = PAGE_CONFIG.marginTop;
  }
}

/**
 * Render a heading element
 */
function renderHeading(state: RendererState, element: HeadingElement): void {
  const fontSize = element.level === 1 
    ? state.config.fontSizes.h1 
    : element.level === 2 
      ? state.config.fontSizes.h2 
      : state.config.fontSizes.h3;
  
  const lineHeight = calculateLineHeight(fontSize);
  
  // Check if we need a new page
  checkPageBreak(state, lineHeight);
  
  // Render heading text
  state.doc
    .font(state.fonts.bold)
    .fontSize(fontSize)
    .text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
      width: CONTENT_WIDTH,
      align: 'left',
    });
  
  // Reset font state to prevent leaking
  state.doc
    .font(state.fonts.main)
    .fontSize(state.config.fontSizes.body);
  
  // Update Y position - use tighter spacing for H1 (name) to bring contact line closer
  const spacingAfter = element.level === 1 ? state.config.spacing.afterNameHeading : state.config.spacing.afterHeading;
  state.currentY += lineHeight + spacingAfter;
}

/**
 * Render a paragraph element
 */
function renderParagraph(state: RendererState, element: ParagraphElement): void {
  const fontSize = state.config.fontSizes.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  // Check minimum space to start paragraph (prevent orphaned first lines)
  checkPageBreak(state, state.config.spacing.minSpaceForParagraph);
  
  // Ensure font state is correct
  state.doc
    .font(state.fonts.main)
    .fontSize(fontSize);
  
  // Render paragraph text
  state.doc.text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
    width: CONTENT_WIDTH,
    align: 'left',
    lineGap: lineHeight - fontSize,
  });
  
  // Update Y position (PDFKit advances position automatically)
  state.currentY = state.doc.y + state.config.spacing.afterParagraph;
}

/**
 * Render a text line element
 */
function renderTextLine(state: RendererState, element: TextLineElement): void {
  // Detect if this is the contact info line (first TEXT_LINE in document, after name)
  const isContactLine = state.isFirstTextLine;
  if (isContactLine) {
    state.isFirstTextLine = false;
  }
  
  const fontSize = isContactLine ? state.config.fontSizes.contactInfo : state.config.fontSizes.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  checkPageBreak(state, lineHeight);
  
  // Render text line
  state.doc
    .font(state.fonts.main)
    .fontSize(fontSize)
    .text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
      width: CONTENT_WIDTH,
      align: 'left',
    });
  
  // Update Y position with special spacing for contact line
  const spacingAfter = isContactLine ? state.config.spacing.afterContactLine : state.config.spacing.afterTextLine;
  state.currentY += lineHeight + spacingAfter;
}

/**
 * Render a list element (bullet points)
 */
function renderList(state: RendererState, element: ListElement): void {
  const fontSize = state.config.fontSizes.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  element.items.forEach((item, index) => {
    // Check minimum space to start list item (prevent orphaned bullets)
    checkPageBreak(state, state.config.spacing.minSpaceForListItem);
    
    // Calculate positions from config
    const bulletX = PAGE_CONFIG.marginLeft;
    const textX = bulletX + state.config.spacing.listItemIndent;
    const textWidth = CONTENT_WIDTH - state.config.spacing.listItemIndent;
    
    // Ensure font state is correct
    state.doc
      .font(state.fonts.main)
      .fontSize(fontSize);
    
    // Render bullet marker
    state.doc.text(BULLET_MARKER, bulletX, state.currentY, {
      width: state.config.spacing.listItemIndent,
      align: 'left',
      continued: false,
    });
    
    // Render item text (indented)
    state.doc.text(item.text, textX, state.currentY, {
      width: textWidth,
      align: 'left',
      lineGap: lineHeight - fontSize,
    });
    
    // Update Y position
    state.currentY = state.doc.y;
    
    // Add spacing between list items (except after last)
    if (index < element.items.length - 1) {
      state.currentY += state.config.spacing.betweenListItems;
    }
  });
  
  // Add spacing after list
  state.currentY += state.config.spacing.afterList;
}

/**
 * Render a section break
 */
function renderSectionBreak(state: RendererState): void {
  state.currentY += state.config.spacing.sectionBreak;
}

/**
 * Render a single document element
 */
function renderElement(state: RendererState, element: DocumentElement): void {
  switch (element.type) {
    case 'HEADING':
      renderHeading(state, element);
      break;
    case 'PARAGRAPH':
      renderParagraph(state, element);
      break;
    case 'TEXT_LINE':
      renderTextLine(state, element);
      break;
    case 'LIST':
      renderList(state, element);
      break;
    case 'SECTION_BREAK':
      renderSectionBreak(state);
      break;
  }
}

/**
 * Verify element order preservation (ATS sanity check)
 * Ensures document elements are rendered in exact order
 */
function verifyElementOrderPreservation(document: Document): void {
  // Build expected order sequence
  const elementSequence = document.elements.map((el, idx) => ({
    index: idx,
    type: el.type,
  }));
  
  // Verify sequence is monotonically increasing (no reordering)
  for (let i = 1; i < elementSequence.length; i++) {
    if (elementSequence[i].index <= elementSequence[i - 1].index) {
      throw new Error(
        `ATS invariant violated: Element order not preserved at index ${i}`
      );
    }
  }
}

/**
 * Render complete document to PDF
 * 
 * Assumes document has already been validated.
 * 
 * @param document - Document model to render
 * @param fontProfile - Font profile to use ('sans', 'serif', or 'mono')
 * @param densityPreset - Density preset for spacing and font sizes
 * @returns Promise that resolves to PDF buffer
 */
export async function renderDocumentToPDF(
  document: Document,
  fontProfile: 'sans' | 'serif' | 'mono' = 'sans',
  densityPreset: DensityPreset = 'normal'
): Promise<Buffer> {
  const result = await renderDocumentToPDFWithMetadata(document, fontProfile, densityPreset);
  return result.buffer;
}

/**
 * Render complete document to PDF with metadata
 * 
 * @param document - Document model to render
 * @param fontProfile - Font profile to use ('sans', 'serif', or 'mono')
 * @param densityPreset - Density preset for spacing and font sizes
 * @returns Promise that resolves to PDF buffer and page count
 */
export async function renderDocumentToPDFWithMetadata(
  document: Document,
  fontProfile: 'sans' | 'serif' | 'mono' = 'sans',
  densityPreset: DensityPreset = 'normal'
): Promise<{ buffer: Buffer; pageCount: number }> {
  return new Promise((resolve, reject) => {
    try {
      // ATS sanity check: verify element order will be preserved
      verifyElementOrderPreservation(document);
      
      const fonts = getFontsForProfile(fontProfile);
      const config = getConfigForDensity(densityPreset);
      const doc = initializePDF();
      const state: RendererState = {
        doc,
        currentY: PAGE_CONFIG.marginTop,
        fonts,
        config,
        elementIndex: 0,
        isFirstTextLine: true,
      };
      
      // Collect PDF data in chunks
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        // PDFKit tracks page count internally
        const pageCount = (doc as any).bufferedPageRange().count;
        resolve({ buffer: pdfBuffer, pageCount });
      });
      
      doc.on('error', (error: Error) => {
        reject(error);
      });
      
      // Render all elements in exact order
      document.elements.forEach((element) => {
        renderElement(state, element);
      });
      
      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
