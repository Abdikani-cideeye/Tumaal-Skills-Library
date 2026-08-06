---
name: hidden-bug-hunter
description: Hunt for silent failures, hidden race conditions, data loss paths, timing bugs, and production-only defects that pass all tests but break in the real world. Use after completing a feature, before a production deploy, when diagnosing a mysterious production incident, or when "everything works locally" but production is broken. Goes beyond linting — finds bugs that only appear under concurrency, load, or specific data conditions that tests never exercise.
---

# hidden-bug-hunter — Surface the Invisible

You are hunting for bugs that automated tests cannot find. The happy path works. CI is green.
The type checker is happy. Your job is to find what breaks when the real world arrives —
concurrent users, partial failures, malformed data, expired tokens, and edge inputs that
no one thought to test.

**The bugs you are looking for are invisible in isolation.** They only appear under these conditions:
- Two things happen at the same time (concurrency)
- An external call fails halfway (partial failure)
- The data has a shape no test covered (edge input)
- Time passes unexpectedly (expiry, drift)
- The server restarts between two steps (durability)
- Traffic volume amplifies a small inefficiency into a crash (scale)

---

## Hunting Protocol

Read these files first:
1. Every file changed in the last commit or feature branch
2. Every file those changes import from (one level deep)
3. DB schema / migration files — understand the data model
4. Any background worker or cron job files

Then run through all 6 categories systematically. Do not stop at the first finding.

---

## Category A — Silent Failures

These bugs swallow errors and hide them from every monitoring tool.

**Pattern 1: Empty catch block**
```typescript
// BUG: error is swallowed — the caller thinks the operation succeeded
try {
  await db.insert(record);
} catch {}
```
Search: `catch\s*\(\s*\w*\s*\)\s*\{?\s*\}` or `catch {}` across the entire codebase.

**Pattern 2: Unawaited promise (fire and forget)**
```typescript
// BUG: if sendEmail throws, nobody knows — and the calling function returns before it completes
sendEmail(user.email, 'Welcome');  // missing await
return { success: true };
```
Search: function calls that return a Promise but are not `await`ed and not `.catch()`-chained.

**Pattern 3: Unhandled promise rejection**
```typescript
// BUG: in older Node versions this crashes the process silently
someAsyncFn().then(result => doSomething(result));
// missing .catch() — rejection is unhandled
```

**Pattern 4: Optional chaining hiding a deeper bug**
```typescript
// BUG: user?.profile?.settings?.theme hides the fact that user should never be null here
// The null propagates further and crashes somewhere unrelated later
const theme = user?.profile?.settings?.theme;
// two hours later: Cannot read property 'apply' of undefined
```

**Pattern 5: Missing error boundary**
In React trees, a component that throws during render crashes the entire tree unless
an error boundary catches it. Check that every top-level route and every data-fetching
component has an error boundary or equivalent fallback.

---

## Category B — Race Conditions

These bugs are impossible to reproduce reliably in tests because they depend on timing.

**Pattern 1: Check-then-act without atomicity**
```typescript
// BUG: another request can run between the check and the deduction
const user = await db.users.findById(userId);
if (user.credits < cost) throw new Error('Insufficient credits');
// ← ANOTHER REQUEST RUNS HERE AND ALSO PASSES THE CHECK ←
await db.users.update(userId, { credits: user.credits - cost });
// Result: user's credits go negative — double-spend
```
Fix: Use `UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?` atomically.

**Pattern 2: Cache stampede**
```typescript
// BUG: 1000 concurrent requests all hit cache miss at the same time
const cached = await redis.get(key);
if (!cached) {
  const result = await db.query(expensiveQuery); // ← 1000 concurrent DB hits
  await redis.set(key, result, 'EX', 300);
}
```
Fix: Implement a distributed lock — only the first request queries the DB; others wait.

**Pattern 3: Non-idempotent webhook handler**
```typescript
// BUG: webhook providers guarantee at-least-once delivery — this handler can run twice
async function handlePaymentSuccess(event) {
  await db.orders.update(orderId, { status: 'paid' });
  await sendConfirmationEmail(user.email);  // sent twice if webhook fires twice
  await shipOrder(orderId);  // shipped twice
}
```
Fix: Check if already processed (`WHERE status != 'paid'`) or use a dedupe key.

**Pattern 4: TOCTOU (Time-of-Check to Time-of-Use)**
```typescript
// BUG: between checking file existence and reading it, another process can delete it
if (fs.existsSync(filePath)) {
  // ← FILE DELETED HERE ←
  const content = fs.readFileSync(filePath); // crashes
}
```
Fix: Use try/catch around the read instead of pre-checking existence.

---

## Category C — Data Loss Paths

These bugs pass all tests and only reveal themselves when data is permanently gone.

**Pattern 1: DELETE without WHERE**
```typescript
// BUG: deletes ALL records if the WHERE clause is missing or the variable is undefined
await db.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
// If userId is undefined → $1 is NULL → WHERE user_id = NULL matches nothing in Postgres
// BUT in some ORMs: db.sessions.deleteMany({ userId }) where userId=undefined deletes ALL
```
Search: Any ORM delete call where the filter object is passed from a function argument.

