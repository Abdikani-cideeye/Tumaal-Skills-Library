---
name: adversarial-review
description: Perform a deep adversarial code review of a diff, pull request, or feature branch — hunting for bugs, missed edge cases, unstated assumptions, security holes, and regressions before merge. Use before any merge to main, especially for auth/credentials, data mutations, concurrency logic, retry logic, public API contracts, and any shared helper that multiple callers depend on. You did NOT write this code. Your job is to break it.
---

# adversarial-review — Break It Before Merge

You are a senior reviewer who did **not** write this code. The context that produced this
diff already believes it is correct — that belief is the bias you exist to defeat.

Your standard is not "does this look reasonable?" but "can I find the scenario where this
breaks, loses data, or creates a security hole?" A green CI run is not a review. Find what
CI cannot find.

**The reviewer, not the author, has the last word on review depth.**
If you spot risk that the scope didn't ask you to look at, you escalate on your own
initiative rather than staying in your lane.

---

## Phase 0 — Measure Blast Radius (always first)

Before reading a single line of the diff, measure how far it can reach.

```
For every changed function, type, or constant:
  1. Count its importers in the whole codebase
  2. Check if it is called in the test suite
  3. Check if it is called in CI, scripts, or background workers
```

**Blast radius classification:**
- **Narrow** — changed code has 1-3 callers, all tested → focused diff review
- **Wide** — changed helper has 10-50+ callers → deep review, multiple lenses
- **Critical** — changed code touches auth, credentials, data mutations, concurrency,
  public API contracts, or shared helpers → high-effort, several independent perspectives required

A one-line edit to a function with 50 importers is **not** a small change. Treat it as
high-effort and say so explicitly in your report.

---

## Phase 1 — Security Lens 🔴

Hunt for these in the diff:

### Auth & Trust Boundaries
- Does this diff widen who can call a protected endpoint?
- Does it decode a JWT without verifying the signature?
- Does it add a new code path that bypasses existing middleware?
- Does it introduce a new action that should require human-in-the-loop approval?
  → Some actions must be deliberately non-automatable (admin grant changes, impersonation,
    high-value approvals). Does this diff accidentally automate one?

### Secrets & Data Exposure
- Does this diff move a secret into a client-readable location?
- Does it add a log statement that includes tokens, passwords, or PII?
- Does it expose internal error details in an API response?
- Does it add a new `NEXT_PUBLIC_` / client-bundle variable that should be server-only?

### Injection & Input Handling
- Is any new user input used in a DB query without parameterization?
- Is any new user input reflected into HTML without sanitization?
- Is any user-supplied URL fetched server-side without SSRF validation?

### Supply Chain
- Does this diff add a new npm dependency?
  → Check its age (must be ≥7 days old), weekly downloads, and GitHub health
  → Run: is it on Socket.dev? Any supply-chain risk flags?

---

## Phase 2 — Data Integrity Lens 🟠

### Transactions
- Does this diff make multiple DB writes that must succeed or fail atomically?
  If yes, are they wrapped in a single transaction?
- Does a partial failure leave data in an inconsistent state?

### Idempotency
- Can this mutation be retried safely? Can a duplicate request, webhook, or
  message create duplicate side effects?
- Is an idempotency key used where needed?

### Cascade & Deletion
- Does this diff add a DELETE operation?
  → Is there a WHERE clause? Is it missing a soft-delete guard?
  → Does deleting this entity orphan related data?
- Does this diff add a relationship to an existing table?
  → Is the cascade behavior explicitly defined and correct?

### Durability
- Does this diff store anything in process memory (Map, array, module-level variable)
  that will be read back later?
  → In a horizontally scaled deployment, that state is wiped on every instance restart.
  → RAM-only is acceptable ONLY as a cache in front of a durable store, or for
    genuinely re-derivable, disposable state.

---

## Phase 3 — Concurrency Lens 🟠

Hunt for these patterns:

### Race Conditions
- **Check-then-act**: Does the code read a value, check it, then act on it without
  holding a lock or using an atomic operation?
  Example: `read balance → if balance > amount → deduct` — window for double-spend
