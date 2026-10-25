import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateClick } from '../../js/mechanics/click.js';
import { activateHold } from '../../js/mechanics/hold.js';
import { pointer } from '../support/dom.js';

let arena;
let enemy;
let deactivate;

beforeEach(() => {
  document.body.innerHTML = '<div id="arena"><button id="enemy"></button></div>';
  arena = document.getElementById('arena');
  enemy = document.getElementById('enemy');
  Object.defineProperties(arena, {
    clientWidth: { value: 320, configurable: true },
    clientHeight: { value: 260, configurable: true },
  });
  Object.defineProperties(enemy, {
    offsetWidth: { value: 110 },
    offsetHeight: { value: 110 },
  });
});

afterEach(() => {
  deactivate?.();
  deactivate = null;
});

describe('click input', () => {
  it.each(['mouse', 'touch', 'pen'])('accepts primary %s input once per action', (pointerType) => {
    const action = vi.fn();
    deactivate = activateClick(enemy, arena, action);
    enemy.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerType }));
    pointer(enemy, 'pointerup');
    expect(action).toHaveBeenCalledExactlyOnceWith(1);
  });

  it.each([1, 2])('ignores mouse button %i', (button) => {
    const action = vi.fn();
    deactivate = activateClick(enemy, arena, action);
    pointer(enemy, 'pointerdown', button);
    expect(action).not.toHaveBeenCalled();
  });

  it('removes its listener and does not accumulate attacks on reactivation', () => {
    const action = vi.fn();
    deactivate = activateClick(enemy, arena, action);
    deactivate();
    pointer(enemy);
    expect(action).not.toHaveBeenCalled();
    deactivate = activateClick(enemy, arena, action);
    pointer(enemy);
    expect(action).toHaveBeenCalledExactlyOnceWith(1);
  });
});

describe('hold input', () => {
  const level = { holdMs: 64, holdDamageMultiplier: 8 };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('enables hold styling and positions the target inside the arena', () => {
    deactivate = activateHold(enemy, arena, vi.fn(), level);
    expect(arena.classList.contains('hold-arena')).toBe(true);
    expect(enemy.classList.contains('hold-mode')).toBe(true);
    expect(enemy.style.left).toBe('105px');
    expect(enemy.style.top).toBe('75px');
  });

  it('clamps movement when the target is larger than the arena', () => {
    Object.defineProperties(arena, { clientWidth: { value: 50 }, clientHeight: { value: 50 } });
    deactivate = activateHold(enemy, arena, vi.fn(), level);
    expect(enemy.style.left).toBe('0px');
    expect(enemy.style.top).toBe('0px');
  });

  it('reports progress but deals no damage before the hold is complete', () => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy);
    vi.advanceTimersByTime(32);
    expect(enemy.style.getPropertyValue('--hold')).toBe('50');
    expect(action).not.toHaveBeenCalled();
  });

  it('deals multiplied damage exactly once, resets progress and moves the target', () => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    vi.mocked(Math.random).mockReturnValue(0.25);
    pointer(enemy);
    vi.advanceTimersByTime(64);
    expect(action).toHaveBeenCalledExactlyOnceWith(8);
    expect(enemy.style.getPropertyValue('--hold')).toBe('0');
    expect(enemy.style.left).toBe('52.5px');
    expect(enemy.style.top).toBe('37.5px');
    vi.advanceTimersByTime(1000);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it.each(['pointerup', 'pointerleave', 'pointercancel'])('cancels an incomplete hold on %s', (event) => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy);
    vi.advanceTimersByTime(32);
    pointer(enemy, event);
    vi.advanceTimersByTime(128);
    expect(action).not.toHaveBeenCalled();
    expect(enemy.style.getPropertyValue('--hold')).toBe('0');
  });

  it('can start a fresh hold after cancellation', () => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy);
    vi.advanceTimersByTime(32);
    pointer(enemy, 'pointerup');
    pointer(enemy);
    vi.advanceTimersByTime(64);
    expect(action).toHaveBeenCalledExactlyOnceWith(8);
  });

  it('ignores an animation callback that was already queued when the hold was cancelled', () => {
    const action = vi.fn();
    let queuedFrame;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      queuedFrame = callback;
      return 1;
    });
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy);
    pointer(enemy, 'pointercancel');
    vi.advanceTimersByTime(128);
    queuedFrame(performance.now());
    expect(action).not.toHaveBeenCalled();
    expect(enemy.style.getPropertyValue('--hold')).toBe('0');
  });

  it('ignores non-primary input', () => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy, 'pointerdown', 2);
    vi.advanceTimersByTime(128);
    expect(action).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('prevents the long-press context menu only while active', () => {
    deactivate = activateHold(enemy, arena, vi.fn(), level);
    const activeMenu = new MouseEvent('contextmenu', { cancelable: true });
    enemy.dispatchEvent(activeMenu);
    expect(activeMenu.defaultPrevented).toBe(true);
    deactivate();
    const inactiveMenu = new MouseEvent('contextmenu', { cancelable: true });
    enemy.dispatchEvent(inactiveMenu);
    expect(inactiveMenu.defaultPrevented).toBe(false);
  });

  it('deactivates pending work, listeners, positioning and styling', () => {
    const action = vi.fn();
    deactivate = activateHold(enemy, arena, action, level);
    pointer(enemy);
    vi.advanceTimersByTime(32);
    deactivate();
    vi.advanceTimersByTime(128);
    pointer(enemy);
    vi.advanceTimersByTime(128);
    expect(action).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(arena.classList.contains('hold-arena')).toBe(false);
    expect(enemy.classList.contains('hold-mode')).toBe(false);
    expect(enemy.style.left).toBe('');
    expect(enemy.style.top).toBe('');
    expect(enemy.style.getPropertyValue('--hold')).toBe('0');
  });
});