**Pattern 2: Missing transaction on multi-step mutation**
```typescript
// BUG: if step 2 fails, step 1 has already committed — data is now inconsistent
await db.accounts.debit(fromAccountId, amount);   // step 1: committed
await db.accounts.credit(toAccountId, amount);    // step 2: throws → money lost
```
Fix: Wrap both in a single DB transaction.

**Pattern 3: Hard delete instead of soft delete**
Check: Does the project's data model use soft deletes (`deleted_at IS NULL`)?
If yes, search for any raw `DELETE FROM` queries or ORM `.delete()` calls that bypass
the soft-delete convention.

**Pattern 4: File deleted before DB record**
```typescript
// BUG: if the DB update fails after the file is deleted, the record still points
// to a file that no longer exists
await storage.deleteFile(filePath);   // file is gone
await db.documents.delete(documentId); // if this fails → orphaned DB record pointing to void
```
Fix: Always delete DB record first, then delete the file. The inverse creates an
orphaned file (benign); the current order creates a broken reference (data loss).

**Pattern 5: Missing backup / point-in-time recovery**
Check `.env.example` and `SKILLS.md`: is a backup strategy documented?
Is point-in-time recovery available at the project's DB tier?
If neither is present → **HIGH** finding.

---

## Category D — Timing Bugs (Production-Only)

These work in development because dev sessions are short and clocks are synchronized.

**Pattern 1: Token validated once, not re-validated**
```typescript
// BUG: user's session is invalidated server-side after login, but this code
// only checks the token at the start of a long-running operation
const user = await verifyToken(req.headers.authorization);
// ...200ms of DB operations...
// ...token revoked here by admin...
// ...more DB writes using user.id, which is now unauthorized...
await db.orders.create({ userId: user.id, ... });
```
Fix: For high-value mutations, re-verify token and re-check permissions at the point of mutation.

**Pattern 2: Time-based OTP without clock-skew tolerance**
```typescript
// BUG: TOTP codes expire every 30 seconds — if the server clock is 15s ahead,
// a code that just expired on the client is rejected even though the user typed it correctly
const isValid = totp.verify({ token, secret, window: 0 }); // window:0 = zero tolerance
```
Fix: Use `window: 1` to accept the previous and next 30-second window.

**Pattern 3: Config loaded at startup, never refreshed**
```typescript
// BUG: feature flags, rate limits, and config read from DB at startup
// A config change in the DB has no effect until the server restarts
const config = await db.config.findAll(); // loaded once
```
Fix: Re-fetch config on each request (with caching) or implement a hot-reload mechanism.

---

## Category E — Scale-Dependent Bugs

These work perfectly at 1 user and silently break at 1000.

**Pattern 1: In-memory state in multi-instance service**
```typescript
// module-level variable — different on every instance
const activeSessions = new Map<string, Session>();

// Instance A sets a session → Instance B looks it up → not found
// Users get logged out randomly as load balancer routes them to different instances
```
Search: Module-level `Map`, `Set`, `Array`, or `Object` that is written to at runtime
and read back on a different request.

**Pattern 2: `console.log` in hot path**
```typescript
// console.log is synchronous I/O in Node.js
// Under load, this blocks the event loop on every request
console.log('Processing request:', JSON.stringify(request.body));
```
Search: `console.log` in request handlers, middleware, or DB query callbacks.
Replace with an async structured logger (Pino, Winston).

**Pattern 3: Missing pagination on list endpoints**
```typescript
// BUG: works fine with 10 records, hangs with 10,000
const allPosts = await db.posts.findAll(); // no LIMIT
return res.json(allPosts); // 50MB JSON response at scale
```
Search: Any ORM `.findAll()`, `.findMany()`, or `.select()` without a `take`/`limit`/`LIMIT` clause.

**Pattern 4: Missing connection pool limit**
```typescript
// BUG: each request opens its own DB connection — works at 5 concurrent, breaks at 50
const db = new PrismaClient(); // called per-request instead of once at startup
```
Search: Any DB client initialized inside a request handler or middleware instead of once at module level.

---

## Output Format

```markdown
# Hidden Bug Hunt Report — [Project Name]

## Hunt Summary
- Files audited: [N]
- Categories checked: A (Silent), B (Race), C (Data Loss), D (Timing), E (Scale)
- Total findings: [N]

---

## 🚨 Critical Findings (data loss / security)

### [Bug Title]
**Category:** C — Data Loss  
**File:** `src/api/documents.ts:87`  
**Pattern:** Missing transaction on multi-step mutation  
**Reproduction scenario:** [Exact sequence of events that triggers it]  
**Impact:** [What data is lost / corrupted]  
**Fix:**
\`\`\`typescript
// Wrap in transaction
await db.$transaction([
  db.accounts.debit(fromId, amount),
  db.accounts.credit(toId, amount),
]);
\`\`\`

---

## ⚠️ High Findings

...

## 🔍 Medium Findings

...

## ✅ Clean Areas
- No empty catch blocks found
- All DB deletes have WHERE clauses
- List endpoints all paginated
```

See `references/bug-patterns.md` for the complete searchable pattern library.
