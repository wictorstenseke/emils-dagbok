export function today(): string {
  return toKey(new Date());
}

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toKey(date);
}

export function formatDisplay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function mondayOf(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return toKey(date);
}

export function weekDays(mondayKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayKey, i));
}

export function shortDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('sv-SE', { weekday: 'short' });
}

export function dayNumber(key: string): number {
  return Number(key.split('-')[2]);
}

export function getSeason(key: string): { name: string; emoji: string } {
  const month = Number(key.split('-')[1]);
  if (month >= 3 && month <= 5) return { name: 'Vår', emoji: '🌳' };
  if (month >= 6 && month <= 8) return { name: 'Sommar', emoji: '☀️' };
  if (month >= 9 && month <= 11) return { name: 'Höst', emoji: '🍂' };
  return { name: 'Vinter', emoji: '❄️' };
}
