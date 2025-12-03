import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/story',
  '/events',
  '/newsletter',
  '/map',
  '/profile',
  '/about',
  '/forum',
  '/messages',
  '/groups',
  '/settings',
  '/forgot-password',
  '/admin'
];

type Failure = { route: string; type: string; message: string; url?: string; status?: number };

test('end-to-end smoke: signup + crawl pages', async ({ page }) => {
  const email = `smoke+${Date.now()}@example.com`;
  const password = 'Test1234!';
  const failures: Failure[] = [];
  let currentRoute = '/signup';

  const recordFailure = (failure: Failure) => failures.push(failure);

  page.on('pageerror', (error) => {
    recordFailure({ route: currentRoute, type: 'pageerror', message: error.message });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      recordFailure({ route: currentRoute, type: 'console', message: msg.text() });
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    const status = response.status();
    if (status >= 400) {
      let message = `${status} error`;
      try {
        message = await response.text();
      } catch {
        // Response body may not be available
      }
      recordFailure({
        route: currentRoute,
        type: 'api',
        message,
        url,
        status
      });
    }
  });

  // Sign up so protected routes have a session.
  await page.goto('/signup', { waitUntil: 'networkidle' });
  await page.fill('#name', 'Smoke Tester');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.fill('#location', 'Testville');
  await page.check('#terms');
  await page.click('button:has-text("Create Account")');
  await page.waitForLoadState('networkidle');

  // Verify we are authenticated by hitting profile.
  currentRoute = '/profile';
  const profileResponse = await page.goto('/profile', { waitUntil: 'networkidle' });
  if (!profileResponse || !profileResponse.ok()) {
    recordFailure({
      route: '/profile',
      type: 'navigation',
      message: `Profile load failed`,
      status: profileResponse?.status()
    });
  }

  // Crawl primary routes.
  for (const route of ROUTES) {
    currentRoute = route;
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      recordFailure({
        route,
        type: 'navigation',
        message: 'Navigation failed',
        status: response?.status()
      });
    }
  }

  if (failures.length) {
    console.table(failures);
  }

  expect(failures, 'UI/API smoke failures were detected').toEqual([]);
});
