// Every game number lives here. Tune the game without touching the logic.
export const CONFIG = {
  tickMs: 100,          // idle damage tick
  saveKey: 'idleClickerSave_v1',
  clickBaseDamage: 1,

  // mechanic: which input this level uses ('click', 'hold' or 'drag').
  // dragDamageMultiplier = damage multiplier for a fully completed drag (partial drags scale down).
  // holdMs = how long to hold the target; holdDamageMultiplier = damage of one completed hold vs one click.
  levels: [
    { name: 'Level 1: Slime Meadow', mechanic: 'click', enemyBaseHp: 10, hpGrowth: 1.15, goldBase: 3, goldGrowth: 1.1,
      killsBeforeBoss: 10, bossHpMultiplier: 8, bossTimeSec: 30, bossGoldMultiplier: 10 },
    { name: 'Level 2: Hollow Cave', mechanic: 'hold', holdMs: 350, holdDamageMultiplier: 8, enemyBaseHp: 80, hpGrowth: 1.15, goldBase: 20, goldGrowth: 1.1,
      killsBeforeBoss: 10, bossHpMultiplier: 8, bossTimeSec: 30, bossGoldMultiplier: 10 },
    { name: 'Level 3: Crystal Peak', mechanic: 'drag', dragDamageMultiplier: 12, dragTolerancePx: 28, enemyBaseHp: 640, hpGrowth: 1.15, goldBase: 160, goldGrowth: 1.1,
      killsBeforeBoss: 10, bossHpMultiplier: 8, bossTimeSec: 40, bossGoldMultiplier: 10 },
  ],

  upgrades: {
    clickPower: { label: 'Stronger clicks', baseCost: 10, costGrowth: 1.15, perLevel: 1, desc: '+1 damage per click' },
    idle:       { label: 'Idle helper',     baseCost: 25, costGrowth: 1.15, perLevel: 0.5, desc: '+0.5 damage per second' },
  },
};
