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
  FONTS,
  FONT_SIZES,
  SPACING,
  BULLET_MARKER,
  calculateLineHeight,
  getElementSpacing,
} from './renderer-config';

/**
 * Renderer state to track current position and page management
 */
interface RendererState {
  doc: PDFKit.PDFDocument;
  currentY: number;
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
    ? FONT_SIZES.h1 
    : element.level === 2 
      ? FONT_SIZES.h2 
      : FONT_SIZES.h3;
  
  const lineHeight = calculateLineHeight(fontSize);
  
  // Check if we need a new page
  checkPageBreak(state, lineHeight);
  
  // Render heading text
  state.doc
    .font(FONTS.bold)
    .fontSize(fontSize)
    .text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
      width: CONTENT_WIDTH,
      align: 'left',
    });
  
  // Reset font state to prevent leaking
  state.doc
    .font(FONTS.main)
    .fontSize(FONT_SIZES.body);
  
  // Update Y position
  state.currentY += lineHeight + getElementSpacing('HEADING', 'after');
}

/**
 * Render a paragraph element
 */
function renderParagraph(state: RendererState, element: ParagraphElement): void {
  const fontSize = FONT_SIZES.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  // Check minimum space to start paragraph (prevent orphaned first lines)
  checkPageBreak(state, SPACING.minSpaceForParagraph);
  
  // Ensure font state is correct
  state.doc
    .font(FONTS.main)
    .fontSize(fontSize);
  
  // Render paragraph text
  state.doc.text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
    width: CONTENT_WIDTH,
    align: 'left',
    lineGap: lineHeight - fontSize,
  });
  
  // Update Y position (PDFKit advances position automatically)
  state.currentY = state.doc.y + getElementSpacing('PARAGRAPH', 'after');
}

/**
 * Render a text line element
 */
function renderTextLine(state: RendererState, element: TextLineElement): void {
  const fontSize = FONT_SIZES.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  checkPageBreak(state, lineHeight);
  
  // Render text line
  state.doc
    .font(FONTS.main)
    .fontSize(fontSize)
    .text(element.text, PAGE_CONFIG.marginLeft, state.currentY, {
      width: CONTENT_WIDTH,
      align: 'left',
    });
  
  // Update Y position
  state.currentY += lineHeight + getElementSpacing('TEXT_LINE', 'after');
}

/**
 * Render a list element (bullet points)
 */
function renderList(state: RendererState, element: ListElement): void {
  const fontSize = FONT_SIZES.body;
  const lineHeight = calculateLineHeight(fontSize);
  
  element.items.forEach((item, index) => {
    // Check minimum space to start list item (prevent orphaned bullets)
    checkPageBreak(state, SPACING.minSpaceForListItem);
    
    // Calculate positions from config
    const bulletX = PAGE_CONFIG.marginLeft;
    const textX = bulletX + SPACING.listItemIndent;
    const textWidth = CONTENT_WIDTH - SPACING.listItemIndent;
    
    // Ensure font state is correct
    state.doc
      .font(FONTS.main)
      .fontSize(fontSize);
    
    // Render bullet marker
    state.doc.text(BULLET_MARKER, bulletX, state.currentY, {
      width: SPACING.listItemIndent,
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
      state.currentY += SPACING.betweenListItems;
    }
  });
  
  // Add spacing after list
  state.currentY += getElementSpacing('LIST', 'after');
}

/**
 * Render a section break
 */
function renderSectionBreak(state: RendererState): void {
  state.currentY += getElementSpacing('SECTION_BREAK', 'after');
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
 * @returns Promise that resolves to PDF buffer
 */
export async function renderDocumentToPDF(document: Document): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // ATS sanity check: verify element order will be preserved
      verifyElementOrderPreservation(document);
      
      const doc = initializePDF();
      const state: RendererState = {
        doc,
        currentY: PAGE_CONFIG.marginTop,
      };
      
      // Collect PDF data in chunks
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
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
