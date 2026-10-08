import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { scenarios, categoryLabels } from '../../src/scenarios/catalog';
import type { Scenario } from '../../src/types';

async function navigate(page: Page, label: string) {
  await page.getByRole('navigation').getByRole('button', { name: label, exact: true }).click();
}
async function openCase(page: Page, s: Scenario) {
  await navigate(page, categoryLabels[s.category]);
  await page.getByRole('button', { name: `Investigate ${s.title}`, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function solve(page: Page, s: Scenario) {
  for (const tab of ['Sign-ins', 'Audit Logs', 'Devices']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    await page.getByRole('button', { name: 'Cite this evidence', exact: true }).click();
  }
  if (!s.tickets) {
    await page.locator('#classification').selectOption(s.correctClassification);
    for (const action of s.correctActions)
      await page.getByRole('checkbox', { name: action, exact: true }).check();
  } else {
    await page.getByRole('tab', { name: 'Overview', exact: true }).click();
    for (let position = 0; position < s.ticketOrder!.length; position++) {
      const ticket = s.tickets.find((t) => t.id === s.ticketOrder![position])!;
      let currentIndex = await page
        .locator('.ticket-card strong')
        .allTextContents()
        .then((titles) => titles.indexOf(ticket.title));
      while (currentIndex > position) {
        await page.getByRole('button', { name: `Move ${ticket.title} up`, exact: true }).click();
        currentIndex--;
      }
    }
  }
  await page.locator('#principle').selectOption(s.principle);
  await page.locator('#quick-notes').fill('Correlated all sources. <script> is only text.');
  await page.getByRole('button', { name: 'Submit investigation', exact: false }).click();
  await expect(page.locator('.score-ring strong')).toHaveText('100');
  await expect(page.getByText('+100 XP earned', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Why Other Choices Were Wrong', exact: true }),
  ).toBeVisible();
}

test('all 27 scenarios are playable, scoreable, and saved without runtime errors', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  for (const scenario of scenarios) {
    await openCase(page, scenario);
    await solve(page, scenario);
    await page.getByRole('button', { name: 'Back to lab', exact: true }).click();
  }
  await page.reload();
  await navigate(page, 'Dashboard');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total XP' }).locator('.stat-value'),
  ).toHaveText('2,700');
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Cases completed' }).locator('.stat-value'),
  ).toHaveText('27');
  await navigate(page, 'Progress');
  await expect(page.locator('.history-list > button')).toHaveCount(27);
  await page.locator('.history-list > button').first().click();
  await expect(page.getByRole('dialog')).toContainText('Ticket prioritization');
  await expect(page.getByRole('dialog')).toContainText('Privileged mailbox takeover');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  expect(errors).toEqual([]);
});

test('filters, access explorer, references, settings, reset, and assessment mode work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await navigate(page, 'Alert Triage');
  await page.getByLabel('Filter scenario difficulty').selectOption('Expert');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByLabel('Search scenarios').fill('no-such-scenario');
  await expect(page.getByText('No cases match these filters')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await navigate(page, 'Azure / Entra');
  await page.getByRole('button', { name: 'Access path explorer', exact: true }).click();
  await expect(page.locator('.access-explorer')).toContainText('Michael Chen');
  await page.getByLabel('Inspect identity').selectOption('1');
  await page.getByLabel('Access path', { exact: true }).selectOption('1');
  await expect(page.locator('.access-explorer')).toContainText('Nested group');
  await navigate(page, 'Knowledge Center');
  await page.getByLabel('Search knowledge concepts').fill('MFA fatigue');
  await expect(page.locator('.concept-card')).toHaveCount(1);
  await navigate(page, 'Settings');
  await page.getByLabel('Play style').selectOption('Assessment');
  await page.locator('#theme-setting').selectOption('Light');
  await page.getByLabel('Investigation timer').uncheck();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await openCase(page, scenarios[0]);
  await expect(page.locator('.hint')).toHaveCount(0);
  await expect(page.locator('.duration')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit investigation' })).toBeDisabled();
  await solve(page, scenarios[0]);
  await page.getByRole('button', { name: 'Back to lab' }).click();
  await navigate(page, 'Settings');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Keep progress', exact: true }).click();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Reset all progress', exact: true }).click();
  await page.reload();
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Total XP' }).locator('.stat-value'),
  ).toHaveText('0');
  expect(errors).toEqual([]);
});

test('log filters and notes work and desktop/mobile layouts fit the viewport', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'docs/screenshots/dashboard.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await openCase(page, scenarios[0]);
  await page.getByRole('tab', { name: 'Sign-ins', exact: true }).click();
  await page.getByLabel('Search logs by user, IP, or event').fill('no-such-event');
  await expect(page.getByText('No matching events')).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.log-event')).toHaveCount(2);
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await page
    .getByRole('tabpanel', { name: 'Notes' })
    .getByLabel('Investigation notes', { exact: true })
    .fill('A note across tabs');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(page.locator('#quick-notes')).toHaveValue('A note across tabs');
  await page.getByRole('tab', { name: 'Timeline', exact: true }).click();
  await expect(page.locator('.timeline article').first()).toContainText('Historical baseline');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await navigate(page, 'Dashboard');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await navigate(page, 'IAM Administration');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page
    .getByRole('button', {
      name: `Investigate ${scenarios.find((s) => s.category === 'IAM')!.title}`,
    })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('.modal').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
});
