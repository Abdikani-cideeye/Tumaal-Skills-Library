# Bug Pattern Library — Reference

A machine-readable catalog of production bugs that pass all tests but break in the real
world. Used by the `hidden-bug-hunter` skill. Each pattern includes: search query,
code example, reproduction scenario, and fix.

---

## Category A — Silent Failures

### A1: Empty Catch Block

**Search query:**
```
catch\s*(\s*\w*\s*)\s*\{\s*\}
catch {}
catch(e) {}
catch (_) {}
```

**Vulnerable pattern:**
```typescript
try {
  await sendNotification(userId);
} catch {} // error swallowed — nobody knows notifications are failing
```

**Why it hides:** No log, no metric, no alert. The operation "succeeds" from the caller's perspective.

**Fix:**
```typescript
try {
  await sendNotification(userId);
} catch (error) {
  logger.error({ userId, error }, 'Failed to send notification');
  // re-throw if the caller needs to know:
  throw error;
}
```

---

### A2: Unawaited Promise

**Search query:**
```
^(?!.*await\s).*\b(send|emit|dispatch|publish|log|track|notify|delete|remove|update|create|insert|save)\w*\s*\(
```

**Vulnerable pattern:**
```typescript
router.post('/checkout', async (c) => {
  const order = await db.orders.create(data);
  sendConfirmationEmail(order); // missing await — returns before email is sent
  return c.json({ success: true });
});
```

**Why it hides:** The response returns `{ success: true }` even when email fails. In tests,
the happy path passes. In production, emails fail silently and users never know.

**Fix:**
```typescript
await sendConfirmationEmail(order);
// OR if truly fire-and-forget, handle explicitly:
sendConfirmationEmail(order).catch((error) => {
  logger.error({ orderId: order.id, error }, 'Background email failed');
});
```

---

### A3: Optional Chaining Hiding Null

**Search query:**
```
\?\.\w+\?\.\w+\?\.\w+
```
(Three or more levels of optional chaining on a value that should not be null)

**Vulnerable pattern:**
```typescript
// user MUST exist here — we just authenticated them
// But optional chaining makes TypeScript and tests happy
const theme = user?.profile?.settings?.theme;
applyTheme(theme); // crashes 200 lines later with "Cannot read property 'apply' of null"
```

**Fix:** If the value should never be null at this point, assert it:
```typescript
if (!user?.profile?.settings) {
  throw new Error('Invariant violation: authenticated user must have profile settings');
}
const theme = user.profile.settings.theme;
```

---

## Category B — Race Conditions

### B1: Check-Then-Act (Non-Atomic)

**Search query:**
Look for these patterns within the same function:
1. `await db.*.findFirst` or `findUnique` followed by
2. `await db.*.update` or `delete` using data from step 1

**Vulnerable pattern:**
```typescript
async function redeemCoupon(userId: string, couponId: string) {
  const coupon = await db.coupons.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.usedAt !== null) throw new Error('Coupon already used');
  // ← CONCURRENT REQUEST ALSO PASSES THIS CHECK ←
  await db.coupons.update({ where: { id: couponId }, data: { usedAt: new Date(), userId } });
  // Result: coupon redeemed twice — both users get the discount
}
```

**Fix:** Use an atomic DB operation:
```typescript
// PostgreSQL: UPDATE with WHERE that includes the condition
const updated = await db.$executeRaw`
  UPDATE coupons
  SET used_at = NOW(), user_id = ${userId}
  WHERE id = ${couponId} AND used_at IS NULL
  RETURNING id
`;
if (updated === 0) throw new Error('Coupon already used');
```

---

### B2: Non-Idempotent Webhook Handler

**Search query:** Functions named `handle*Webhook`, `on*Event`, `process*Message` — check if
they have a "already processed" guard.

