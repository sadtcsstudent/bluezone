import { test, expect } from '@playwright/test';

type Failure = { route: string; type: string; message: string; target?: string; status?: number };

test.describe('Comprehensive Frontend Test Suite', () => {
  test.setTimeout(360_000); // 6 minutes

  test('complete user journey: signup, profile, events, groups, forum, initiatives', async ({ page }) => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'Test1234!';
    const failures: Failure[] = [];
    let currentRoute = '/';
    const waitAfterAction = async (ms = 800) => page.waitForTimeout(ms);

    const recordFailure = (failure: Failure) => failures.push(failure);

    // Auto-accept dialogs
    page.on('dialog', async (dialog) => dialog.accept());

    // Track page errors
    page.on('pageerror', (error) => {
      recordFailure({ route: currentRoute, type: 'pageerror', message: error.message });
    });

    // Track console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        recordFailure({ route: currentRoute, type: 'console', message: msg.text() });
      }
    });

    // Track API errors
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
          target: url,
          status
        });
      }
    });

    console.log('\n🧪 Testing: User Signup & Authentication');
    currentRoute = '/signup';
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await page.fill('#name', 'Test User');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.fill('#location', 'Test City');
    await page.check('#terms');
    await page.click('button:has-text("Create Account")');
    await waitAfterAction();

    console.log('✓ Signup completed');

    // Test Profile
    console.log('\n🧪 Testing: Profile Page');
    currentRoute = '/profile';
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /edit profile/i }).first().click();
    await waitAfterAction();
    console.log('✓ Profile page loaded');

    // Test Settings
    console.log('\n🧪 Testing: Settings Page');
    currentRoute = '/settings';
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    console.log('✓ Settings page loaded');

    // Test Events
    console.log('\n🧪 Testing: Events');
    currentRoute = '/events';
    await page.goto('/events', { waitUntil: 'domcontentloaded' });

    // Create event
    const createEventBtn = page.getByRole('button', { name: /create event/i }).first();
    if (await createEventBtn.isVisible().catch(() => false)) {
      await createEventBtn.click();
      await waitAfterAction();

      await page.fill('input[name="title"], #title, [placeholder*="title" i]', 'Test Event');
      await page.fill('textarea[name="description"], #description, [placeholder*="description" i]', 'Test event description');
      await page.fill('input[type="date"], input[name="date"], #date', '2026-12-31');
      await page.fill('input[name="location"], #location, [placeholder*="location" i]', 'Test Location');

      const submitBtn = page.getByRole('button', { name: /create|submit/i }).first();
      await submitBtn.click();
      await waitAfterAction();
      console.log('✓ Event created');
    }

    // Register for an event
    await page.goto('/events', { waitUntil: 'domcontentloaded' });
    const firstEvent = page.locator('.event-card, [class*="event"]').first();
    if (await firstEvent.isVisible().catch(() => false)) {
      await firstEvent.click();
      await waitAfterAction();

      const registerBtn = page.getByRole('button', { name: /register/i }).first();
      if (await registerBtn.isVisible().catch(() => false)) {
        await registerBtn.click();
        await waitAfterAction();
        console.log('✓ Registered for event');

        // Unregister
        const unregisterBtn = page.getByRole('button', { name: /unregister/i }).first();
        if (await unregisterBtn.isVisible().catch(() => false)) {
          await unregisterBtn.click();
          await waitAfterAction();
          console.log('✓ Unregistered from event');
        }
      }
    }

    // Test Groups
    console.log('\n🧪 Testing: Groups');
    currentRoute = '/groups';
    await page.goto('/groups', { waitUntil: 'domcontentloaded' });

    // Create group
    const createGroupBtn = page.getByRole('button', { name: /create group/i }).first();
    if (await createGroupBtn.isVisible().catch(() => false)) {
      await createGroupBtn.click();
      await waitAfterAction();

      await page.fill('input[name="name"], #name, [placeholder*="name" i]', 'Test Group');
      await page.fill('textarea[name="description"], #description, [placeholder*="description" i]', 'Test group description');

      const submitBtn = page.getByRole('button', { name: /create|submit/i }).first();
      await submitBtn.click();
      await waitAfterAction();
      console.log('✓ Group created');
    }

    // Join a group
    await page.goto('/groups', { waitUntil: 'domcontentloaded' });
    const firstGroup = page.locator('.group-card, [class*="group"]').first();
    if (await firstGroup.isVisible().catch(() => false)) {
      await firstGroup.click();
      await waitAfterAction();

      const joinBtn = page.getByRole('button', { name: /join/i }).first();
      if (await joinBtn.isVisible().catch(() => false)) {
        await joinBtn.click();
        await waitAfterAction();
        console.log('✓ Joined group');
      }
    }

    // Test Forum
    console.log('\n🧪 Testing: Forum');
    currentRoute = '/forum';
    await page.goto('/forum', { waitUntil: 'domcontentloaded' });

    // Create discussion
    const createDiscussionBtn = page.getByRole('button', { name: /new discussion|create/i }).first();
    if (await createDiscussionBtn.isVisible().catch(() => false)) {
      await createDiscussionBtn.click();
      await waitAfterAction();

      await page.fill('input[name="title"], #title, [placeholder*="title" i]', 'Test Discussion');
      await page.fill('textarea[name="content"], #content, [placeholder*="content" i]', 'Test discussion content');

      const submitBtn = page.getByRole('button', { name: /post|submit|create/i }).first();
      await submitBtn.click();
      await waitAfterAction();
      console.log('✓ Discussion created');
    }

    // Reply to discussion
    await page.goto('/forum', { waitUntil: 'domcontentloaded' });
    const firstDiscussion = page.locator('.discussion-card, [class*="discussion"]').first();
    if (await firstDiscussion.isVisible().catch(() => false)) {
      await firstDiscussion.click();
      await waitAfterAction();

      const replyTextarea = page.locator('textarea').first();
      if (await replyTextarea.isVisible().catch(() => false)) {
        await replyTextarea.fill('Test reply content');
        const replyBtn = page.getByRole('button', { name: /reply|post/i }).first();
        await replyBtn.click();
        await waitAfterAction();
        console.log('✓ Reply posted');
      }
    }

    // Test Initiatives Map
    console.log('\n🧪 Testing: Initiatives Map');
    currentRoute = '/map';
    await page.goto('/map', { waitUntil: 'domcontentloaded' });

    // Test filter buttons
    const gardenBtn = page.getByRole('button', { name: /garden/i }).first();
    if (await gardenBtn.isVisible().catch(() => false)) {
      await gardenBtn.click();
      await waitAfterAction();
      console.log('✓ Garden filter clicked');
    }

    const marketBtn = page.getByRole('button', { name: /market/i }).first();
    if (await marketBtn.isVisible().catch(() => false)) {
      await marketBtn.click();
      await waitAfterAction();
      console.log('✓ Market filter clicked');
    }

    // Test Messages
    console.log('\n🧪 Testing: Messages');
    currentRoute = '/messages';
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    console.log('✓ Messages page loaded');

    // Test Newsletter
    console.log('\n🧪 Testing: Newsletter');
    currentRoute = '/newsletter';
    await page.goto('/newsletter', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('newsletter@test.com');
      const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
      await subscribeBtn.click();
      await waitAfterAction();
      console.log('✓ Newsletter subscription tested');
    }

    // Test About/Story
    console.log('\n🧪 Testing: About & Story Pages');
    currentRoute = '/story';
    await page.goto('/story', { waitUntil: 'domcontentloaded' });
    console.log('✓ Story page loaded');

    currentRoute = '/about';
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    console.log('✓ About page loaded');

    // Test Admin (if accessible)
    console.log('\n🧪 Testing: Admin Dashboard');
    currentRoute = '/admin';
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    console.log('✓ Admin page loaded');

    // Test navigation
    console.log('\n🧪 Testing: Main Navigation');
    currentRoute = '/';
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const navLinks = ['Home', 'Events', 'Forum', 'Map', 'Newsletter'];
    for (const linkText of navLinks) {
      const link = page.getByRole('link', { name: new RegExp(linkText, 'i') }).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        console.log(`✓ Navigated to ${linkText}`);
      }
    }

    // Report results
    console.log('\n' + '='.repeat(80));
    console.log('TEST RESULTS');
    console.log('='.repeat(80));

    if (failures.length === 0) {
      console.log('✅ ALL TESTS PASSED! No errors detected.');
    } else {
      console.log(`❌ Found ${failures.length} failures:\n`);
      console.table(failures);
    }

    expect(failures, 'UI/API failures were detected').toEqual([]);
  });
});
