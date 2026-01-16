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
 * Font Profile Configurations
 * Maps font profiles to PDF standard font families
 */
export const FONT_PROFILES = {
  sans: {
    main: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  serif: {
    main: 'Times-Roman',
    bold: 'Times-Bold',
  },
  mono: {
    main: 'Courier',
    bold: 'Courier-Bold',
  },
} as const;

/**
 * Get fonts for a given profile
 */
export function getFontsForProfile(profile: 'sans' | 'serif' | 'mono' = 'sans') {
  return FONT_PROFILES[profile];
}

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
 * Density Preset Configurations
 * Controls font sizes and spacing to fit more content while maintaining readability
 */
export const DENSITY_PRESETS = {
  normal: {
    fontSizes: {
      h1: 16,
      h2: 14,
      h3: 12,
      body: 11,
      contactInfo: 9.5,
    },
    spacing: {
      sectionBreak: 12,
      afterHeading: 4,
      afterNameHeading: 2,
      afterParagraph: 6,
      afterTextLine: 2,
      afterContactLine: 8,
      afterList: 6,
      listItemIndent: 15,
      betweenListItems: 2,
      minSpaceForParagraph: 40,
      minSpaceForListItem: 30,
    },
  },
  compact: {
    fontSizes: {
      h1: 15,
      h2: 13,
      h3: 11,
      body: 10,
      contactInfo: 9,
    },
    spacing: {
      sectionBreak: 10,
      afterHeading: 3,
      afterNameHeading: 1.5,
      afterParagraph: 5,
      afterTextLine: 2,
      afterContactLine: 7,
      afterList: 5,
      listItemIndent: 15,
      betweenListItems: 1.5,
      minSpaceForParagraph: 40,
      minSpaceForListItem: 30,
    },
  },
  'ultra-compact': {
    fontSizes: {
      h1: 14,
      h2: 12,
      h3: 10,
      body: 9,
      contactInfo: 8.5,
    },
    spacing: {
      sectionBreak: 8,
      afterHeading: 2,
      afterNameHeading: 1,
      afterParagraph: 4,
      afterTextLine: 2,
      afterContactLine: 6,
      afterList: 4,
      listItemIndent: 15,
      betweenListItems: 1,
      minSpaceForParagraph: 40,
      minSpaceForListItem: 30,
    },
  },
} as const;

export type DensityPreset = keyof typeof DENSITY_PRESETS;

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
 * Get configuration for a given density preset
 */
export function getConfigForDensity(preset: DensityPreset = 'normal') {
  return DENSITY_PRESETS[preset];
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