**Vulnerable pattern:**
```typescript
app.post('/webhook/stripe', async (c) => {
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  if (event.type === 'payment_intent.succeeded') {
    await db.orders.update({ where: { id }, data: { status: 'paid' } });
    await fulfillOrder(id); // ships product — dangerous if called twice
  }
});
```

**Fix:** Deduplicate using the event ID:
```typescript
app.post('/webhook/stripe', async (c) => {
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  // Idempotency check
  const existing = await db.processedEvents.findUnique({ where: { eventId: event.id } });
  if (existing) return c.json({ received: true }); // already processed — safe to ignore
  await db.processedEvents.create({ data: { eventId: event.id } });
  // Now safe to process
  if (event.type === 'payment_intent.succeeded') {
    await db.orders.update({ where: { id }, data: { status: 'paid' } });
    await fulfillOrder(id);
  }
});
```

---

### B3: Cache Stampede

**Vulnerable pattern:**
```typescript
async function getPopularPosts() {
  const cached = await redis.get('popular-posts');
  if (cached) return JSON.parse(cached);
  // If 1000 requests arrive simultaneously with a cache miss:
  const posts = await db.posts.findMany({ orderBy: { views: 'desc' }, take: 10 });
  // 1000 concurrent DB queries run simultaneously
  await redis.set('popular-posts', JSON.stringify(posts), 'EX', 300);
  return posts;
}
```

**Fix:** Use a distributed lock (single-flight pattern):
```typescript
async function getPopularPosts() {
  const cached = await redis.get('popular-posts');
  if (cached) return JSON.parse(cached);

  const lockKey = 'lock:popular-posts';
  const lock = await redis.set(lockKey, '1', 'NX', 'EX', 10); // NX = only if not exists
  if (!lock) {
    // Another instance is computing — wait and retry
    await sleep(100);
    return getPopularPosts();
  }
  try {
    const posts = await db.posts.findMany({ orderBy: { views: 'desc' }, take: 10 });
    await redis.set('popular-posts', JSON.stringify(posts), 'EX', 300);
    return posts;
  } finally {
    await redis.del(lockKey);
  }
}
```

---

## Category C — Data Loss Paths

### C1: Missing Transaction on Multi-Step Mutation

**Search query:** Multiple `await db.*.update/create/delete` calls in the same function
without `db.$transaction()`.

**Vulnerable pattern:**
```typescript
async function transferFunds(fromId: string, toId: string, amount: number) {
  await db.accounts.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
  // ← IF THIS THROWS: money is debited but never credited ←
  await db.accounts.update({ where: { id: toId }, data: { balance: { increment: amount } } });
}
```

**Fix:**
```typescript
await db.$transaction([
  db.accounts.update({ where: { id: fromId }, data: { balance: { decrement: amount } } }),
  db.accounts.update({ where: { id: toId }, data: { balance: { increment: amount } } }),
]);
```

---

### C2: File Deleted Before DB Record

**Vulnerable pattern:**
```typescript
async function deleteDocument(documentId: string) {
  await storage.delete(document.filePath); // file deleted
  await db.documents.delete({ where: { id: documentId } }); // if this throws: broken reference
}
```

**Fix:** Always delete DB record first, then the file. A missing file is a recoverable bug.
A DB record pointing to a missing file is data corruption.
```typescript
async function deleteDocument(documentId: string) {
  const document = await db.documents.delete({ where: { id: documentId } }); // DB first
  await storage.delete(document.filePath).catch((error) => {
    // Log but don't throw — orphaned file is recoverable, DB inconsistency is not
    logger.error({ documentId, path: document.filePath, error }, 'Orphaned file after delete');
  });
}
```

---

## Category D — Timing Bugs

### D1: JWT Not Re-Validated on Sensitive Operations

