import { test as base, expect } from '@playwright/test';
import { CONFIG } from '../../js/config.js';
import { createState } from '../../js/state.js';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`JavaScript: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`Console: ${message.text()}`);
    });
    page.on('requestfailed', (request) => {
      errors.push(`Network: ${request.url()} (${request.failure()?.errorText})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    await use(page);
    expect(errors, 'The game must not emit browser errors or fail to load assets').toEqual([]);
  },
});

export { expect };

export async function seedSave(page, overrides) {
  const state = { ...createState(), ...overrides };
  await seedRawSave(page, JSON.stringify(state));
}

export async function seedRawSave(page, raw) {
  await page.addInitScript(({ key, raw }) => {
    // Seed only the first navigation, so reloads exercise real persistence.
    if (!sessionStorage.getItem('smoke-save-seeded')) {
      localStorage.setItem(key, raw);
      sessionStorage.setItem('smoke-save-seeded', 'true');
    }
  }, { key: CONFIG.saveKey, raw });
}

export async function attack(page, count = 1) {
  const enemy = page.getByRole('button', { name: 'Enemy, click to attack' });
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  for (let i = 0; i < count; i++) {
    if (touch) await enemy.tap();
    else await enemy.click();
  }
}

export async function pauseClock(page) {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T12:00:01Z'));
}
