import { PageDimensions, HandwritingStyle, PersonalHandwritingProfile } from '../types';

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

  const printableWidthPx = Math.max(100, widthPx - marginLeftPx - marginRightPx);
  const printableHeightPx = Math.max(100, heightPx - marginTopPx - marginBottomPx);

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
  if (typeof window === 'undefined') return text.length * 10;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * 10;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/**
 * Accurately measures the rendered width of text for fonts or personal glyphs.
 */
export function measureTextLineWidth(
  text: string,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): number {
  const fontSpec = `${style.fontSize}px ${style.fontFamily}`;
  const wordSpacingMultiplier = style.wordSpacing ?? 1.0;
  const baseSpacePx = style.fontSize * 0.28 * wordSpacingMultiplier;

  if (style.usePersonalHandwriting && activeProfile && activeProfile.glyphs) {
    let totalW = 0;
    const cellHeightPx = style.fontSize * 1.30;
    const userLetterSpacing = style.letterSpacing ?? 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        totalW += baseSpacePx;
        continue;
      }

      const glyphList = activeProfile.glyphs[char];
      const nextChar = i < text.length - 1 && text[i + 1] !== ' ' ? text[i + 1] : undefined;

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
        const targetWidth = Math.max(3, targetHeight * glyph.aspectRatio);

        let kerningPx = 0;
        if (nextChar) {
          const isNextPunctuation = /[.,!?:;'"\-_()/@#+]/.test(nextChar);
          const isCurrentPunctuation = /[.,!?:;'"\-_()/@#+]/.test(char);
          if (isNextPunctuation) kerningPx = -Math.round(style.fontSize * 0.15);
          else if (isCurrentPunctuation) kerningPx = -Math.round(style.fontSize * 0.06);
          else {
            const cursiveOverlapRatio = (style.connectedCursive ?? true) ? 0.16 + 0.03 * (style.messiness ?? 1.0) : 0.10;
            kerningPx = -Math.round(style.fontSize * cursiveOverlapRatio);
          }
        }

        totalW += Math.max(1, targetWidth + kerningPx + userLetterSpacing);
      } else {
        const fontOverlap = (style.connectedCursive ?? true) && nextChar && /[a-zA-Z]/.test(nextChar)
          ? -Math.round(style.fontSize * 0.04)
          : 0;
        totalW += getTextWidth(char, fontSpec) + fontOverlap + userLetterSpacing;
      }
    }
    return totalW;
  }

  return getTextWidth(text, fontSpec);
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

  for (const para of paragraphs) {
    if (para.trim() === '') {
      // Empty line / paragraph gap
      allWrappedLines.push('');
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureTextLineWidth(testLine, style, activeProfile);

      if (testWidth <= layout.printableWidthPx) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allWrappedLines.push(currentLine);
          currentLine = word;
        } else {
          // Word itself is wider than printable width -> break it up
          let partialWord = '';
          for (const char of word) {
            if (measureTextLineWidth(partialWord + char, style, activeProfile) <= layout.printableWidthPx) {
              partialWord += char;
            } else {
              allWrappedLines.push(partialWord);
              partialWord = char;
            }
          }
          currentLine = partialWord;
        }
      }
    }

    if (currentLine) {
      allWrappedLines.push(currentLine);
    }
  }

  // Ensure at least 1 page even if empty
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