**Vulnerable pattern:**
```typescript
// Middleware validates JWT once at request start
// But for a 30-second mutation (batch process), the token can expire mid-operation
app.post('/api/bulk-delete', requireAuth, async (c) => {
  const user = c.get('user'); // validated 30 seconds ago
  // ...30 seconds of DB operations...
  // User's session was revoked by admin during this time
  await db.items.deleteMany({ where: { userId: user.id } }); // still executes
});
```

**Fix:** For high-value, long-running mutations, re-verify the token at the point of the
destructive action:
```typescript
const { data: { user: freshUser } } = await supabase.auth.getUser(token);
if (!freshUser || freshUser.id !== user.id) throw new UnauthorizedError();
await db.items.deleteMany({ where: { userId: freshUser.id } });
```

---

### D2: Config Loaded Once at Startup

**Search query:** `const config = await db.config.find` at module level or in startup code.

**Vulnerable pattern:**
```typescript
// startup.ts
export const featureFlags = await db.featureFlags.findAll(); // loaded once

// routes/checkout.ts
if (featureFlags.newCheckoutEnabled) { // stale after deploy until restart
  // ...
}
```

**Fix:** Re-fetch on each request with a short cache:
```typescript
async function getFeatureFlags() {
  const cached = await redis.get('feature-flags');
  if (cached) return JSON.parse(cached);
  const flags = await db.featureFlags.findAll();
  await redis.set('feature-flags', JSON.stringify(flags), 'EX', 60); // 60-second cache
  return flags;
}
```

---

## Category E — Scale-Dependent Bugs

### E1: Module-Level Stateful Map

**Search query:**
```
const \w+ = new Map<
const \w+ = new Set<
const \w+: \w+\[\] = \[\]
```
at module scope (outside a class or function), where the variable is written to at runtime.

**Vulnerable pattern:**
```typescript
// auth.ts — module level
const activeSessions = new Map<string, Session>(); // different on every instance!

export function createSession(token: string, session: Session) {
  activeSessions.set(token, session); // only on THIS instance
}

export function getSession(token: string) {
  return activeSessions.get(token); // returns undefined on OTHER instances
}
```

**Fix:** Replace with Redis or DB-backed session store.

---

### E2: `console.log` in Hot Path

**Search query:** `console.log` or `console.error` in files under `src/routes/`, `src/middleware/`, or `src/lib/`.

**Vulnerable pattern:**
```typescript
app.get('/api/posts', async (c) => {
  const posts = await db.posts.findMany();
  console.log('Fetched posts:', JSON.stringify(posts)); // synchronous I/O, blocks event loop
  return c.json(posts);
});
```

**Fix:** Use Pino or a structured async logger:
```typescript
import { logger } from '../lib/logger';
logger.info({ count: posts.length }, 'Fetched posts'); // async, non-blocking
```

---

### E3: Unpaginated List Query

**Search query:**
```
findMany\(\s*\{(?!.*take)
findAll\(\s*\)
select\(\s*\*\s*\)
```
(queries without a `take`, `limit`, or `LIMIT` clause)

**Vulnerable pattern:**
```typescript
const allUsers = await db.users.findMany(); // returns ALL users — 1M at scale
```

**Fix:**
```typescript
const users = await db.users.findMany({
  take: 50, // always set a maximum
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

---

## Quick Search Commands

Run these against any codebase to find common patterns:

```bash
# Silent catch blocks
grep -rn "catch\s*{}" src/
grep -rn "catch (_)" src/
grep -rn "catch (e) {}" src/

# console.log in source (not tests)
grep -rn "console.log" src/ --include="*.ts" --exclude-dir=test

# Module-level Maps/Sets (potential state synchronization bugs)
grep -rn "^const .* = new Map\|^const .* = new Set\|^const .*: .*\[\] = \[\]" src/

# Unpaginated queries
grep -rn "findMany()" src/ | grep -v "take:"
grep -rn "findAll()" src/

# Missing await (simplified — check manually)
grep -rn "^\s*[a-z].*([^;]*);$" src/ | grep -v "await\|return\|const\|let\|var"
```
