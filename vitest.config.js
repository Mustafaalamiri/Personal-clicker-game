import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://127.0.0.1:4173' } },
    setupFiles: ['tests/support/setup.js'],
    maxWorkers: 1,
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        perFile: true,
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    },
  },
});
