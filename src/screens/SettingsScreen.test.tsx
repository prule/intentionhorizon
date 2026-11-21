import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from 'react';
import * as IH from '../data/store';
import { SettingsScreen } from './SettingsScreen';
import { mount, byTestId, click } from '../test/render';

const intention = (name: string, categoryId: string | null): IH.IntentionInput => ({
  name,
  categoryId,
  color: 'clay',
  targetEnabled: false,
  targetCompletions: 3,
  targetPeriodDays: 7,
});

beforeEach(async () => {
  await IH.initStore();
  IH.resetSeed();
  IH.addCategory('Health');
  IH.addCategory('Mind');
  const [health] = IH.load().categories;
  IH.addIntention(intention('Run', health.id));
  IH.addIntention({ ...intention('Swim', health.id), targetEnabled: true });
  IH.addIntention(intention('Loose', null));
});

function renderScreen() {
  let version = 0;
  const view = mount(<SettingsScreen version={0} bump={() => {}} openGuide={() => {}} />);
  const bump = () =>
    view.rerender(<SettingsScreen version={++version} bump={bump} openGuide={() => {}} />);
  bump();
  return view.container;
}

// Editors render in a Sheet portalled to document.body, outside the container.
afterEach(() => vi.unstubAllGlobals());

// Drags a grip downward; jsdom lays every row out at height 0, so any downward
// drag lands the row last.
async function dragDown(grip: HTMLElement) {
  const fire = (type: string, clientY: number) =>
    act(() => {
      grip.dispatchEvent(new PointerEvent(type, { bubbles: true, clientY }));
    });
  fire('pointerdown', 0);
  fire('pointermove', 100);
  fire('pointerup', 100);
  await act(async () => {}); // onReorder runs in a microtask
}

const value = (id: string) => (byTestId(document, id)[0] as HTMLInputElement | undefined)?.value;
const named = (el: HTMLElement, id: string, attr: string, name: string) =>
  byTestId(el, id).find((n) => n.getAttribute(attr) === name)!;

describe('SettingsScreen', () => {
  it('lists each category, plus Uncategorized for intentions without one', () => {
    const el = renderScreen();
    expect(byTestId(el, 'category-section').map((s) => s.dataset.categoryName)).toEqual([
      'Health',
      'Mind',
      'Uncategorized',
    ]);
  });

  it('opens the category editor filled with that category', () => {
    const el = renderScreen();
    click(named(el, 'category-edit', 'data-category-name', 'Mind'));
    expect(value('category-name')).toBe('Mind');
  });

  it('refills the intention editor for each intention, and blanks it for a new one', () => {
    const el = renderScreen();
    click(named(el, 'settings-intention', 'data-intention-name', 'Run'));
    expect(value('intention-name')).toBe('Run');
    click(named(el, 'settings-intention', 'data-intention-name', 'Swim'));
    expect(value('intention-name')).toBe('Swim');
    click(byTestId(el, 'add-intention')[0]);
    expect(value('intention-name')).toBe('');
  });

  it('shows a target badge only on intentions with a target', () => {
    const el = renderScreen();
    expect(byTestId(el, 'target-badge').map((b) => b.dataset.intentionName)).toEqual(['Swim']);
  });

  it('reorders categories by dragging the grip', async () => {
    const el = renderScreen();
    const grip = named(el, 'category-section', 'data-category-name', 'Health')
      .firstElementChild as HTMLElement;
    await dragDown(grip);
    expect(IH.load().categories.map((c) => c.name)).toEqual(['Mind', 'Health']);
  });

  it('reorders intentions within a category by dragging the grip', async () => {
    const el = renderScreen();
    const grip = named(el, 'settings-intention', 'data-intention-name', 'Run')
      .previousElementSibling as HTMLElement;
    await dragDown(grip);
    expect(IH.load().intentions.map((i) => i.name)).toEqual(['Swim', 'Run', 'Loose']);
  });

  it('imports a CSV after confirmation and reports what was added', async () => {
    vi.stubGlobal('confirm', () => true);
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    const el = renderScreen();
    const input = byTestId(el, 'import-csv-input')[0] as HTMLInputElement;
    const csv = 'date,category,intention,completed\n2026-01-01,Work,Ship,true\n';
    Object.defineProperty(input, 'files', { value: [new File([csv], 'in.csv')] });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await vi.waitFor(() => expect(alert).toHaveBeenCalled());
    expect(alert.mock.calls[0][0]).toMatch(/^Import complete\. Added 1 category, 1 intention/);
    expect(named(el, 'category-section', 'data-category-name', 'Work')).toBeTruthy();
  });

  it('reports a failed import without changing anything', async () => {
    vi.stubGlobal('confirm', () => true);
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    const el = renderScreen();
    const input = byTestId(el, 'import-csv-input')[0] as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [new File(['nonsense'], 'in.csv')] });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await vi.waitFor(() => expect(alert).toHaveBeenCalled());
    expect(alert.mock.calls[0][0]).toMatch(/^Import failed/);
  });
});
