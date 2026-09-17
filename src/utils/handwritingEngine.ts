import { HandwritingStyle, FONT_OPTIONS, FontVariant, PersonalHandwritingProfile, ExtractedGlyph } from '../types';
import { getTintedGlyphUrl } from './glyphExtractor';

/**
 * Fast seeded pseudo-random number generator (Mulberry32).
 * Returns a deterministic float between 0 (inclusive) and 1 (exclusive).
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic integer hash for any set of numbers / strings.
 */
export function hashValues(...args: (number | string)[]): number {
  let hash = 0x811c9dc5;
  for (const val of args) {
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return hash >>> 0;
}

export interface CharRenderProps {
  char: string;
  style: React.CSSProperties;
  key: string;
  glyphDataUrl?: string;
  glyphWidthPx?: number;
  glyphHeightPx?: number;
  isPersonalGlyph?: boolean;
}

export interface WordRenderProps {
  wordIndex: number;
  chars: CharRenderProps[];
  spaceWidthPx: number;
}

export interface LineRenderProps {
  lineIndex: number;
  words: WordRenderProps[];
  lineDriftAngleDeg: number;
  lineOffsetYPx: number;
  lineOffsetXMarginPx: number;
}

/**
 * Finds available font variants for the active font family.
 */
function getActiveFontVariants(style: HandwritingStyle): FontVariant[] {
  const matched = FONT_OPTIONS.find((f) => f.fontFamily === style.fontFamily);
  if (matched && matched.variants && matched.variants.length > 0) {
    return matched.variants;
  }
  return [{ fontFamily: style.fontFamily, scale: 1.0, baselineShift: 0 }];
}

/**
 * Computes deterministic, natural handwriting transformation properties for a character.
 */
export function computeCharTransform(
  char: string,
  charIndexInWord: number,
  wordIndex: number,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle,
  charOccurrencesInLine: number,
  prevChar?: string,
  nextChar?: string,
  wordLength: number = 1,
  activeProfile?: PersonalHandwritingProfile | null
): { css: React.CSSProperties; glyph?: ExtractedGlyph; isPersonalGlyph: boolean; glyphWidthPx?: number; glyphHeightPx?: number } {
  const intensity = style.variationIntensity ?? 1.0;
  const messiness = style.messiness ?? 1.0;
  const seed = style.seed ?? 42;
  const cursiveSlant = style.cursiveSlant ?? 8;
  const connectedCursive = style.connectedCursive ?? true;

  // Compute unique hash for this character occurrence
  const h = hashValues(seed, pageIndex, lineIndex, wordIndex, charIndexInWord, char);
  const rand = mulberry32(h);

  // Check if personal glyph exists
  let personalGlyph: ExtractedGlyph | undefined;
  if (style.usePersonalHandwriting && activeProfile && activeProfile.glyphs[char]) {
    const glyphVariants = activeProfile.glyphs[char];
    if (glyphVariants.length > 0) {
      // Deterministically pick variant
      const variantIdx = (charOccurrencesInLine + h) % glyphVariants.length;
      personalGlyph = glyphVariants[variantIdx] || glyphVariants[0];
    }
  }

  // Fallback font variant
  const variants = getActiveFontVariants(style);
  let selectedVariant: FontVariant = variants[0];

  const isLetter = /[a-zA-Z]/.test(char);
  const isDirectlyRepeated = prevChar && prevChar.toLowerCase() === char.toLowerCase();

  if (!personalGlyph && style.glyphVariation && isLetter && variants.length > 1) {
    if (isDirectlyRepeated) {
      const variantIdx = (h % (variants.length - 1)) + 1;
      selectedVariant = variants[variantIdx] || variants[1];
    } else if (charOccurrencesInLine > 0) {
      const variantIdx = (charOccurrencesInLine + h) % variants.length;
      selectedVariant = variants[variantIdx] || variants[0];
    }
  }

  // Helper to determine proportional glyph height
  const getProportionalGlyphMetrics = (glyph: ExtractedGlyph, scaleFactorX: number, scaleFactorY: number) => {
    let relHeight = glyph.heightRatioInCell;
    if (!relHeight || relHeight <= 0) {
      if (char === '.' || char === ',') relHeight = 0.20;
      else if (char === '-' || char === '_') relHeight = 0.15;
      else if (/[!?:;'"()/@#+]/.test(char)) relHeight = 0.55;
      else if (/[acegmnopqrsuvwxyz]/.test(char)) relHeight = 0.50;
      else if (/[bdfhkltA-Z0-9]/.test(char)) relHeight = 0.80;
      else relHeight = 0.65;
    }

    const cellHeightPx = style.fontSize * 1.30;
    const targetHeight = Math.max(4, cellHeightPx * relHeight * scaleFactorY);
    const targetWidth = Math.max(3, targetHeight * glyph.aspectRatio * scaleFactorX);

    // Baseline alignment: how far from the baseline this glyph's bottom should sit
    const glyphBottomRatio = glyph.baselineOffsetRatio ?? 0.75;
    const baselineYRatio = 0.75;
    const glyphBaselineShift = (glyphBottomRatio - baselineYRatio) * cellHeightPx * 0.4;

    return { targetHeight, targetWidth, glyphBaselineShift };
  };

  // Natural handwriting cursive kerning compensation between letters
  let baseKerning = 0;
  if (personalGlyph) {
    const isNextPunctuation = nextChar ? /[.,!?:;'"\-_()/@#+]/.test(nextChar) : false;
    const isCurrentPunctuation = /[.,!?:;'"\-_()/@#+]/.test(char);

    if (!nextChar) {
      baseKerning = 0;
    } else if (isNextPunctuation) {
      baseKerning = -Math.round(style.fontSize * 0.15);
    } else if (isCurrentPunctuation) {
      baseKerning = -Math.round(style.fontSize * 0.06);
    } else {
      // Natural flowing cursive connection overlap
      const cursiveOverlapRatio = connectedCursive ? 0.16 + 0.03 * messiness : 0.10;
      baseKerning = -Math.round(style.fontSize * cursiveOverlapRatio);
    }
  } else if (connectedCursive && isLetter && nextChar && /[a-zA-Z]/.test(nextChar)) {
    // Subtle font ligature tucking
    baseKerning = -Math.round(style.fontSize * 0.04);
  }

  const userLetterSpacing = style.letterSpacing ?? 0;

  if (!style.subtleVariation) {
    if (personalGlyph) {
      const { targetHeight, targetWidth, glyphBaselineShift } = getProportionalGlyphMetrics(personalGlyph, 1.0, 1.0);
      return {
        css: {
          display: 'inline-flex',
          position: 'relative',
          verticalAlign: 'baseline',
          transform: `translate(0px, ${glyphBaselineShift.toFixed(2)}px) skewX(${-cursiveSlant}deg)`,
          transformOrigin: '50% 85%',
          marginRight: `${(baseKerning + userLetterSpacing).toFixed(2)}px`,
        },
        glyph: personalGlyph,
        isPersonalGlyph: true,
        glyphWidthPx: targetWidth,
        glyphHeightPx: targetHeight,
      };
    }

    return {
      css: {
        display: 'inline-block',
        position: 'relative',
        fontFamily: selectedVariant.fontFamily,
        fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1, "swsh" 1, "kern" 1',
        color: style.inkColor,
        transform: `skewX(${-cursiveSlant}deg)`,
        transformOrigin: '50% 85%',
        marginRight: `${(baseKerning + userLetterSpacing).toFixed(2)}px`,
      },
      isPersonalGlyph: false,
    };
  }

  // 1. Rotation & Cursive Momentum (e.g. -2.5deg to +2.5deg)
  const rotRange = (1.5 + 0.9 * messiness) * intensity;
  let rotateDeg = (rand() * 2 - 1) * rotRange;

  // 2. Baseline & Rushed Vertical Wobble
  const dyRange = (0.7 + 0.6 * messiness) * intensity;
  let dy = (rand() * 2 - 1) * dyRange + (selectedVariant.baselineShift || 0);

  // Hurried letter wave inside a word: middle letters arch slightly, ending drops
  if (wordLength > 2) {
    const arcPos = (charIndexInWord + 0.5) / wordLength;
    const midWave = Math.sin(arcPos * Math.PI) * (-0.9 * messiness * intensity);
    const endSettle = (charIndexInWord / wordLength) * (0.5 * messiness * intensity);
    dy += midWave + endSettle;
  }

  // 3. Horizontal offset
  const dxRange = (0.4 + 0.3 * messiness) * intensity;
  const dx = (rand() * 2 - 1) * dxRange;

  // 4. Width and Height scale (Hurried messy dynamics: fast vowels compress, ascenders shoot up)
  const scaleVar = (0.04 + 0.05 * messiness) * intensity;
  const baseScale = selectedVariant.scale || 1.0;
  let scaleX = baseScale * (1 + (rand() * 2 - 1) * scaleVar);
  let scaleY = baseScale * (1 + (rand() * 2 - 1) * scaleVar);

  const isFastVowel = /[aeoucs]/.test(char);
  const isTallAscender = /[bdfhkltA-Z]/.test(char);
  const isDescender = /[gjpqy]/.test(char);

  if (messiness > 0.6) {
    if (isFastVowel && charIndexInWord > 0 && charIndexInWord < wordLength - 1) {
      scaleX *= Math.max(0.85, 1 - (0.07 * messiness));
      scaleY *= Math.max(0.88, 1 - (0.05 * messiness));
    } else if (isTallAscender) {
      scaleY *= 1 + (0.08 * messiness);
      rotateDeg += 1.2 * messiness; // extra forward tilt on tall strokes
    } else if (isDescender) {
      scaleY *= 1 + (0.07 * messiness);
      dy += 0.6 * messiness;
    }
  }

  // 5. Cursive Forward Slant + Jitter
  const skewRange = (1.2 + 1.0 * messiness) * intensity;
  const forwardSlant = -cursiveSlant + (rand() * 2 - 1) * skewRange;

  // 6. Stroke Weight / Pressure variation (Heavier downstrokes, thin upstrokes)
  let weight = 400;
  if (isDirectlyRepeated) {
    dy += (rand() > 0.5 ? 0.6 : -0.6) * messiness * intensity;
    scaleX *= 0.94; // 2nd repeated letter is written faster
    weight = rand() > 0.5 ? 500 : 300;
  } else {
    const wRand = rand();
    if (wRand > 0.80) weight = 500;
    else if (wRand < 0.20) weight = 300;
  }

  // 7. Dynamic ink density & subtle pressure pooling
  const opacityJitter = 1 - (rand() * (0.06 + 0.04 * messiness) * intensity);
  const inkOpacity = Math.max(0.82, Math.min(1.0, (style.inkOpacity || 0.95) * opacityJitter));

  // 8. Individual letter spacing variance
  const letterSpacingDelta = (rand() * 2 - 1) * (0.22 + 0.15 * messiness) * intensity;
  const totalMarginRight = baseKerning + userLetterSpacing + letterSpacingDelta;

  const inkShadow = (style.inkBleed ?? true) ? 'drop-shadow(0 0 0.35px rgba(24, 32, 48, 0.45))' : 'none';

  if (personalGlyph) {
    const { targetHeight, targetWidth, glyphBaselineShift } = getProportionalGlyphMetrics(personalGlyph, scaleX, scaleY);
    const totalDy = dy + glyphBaselineShift;

    return {
      css: {
        display: 'inline-flex',
        position: 'relative',
        verticalAlign: 'baseline',
        transform: `translate(${dx.toFixed(2)}px, ${totalDy.toFixed(2)}px) rotate(${rotateDeg.toFixed(2)}deg) skewX(${forwardSlant.toFixed(2)}deg)`,
        transformOrigin: '50% 85%',
        opacity: inkOpacity,
        filter: inkShadow,
        marginRight: `${totalMarginRight.toFixed(2)}px`,
      },
      glyph: personalGlyph,
      isPersonalGlyph: true,
      glyphWidthPx: targetWidth,
      glyphHeightPx: targetHeight,
    };
  }

  return {
    css: {
      display: 'inline-block',
      position: 'relative',
      fontFamily: selectedVariant.fontFamily,
      color: style.inkColor,
      transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rotateDeg.toFixed(2)}deg) skewX(${forwardSlant.toFixed(2)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
      transformOrigin: '50% 85%',
      fontWeight: weight,
      opacity: inkOpacity,
      filter: inkShadow,
      marginRight: `${totalMarginRight.toFixed(2)}px`,
      fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1, "swsh" 1, "kern" 1',
      WebkitFontSmoothing: 'antialiased',
    },
    isPersonalGlyph: false,
  };
}

/**
 * Processes a line of text into words and individual characters with natural human handwriting variance.
 */
export function processHandwrittenLine(
  lineText: string,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): LineRenderProps {
  const intensity = style.variationIntensity ?? 1.0;
  const messiness = style.messiness ?? 1.0;
  const seed = style.seed ?? 42;

  // Line-level drift, slant & organic left-margin wandering
  let lineDriftAngleDeg = 0;
  let lineOffsetYPx = 0;
  let lineOffsetXMarginPx = 0;

  if (style.lineDrift && style.subtleVariation) {
    const lineHash = hashValues(seed, pageIndex, lineIndex, 'line-drift');
    const lineRand = mulberry32(lineHash);
    lineDriftAngleDeg = (lineRand() * 2 - 1) * (0.24 + 0.15 * messiness) * intensity;
    lineOffsetYPx = (lineRand() * 2 - 1) * (0.6 + 0.4 * messiness) * intensity;

    // Organic left margin indentation wave & human wander
    const marginHash = hashValues(seed, pageIndex, lineIndex, 'line-margin');
    const marginRand = mulberry32(marginHash);
    const waveOffset = Math.sin(lineIndex * 0.9 + (seed % 7)) * (3.5 + 1.5 * messiness) * intensity;
    const humanJitter = (marginRand() * 2 - 1) * (2.0 + 1.2 * messiness) * intensity;
    lineOffsetXMarginPx = Math.max(-6, Math.min(10, waveOffset + humanJitter));
  }

  const rawWords = lineText.split(' ');
  const words: WordRenderProps[] = [];

  // Track character occurrence counts across the line
  const charOccurrences = new Map<string, number>();

  for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
    const word = rawWords[wIdx];
    const wordHash = hashValues(seed, pageIndex, lineIndex, wIdx, 'word');
    const wordRand = mulberry32(wordHash);

    // Natural word space width
    const wordSpacingMultiplier = style.wordSpacing ?? 1.0;
    const baseSpacePx = style.fontSize * 0.28 * wordSpacingMultiplier;
    const spaceVarPx = style.wordSpacingVariation && style.subtleVariation
      ? (wordRand() * 2 - 1) * (style.fontSize * (0.05 + 0.03 * messiness)) * intensity
      : 0;
    const spaceWidthPx = Math.max(4, Math.round(baseSpacePx + spaceVarPx));

    const chars: CharRenderProps[] = [];
    let prevChar = '';

    for (let cIdx = 0; cIdx < word.length; cIdx++) {
      const char = word[cIdx];
      const nextChar = cIdx < word.length - 1 ? word[cIdx + 1] : undefined;
      const charLower = char.toLowerCase();
      const occurrenceCount = charOccurrences.get(charLower) || 0;
      charOccurrences.set(charLower, occurrenceCount + 1);

      const { css, glyph, isPersonalGlyph, glyphWidthPx, glyphHeightPx } = computeCharTransform(
        char,
        cIdx,
        wIdx,
        lineIndex,
        pageIndex,
        style,
        occurrenceCount,
        prevChar,
        nextChar,
        word.length,
        activeProfile
      );

      const glyphDataUrl = glyph ? getTintedGlyphUrl(glyph.dataUrl, style.inkColor) : undefined;

      chars.push({
        char,
        style: css,
        key: `c-${pageIndex}-${lineIndex}-${wIdx}-${cIdx}-${char}-${occurrenceCount}`,
        glyphDataUrl,
        glyphWidthPx,
        glyphHeightPx,
        isPersonalGlyph,
      });

      prevChar = char;
    }

    words.push({
      wordIndex: wIdx,
      chars,
      spaceWidthPx,
    });
  }

  return {
    lineIndex,
    words,
    lineDriftAngleDeg,
    lineOffsetYPx,
    lineOffsetXMarginPx,
  };
}
