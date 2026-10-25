import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG } from '../../js/config.js';
import { createState, saveState } from '../../js/state.js';
import { mountGameDom, pointer } from '../support/dom.js';

const element = (id) => document.getElementById(id);
const saved = () => JSON.parse(localStorage.getItem(CONFIG.saveKey));
const buy = (key) => document.querySelector(`#shop [data-key="${key}"]`);
const select = (index) => document.querySelector(`#levels [data-index="${index}"]`);
const attack = (count = 1) => {
  for (let i = 0; i < count; i++) pointer(element('enemy'));
};

async function boot(overrides) {
  if (overrides) saveState({ ...createState(), ...overrides });
  await import('../../js/main.js');
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  mountGameDom();
});

describe('real application startup and combat', () => {
  it('boots the entry module against the actual HTML and starts one game loop', async () => {
    await boot();
    expect(element('level-name').textContent).toBe(CONFIG.levels[0].name);
    expect(element('shop').children).toHaveLength(2);
    expect(element('levels').children).toHaveLength(2);
    expect(element('hp-text').textContent).toBe('10 / 10 HP');
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(element('hp-text').textContent).toBe('10 / 10 HP');
  });

  it('damages, kills, rewards, spawns the next enemy and persists progress', async () => {
    await boot();
    attack();
    expect(element('hp-text').textContent).toBe('9 / 10 HP');
    attack(9);
    expect(element('kills').textContent).toBe('1');
    expect(element('gold').textContent).toBe('3');
    expect(element('hp-text').textContent).toBe('12 / 12 HP');
    expect(saved()).toMatchObject({ kills: 1, gold: 3, killsInLevel: 1, enemyHp: 12, enemyMaxHp: 12 });
  });

  it('restores saved progress, damage and upgrades on startup', async () => {
    await boot({ gold: 40, kills: 8, enemyHp: 4, upgrades: { clickPower: 2, idle: 0 } });
    expect(element('gold').textContent).toBe('40');
    expect(element('kills').textContent).toBe('8');
    expect(element('click-dmg').textContent).toBe('3');
    attack();
    expect(element('hp-text').textContent).toBe('1 / 10 HP');
  });

  it('recovers from invalid JSON without crashing the application', async () => {
    localStorage.setItem(CONFIG.saveKey, '{not json');
    await boot();
    attack(10);
    expect(saved()).toMatchObject({ kills: 1, gold: 3 });
  });

  it('remains playable when local storage is blocked', async () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('blocked'); });
    }
    await boot();
    attack(10);
    expect(element('kills').textContent).toBe('1');
    expect(element('gold').textContent).toBe('3');
  });

  it('falls back to click input for an unknown level mechanic', async () => {
    const { CONFIG: liveConfig } = await import('../../js/config.js');
    const original = liveConfig.levels[0].mechanic;
    try {
      liveConfig.levels[0].mechanic = 'not-implemented';
      await boot();
      attack();
      expect(element('hp-text').textContent).toBe('9 / 10 HP');
    } finally {
      liveConfig.levels[0].mechanic = original;
    }
  });
});

describe('shop and idle game loop', () => {
  it('buys both upgrades, updates stats and saves the purchases', async () => {
    await boot({ gold: 35 });
    buy('clickPower').click();
    buy('idle').click();
    expect(element('gold').textContent).toBe('0');
    expect(element('click-dmg').textContent).toBe('2');
    expect(element('idle-dps').textContent).toBe('0.5');
    expect(saved()).toMatchObject({ gold: 0, upgrades: { clickPower: 1, idle: 1 } });
    attack();
    expect(element('hp-text').textContent).toBe('8 / 10 HP');
    expect(buy('clickPower').disabled).toBe(true);
    expect(buy('idle').disabled).toBe(true);
  });

  it('guards against unaffordable purchases even if a disabled control receives an event', async () => {
    await boot({ gold: 9 });
    const before = localStorage.getItem(CONFIG.saveKey);
    buy('clickPower').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(element('gold').textContent).toBe('9');
    expect(element('click-dmg').textContent).toBe('1');
    expect(localStorage.getItem(CONFIG.saveKey)).toBe(before);
  });

  it('uses fractional elapsed seconds for idle damage and can kill enemies', async () => {
    await boot({ upgrades: { clickPower: 0, idle: 2 } });
    vi.advanceTimersByTime(100);
    expect(parseFloat(element('hp-fill').style.width)).toBeCloseTo(99);
    vi.advanceTimersByTime(10_000);
    expect(element('kills').textContent).toBe('1');
    expect(element('gold').textContent).toBe('3');
    expect(saved()).toMatchObject({ kills: 1, gold: 3 });
  });

  it('uses elapsed time after a throttled tick and caps it at sixty seconds', async () => {
    await boot({ enemyHp: 1000, enemyMaxHp: 1000, upgrades: { clickPower: 0, idle: 2 } });
    vi.spyOn(performance, 'now').mockReturnValue(120_000);
    vi.advanceTimersByTime(CONFIG.tickMs);
    expect(element('hp-text').textContent).toBe('940 / 1000 HP');
  });
});

