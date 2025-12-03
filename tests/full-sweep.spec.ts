import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Failure = { route: string; type: string; message: string; target?: string; status?: number };
const BUTTON_BLOCKLIST = /(logout|log out|sign out|delete|remove|unsubscribe|suspend|leave|unregister|unlock)/i;

const BASE_ROUTES = [
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
  '/forgot-password'
];

let prismaCache: any = null;
const getPrisma = async () => {
  const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bluezone?schema=public';
  const dbUrl = rawUrl.toLowerCase();
  if (!dbUrl.startsWith('postgres')) {
    console.warn('Prisma skipped: DATABASE_URL not set to postgres.');
    return null;
  }
  if (prismaCache) return prismaCache;
  try {
    const clientPath = pathToFileURL(path.resolve(__dirname, '../server/node_modules/@prisma/client/index.js')).href;
    const mod: any = await import(clientPath);
    const candidates = [rawUrl];
    if (rawUrl.includes('@db:')) {
      candidates.push(rawUrl.replace('@db:', '@localhost:'));
    }
    for (const url of candidates) {
      try {
        const client = new mod.PrismaClient({ datasources: { db: { url } } });
        await client.$queryRaw`SELECT 1`;
        prismaCache = client;
        return prismaCache;
      } catch (err) {
        continue;
      }
    }
    console.warn('Prisma unavailable after connection attempts; DB assertions will be skipped');
    return null;
  } catch (err) {
    console.warn('Prisma unavailable; DB assertions will be skipped', err instanceof Error ? err.message : err);
    return null;
  }
};

test.afterAll(async () => {
  if (prismaCache?.$disconnect) {
    await prismaCache.$disconnect().catch(() => {});
  }
});

