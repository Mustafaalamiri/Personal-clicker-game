import { CONFIG } from './config.js';
import {
  enemyHp, goldReward, clickDamage, idleDps, applyDamage, isDead,
  bossHp, bossGold, shouldSpawnBoss, tickTimer, isTimeUp, unlockedAfterBoss, mechanicDamage,
} from './logic.js';
import { createState, loadState, saveState, clearSave } from './state.js';
import { buyUpgrade } from './shop.js';
import { activateClick } from './mechanics/click.js';
import { activateHold } from './mechanics/hold.js';
import { activateDrag } from './mechanics/drag.js';
import { buildShop, buildLevels, render } from './ui.js';

let state = loadState();
let message = '';

const enemyEl = document.getElementById('enemy');
const arenaEl = document.getElementById('arena');
const MECHANICS = { click: activateClick, hold: activateHold, drag: activateDrag };
let deactivateMechanic = null;

const currentLevel = () => CONFIG.levels[state.levelIndex];
const baseClickDamage = () =>
  clickDamage(CONFIG.clickBaseDamage, CONFIG.upgrades.clickPower, state.upgrades.clickPower);

// Scaling uses killsInLevel, which resets after every boss cycle and level switch.
function spawnEnemy() {
  const level = currentLevel();
  state.enemyMaxHp = state.bossActive ? bossHp(level, state.killsInLevel) : enemyHp(level, state.killsInLevel);
  state.enemyHp = state.enemyMaxHp;
}

function startBoss() {
  state.bossActive = true;
  state.bossTimeLeft = currentLevel().bossTimeSec;
  message = 'A boss appears!';
  spawnEnemy();
}

function onEnemyKilled() {
  const level = currentLevel();
  if (state.bossActive) {
    state.gold += bossGold(level, state.killsInLevel);
    const before = state.unlockedLevels;
    state.unlockedLevels = unlockedAfterBoss(state.unlockedLevels, state.levelIndex, CONFIG.levels.length);
    message = state.unlockedLevels > before ? 'Boss defeated! Next level unlocked.' : 'Boss defeated!';
    state.bossActive = false;
    state.killsInLevel = 0;
    spawnEnemy();
  } else {
    state.gold += goldReward(level, state.killsInLevel);
    state.kills += 1;
    state.killsInLevel += 1;
    if (shouldSpawnBoss(state.killsInLevel, level)) startBoss();
    else spawnEnemy();
  }
  saveState(state);
}

function dealDamage(amount) {
  state.enemyHp = applyDamage(state.enemyHp, amount);
  if (isDead(state.enemyHp)) onEnemyKilled();
  render(state, message);
}

// Activate the input mechanic that the current level uses
function setMechanic() {
  if (deactivateMechanic) deactivateMechanic();
  const level = currentLevel();
  const activate = MECHANICS[level.mechanic] || activateClick;
  deactivateMechanic = activate(enemyEl, arenaEl, (multiplier = 1) => {
    dealDamage(mechanicDamage(baseClickDamage(), multiplier));
  }, level);
}

function onBuy(key) {
  if (buyUpgrade(state, key)) {
    saveState(state);
    render(state, message);
  }
}

function switchLevel(i) {
  if (i >= state.unlockedLevels || i === state.levelIndex) return;
  state.levelIndex = i;
  state.killsInLevel = 0;
  state.bossActive = false;
  message = '';
  spawnEnemy();
  setMechanic();
  saveState(state);
  render(state, message);
}

// Game tick: idle damage and boss timer, using real elapsed time (background tabs are throttled)
let lastTick = performance.now();
setInterval(() => {
  const now = performance.now();
  const seconds = Math.min(now - lastTick, 60000) / 1000;
  lastTick = now;

  const dps = idleDps(CONFIG.upgrades.idle, state.upgrades.idle);
  if (dps > 0) dealDamage(dps * seconds);

  if (state.bossActive) {
    state.bossTimeLeft = tickTimer(state.bossTimeLeft, seconds);
    if (isTimeUp(state.bossTimeLeft)) {
      // Gentle failure: no punishment, back to normal enemies until the boss returns
      state.bossActive = false;
      state.killsInLevel = 0;
      message = 'The boss got away. Keep farming and try again.';
      spawnEnemy();
      saveState(state);
    }
  }
  render(state, message);
}, CONFIG.tickMs);

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Reset all progress?')) {
    clearSave();
    state = createState();
    message = '';
    setMechanic();
    render(state, message);
  }
});

buildShop(onBuy);
buildLevels(switchLevel);
setMechanic();
render(state, message);
