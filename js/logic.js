// Pure functions only: no DOM, no state access. Easy to test.
export function enemyHp(level, index) {
  return Math.round(level.enemyBaseHp * Math.pow(level.hpGrowth, index));
}
export function goldReward(level, index) {
  return Math.round(level.goldBase * Math.pow(level.goldGrowth, index));
}
export function upgradeCost(def, owned) {
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, owned));
}
export function clickDamage(baseDamage, def, owned) {
  return baseDamage + def.perLevel * owned;
}
export function idleDps(def, owned) {
  return def.perLevel * owned;
}
export function applyDamage(hp, damage) {
  return Math.max(0, hp - damage);
}
export function isDead(hp) {
  return hp <= 0;
}
export function canAfford(gold, cost) {
  return gold >= cost;
}

// --- Boss and level progression ---
export function bossHp(level, index) {
  return Math.round(enemyHp(level, index) * level.bossHpMultiplier);
}
export function bossGold(level, index) {
  return goldReward(level, index) * level.bossGoldMultiplier;
}
export function shouldSpawnBoss(killsInLevel, level) {
  return killsInLevel >= level.killsBeforeBoss;
}
export function tickTimer(timeLeft, seconds) {
  return Math.max(0, timeLeft - seconds);
}
export function isTimeUp(timeLeft) {
  return timeLeft <= 0;
}
// How many levels are unlocked after beating the boss of levelIndex.
export function unlockedAfterBoss(unlocked, levelIndex, totalLevels) {
  return Math.min(totalLevels, Math.max(unlocked, levelIndex + 2));
}

// Damage of one valid action: base click damage times the mechanic's multiplier.
export function mechanicDamage(baseDamage, multiplier) {
  return baseDamage * multiplier;
}

// --- Drag mechanic geometry ---
// How far along segment a->b the point p is (0 to 1, clamped).
export function segmentProgress(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return 0;
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return Math.min(1, Math.max(0, t));
}
// Shortest distance from point p to the segment a->b.
export function distanceToSegment(p, a, b) {
  const t = segmentProgress(p, a, b);
  return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
}
// Damage multiplier of a drag that reached the given progress (0 to 1).
export function dragMultiplier(fullMultiplier, progress) {
  return fullMultiplier * Math.min(1, Math.max(0, progress));
}

// Drag feedback: below DRAG_MIN_PROGRESS nothing counts, from DRAG_FULL_PROGRESS on it counts as complete.
export const DRAG_MIN_PROGRESS = 0.1;
export const DRAG_FULL_PROGRESS = 0.9;
export function dragEffectiveProgress(progress) {
  if (progress < DRAG_MIN_PROGRESS) return 0;
  if (progress >= DRAG_FULL_PROGRESS) return 1;
  return progress;
}
// 'none' | 'low' | 'mid' | 'full', used to colour the trail
export function dragTier(progress) {
  const e = dragEffectiveProgress(progress);
  if (e === 0) return 'none';
  if (e === 1) return 'full';
  return e < 0.5 ? 'low' : 'mid';
}
