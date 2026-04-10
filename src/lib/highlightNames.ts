const NAMES = [
  'mamma', 'pappa',
  'Olle', 'Ellen',
  'jag',
  'mormor', 'morfar', 'farmor', 'farfar',
];

// Build a single regex that matches any name as a whole word (case-insensitive).
// Word boundaries work fine here since all names are pure ASCII/latin letters.
const pattern = new RegExp(
  `\\b(${NAMES.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi',
);

/**
 * Escape HTML entities and wrap matched names in <strong> tags.
 * Newlines are converted to <br> so the overlay matches textarea line breaks.
 */
export function highlightNames(text: string): string {
  // 1. Escape HTML
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Bold names
  const bolded = escaped.replace(pattern, '<strong>$1</strong>');

  // 3. Convert newlines to <br> and add trailing space so the overlay
  //    height always matches the textarea (textarea shows a new line
  //    after a trailing newline; we need to match that).
  return bolded.replace(/\n/g, '<br>') + '&nbsp;';
}
