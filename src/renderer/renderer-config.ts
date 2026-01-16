/**
 * PDF Renderer Configuration
 * 
 * Fixed, non-configurable settings for ATS-safe PDF generation.
 * All values are deterministic and based on PROJECT_GUIDELINES.md requirements.
 */

/**
 * Page configuration (US Letter)
 */
export const PAGE_CONFIG = {
  width: 612, // 8.5 inches in points
  height: 792, // 11 inches in points
  marginTop: 54, // 0.75 inch
  marginBottom: 54, // 0.75 inch
  marginLeft: 54, // 0.75 inch
  marginRight: 54, // 0.75 inch
} as const;

/**
 * Calculate usable content width
 */
export const CONTENT_WIDTH = PAGE_CONFIG.width - PAGE_CONFIG.marginLeft - PAGE_CONFIG.marginRight;

/**
 * Font configuration (PDF standard fonts only)
 */
export const FONTS = {
  main: 'Helvetica',
  bold: 'Helvetica-Bold',
} as const;

/**
 * Font sizes in points
 */
export const FONT_SIZES = {
  h1: 16,
  h2: 14,
  h3: 12,
  body: 11,
} as const;

/**
 * Line height multiplier
 */
export const LINE_HEIGHT = 1.15;

/**
 * Spacing in points
 */
export const SPACING = {
  sectionBreak: 12,
  afterHeading: 4,
  afterParagraph: 6,
  afterTextLine: 2,
  afterList: 6,
  listItemIndent: 15,
  betweenListItems: 2,
  minSpaceForParagraph: 40, // Minimum space to start a paragraph
  minSpaceForListItem: 30, // Minimum space to start a list item
} as const;

/**
 * Bullet marker character
 */
export const BULLET_MARKER = '-';

/**
 * Calculate line height for a given font size
 */
export function calculateLineHeight(fontSize: number): number {
  return fontSize * LINE_HEIGHT;
}

/**
 * Calculate spacing for element type
 */
export function getElementSpacing(elementType: string, position: 'before' | 'after'): number {
  if (position === 'before') {
    // No extra space before elements (they naturally follow previous spacing)
    return 0;
  }
  
  switch (elementType) {
    case 'HEADING':
      return SPACING.afterHeading;
    case 'PARAGRAPH':
      return SPACING.afterParagraph;
    case 'TEXT_LINE':
      return SPACING.afterTextLine;
    case 'LIST':
      return SPACING.afterList;
    case 'SECTION_BREAK':
      return SPACING.sectionBreak;
    default:
      return 0;
  }
}
