// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../../js/config.js';

describe('playable configuration', () => {
  it('has a stable save key, positive tick interval and click damage', () => {
    expect(CONFIG.saveKey).toBe('idleClickerSave_v1');
    expect(CONFIG.tickMs).toBeGreaterThan(0);
    expect(CONFIG.clickBaseDamage).toBeGreaterThan(0);
    expect(CONFIG.levels.length).toBeGreaterThan(0);
  });

  it.each(CONFIG.levels)('$name has a supported mechanic and valid combat values', (level) => {
    expect(level.name).toBeTruthy();
    expect(['click', 'hold']).toContain(level.mechanic);
    for (const key of ['enemyBaseHp', 'goldBase', 'killsBeforeBoss', 'bossTimeSec']) {
      expect(Number.isFinite(level[key])).toBe(true);
      expect(level[key]).toBeGreaterThan(0);
    }
    for (const key of ['hpGrowth', 'goldGrowth', 'bossHpMultiplier', 'bossGoldMultiplier']) {
      expect(level[key]).toBeGreaterThanOrEqual(1);
    }
    expect(Number.isInteger(level.killsBeforeBoss)).toBe(true);
    if (level.mechanic === 'hold') {
      expect(level.holdMs).toBeGreaterThan(0);
      expect(level.holdDamageMultiplier).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(Object.entries(CONFIG.upgrades))('%s has valid shop values', (_, upgrade) => {
    expect(upgrade.label).toBeTruthy();
    expect(upgrade.desc).toBeTruthy();
    expect(upgrade.baseCost).toBeGreaterThan(0);
    expect(upgrade.costGrowth).toBeGreaterThanOrEqual(1);
    expect(upgrade.perLevel).toBeGreaterThan(0);
  });
});
