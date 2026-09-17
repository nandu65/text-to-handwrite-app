export type PaperType = 'ruled' | 'blank' | 'graph';

export type PageSize = 'A4' | 'A5' | 'Letter';

export interface PageDimensions {
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  label: string;
}

export const PAGE_SIZES: Record<PageSize, PageDimensions> = {
  A4: {
    widthMm: 210,
    heightMm: 297,
    aspectRatio: 210 / 297,
    label: 'A4 (210 × 297 mm)',
  },
  A5: {
    widthMm: 148,
    heightMm: 210,
    aspectRatio: 148 / 210,
    label: 'A5 (148 × 210 mm)',
  },
  Letter: {
    widthMm: 215.9,
    heightMm: 279.4,
    aspectRatio: 215.9 / 279.4,
    label: 'Letter (8.5 × 11 in)',
  },
};

export interface FontVariant {
  fontFamily: string;
  scale: number; // visual optical scale compensation (e.g. 1.05)
  baselineShift: number; // optical baseline compensation in px
}

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
  variants: FontVariant[];
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'rushed-cursive',
    name: '⚡ Rushed Notes (Messy Fast Cursive)',
    fontFamily: "'Reenie Beanie', cursive",
    description: 'Fast, hurried student notes with messy cursive connectors and rapid strokes',
    variants: [
      { fontFamily: "'Reenie Beanie', cursive", scale: 1.18, baselineShift: -0.4 },
      { fontFamily: "'Nothing You Could Do', cursive", scale: 0.96, baselineShift: 0.3 },
      { fontFamily: "'Cedarville Cursive', cursive", scale: 0.92, baselineShift: 0.1 },
      { fontFamily: "'Zeyada', cursive", scale: 1.10, baselineShift: -0.3 },
    ],
  },
  {
    id: 'doctor-scrawl',
    name: "🩺 Doctor's Scrawl (Hurried Cursive)",
    fontFamily: "'Nothing You Could Do', cursive",
    description: 'Imperfect, rushed natural penmanship with variable loops and baseline drift',
    variants: [
      { fontFamily: "'Nothing You Could Do', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'La Belle Aurore', cursive", scale: 1.05, baselineShift: -0.5 },
      { fontFamily: "'Just Another Hand', cursive", scale: 1.15, baselineShift: -0.2 },
      { fontFamily: "'Meddon', cursive", scale: 0.88, baselineShift: 0.4 },
    ],
  },
  {
    id: 'cedarville',
    name: '✍️ Cedarville Cursive (Organic Flow)',
    fontFamily: "'Cedarville Cursive', cursive",
    description: 'Authentic loose cursive handwriting with continuous ligature flow',
    variants: [
      { fontFamily: "'Cedarville Cursive', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Caveat', cursive", scale: 1.08, baselineShift: -0.4 },
      { fontFamily: "'Bad Script', cursive", scale: 0.94, baselineShift: 0.2 },
      { fontFamily: "'Dancing Script', cursive", scale: 1.02, baselineShift: 0.1 },
    ],
  },
  {
    id: 'belle-aurore',
    name: '🖋️ La Belle Aurore (Casual Scratch)',
    fontFamily: "'La Belle Aurore', cursive",
    description: 'Light, quick scratchy pen handwriting with loose character forms',
    variants: [
      { fontFamily: "'La Belle Aurore', cursive", scale: 1.08, baselineShift: 0 },
      { fontFamily: "'Reenie Beanie', cursive", scale: 1.14, baselineShift: -0.4 },
      { fontFamily: "'Waiting for the Sunrise', cursive", scale: 1.06, baselineShift: 0.3 },
    ],
  },
  {
    id: 'caveat',
    name: 'Caveat (Smooth Connected Script)',
    fontFamily: "'Caveat', cursive",
    description: 'Dynamic flowing cursive with natural ligature alternates',
    variants: [
      { fontFamily: "'Caveat', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Kalam', cursive", scale: 0.94, baselineShift: -0.5 },
      { fontFamily: "'Marck Script', cursive", scale: 0.90, baselineShift: 0.5 },
    ],
  },
  {
    id: 'kalam',
    name: 'Kalam (Everyday Ballpoint)',
    fontFamily: "'Kalam', cursive",
    description: 'Everyday ballpoint note-taking style with realistic stroke taper',
    variants: [
      { fontFamily: "'Kalam', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Caveat', cursive", scale: 1.06, baselineShift: 0.5 },
      { fontFamily: "'Nanum Pen Script', cursive", scale: 1.04, baselineShift: -0.4 },
    ],
  },
  {
    id: 'dancing',
    name: 'Dancing Script (Expressive Loops)',
    fontFamily: "'Dancing Script', cursive",
    description: 'Expressive rhythmic cursive with varied loops and bounce',
    variants: [
      { fontFamily: "'Dancing Script', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Marck Script', cursive", scale: 0.92, baselineShift: 0.2 },
      { fontFamily: "'Caveat', cursive", scale: 1.05, baselineShift: -0.3 },
    ],
  },
  {
    id: 'apple',
    name: 'Homemade Apple (Pen & Ink)',
    fontFamily: "'Homemade Apple', cursive",
    description: 'Authentic vintage fountain pen manuscript style',
    variants: [
      { fontFamily: "'Homemade Apple', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Reenie Beanie', cursive", scale: 1.15, baselineShift: -0.5 },
      { fontFamily: "'Nothing You Could Do', cursive", scale: 0.96, baselineShift: 0.3 },
    ],
  },
  {
    id: 'shadows',
    name: 'Shadows Into Light (Quick Print)',
    fontFamily: "'Shadows Into Light', cursive",
    description: 'Clean modern script with distinct print strokes',
    variants: [
      { fontFamily: "'Shadows Into Light', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Architects Daughter', cursive", scale: 0.92, baselineShift: -0.8 },
      { fontFamily: "'Covered By Your Grace', cursive", scale: 1.02, baselineShift: 0.4 },
    ],
  },
  {
    id: 'indie',
    name: 'Indie Flower (Rounded Friendly)',
    fontFamily: "'Indie Flower', cursive",
    description: 'Warm, rounded penmanship with soft character loops',
    variants: [
      { fontFamily: "'Indie Flower', cursive", scale: 1.0, baselineShift: 0 },
      { fontFamily: "'Gochi Hand', cursive", scale: 0.92, baselineShift: -0.3 },
      { fontFamily: "'Schoolbell', cursive", scale: 0.95, baselineShift: 0.2 },
    ],
  },
];