- **TOCTOU**: Does the code check a condition (file exists, record exists) then act
  on it in a separate operation?

### Non-Atomic Sequences
- Is a "read-modify-write" cycle done with separate queries instead of
  `UPDATE ... RETURNING` or `SELECT FOR UPDATE`?
- Is a cache read-then-write done without a distributed lock?
  → Cache stampede risk under high concurrency.

### Webhook & Event Deduplication
- If this diff handles webhooks or queue messages, is the handler idempotent?
  Can the same event be processed twice without corruption?

---

## Phase 4 — Error Path Lens 🟡

**The happy path is tested. Find the unhappy paths.**

For every external call (DB, API, cache, filesystem) added in the diff:
- What happens when it times out?
- What happens when it returns an unexpected status code?
- What happens when it throws an exception?
- Is the error caught, logged, and handled — or swallowed silently?

**Silent failure check:**
- Any `try { } catch { }` or `catch (e) { /* nothing */ }` → BLOCK
- Any unhandled promise (missing `await`, missing `.catch()`) → HIGH
- Any optional chaining on a value that should never be null (hiding a deeper bug) → MEDIUM

---

## Phase 5 — Edge Case Lens 🟡

Test the diff against these inputs mentally:

| Input | Does the code handle it? |
|---|---|
| Empty array / empty string | |
| `null` or `undefined` | |
| Zero amount / zero quantity | |
| Very large number (overflow?) | |
| Concurrent duplicate requests | |
| Expired token at the exact moment of use | |
| Network failure mid-transaction | |
| Malformed but valid-looking input | |
| Maximum payload size | |

---

## Phase 6 — Regression Check 🟢

**Fix all, not one.** When you find a bug pattern in this diff:
1. Search the whole codebase for the same pattern
2. List every other location that has the same bug
3. The fix belongs in one commit that covers all instances

A fixed call site with untouched siblings is a regression waiting to be rediscovered.

### Import Order Verification (standing check on every review)

AI coding assistants routinely break CI by adding imports without respecting
ESLint's `import/order` rules. Check every file in the diff:

- [ ] Are imports grouped: `builtin → external → internal monorepo → internal alias → type-only`?
- [ ] Is there a **blank line** between each group?
- [ ] Within the same module, do **value imports come before** `import type` statements?

If any violation is found:
1. Flag it as a **Required Change** (it will break CI lint).
2. Include the fix command: `pnpm --filter <pkg> lint --fix`
3. Add a note: "Run `pnpm turbo lint` after fixing to verify zero errors."

> **Standing reviewer directive:** Never issue a LGTM on a diff that has import
> order violations. A green CI history does not excuse a file that will fail
> lint after being touched again.

---

## Output Format

```markdown
# Adversarial Review — [Feature/PR Name]

## Blast Radius Assessment
- Changed functions: [list]
- Importer count: [N]
- Classification: NARROW / WIDE / CRITICAL
- Review depth warranted: FOCUSED / DEEP / HIGH-EFFORT

## Verdict: ✅ LGTM / ⚠️ REQUEST CHANGES / 🚫 BLOCK

---

## 🚫 BLOCKING Issues (must fix before merge)

### [Issue Title]
**Location:** `src/api/payments.ts:87`  
**Category:** Data Integrity > Transaction  
**Scenario:** When the first INSERT succeeds and the second fails, the charge is applied
but the order record is never created. User is billed with no order.  
**Fix:** Wrap both operations in a single DB transaction.

---

## ⚠️ Required Changes (must fix, can be follow-up PR)

### [Issue Title]
...

---

## 💡 Suggestions (non-blocking improvements)

### [Issue Title]
...

---

## ✅ Passed Checks
- Auth middleware correctly verifies JWT signature
- All inputs validated with Zod before use
- Error paths logged with structured logger
...

## 🔍 Siblings to Fix
The same pattern found at these other locations (fix in a follow-up):
- `src/api/subscriptions.ts:142`
- `src/workers/renewal.ts:67`
```

See `references/review-checklist.md` for the full machine-readable checklist.
