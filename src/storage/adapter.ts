// Storage adapter — swap this file to migrate to Firebase or any backend.
// All app code imports from here, never from localStorage directly.

export interface UserProfile {
  name: string;
  code: number[]; // 4-tap sequence
}

const PROFILE_KEY = 'diary:user';
const SESSION_KEY = 'diary:loggedIn';
const ACTIVITY_KEY = 'diary:lastActivity';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ENTRY_PREFIX = 'diary:entries:';
const entryKey = (date: string) => `${ENTRY_PREFIX}${date}`;
const isValidDateKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export interface ExportData {
  version: 1;
  exportedAt: string;
  entries: Record<string, string>;
}

export const storage = {
  getProfile(): UserProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  getEntry(date: string): string {
    return localStorage.getItem(entryKey(date)) ?? '';
  },

  saveEntry(date: string, text: string): void {
    localStorage.setItem(entryKey(date), text);
  },

  getAllEntries(): Record<string, string> {
    const entries: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ENTRY_PREFIX)) {
        const date = key.slice(ENTRY_PREFIX.length);
        if (isValidDateKey(date)) {
          entries[date] = localStorage.getItem(key) ?? '';
        }
      }
    }
    return entries;
  },

  replaceAllEntries(entries: Record<string, string>): void {
    // Remove every existing entry key, then write the new ones.
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ENTRY_PREFIX)) toRemove.push(key);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    for (const [date, text] of Object.entries(entries)) {
      localStorage.setItem(entryKey(date), text);
    }
  },

  getSession(): boolean {
    return localStorage.getItem(SESSION_KEY) === 'true';
  },

  setSession(loggedIn: boolean): void {
    if (loggedIn) {
      localStorage.setItem(SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ACTIVITY_KEY);
    }
  },

  touchActivity(): void {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
  },

  isSessionExpired(): boolean {
    const last = localStorage.getItem(ACTIVITY_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > SESSION_TIMEOUT;
  },
};
