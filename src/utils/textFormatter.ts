/**
 * Text formatting utility for on-page text selection and inline markdown transformations.
 */

export function stripFormattingSyntax(text: string): string {
  return text
    .replace(/==(.*?)==/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\(\((.*?)\)\)/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^\[[ xX]\]\s*/g, '')
    .replace(/^->\s*/g, '')
    .replace(/^=>\s*/g, '');
}

export function formatSelectedText(
  originalText: string,
  formatType: 'highlight' | 'scratch' | 'circle' | 'underline' | 'checkbox' | 'arrow' | 'clear'
): string {
  const clean = stripFormattingSyntax(originalText.trim());
  if (!clean) return originalText;

  switch (formatType) {
    case 'highlight':
      return `==${clean}==`;
    case 'scratch':
      return `~~${clean}~~`;
    case 'circle':
      return `((${clean}))`;
    case 'underline':
      return `__${clean}__`;
    case 'checkbox':
      return `[x] ${clean}`;
    case 'arrow':
      return `-> ${clean}`;
    case 'clear':
      return clean;
    default:
      return originalText;
  }
}

export function applyFormattingToDocument(
  fullDocument: string,
  selectedText: string,
  formatType: 'highlight' | 'scratch' | 'circle' | 'underline' | 'checkbox' | 'arrow' | 'clear'
): string {
  const trimmed = selectedText.trim();
  if (!trimmed || !fullDocument) return fullDocument;

  const formatted = formatSelectedText(trimmed, formatType);

  // Exact substring match
  if (fullDocument.includes(trimmed)) {
    return fullDocument.replace(trimmed, formatted);
  }

  // Clean substring match
  const cleanTarget = stripFormattingSyntax(trimmed);
  if (fullDocument.includes(cleanTarget)) {
    return fullDocument.replace(cleanTarget, formatted);
  }

  return fullDocument;
}

export function replaceSelectionInDocument(
  fullDocument: string,
  oldText: string,
  newText: string
): string {
  const trimmedOld = oldText.trim();
  if (!trimmedOld || !fullDocument) return fullDocument;

  if (fullDocument.includes(trimmedOld)) {
    return fullDocument.replace(trimmedOld, newText);
  }

  const cleanOld = stripFormattingSyntax(trimmedOld);
  if (fullDocument.includes(cleanOld)) {
    return fullDocument.replace(cleanOld, newText);
  }

  return fullDocument;
}