/**
 * Extracted personal glyph entry with transparent raster image data URL and aspect ratio metrics.
 */
export interface ExtractedGlyph {
  char: string;
  dataUrl: string; // Transparent PNG / mask of the character
  width: number;
  height: number;
  aspectRatio: number;
  baselineOffsetRatio: number; // 0 to 1 relative baseline anchor
  heightRatioInCell?: number; // relative height within writing zone
}

export type PersonalGlyphLibrary = Record<string, ExtractedGlyph[]>;

export interface PersonalHandwritingProfile {
  id: string;
  name: string;
  createdDate: string;
  glyphs: PersonalGlyphLibrary;
  totalExtracted: number;
  characterSpacingMultiplier: number;
  wordSpacingMultiplier: number;
  lineSpacingMultiplier: number;
  baselineAdjustment: number;
  previewSampleText: string;
}

export interface HandwritingStyle {
  fontFamily: string;
  fontName: string;
  fontSize: number; // in px at base scale (e.g., 26)
  lineSpacing: number; // line-height multiplier e.g. 1.85
  letterSpacing: number; // in px e.g. 0.0
  wordSpacing?: number; // word gap multiplier e.g. 1.0 (0.6x to 1.8x)
  cursiveSlant?: number; // forward cursive slant in degrees (0 to 18 deg)
  messiness?: number; // 0.2 to 2.0 messy handwriting / rushed intensity
  connectedCursive?: boolean; // cursive ligature flow and connected stroke tails
  inkBleed?: boolean; // micro ink pooling and realistic pressure variance
  inkColor: string;
  inkOpacity: number;
  paperType: PaperType;
  pageSize: PageSize;
  paperColor: string;
  marginTopMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  marginBottomMm: number;
  showRedMargin: boolean;
  subtleVariation: boolean;
  glyphVariation: boolean; // enables multi-glyph compatible variants for repeated letters
  seed: number; // deterministic randomness seed
  variationIntensity: number; // 0 to 2 multiplier (default 1.0)
  lineDrift: boolean; // subtle natural line drift
  wordSpacingVariation: boolean; // natural word gap variance
  usePersonalHandwriting: boolean; // whether to use personal glyph library
  activeProfileId?: string;
}

export const INK_COLORS = [
  { name: 'Dark Ink', value: '#1e293b' },
  { name: 'Classic Blue', value: '#1e3a8a' },
  { name: 'Royal Blue', value: '#1d4ed8' },
  { name: 'Gel Black', value: '#09090b' },
  { name: 'Fountain Brown', value: '#451a03' },
  { name: 'Teacher Red', value: '#991b1b' },
  { name: 'Emerald Green', value: '#065f46' },
];
