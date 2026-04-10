// Storage adapter — swap this file to migrate to Firebase or any backend.
// All app code imports from here, never from localStorage directly.

export interface UserProfile {
  name: string;
  code: number[]; // 4-tap sequence
}

const PROFILE_KEY = 'diary:user';
const SESSION_KEY = 'diary:loggedIn';
const entryKey = (date: string) => `diary:entries:${date}`;

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

  getSession(): boolean {
    return localStorage.getItem(SESSION_KEY) === 'true';
  },

  setSession(loggedIn: boolean): void {
    if (loggedIn) {
      localStorage.setItem(SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },
};
