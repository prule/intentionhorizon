import { describe, it, expect } from 'vitest';
import { formatVersion } from './version';

describe('formatVersion', () => {
  it('joins the git-derived version and short hash', () => {
    expect(formatVersion('v1.42', 'a1b2c3d')).toBe('v1.42 · a1b2c3d');
  });

  it('shows just the version when the hash is empty (git-unavailable fallback)', () => {
    expect(formatVersion('dev', '')).toBe('dev');
  });
});
