import { describe, it, expect } from '../fixtures';
import { Ensure, contain, includes, not } from '@serenity-js/assertions';
import { Click, ModalDialog } from '@serenity-js/web';
import { GoToTab } from '../tasks';
import { byTestId } from '../elements';
import { IntentionList, CategoryList } from '../questions';

/**
 * CSV import. The export format is lossy (only completed rows; names, not ids),
 * so these specs exercise it end-to-end through the real UI.
 *
 * Two Playwright-level details: the hidden file input is driven with
 * setInputFiles (file upload has no screenplay vocabulary), and the app's native
 * confirm()/alert() dialogs are handled with Serenity's ModalDialog — the actor
 * dismisses dialogs by default, so each confirm must be armed with acceptNext().
 * Import is async, so post-import checks use Ensure.eventually to let it settle.
 */
describe('Importing data from CSV', () => {
  it('round-trips: export, clear, then import restores logged intentions', async ({ actor, page }) => {
    await actor.attemptsTo(GoToTab.to('settings'));

    // Capture the real export. Default seed: "Read" has 3 completed days in
    // category "Health"; "Workout" has none, so it is absent from the export.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-csv').click(),
    ]);
    const csv = await readDownload(download);
    expect(csv).toContain('Read');

    // Wipe the Real source (confirm accepted), then confirm the data is gone.
    await actor.attemptsTo(
      ModalDialog.acceptNext(),
      Click.on(byTestId('clear-data')),
      GoToTab.to('entry'),
      Ensure.eventually(IntentionList.names(), not(contain('Read'))),
    );

    // Import the captured CSV; Read (and its Health category) come back.
    await actor.attemptsTo(GoToTab.to('settings'), ModalDialog.acceptNext());
    await page.getByTestId('import-csv-input').setInputFiles({
      name: 'export.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
    });
    await actor.attemptsTo(
      Ensure.eventually(CategoryList.names(), contain('Health')),
      GoToTab.to('entry'),
      Ensure.eventually(IntentionList.names(), contain('Read')),
    );
  });

  it('merges by name without duplicating existing items', async ({ actor, page }) => {
    // New intention in a new category, plus an extra completed day for the
    // already-seeded "Read" — must not create a second "Read".
    // The "BadDate" row has an unparseable date and must be dropped, so no
    // such intention is ever created.
    const csv = [
      'date,category,intention,completed',
      '2026-01-01,Wellness,Yoga,1',
      '2026-01-01,Health,Read,1',
      '2026-13-99,Health,BadDate,1',
    ].join('\n');

    await actor.attemptsTo(GoToTab.to('settings'), ModalDialog.acceptNext());
    await page.getByTestId('import-csv-input').setInputFiles({
      name: 'merge.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
    });

    await actor.attemptsTo(
      Ensure.eventually(CategoryList.names(), contain('Wellness')),
      GoToTab.to('entry'),
      Ensure.eventually(IntentionList.names(), contain('Yoga')),
      Ensure.that(IntentionList.names(), contain('Read')),
      Ensure.that(IntentionList.names(), not(contain('BadDate'))),
    );
    // exactly one "Read" row — the merge must not duplicate the seeded one
    const readRows = await page
      .locator('[data-testid="intention-row"][data-intention-name="Read"]').count();
    expect(readRows).toBe(1);
  });

  it('rejects an invalid file and leaves data untouched', async ({ actor, page }) => {
    // Header is missing the required "completed" column.
    const csv = ['date,category,intention', '2026-01-01,Health,Read'].join('\n');

    await actor.attemptsTo(GoToTab.to('settings'), ModalDialog.acceptNext());
    await page.getByTestId('import-csv-input').setInputFiles({
      name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
    });

    await actor.attemptsTo(
      // the failure surfaces as an alert dialog
      Ensure.eventually(ModalDialog.lastDialogMessage(), includes('Import failed')),
      // seed data survives the failed import
      GoToTab.to('entry'),
      Ensure.that(IntentionList.names(), contain('Read')),
    );
  });
});

/** Collect a Playwright download into a UTF-8 string. */
async function readDownload(download: import('@playwright/test').Download): Promise<string> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
}
