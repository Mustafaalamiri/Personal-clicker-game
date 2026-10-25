import { describe, expect, it, vi } from 'vitest';
import { CONFIG } from '../../js/config.js';
import { clearSave, createState, loadState, saveState } from '../../js/state.js';

describe('new game state', () => {
  it('starts with one unlocked level, a healthy enemy and no progress', () => {
    expect(createState()).toEqual({
      levelIndex: 0, unlockedLevels: 1,
      enemyIndex: 0, killsInLevel: 0,
      enemyHp: 10, enemyMaxHp: 10,
      bossActive: false, bossTimeLeft: 0,
      gold: 0, kills: 0,
      upgrades: { clickPower: 0, idle: 0 },
    });
  });

  it('does not share mutable upgrade objects between games', () => {
    const first = createState();
    first.upgrades.idle = 5;
    expect(createState().upgrades.idle).toBe(0);
  });
});

describe('save persistence', () => {
  it('returns a fresh state without a save', () => {
    expect(loadState()).toEqual(createState());
  });

  it('round-trips progress, upgrades, level and an active boss', () => {
    const state = {
      ...createState(), gold: 42, kills: 15, levelIndex: 1, unlockedLevels: 2,
      enemyHp: 50, enemyMaxHp: 640, bossActive: true, bossTimeLeft: 12.5,
      upgrades: { clickPower: 3, idle: 2 },
    };
    saveState(state);
    expect(JSON.parse(localStorage.getItem(CONFIG.saveKey))).toEqual(state);
    expect(loadState()).toEqual(state);
    expect(loadState()).not.toBe(state);
  });

  it('fills missing top-level fields with the initial defaults', () => {
    localStorage.setItem(CONFIG.saveKey, JSON.stringify({ gold: 17, kills: 2 }));
    expect(loadState()).toEqual({ ...createState(), gold: 17, kills: 2 });
  });

  it.each(['{broken', '', 'undefined'])('recovers from an unreadable save: %s', (raw) => {
    localStorage.setItem(CONFIG.saveKey, raw);
    expect(loadState()).toEqual(createState());
  });

  it('clears only this game, not unrelated local storage', () => {
    saveState({ ...createState(), gold: 99 });
    localStorage.setItem('other-app', 'keep me');
    clearSave();
    expect(localStorage.getItem(CONFIG.saveKey)).toBeNull();
    expect(localStorage.getItem('other-app')).toBe('keep me');
    expect(loadState()).toEqual(createState());
  });

  it.each(['getItem', 'setItem', 'removeItem'])('tolerates unavailable storage during %s', (method) => {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    });
    expect(() => saveState(createState())).not.toThrow();
    expect(loadState()).toEqual(createState());
    expect(() => clearSave()).not.toThrow();
  });

  it('does not throw when serialization fails', () => {
    const state = createState();
    state.self = state;
    expect(() => saveState(state)).not.toThrow();
    expect(localStorage.getItem(CONFIG.saveKey)).toBeNull();
  });
});
