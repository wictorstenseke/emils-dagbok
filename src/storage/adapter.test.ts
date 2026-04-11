import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storage } from './adapter';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('storage adapter', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useRealTimers();
  });

  afterEach(() => vi.useRealTimers());

  describe('profile', () => {
    it('returns null when no profile is saved', () => {
      expect(storage.getProfile()).toBeNull();
    });

    it('saves and retrieves a profile', () => {
      const profile = { name: 'Emil', code: [1, 2, 3, 4] };
      storage.saveProfile(profile);
      expect(storage.getProfile()).toEqual(profile);
    });
  });

  describe('entries', () => {
    it('returns empty string for missing entry', () => {
      expect(storage.getEntry('2026-04-10')).toBe('');
    });

    it('saves and retrieves an entry', () => {
      storage.saveEntry('2026-04-10', 'Idag var en bra dag!');
      expect(storage.getEntry('2026-04-10')).toBe('Idag var en bra dag!');
    });

    it('stores entries per date independently', () => {
      storage.saveEntry('2026-04-10', 'Dag 1');
      storage.saveEntry('2026-04-11', 'Dag 2');
      expect(storage.getEntry('2026-04-10')).toBe('Dag 1');
      expect(storage.getEntry('2026-04-11')).toBe('Dag 2');
    });
  });

  describe('export / import', () => {
    it('returns an empty map when there are no entries', () => {
      expect(storage.getAllEntries()).toEqual({});
    });

    it('returns every saved entry keyed by date', () => {
      storage.saveEntry('2026-04-10', 'Dag 1');
      storage.saveEntry('2026-04-11', 'Dag 2');
      expect(storage.getAllEntries()).toEqual({
        '2026-04-10': 'Dag 1',
        '2026-04-11': 'Dag 2',
      });
    });

    it('does not include profile or session keys in the export', () => {
      storage.saveProfile({ name: 'Emil', code: [1, 2, 3, 4] });
      storage.setSession(true);
      storage.saveEntry('2026-04-10', 'Dag 1');
      expect(storage.getAllEntries()).toEqual({ '2026-04-10': 'Dag 1' });
    });

    it('replaceAllEntries removes existing entries before writing new ones', () => {
      storage.saveEntry('2026-04-10', 'Gammal');
      storage.saveEntry('2026-04-11', 'Borttagen');
      storage.replaceAllEntries({ '2026-04-12': 'Ny' });
      expect(storage.getEntry('2026-04-10')).toBe('');
      expect(storage.getEntry('2026-04-11')).toBe('');
      expect(storage.getEntry('2026-04-12')).toBe('Ny');
    });

    it('replaceAllEntries leaves profile and session keys untouched', () => {
      const profile = { name: 'Emil', code: [1, 2, 3, 4] };
      storage.saveProfile(profile);
      storage.setSession(true);
      storage.touchActivity();
      storage.saveEntry('2026-04-10', 'Gammal');

      storage.replaceAllEntries({ '2026-04-12': 'Ny' });

      expect(storage.getProfile()).toEqual(profile);
      expect(storage.getSession()).toBe(true);
      expect(storage.getAllEntries()).toEqual({ '2026-04-12': 'Ny' });
    });

    it('replaceAllEntries with an empty map clears all entries', () => {
      storage.saveEntry('2026-04-10', 'Dag 1');
      storage.replaceAllEntries({});
      expect(storage.getAllEntries()).toEqual({});
    });
  });

  describe('session', () => {
    it('defaults to not logged in', () => {
      expect(storage.getSession()).toBe(false);
    });

    it('sets and clears session', () => {
      storage.setSession(true);
      expect(storage.getSession()).toBe(true);
      storage.setSession(false);
      expect(storage.getSession()).toBe(false);
    });

    it('clears activity timestamp on logout', () => {
      storage.touchActivity();
      storage.setSession(false);
      expect(storage.isSessionExpired()).toBe(true);
    });
  });

  describe('session expiry', () => {
    it('is expired when no activity recorded', () => {
      expect(storage.isSessionExpired()).toBe(true);
    });

    it('is not expired immediately after touch', () => {
      storage.touchActivity();
      expect(storage.isSessionExpired()).toBe(false);
    });

    it('expires after 15 minutes', () => {
      vi.useFakeTimers({ now: 1000000 });
      storage.touchActivity();
      // Advance time by 15 minutes + 1 ms
      vi.setSystemTime(1000000 + 15 * 60 * 1000 + 1);
      expect(storage.isSessionExpired()).toBe(true);
    });

    it('does not expire before 15 minutes', () => {
      vi.useFakeTimers({ now: 1000000 });
      storage.touchActivity();
      vi.setSystemTime(1000000 + 14 * 60 * 1000);
      expect(storage.isSessionExpired()).toBe(false);
    });
  });
});
