import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredConsent, setConsent } from './consent';

const KEY = 'ih-consent';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  delete (window as { gtag?: unknown }).gtag;
});
afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});

describe('getStoredConsent', () => {
  it('returns the valid stored choice', () => {
    localStorage.setItem(KEY, 'granted');
    expect(getStoredConsent()).toBe('granted');
    localStorage.setItem(KEY, 'denied');
    expect(getStoredConsent()).toBe('denied');
  });

  it('returns null for an invalid stored value', () => {
    localStorage.setItem(KEY, 'maybe');
    expect(getStoredConsent()).toBeNull();
  });

  it('returns null when nothing is stored', () => {
    expect(getStoredConsent()).toBeNull();
  });
});

describe('setConsent', () => {
  it('persists the choice and updates gtag consent', () => {
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;

    setConsent('granted');

    expect(localStorage.getItem(KEY)).toBe('granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
  });

  it('still persists when gtag is absent', () => {
    setConsent('denied'); // no window.gtag defined — must not throw
    expect(localStorage.getItem(KEY)).toBe('denied');
  });
});