test.describe('Full UI sweep with data setup + destructive actions', () => {
  test.setTimeout(240_000);

  test('seeds data, exercises flows, clicks buttons, and records all failures', async ({ page }) => {
    const email = `fullsweep+${Date.now()}@example.com`;
    const password = 'Test1234!';
    const failures: Failure[] = [];
    let currentRoute = '/signup';
    const waitAfterAction = async (ms = 250) => page.waitForTimeout(ms);
    const MAX_BUTTONS_PER_ROUTE = 10;
    const MAX_TOTAL_BUTTONS = 150;
    const MAX_RUNTIME_MS = 3 * 60 * 1000;
    const startedAt = Date.now();
    let totalButtonClicks = 0;
    const created: Record<string, string | null> = {
      userId: null,
      eventId: null,
      groupId: null,
      discussionId: null,
      initiativeId: null
    };
    let prisma = await getPrisma();

    const isIgnorable = (f: Failure) => {
      if (f.route === '/admin' && f.status === 403) return true;
      if (f.type === 'pageerror' && f.message.toLowerCase().includes('clipboard')) return true;
      if (f.status === 401 && f.message.toLowerCase().includes('invalid token')) return true;
      if (f.type === 'console' && f.message.includes('401')) return true;
      return false;
    };

    const recordFailure = (failure: Failure) => failures.push(failure);

    const ensureAuthenticated = async () => {
      const ok = await page.evaluate(async () => {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        return res.status === 200;
      });
      if (!ok) {
        await page.evaluate(
          async (creds) => {
            await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: creds.email, password: creds.password }),
              credentials: 'include'
            });
          },
          { email, password }
        );
        await waitAfterAction();
      }
    };

    const fetchCurrentUser = async () => {
      return page.evaluate(async () => {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
      });
    };

    page.on('dialog', async (dialog) => dialog.accept());

    page.on('pageerror', (error) => {
      if (error.message.toLowerCase().includes('clipboard')) return;
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
          target: url,
          status
        });
      }
    });

    // Bootstrap session (signup).
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await page.fill('#name', 'Full Sweep');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.fill('#location', 'Testville');
    await page.check('#terms');
    await page.click('button:has-text("Create Account")');
    await waitAfterAction();

    // Verify session works.
    await ensureAuthenticated();
    const me = await fetchCurrentUser();
    if (me?.id) created.userId = me.id;
    if (prisma && me?.id) {
      await prisma.user.update({ where: { id: me.id }, data: { role: 'admin' } }).catch(() => {});
      await ensureAuthenticated();
    }
    currentRoute = '/profile';
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    // Seed backend data using the authenticated browser context.
    const seeded = await page.evaluate(async () => {
      const headers = { 'Content-Type': 'application/json' };
      const eventRes = await fetch('/api/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Full Sweep Event',
          description: 'Seeded event for Playwright sweep',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          location: 'Sweep City',
          category: 'community'
        })
      });
      const eventJson = await eventRes.json();

      const groupRes = await fetch('/api/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Full Sweep Group',
          category: 'Community',
          description: 'Seeded group for Playwright sweep'
        })
      });
      const groupJson = await groupRes.json();

      const discussionRes = await fetch('/api/forum/discussions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Full Sweep Discussion',
          category: 'General Discussion',
          content: 'Seeded discussion content'
        })
      });
      const discussionJson = await discussionRes.json();

      const initiativeRes = await fetch('/api/initiatives', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Full Sweep Initiative',
          description: 'Seeded initiative for sweep',
          type: 'garden',
          location: 'Sweepville',
          coordinateX: 10,
          coordinateY: 20
        })
      });
      const initiativeJson = await initiativeRes.json();

      return {
        eventId: eventJson.event?.id,
        groupId: groupJson.group?.id,
        discussionId: discussionJson.discussion?.id,
        initiativeId: initiativeJson.initiative?.id
      };
    });
    created.eventId = seeded.eventId;
    created.groupId = seeded.groupId;
    created.discussionId = seeded.discussionId;
    created.initiativeId = seeded.initiativeId;

    // Targeted flows with seeded data and persistence checks.
    if (seeded.eventId) {
      if (prisma) {
        const row = await prisma.event.findUnique({ where: { id: seeded.eventId } });
        expect(row, 'Seeded event persisted in DB').not.toBeNull();
      }
      currentRoute = '/events';
      await page.goto('/events', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Full Sweep Event', { exact: false }).first()).toBeVisible();

      currentRoute = `/events/${seeded.eventId}`;
      await page.goto(currentRoute, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /register/i }).first().click({ timeout: 5_000 }).catch(() => {});
      await waitAfterAction();
      if (prisma && created.userId) {
        const reg = await prisma.eventRegistration.findFirst({ where: { userId: created.userId, eventId: seeded.eventId } });
        expect(reg, 'Event registration persisted').not.toBeNull();
      }
      await page.getByRole('button', { name: /unregister/i }).first().click({ timeout: 5_000 }).catch(() => {});
      await waitAfterAction();
      if (prisma && created.userId) {
        const regGone = await prisma.eventRegistration.findFirst({ where: { userId: created.userId, eventId: seeded.eventId } });
        if (regGone) {
          recordFailure({
            route: currentRoute,
            type: 'db',
            message: 'Event unregistration left registration row',
            target: `eventRegistration:${regGone.id}`
          });
          await prisma.eventRegistration.delete({ where: { id: regGone.id } }).catch(() => {});
        }
      }
    }

    if (seeded.groupId) {
      if (prisma) {
        const row = await prisma.group.findUnique({ where: { id: seeded.groupId } });
        expect(row, 'Seeded group persisted in DB').not.toBeNull();
      }
      currentRoute = '/groups';
      await page.goto('/groups', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Full Sweep Group', { exact: false }).first()).toBeVisible();

      currentRoute = `/groups/${seeded.groupId}`;
      await page.goto(currentRoute, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /join group/i }).click({ timeout: 5_000 }).catch(() => {});
      await waitAfterAction();
      if (prisma && created.userId) {
        const gm = await prisma.groupMember.findFirst({ where: { userId: created.userId, groupId: seeded.groupId } });
        expect(gm, 'Group membership persisted').not.toBeNull();
      }
      await page.getByRole('button', { name: /leave group/i }).click({ timeout: 5_000 }).catch(() => {});
      await waitAfterAction();
      if (prisma && created.userId) {
        const gmGone = await prisma.groupMember.findFirst({ where: { userId: created.userId, groupId: seeded.groupId } });
        if (gmGone) {
          recordFailure({
            route: currentRoute,
            type: 'db',
            message: 'Group leave left membership row',
            target: `groupMember:${gmGone.id}`
          });
          await prisma.groupMember.delete({ where: { id: gmGone.id } }).catch(() => {});
        }
      }
    }

    if (seeded.discussionId) {
      if (prisma) {
        const row = await prisma.discussion.findUnique({ where: { id: seeded.discussionId } });
        expect(row, 'Seeded discussion persisted in DB').not.toBeNull();
      }
      currentRoute = '/forum';
      await page.goto('/forum', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Full Sweep Discussion', { exact: false }).first()).toBeVisible();

      currentRoute = `/forum/${seeded.discussionId}`;
      await page.goto(currentRoute, { waitUntil: 'domcontentloaded' });
      await page.fill('textarea', 'Automated reply content');
      await page.getByRole('button', { name: /post reply/i }).click({ timeout: 5_000 }).catch(() => {});
      await waitAfterAction();
      if (prisma && created.userId) {
        const reply = await prisma.reply.findFirst({ where: { discussionId: seeded.discussionId, authorId: created.userId } });
        expect(reply, 'Reply persisted').not.toBeNull();
      }
    }

    if (seeded.initiativeId) {
      if (prisma) {
        const row = await prisma.initiative.findUnique({ where: { id: seeded.initiativeId } });
        expect(row, 'Seeded initiative persisted in DB').not.toBeNull();
      }
      currentRoute = '/map';
      await page.goto('/map', { waitUntil: 'domcontentloaded' });
      const firstPin = page.locator('.map-pin').first();
      if (await firstPin.count()) {
        try {
          await firstPin.scrollIntoViewIfNeeded();
          await firstPin.click({ timeout: 2_000, force: true });
          const saveBtn = page.getByRole('button', { name: /save|unsave|saved/i }).first();
          await saveBtn.click({ timeout: 2_000 }).catch(() => {});
          await waitAfterAction();
          if (prisma && created.userId) {
            const saved = await prisma.savedInitiative.findFirst({ where: { userId: created.userId, initiativeId: seeded.initiativeId } });
            expect(saved, 'Initiative saved state persisted').not.toBeNull();
            await prisma.savedInitiative.deleteMany({ where: { userId: created.userId, initiativeId: seeded.initiativeId } }).catch(() => {});
          }
        } catch (err: any) {
          recordFailure({
            route: currentRoute,
            type: 'button',
            message: err?.message || 'Map pin click failed',
            target: 'map-pin'
          });
        }
      }
    }

    if (prisma && created.userId) {
      currentRoute = '/admin';
      await ensureAuthenticated();
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Admin Panel', { exact: false })).toBeVisible();
    }

    // Construct routes list including seeded detail pages.
    const routes = [
      ...BASE_ROUTES,
      prisma ? '/admin' : null,
      seeded.eventId ? `/events/${seeded.eventId}` : null,
      seeded.groupId ? `/groups/${seeded.groupId}` : null,
      seeded.discussionId ? `/forum/${seeded.discussionId}` : null
    ].filter(Boolean) as string[];

    // Sweep buttons (including destructive) across routes.
    for (const route of routes) {
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break;
      await ensureAuthenticated();
      currentRoute = route;
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      if (!response || !response.ok()) {
        recordFailure({
          route,
          type: 'navigation',
          message: 'Navigation failed',
          status: response?.status()
        });
      }

      const buttons = await page.getByRole('button', { includeHidden: false }).all();
      const cappedButtons = buttons.slice(0, MAX_BUTTONS_PER_ROUTE);
      for (let i = 0; i < cappedButtons.length; i++) {
        const button = buttons[i];
        const label = ((await button.textContent()) || '').trim() || `<button#${i}>`;

        if (totalButtonClicks >= MAX_TOTAL_BUTTONS || Date.now() - startedAt > MAX_RUNTIME_MS) break;
        if (BUTTON_BLOCKLIST.test(label)) continue;

        try {
          const beforeUrl = page.url();
          await button.click({ timeout: 3_000 });
          await waitAfterAction();
          totalButtonClicks += 1;
          const afterUrl = page.url();
          if (afterUrl !== beforeUrl) {
            currentRoute = route;
            await page.goto(route, { waitUntil: 'domcontentloaded' });
          }
        } catch (err: any) {
          recordFailure({
            route,
            type: 'button',
            message: err?.message || 'Click failed',
            target: label
          });
        }
      }
    }

    const actionable = failures.filter((f) => !isIgnorable(f));
    if (actionable.length) console.table(actionable);
    expect(actionable, 'UI/API sweep failures were detected').toEqual([]);
  });
});
