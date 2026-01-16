/**
 * Intermediate Document Model
 * 
 * Layout-oriented representation for ATS-safe PDF rendering.
 * This model sits between validated JSON data and PDF generation.
 * 
 * Design principles:
 * - Plain text only (no inline formatting)
 * - Structural representation (no spacing/layout metadata)
 * - ATS-safe (single column, predictable reading order)
 */

/**
 * Document element types
 */
export type DocumentElementType = 
  | 'HEADING'
  | 'PARAGRAPH'
  | 'TEXT_LINE'
  | 'LIST'
  | 'SECTION_BREAK';

/**
 * Heading levels for visual hierarchy
 */
export type HeadingLevel = 1 | 2 | 3;

/**
 * Heading element (section titles)
 */
export interface HeadingElement {
  type: 'HEADING';
  level: HeadingLevel;
  text: string;
}

/**
 * Paragraph element (multi-line text block)
 */
export interface ParagraphElement {
  type: 'PARAGRAPH';
  text: string;
}

/**
 * Single text line (contact info, dates, simple text)
 */
export interface TextLineElement {
  type: 'TEXT_LINE';
  text: string;
}

/**
 * List item (single bullet point)
 */
export interface ListItem {
  text: string;
}

/**
 * List block (group of bullet points)
 */
export interface ListElement {
  type: 'LIST';
  items: ListItem[];
}

/**
 * Section break (logical separator between major sections)
 */
export interface SectionBreakElement {
  type: 'SECTION_BREAK';
}

/**
 * Union of all document elements
 */
export type DocumentElement =
  | HeadingElement
  | ParagraphElement
  | TextLineElement
  | ListElement
  | SectionBreakElement;

/**
 * Complete document structure
 */
export interface Document {
  elements: DocumentElement[];
}

/**
 * Metadata about the document (not rendered, but useful for tracking)
 */
export interface DocumentMetadata {
  generatedAt: string; // ISO 8601 timestamp
  sourceResumeId?: string; // Optional identifier
}

/**
 * Complete document with metadata
 */
export interface DocumentWithMetadata {
  document: Document;
  metadata: DocumentMetadata;
}
