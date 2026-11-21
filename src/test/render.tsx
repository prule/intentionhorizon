// Minimal React mount for component tests (same createRoot + act pattern as
// UpdateBanner.test.tsx), so tests share one cleanup path.
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: { root: Root; container: HTMLElement }[] = [];

export function mount(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  mounted.push({ root, container });
  return {
    container,
    rerender: (next: React.ReactElement) => act(() => root.render(next)),
  };
}

export const byTestId = (el: ParentNode, id: string) =>
  Array.from(el.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`));

export const click = (el: Element) =>
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

afterEach(() => {
  for (const { root, container } of mounted.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});