describe('boss lifecycle', () => {
  it('spawns the boss at the kill threshold with scaled health and a countdown', async () => {
    await boot({ kills: 9, killsInLevel: 9, enemyHp: 1 });
    attack();
    expect(element('kills').textContent).toBe('10');
    expect(element('enemy').textContent).toBe('👹');
    expect(element('hp-text').textContent).toBe('320 / 320 HP');
    expect(element('boss-info').textContent).toBe('BOSS: 30.0s left');
    expect(element('message').textContent).toBe('A boss appears!');
    expect(saved()).toMatchObject({ bossActive: true, bossTimeLeft: 30, killsInLevel: 10 });
  });

  it('does not expire a newly spawned boss using time elapsed before its spawn', async () => {
    await boot({
      kills: 9, killsInLevel: 9, enemyHp: 30, enemyMaxHp: 35,
      upgrades: { clickPower: 0, idle: 1 },
    });

    // At 0.5 DPS, all sixty elapsed seconds are needed to kill the normal enemy.
    // The boss only spawns at the end of that interval and still has its full timer.
    const now = performance.now();
    vi.spyOn(performance, 'now').mockReturnValue(now + 60_000);
    vi.advanceTimersByTime(CONFIG.tickMs);

    expect(element('kills').textContent).toBe('10');
    expect(saved()).toMatchObject({ bossActive: true, bossTimeLeft: 30, killsInLevel: 10 });
    expect(element('boss-info').textContent).toBe('BOSS: 30.0s left');
    expect(element('hp-text').textContent).toBe('320 / 320 HP');
    expect(element('message').textContent).toBe('A boss appears!');
  });

  it('rewards a boss victory, unlocks the next level and starts a fresh cycle', async () => {
    await boot({ kills: 10, killsInLevel: 10, bossActive: true, bossTimeLeft: 20, enemyHp: 1, enemyMaxHp: 320 });
    attack();
    expect(saved()).toMatchObject({
      gold: 80, unlockedLevels: 2, bossActive: false, killsInLevel: 0, enemyHp: 10, kills: 10,
    });
    expect(select(1).disabled).toBe(false);
    expect(element('message').textContent).toBe('Boss defeated! Next level unlocked.');
    expect(element('boss-info').textContent).toBe('Boss in 10 kills');
  });

  it('does not unlock beyond the last level or announce an existing unlock again', async () => {
    await boot({
      levelIndex: 1, unlockedLevels: 2, killsInLevel: 10,
      bossActive: true, bossTimeLeft: 20, enemyHp: 1,
      upgrades: { clickPower: 0, idle: 20 },
    });
    vi.advanceTimersByTime(200);
    expect(saved()).toMatchObject({ unlockedLevels: 2, bossActive: false, gold: 520 });
    expect(element('message').textContent).toBe('Boss defeated!');
  });

  it('counts down and returns to farming on timeout without removing gold or unlocks', async () => {
    await boot({
      bossActive: true, bossTimeLeft: 0.2, killsInLevel: 10,
      enemyHp: 320, enemyMaxHp: 320, gold: 123, unlockedLevels: 2,
    });
    vi.advanceTimersByTime(100);
    expect(element('boss-info').textContent).toBe('BOSS: 0.1s left');
    vi.advanceTimersByTime(100);
    expect(saved()).toMatchObject({
      bossActive: false, killsInLevel: 0, gold: 123, unlockedLevels: 2, enemyHp: 10,
    });
    expect(element('message').textContent).toBe('The boss got away. Keep farming and try again.');
    expect(element('enemy').textContent).toBe('👾');
  });

  it('lets lethal idle damage defeat the boss before processing its timeout', async () => {
    await boot({
      bossActive: true, bossTimeLeft: 0.1, killsInLevel: 10,
      enemyHp: 1, upgrades: { clickPower: 0, idle: 20 },
    });
    vi.advanceTimersByTime(100);
    expect(saved()).toMatchObject({ gold: 80, unlockedLevels: 2, bossActive: false });
    expect(element('message').textContent).toBe('Boss defeated! Next level unlocked.');
  });
});

