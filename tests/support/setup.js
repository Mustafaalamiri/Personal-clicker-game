import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

afterEach(() => {
  if (vi.isFakeTimers()) vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof document !== 'undefined') document.body.replaceChildren();
});
