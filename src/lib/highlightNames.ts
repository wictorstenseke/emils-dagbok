const NAMES = [
  'mamma', 'pappa',
  'Olle', 'Ellen',
  'jag',
  'mormor', 'morfar', 'farmor', 'farfar',
];

const AVATARS: Record<string, string> = {
  'mamma': '👩',
  'pappa': '👨',
  'mormor': '👵',
  'morfar': '👴',
  'farmor': '👵',
  'farfar': '👴',
  'olle': '👦',
  'ellen': '👧',
  'jag': '🙋',
};

// Build a single regex that matches any name as a whole word (case-insensitive).
// Word boundaries work fine here since all names are pure ASCII/latin letters.
const pattern = new RegExp(
  `\\b(${NAMES.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi',
);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape HTML entities and wrap matched names in <strong> tags.
 * Newlines are converted to <br> so the overlay matches textarea line breaks.
 */
export function highlightNames(text: string): string {
  const escaped = escapeHtml(text);
  const bolded = escaped.replace(pattern, '<strong>$1</strong>');
  return bolded.replace(/\n/g, '<br>') + '&nbsp;';
}

/**
 * Like highlightNames but also adds avatar emoji icons next to names.
 * Used in display mode (when not editing).
 */
export function highlightNamesWithAvatars(text: string): string {
  const escaped = escapeHtml(text);
  const bolded = escaped.replace(pattern, (_match, name: string) => {
    const avatar = AVATARS[name.toLowerCase()];
    if (avatar) {
      return `<strong>${name}<span class="name-avatar">${avatar}</span></strong>`;
    }
    return `<strong>${name}</strong>`;
  });
  return bolded.replace(/\n/g, '<br>') + '&nbsp;';
}
