import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// Mock the plugin's virtual module so the banner renders without a real SW.
// vi.hoisted lets the (hoisted) vi.mock factory reference our spy.
const { useRegisterSWMock } = vi.hoisted(() => ({ useRegisterSWMock: vi.fn() }));
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (opts: unknown) => useRegisterSWMock(opts),
}));

import { UpdateBanner } from './UpdateBanner';

let container: HTMLDivElement;
let root: Root;

function render() {
  act(() => { root.render(<UpdateBanner />); });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
});

describe('UpdateBanner', () => {
  it('renders nothing when no update is waiting', () => {
    useRegisterSWMock.mockReturnValue({ needRefresh: [false, vi.fn()], updateServiceWorker: vi.fn() });
    render();
    expect(container.querySelector('[data-testid="update-banner"]')).toBeNull();
  });

  it('shows the banner when an update is waiting', () => {
    useRegisterSWMock.mockReturnValue({ needRefresh: [true, vi.fn()], updateServiceWorker: vi.fn() });
    render();
    expect(container.querySelector('[data-testid="update-banner"]')).not.toBeNull();
  });

  it('"Later" dismisses by clearing needRefresh (no reload)', () => {
    const setNeedRefresh = vi.fn();
    const updateServiceWorker = vi.fn();
    useRegisterSWMock.mockReturnValue({ needRefresh: [true, setNeedRefresh], updateServiceWorker });
    render();
    const later = container.querySelector<HTMLButtonElement>('[data-testid="update-later"]')!;
    act(() => { later.click(); });
    expect(setNeedRefresh).toHaveBeenCalledWith(false);
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });

  it('"Reload" applies the update', () => {
    const updateServiceWorker = vi.fn();
    useRegisterSWMock.mockReturnValue({ needRefresh: [true, vi.fn()], updateServiceWorker });
    render();
    const reload = container.querySelector<HTMLButtonElement>('[data-testid="update-reload"]')!;
    act(() => { reload.click(); });
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