describe('level changes and input lifecycle', () => {
  it('ignores locked and already selected levels without resetting the enemy', async () => {
    await boot();
    attack();
    select(0).click();
    select(1).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(element('level-name').textContent).toBe(CONFIG.levels[0].name);
    expect(element('hp-text').textContent).toBe('9 / 10 HP');
  });

  it('switches to hold input, cancels an active boss and preserves shared progress', async () => {
    await boot({ unlockedLevels: 2, gold: 42, kills: 12, bossActive: true, bossTimeLeft: 20, killsInLevel: 10 });
    select(1).click();
    expect(saved()).toMatchObject({
      levelIndex: 1, gold: 42, kills: 12, bossActive: false, killsInLevel: 0, enemyHp: 80,
    });
    expect(element('enemy').classList.contains('hold-mode')).toBe(true);
    expect(element('message').textContent).toBe('');
    attack();
    expect(element('hp-text').textContent).toBe('80 / 80 HP');
    vi.advanceTimersByTime(720);
    expect(element('hp-text').textContent).toBe('72 / 80 HP');
  });

  it('cancels a pending hold on level change and does not duplicate click listeners', async () => {
    await boot({ unlockedLevels: 2 });
    for (let cycle = 0; cycle < 3; cycle++) {
      select(1).click();
      attack();
      vi.advanceTimersByTime(300);
      select(0).click();
      vi.advanceTimersByTime(800);
      expect(element('hp-text').textContent).toBe('10 / 10 HP');
    }
    attack();
    expect(element('hp-text').textContent).toBe('9 / 10 HP');
    expect(element('enemy').classList.contains('hold-mode')).toBe(false);
    expect(element('enemy').style.left).toBe('');
  });
});

describe('reset confirmation', () => {
  it('preserves the current game and save when reset is cancelled', async () => {
    await boot({ gold: 50, kills: 5 });
    const before = localStorage.getItem(CONFIG.saveKey);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    element('reset').click();
    expect(confirm).toHaveBeenCalledExactlyOnceWith('Reset all progress?');
    expect(localStorage.getItem(CONFIG.saveKey)).toBe(before);
    expect(element('gold').textContent).toBe('50');
    expect(element('kills').textContent).toBe('5');
  });

  it('clears progress and pending holds and restores playable click input', async () => {
    await boot({ levelIndex: 1, unlockedLevels: 2, gold: 50, upgrades: { clickPower: 5, idle: 2 } });
    attack();
    vi.advanceTimersByTime(300);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    element('reset').click();
    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem(CONFIG.saveKey)).toBeNull();
    expect(element('gold').textContent).toBe('0');
    expect(element('kills').textContent).toBe('0');
    expect(element('click-dmg').textContent).toBe('1');
    expect(element('idle-dps').textContent).toBe('0');
    expect(element('hp-text').textContent).toBe('10 / 10 HP');
    expect(select(1).disabled).toBe(true);
    expect(element('enemy').classList.contains('hold-mode')).toBe(false);
    attack(10);
    expect(saved()).toMatchObject({ gold: 3, kills: 1 });
    expect(vi.getTimerCount()).toBe(1);
  });
});
