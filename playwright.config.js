import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      // Optional JSON array for environments needing native Chromium launch flags.
      args: process.env.PLAYWRIGHT_CHROMIUM_ARGS
        ? JSON.parse(process.env.PLAYWRIGHT_CHROMIUM_ARGS)
        : [],
    },
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run test:serve',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
