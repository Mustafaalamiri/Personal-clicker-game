import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG } from '../../js/config.js';
import { createState } from '../../js/state.js';
import { buildLevels, buildShop, render } from '../../js/ui.js';
import { mountGameDom } from '../support/dom.js';

const element = (id) => document.getElementById(id);

beforeEach(mountGameDom);

describe('control construction', () => {
  it('builds one shop button per upgrade and passes the selected key', () => {
    const buy = vi.fn();
    buildShop(buy);
    const buttons = [...element('shop').querySelectorAll('button')];
    expect(buttons.map((button) => button.dataset.key)).toEqual(Object.keys(CONFIG.upgrades));
    for (const button of buttons) {
      expect(button.type).toBe('button');
      button.click();
      expect(buy).toHaveBeenLastCalledWith(button.dataset.key);
    }
    expect(buy).toHaveBeenCalledTimes(buttons.length);
  });

  it('builds one level button per level with numeric selection callbacks', () => {
    const select = vi.fn();
    buildLevels(select);
    const buttons = [...element('levels').querySelectorAll('button')];
    expect(buttons).toHaveLength(CONFIG.levels.length);
    buttons.forEach((button, index) => {
      expect(button.type).toBe('button');
      button.click();
      expect(select).toHaveBeenLastCalledWith(index);
    });
  });

  it('rebuilds controls without duplicating buttons or callbacks', () => {
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    buildShop(oldCallback);
    buildShop(newCallback);
    buildLevels(oldCallback);
    buildLevels(newCallback);
    expect(element('shop').children).toHaveLength(Object.keys(CONFIG.upgrades).length);
    expect(element('levels').children).toHaveLength(CONFIG.levels.length);
    element('shop').firstElementChild.click();
    element('levels').firstElementChild.click();
    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalledTimes(2);
  });
});

describe('state rendering', () => {
  beforeEach(() => {
    buildShop(vi.fn());
    buildLevels(vi.fn());
  });

  it('renders a new game, locked levels and unaffordable upgrades', () => {
    render(createState());
    expect(element('level-name').textContent).toBe(CONFIG.levels[0].name);
    expect(element('gold').textContent).toBe('0');
    expect(element('kills').textContent).toBe('0');
    expect(element('click-dmg').textContent).toBe('1');
    expect(element('idle-dps').textContent).toBe('0');
    expect(element('hp-text').textContent).toBe('10 / 10 HP');
    expect(element('hp-fill').style.width).toBe('100%');
    expect(element('enemy').textContent).toBe('👾');
    expect(element('message').textContent).toBe('');
    expect(element('boss-info').textContent).toBe('Boss in 10 kills');
    const levels = element('levels').querySelectorAll('button');
    expect(levels[0].disabled).toBe(false);
    expect(levels[0].classList.contains('current')).toBe(true);
    expect(levels[1].disabled).toBe(true);
    expect(levels[1].textContent).toBe('Level 2 (locked)');
    expect([...element('shop').children].every((button) => button.disabled)).toBe(true);
  });

  it('updates rounded numbers, health, affordability, unlocks and the current level', () => {
    const state = {
      ...createState(), levelIndex: 1, unlockedLevels: 2, gold: 30.9, kills: 7,
      enemyHp: 4.1, enemyMaxHp: 10, killsInLevel: 4,
      upgrades: { clickPower: 2, idle: 3 },
    };
    render(state, 'Keep going');
    expect(element('gold').textContent).toBe('30');
    expect(element('kills').textContent).toBe('7');
    expect(element('click-dmg').textContent).toBe('3');
    expect(element('idle-dps').textContent).toBe('1.5');
    expect(element('hp-text').textContent).toBe('5 / 10 HP');
    expect(parseFloat(element('hp-fill').style.width)).toBeCloseTo(41);
    expect(element('message').textContent).toBe('Keep going');
    expect(element('boss-info').textContent).toBe('Boss in 6 kills');
    const levels = element('levels').querySelectorAll('button');
    expect(levels[0].classList.contains('current')).toBe(false);
    expect(levels[1].classList.contains('current')).toBe(true);
    expect(levels[1].disabled).toBe(false);
    expect(levels[1].textContent).toBe('Level 2');
    expect(element('shop').querySelector('[data-key="clickPower"]').disabled).toBe(false);
    expect(element('shop').querySelector('[data-key="idle"]').disabled).toBe(true);
    expect(element('shop').firstElementChild.textContent).toBe('Stronger clicks (Lv 2): +1 damage per click. Cost: 14');
  });

  it('enables buying at the exact price', () => {
    render({ ...createState(), gold: 10 });
    expect(element('shop').querySelector('[data-key="clickPower"]').disabled).toBe(false);
  });

  it('renders the boss countdown and returns to the normal display afterwards', () => {
    const state = { ...createState(), bossActive: true, bossTimeLeft: 12.34 };
    render(state, 'A boss appears!');
    expect(element('enemy').textContent).toBe('👹');
    expect(element('boss-info').textContent).toBe('BOSS: 12.3s left');
    render(createState());
    expect(element('enemy').textContent).toBe('👾');
    expect(element('message').textContent).toBe('');
  });

  it('does not show a negative number of kills until the boss', () => {
    render({ ...createState(), killsInLevel: 11 });
    expect(element('boss-info').textContent).toBe('Boss in 0 kills');
  });

  it('treats messages as text rather than HTML', () => {
    render(createState(), '<img src=x onerror=alert(1)>');
    expect(element('message').querySelector('img')).toBeNull();
    expect(element('message').textContent).toBe('<img src=x onerror=alert(1)>');
  });
});
