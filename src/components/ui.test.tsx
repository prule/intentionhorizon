import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { useMedia } from './ui';
import { mount } from '../test/render';

// jsdom has no matchMedia: a fake whose `matches` the test flips.
function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<() => void>();
  const state = { matches: initial };
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return state.matches;
    },
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  }));
  return {
    set(v: boolean) {
      state.matches = v;
      act(() => listeners.forEach((l) => l()));
    },
    listeners,
  };
}

function Probe() {
  return <span>{useMedia('(min-width: 880px)') ? 'wide' : 'narrow'}</span>;
}

afterEach(() => vi.unstubAllGlobals());

describe('useMedia', () => {
  it('follows the media query as it changes', () => {
    const mq = fakeMatchMedia(false);
    const { container } = mount(<Probe />);
    expect(container.textContent).toBe('narrow');
    mq.set(true);
    expect(container.textContent).toBe('wide');
  });
});
