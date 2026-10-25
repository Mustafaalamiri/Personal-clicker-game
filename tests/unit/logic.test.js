// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as logic from '../../js/logic.js';

const level = {
  enemyBaseHp: 10, hpGrowth: 1.15, goldBase: 3, goldGrowth: 1.1,
  killsBeforeBoss: 10, bossHpMultiplier: 8, bossGoldMultiplier: 10,
};
const upgrade = { baseCost: 10, costGrowth: 1.15, perLevel: 0.5 };

describe('enemy and upgrade scaling', () => {
  it.each([[0, 10], [1, 12], [2, 13], [10, 40]])('enemy %i has %i HP', (index, hp) => {
    expect(logic.enemyHp(level, index)).toBe(hp);
  });

  it.each([[0, 3], [1, 3], [2, 4], [10, 8]])('enemy %i rewards %i gold', (index, gold) => {
    expect(logic.goldReward(level, index)).toBe(gold);
  });

  it.each([[0, 10], [1, 12], [2, 14], [3, 16]])('upgrade %i costs %i (rounded up)', (owned, cost) => {
    expect(logic.upgradeCost(upgrade, owned)).toBe(cost);
  });

  it('adds click upgrades to the base damage without rounding fractions', () => {
    expect(logic.clickDamage(1, upgrade, 0)).toBe(1);
    expect(logic.clickDamage(1, upgrade, 3)).toBe(2.5);
  });

  it('has no idle damage before buying an upgrade', () => {
    expect(logic.idleDps(upgrade, 0)).toBe(0);
    expect(logic.idleDps(upgrade, 3)).toBe(1.5);
  });
});

describe('combat boundaries', () => {
  it.each([[10, 0, 10], [10, 3, 7], [10, 0.5, 9.5], [5, 5, 0], [5, 100, 0]])(
    '%s HP minus %s damage gives %s HP', (hp, damage, expected) => {
      expect(logic.applyDamage(hp, damage)).toBe(expected);
    },
  );

  it.each([[0, true], [-1, true], [0.1, false]])('isDead(%s) is %s', (hp, expected) => {
    expect(logic.isDead(hp)).toBe(expected);
  });

  it.each([[9, 10, false], [10, 10, true], [11, 10, true], [0, 0, true]])(
    'affordability for %s gold and %s cost is %s', (gold, cost, expected) => {
      expect(logic.canAfford(gold, cost)).toBe(expected);
    },
  );

  it.each([[3, 8, 24], [5, 1, 5], [0, 8, 0]])('action damage %s × %s = %s', (base, multiplier, expected) => {
    expect(logic.mechanicDamage(base, multiplier)).toBe(expected);
  });
});

describe('boss progression', () => {
  it('applies boss multipliers to the rounded normal enemy values', () => {
    expect(logic.bossHp(level, 1)).toBe(96);
    expect(logic.bossGold(level, 2)).toBe(40);
  });

  it.each([[9, false], [10, true], [11, true]])('spawns a boss after %i kills: %s', (kills, expected) => {
    expect(logic.shouldSpawnBoss(kills, level)).toBe(expected);
  });

  it.each([[10, 2.5, 7.5], [1, 1, 0], [1, 5, 0], [0, 1, 0]])(
    'timer %s minus %s seconds is %s', (remaining, elapsed, expected) => {
      expect(logic.tickTimer(remaining, elapsed)).toBe(expected);
    },
  );

  it.each([[0, true], [-1, true], [0.1, false]])('isTimeUp(%s) is %s', (remaining, expected) => {
    expect(logic.isTimeUp(remaining)).toBe(expected);
  });

  it.each([[1, 0, 3, 2], [3, 0, 3, 3], [3, 2, 3, 3], [1, 0, 1, 1]])(
    'unlocks levels without losing unlocks or exceeding the level count', (unlocked, index, total, expected) => {
      expect(logic.unlockedAfterBoss(unlocked, index, total)).toBe(expected);
    },
  );
});
