import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.UI_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  reporter: [['list']]
});
