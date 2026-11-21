import { describe, it, expect } from 'vitest';
import { ConsentBanner } from './ConsentBanner';
import { setConsent, getStoredConsent } from '../consent';
import { mount, byTestId, click } from '../test/render';

describe('ConsentBanner', () => {
  it('shows on first run and hides once a choice is made', () => {
    const { container } = mount(<ConsentBanner />);
    expect(byTestId(container, 'consent-banner')).toHaveLength(1);
    click(byTestId(container, 'consent-accept')[0]);
    expect(byTestId(container, 'consent-banner')).toHaveLength(0);
    expect(getStoredConsent()).toBe('granted');
  });

  it('stays hidden when a choice is already stored', () => {
    setConsent('denied');
    const { container } = mount(<ConsentBanner />);
    expect(byTestId(container, 'consent-banner')).toHaveLength(0);
  });
});
