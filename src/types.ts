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

export interface HandwritingStyle {
  fontFamily: string;
  fontName: string;
  fontSize: number; // in px at base scale (e.g., 22)
  lineSpacing: number; // line-height multiplier e.g. 1.9
  letterSpacing: number; // in px e.g. 0.4
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
  seed: number; // deterministic randomness seed
  variationIntensity: number; // 0 to 2 multiplier (default 1.0)
  lineDrift: boolean; // subtle natural line drift
  wordSpacingVariation: boolean; // natural word gap variance
}

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'caveat', name: 'Caveat', fontFamily: "'Caveat', cursive", description: 'Casual & dynamic cursive' },
  { id: 'shadows', name: 'Shadows Into Light', fontFamily: "'Shadows Into Light', cursive", description: 'Neat & modern handwriting' },
  { id: 'indie', name: 'Indie Flower', fontFamily: "'Indie Flower', cursive", description: 'Friendly, rounded handwriting' },
  { id: 'patrick', name: 'Patrick Hand', fontFamily: "'Patrick Hand', cursive", description: 'Clean schoolbook print' },
  { id: 'kalam', name: 'Kalam', fontFamily: "'Kalam', cursive", description: 'Ballpoint pen style' },
  { id: 'dancing', name: 'Dancing Script', fontFamily: "'Dancing Script', cursive", description: 'Elegant flowing script' },
  { id: 'apple', name: 'Homemade Apple', fontFamily: "'Homemade Apple', cursive", description: 'Authentic pen & ink' },
];

export const INK_COLORS = [
  { name: 'Dark Ink', value: '#1e293b' },
  { name: 'Classic Blue', value: '#1e3a8a' },
  { name: 'Royal Blue', value: '#1d4ed8' },
  { name: 'Gel Black', value: '#09090b' },
  { name: 'Fountain Brown', value: '#451a03' },
  { name: 'Teacher Red', value: '#991b1b' },
  { name: 'Emerald Green', value: '#065f46' },
];
