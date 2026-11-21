import { describe, it, expect, beforeEach } from 'vitest';
import * as IH from '../data/store';
import { AnalyticsScreen } from './AnalyticsScreen';
import { mount, byTestId, click } from '../test/render';

beforeEach(async () => {
  await IH.initStore();
  IH.resetSeed();
  IH.addIntention({
    name: 'Run',
    categoryId: null,
    color: 'clay',
    targetEnabled: true,
    targetCompletions: 1,
    targetPeriodDays: 1,
  });
});

const chip = (el: HTMLElement, name: string) =>
  byTestId(el, 'filter-chip').find((c) => c.dataset.filterName === name)!;
const isActive = (c: HTMLElement) => c.style.background === 'var(--ink)';

describe('AnalyticsScreen', () => {
  it('drops back to All when the filtered intention is deleted', () => {
    const view = mount(<AnalyticsScreen version={0} />);
    click(chip(view.container, 'Run'));
    expect(isActive(chip(view.container, 'Run'))).toBe(true);
    expect(view.container.textContent).toContain('Target met');

    IH.deleteIntention(IH.load().intentions[0].id);
    view.rerender(<AnalyticsScreen version={1} />);
    expect(isActive(chip(view.container, 'All'))).toBe(true);
    expect(view.container.textContent).toContain('Targets met');
  });

  it("labels the heatmap with this month's name", () => {
    const { container } = mount(<AnalyticsScreen version={0} />);
    expect(container.textContent).toContain(IH.MONTHS[IH.today().getMonth()]);
  });
});
