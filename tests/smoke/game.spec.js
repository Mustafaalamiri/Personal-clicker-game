import { test, expect, seedSave, seedRawSave, attack, pauseClock } from './fixtures.js';

test('fresh entry page loads JavaScript, styles, controls and locked progression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Idle Clicker');
  await expect(page.getByRole('heading', { name: 'Level 1: Slime Meadow' })).toBeVisible();
  await expect(page.locator('#hp-text')).toHaveText('10 / 10 HP');
  await expect(page.locator('#gold')).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Level 2 (locked)', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Stronger clicks/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Idle helper/ })).toBeDisabled();
  await expect(page.locator('#enemy')).toHaveCSS('font-size', '96px');
  await expect(page.locator('#enemy')).toHaveCSS('touch-action', 'manipulation');
  await expect(page.locator('#message')).toHaveAttribute('aria-live', 'polite');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('a new player earns gold, buys an upgrade and keeps progress across reload', async ({ page }) => {
  await page.goto('/');
  // Four real enemies, without injecting gold or calling internal game functions.
  await attack(page, 10 + 12 + 13 + 15);
  await expect(page.locator('#kills')).toHaveText('4');
  await expect(page.locator('#gold')).toHaveText('14');
  await page.getByRole('button', { name: /Stronger clicks/ }).click();
  await expect(page.locator('#gold')).toHaveText('4');
  await expect(page.locator('#click-dmg')).toHaveText('2');
  await attack(page);
  await expect(page.locator('#hp-text')).toHaveText('15 / 17 HP');
  await page.reload();
  await expect(page.locator('#kills')).toHaveText('4');
  await expect(page.locator('#gold')).toHaveText('4');
  await expect(page.locator('#click-dmg')).toHaveText('2');
  await expect(page.getByRole('button', { name: /Stronger clicks \(Lv 1\)/ })).toBeVisible();
});

test('boss victory unlocks the hold level and switching back restores click input', async ({ page }) => {
  await pauseClock(page);
  await seedSave(page, {
    kills: 10, killsInLevel: 10, enemyHp: 1, enemyMaxHp: 320,
    bossActive: true, bossTimeLeft: 20,
  });
  await page.goto('/');
  await expect(page.locator('#boss-info')).toHaveText('BOSS: 20.0s left');
  await attack(page);
  await expect(page.locator('#message')).toHaveText('Boss defeated! Next level unlocked.');
  await expect(page.locator('#gold')).toHaveText('80');
  await page.getByRole('button', { name: 'Level 2', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Level 2: Hollow Cave' })).toBeVisible();
  await expect(page.locator('#enemy')).toHaveClass(/hold-mode/);
  await expect(page.locator('#hp-text')).toHaveText('80 / 80 HP');

  // A normal tap/click must not trigger the hold mechanic.
  await attack(page);
  await page.clock.runFor(800);
  await expect(page.locator('#hp-text')).toHaveText('80 / 80 HP');

  // Use browser-level mouse/touch input, not dispatchEvent or internal callbacks.
  const target = await page.locator('#enemy').boundingBox();
  expect(target).not.toBeNull();
  const x = target.x + target.width / 2;
  const y = target.y + target.height / 2;
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  const session = touch ? await page.context().newCDPSession(page) : null;
  if (touch) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
  }
  await page.clock.runFor(720);
  if (touch) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.up();
  }
  await expect(page.locator('#hp-text')).toHaveText('72 / 80 HP');
  const arena = await page.locator('#arena').boundingBox();
  const movedTarget = await page.locator('#enemy').boundingBox();
  expect(movedTarget.x).toBeGreaterThanOrEqual(arena.x);
  expect(movedTarget.y).toBeGreaterThanOrEqual(arena.y);
  expect(movedTarget.x + movedTarget.width).toBeLessThanOrEqual(arena.x + arena.width);
  expect(movedTarget.y + movedTarget.height).toBeLessThanOrEqual(arena.y + arena.height);

  await page.getByRole('button', { name: 'Level 1', exact: true }).click();
  await expect(page.locator('#enemy')).not.toHaveClass(/hold-mode/);
  await attack(page);
  await expect(page.locator('#hp-text')).toHaveText('9 / 10 HP');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Level 2', exact: true })).toBeEnabled();
});

test('idle upgrades damage and kill enemies without player input', async ({ page }) => {
  await pauseClock(page);
  await seedSave(page, { gold: 25 });
  await page.goto('/');
  await page.getByRole('button', { name: /Idle helper/ }).click();
  await expect(page.locator('#idle-dps')).toHaveText('0.5');
  await page.clock.runFor(10_000);
  expect(await page.locator('#hp-fill').evaluate((element) => parseFloat(element.style.width))).toBeCloseTo(50);
  await page.clock.runFor(10_100);
  await expect(page.locator('#kills')).toHaveText('1');
  await expect(page.locator('#gold')).toHaveText('3');
});

test('a boss timeout returns to farming without losing gold', async ({ page }) => {
  await pauseClock(page);
  await seedSave(page, {
    bossActive: true, bossTimeLeft: 0.2, killsInLevel: 10,
    enemyHp: 320, enemyMaxHp: 320, gold: 42,
  });
  await page.goto('/');
  await page.clock.runFor(300);
  await expect(page.locator('#message')).toHaveText('The boss got away. Keep farming and try again.');
  await expect(page.locator('#boss-info')).toHaveText('Boss in 10 kills');
  await expect(page.locator('#hp-text')).toHaveText('10 / 10 HP');
  await expect(page.locator('#gold')).toHaveText('42');
  await page.reload();
  await expect(page.locator('#hp-text')).toHaveText('10 / 10 HP');
  await expect(page.locator('#gold')).toHaveText('42');
});

test('reset can be cancelled or confirmed and the cleared state survives reload', async ({ page }) => {
  await seedSave(page, { gold: 100, kills: 8, unlockedLevels: 2 });
  await page.goto('/');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await expect(page.locator('#gold')).toHaveText('100');
  await expect(page.locator('#kills')).toHaveText('8');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await expect(page.locator('#gold')).toHaveText('0');
  await expect(page.locator('#kills')).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Level 2 (locked)', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.locator('#gold')).toHaveText('0');
  await attack(page);
  await expect(page.locator('#hp-text')).toHaveText('9 / 10 HP');
});

test('invalid saved JSON does not prevent startup or the next save', async ({ page }) => {
  await seedRawSave(page, '{not json');
  await page.goto('/');
  await expect(page.locator('#hp-text')).toHaveText('10 / 10 HP');
  await attack(page, 10);
  await expect(page.locator('#kills')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#kills')).toHaveText('1');
  await expect(page.locator('#gold')).toHaveText('3');
});
