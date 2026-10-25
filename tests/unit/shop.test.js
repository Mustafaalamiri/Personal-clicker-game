// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../js/config.js';
import { buyUpgrade, costOf } from '../../js/shop.js';
import { createState } from '../../js/state.js';

describe.each(Object.keys(CONFIG.upgrades))('%s purchases', (key) => {
  it('starts at the configured base cost', () => {
    expect(costOf(createState(), key)).toBe(CONFIG.upgrades[key].baseCost);
  });

  it('rejects an unaffordable purchase without mutating state', () => {
    const state = createState();
    state.gold = costOf(state, key) - 1;
    const before = structuredClone(state);
    expect(buyUpgrade(state, key)).toBe(false);
    expect(state).toEqual(before);
  });

  it('accepts the exact price and upgrades only the selected item', () => {
    const state = createState();
    state.gold = costOf(state, key);
    const before = structuredClone(state);
    expect(buyUpgrade(state, key)).toBe(true);
    expect(state).toEqual({
      ...before, gold: 0,
      upgrades: { ...before.upgrades, [key]: 1 },
    });
  });

  it('deducts the growing cost exactly once on every purchase', () => {
    const state = createState();
    state.gold = 1000;
    let spent = 0;
    for (let owned = 0; owned < 5; owned++) {
      const expected = Math.ceil(CONFIG.upgrades[key].baseCost * CONFIG.upgrades[key].costGrowth ** owned);
      expect(costOf(state, key)).toBe(expected);
      expect(buyUpgrade(state, key)).toBe(true);
      spent += expected;
      expect(state.gold).toBe(1000 - spent);
      expect(state.upgrades[key]).toBe(owned + 1);
    }
  });
});
