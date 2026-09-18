import { PageDimensions, HandwritingStyle, PersonalHandwritingProfile, FONT_OPTIONS } from '../types';

export const MM_TO_PX = 3.7795275591; // 1 mm in standard 96 DPI CSS pixels

export interface PageLayout {
  widthPx: number;
  heightPx: number;
  marginTopPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  marginBottomPx: number;
  printableWidthPx: number;
  printableHeightPx: number;
  lineHeightPx: number;
  maxLinesPerPage: number;
}

export function calculateLayout(
  dimensions: PageDimensions,
  style: HandwritingStyle
): PageLayout {
  const widthPx = Math.round(dimensions.widthMm * MM_TO_PX);
  const heightPx = Math.round(dimensions.heightMm * MM_TO_PX);

  const marginTopPx = Math.round(style.marginTopMm * MM_TO_PX);
  const marginLeftPx = Math.round(style.marginLeftMm * MM_TO_PX);
  const marginRightPx = Math.round(style.marginRightMm * MM_TO_PX);
  const marginBottomPx = Math.round(style.marginBottomMm * MM_TO_PX);

  // Leave a safe right margin buffer so natural cursive handwriting never touches or exceeds the edge
  const printableWidthPx = Math.max(80, widthPx - marginLeftPx - marginRightPx - 20);
  const printableHeightPx = Math.max(80, heightPx - marginTopPx - marginBottomPx);

  const lineHeightPx = Math.round(style.fontSize * style.lineSpacing);
  const maxLinesPerPage = Math.max(1, Math.floor(printableHeightPx / lineHeightPx));

  return {
    widthPx,
    heightPx,
    marginTopPx,
    marginLeftPx,
    marginRightPx,
    marginBottomPx,
    printableWidthPx,
    printableHeightPx,
    lineHeightPx,
    maxLinesPerPage,
  };
}

let measureCanvas: HTMLCanvasElement | null = null;

function getTextWidth(text: string, font: string): number {
  if (typeof window === 'undefined') return text.length * 16;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * 16;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function stripFormattingTokens(text: string): string {
  return text
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/==(.*?)==/g, '$1')
    .replace(/\(\((.*?)\)\)/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\[x\]|\[X\]/g, '✓')
    .replace(/\[ \]|\[\]/g, '◻')
    .replace(/-->|->/g, '→')
    .replace(/==>|=>/g, '⇒');
}

/**
 * Returns conservative, bulletproof character width metrics to prevent text overflowing the right margin.
 */
function getConservativeCharWidth(char: string, fontSize: number): number {
  if (char === ' ') return fontSize * 0.38;
  if (/[mMwW]/.test(char)) return fontSize * 0.88;
  if (/[A-Z0-9]/.test(char)) return fontSize * 0.72;
  if (/[bdfhkl]/.test(char)) return fontSize * 0.62;
  if (/[aceginopqrstuvxyz]/.test(char)) return fontSize * 0.58;
  if (/[.,!?:;'"\-_]/.test(char)) return fontSize * 0.32;
  return fontSize * 0.55;
}

/**
 * Accurately measures the true rendered width of text for both Personal Glyphs and Built-in Cursive Fonts.
 */
export function measureTextLineWidth(
  rawText: string,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): number {
  const cleanFontFamily = (style.fontFamily || 'cursive').replace(/'/g, '"');
  const fontSpec = `${style.fontSize}px ${cleanFontFamily}`;
  const wordSpacingMultiplier = style.wordSpacing ?? 1.0;
  const baseSpacePx = style.fontSize * 0.38 * wordSpacingMultiplier;
  const userLetterSpacing = style.letterSpacing ?? 0;

  // 1. Personal Glyph Library Measurement
  if (style.usePersonalHandwriting && activeProfile && activeProfile.glyphs) {
    let totalW = 0;
    const cellHeightPx = style.fontSize * 1.30;
    const cleanText = stripFormattingTokens(rawText);

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char === ' ') {
        totalW += baseSpacePx;
        continue;
      }

      const glyphList = activeProfile.glyphs[char];
      const nextChar = i < cleanText.length - 1 && cleanText[i + 1] !== ' ' ? cleanText[i + 1] : undefined;

      if (glyphList && glyphList.length > 0) {
        const glyph = glyphList[0];
        let relHeight = glyph.heightRatioInCell;
        if (!relHeight || relHeight <= 0) {
          if (char === '.' || char === ',') relHeight = 0.20;
          else if (char === '-' || char === '_') relHeight = 0.15;
          else if (/[!?:;'"()/@#+]/.test(char)) relHeight = 0.55;
          else if (/[acegmnopqrsuvwxyz]/.test(char)) relHeight = 0.50;
          else if (/[bdfhkltA-Z0-9]/.test(char)) relHeight = 0.80;
          else relHeight = 0.65;
        }
        const targetHeight = Math.max(4, cellHeightPx * relHeight);
        const computedGlyphW = targetHeight * (glyph.aspectRatio || 0.75) * 1.12;
        const conservativeW = getConservativeCharWidth(char, style.fontSize);
        const targetWidth = Math.max(computedGlyphW, conservativeW);

        totalW += targetWidth + userLetterSpacing;
      } else {
        const fontW = Math.max(getTextWidth(char, fontSpec), getConservativeCharWidth(char, style.fontSize));
        totalW += fontW + userLetterSpacing;
      }
    }
    return totalW + 12;
  }

  // 2. Built-in Google Font Character-by-Character Measurement
  const matchedFont = FONT_OPTIONS.find((f) => f.fontFamily === style.fontFamily);
  const fontVariantScale = matchedFont && matchedFont.variants && matchedFont.variants[0]
    ? Math.max(1.0, matchedFont.variants[0].scale)
    : 1.08;

  let totalW = 0;
  const words = rawText.split(' ');

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const rawWord = words[wIdx];
    if (!rawWord) continue;

    if (wIdx > 0) {
      totalW += baseSpacePx;
    }

    // Checkbox Tokens
    if (rawWord === '[x]' || rawWord === '[X]' || rawWord === '[ ]' || rawWord === '[]') {
      totalW += style.fontSize * 1.05 + 10;
      continue;
    }

    // Arrow Tokens
    if (rawWord === '->' || rawWord === '-->' || rawWord === '=>' || rawWord === '==>') {
      totalW += style.fontSize * 1.0 + 8;
      continue;
    }

    const cleanWord = stripFormattingTokens(rawWord);

    for (let cIdx = 0; cIdx < cleanWord.length; cIdx++) {
      const char = cleanWord[cIdx];
      const measuredCharW = getTextWidth(char, fontSpec);
      const conservativeW = getConservativeCharWidth(char, style.fontSize);
      const effectiveCharW = Math.max(measuredCharW, conservativeW) * fontVariantScale;

      totalW += effectiveCharW + userLetterSpacing;
    }
  }

  return totalW + 14;
}

/**
 * Splits input text into visual wrapped lines and groups them into pages.
 */
export function paginateText(
  rawText: string,
  layout: PageLayout,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): string[][] {
  const paragraphs = rawText.split('\n');
  const allWrappedLines: string[] = [];

  const paraIndentPx = style.paragraphIndent ?? 0;
  const extraParaSpacing = style.paragraphSpacing ?? 0;
  const extraSectionSpacing = style.sectionSpacing ?? 0;
  // Use strict printable width boundary
  const maxAllowedWidth = layout.printableWidthPx - 16;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    if (para.trim() === '') {
      allWrappedLines.push('');
      continue;
    }

    // Section spacing before headings
    const isSectionHeading = para.trim().startsWith('__') || para.trim().startsWith('#');
    if (pIdx > 0 && isSectionHeading && extraSectionSpacing > 0) {
      for (let s = 0; s < extraSectionSpacing; s++) {
        allWrappedLines.push('');
      }
    }

    const words = para.split(' ');
    let currentLine = '';
    let isFirstLineInPara = true;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word) continue;

      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const availableWidth = isFirstLineInPara
        ? maxAllowedWidth - paraIndentPx
        : maxAllowedWidth;

      const testWidth = measureTextLineWidth(testLine, style, activeProfile);

      if (testWidth <= availableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allWrappedLines.push(currentLine);
          currentLine = word;
          isFirstLineInPara = false;
        } else {
          // Word itself is wider than line -> break it up
          let partialWord = '';
          for (const char of word) {
            if (measureTextLineWidth(partialWord + char, style, activeProfile) <= availableWidth) {
              partialWord += char;
            } else {
              allWrappedLines.push(partialWord);
              partialWord = char;
              isFirstLineInPara = false;
            }
          }
          currentLine = partialWord;
        }
      }
    }

    if (currentLine) {
      allWrappedLines.push(currentLine);
    }

    // Extra paragraph spacing
    if (extraParaSpacing > 0 && pIdx < paragraphs.length - 1 && para.trim() !== '') {
      for (let ep = 0; ep < extraParaSpacing; ep++) {
        allWrappedLines.push('');
      }
    }
  }

  // Ensure at least 1 page
  if (allWrappedLines.length === 0) {
    return [['']];
  }

  // Group into pages
  const pages: string[][] = [];
  const linesPerPage = layout.maxLinesPerPage;

  for (let i = 0; i < allWrappedLines.length; i += linesPerPage) {
    pages.push(allWrappedLines.slice(i, i + linesPerPage));
  }

  return pages.length > 0 ? pages : [['']];
}
