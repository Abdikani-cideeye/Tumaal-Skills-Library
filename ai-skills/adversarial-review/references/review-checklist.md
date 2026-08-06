# Adversarial Review Checklist — Machine-Readable Reference

Use this alongside the `adversarial-review` SKILL.md. Every item must be checked.
Mark each as: ✅ PASS | ⚠️ CONCERN | 🚫 BLOCK | N/A

---

## PRE-REVIEW: Blast Radius Assessment

```
[ ] List all functions/types/constants changed in the diff
[ ] For each: count importers (grep across src/, test/, scripts/)
[ ] Classify: NARROW (<5 importers) / WIDE (5-50) / CRITICAL (50+, or auth/data/concurrency)
[ ] State review depth required in the report header
```

---

## SECURITY LENS

### Auth & Trust Boundaries
```
[ ] Every new route: is it guarded by auth middleware?
[ ] Token handling: is the signature verified (not just decoded)?
[ ] New code path: does it bypass any existing middleware?
[ ] New capability: should it require human-in-the-loop approval?
    (admin grants, impersonation, irreversible actions — must NOT be automatable)
[ ] Permission check: does the code verify ownership before reading/mutating?
```

### Secrets & Data Exposure
```
[ ] New env variable: is it server-only or accidentally client-exposed?
[ ] New log statement: does it log tokens, passwords, or PII?
[ ] Error response: does it expose internal stack traces or DB schema?
[ ] New NEXT_PUBLIC_ or equivalent: is a secret hiding here?
```

### Injection
```
[ ] DB queries: parameterized? No string concatenation with user input?
[ ] HTML output: sanitized? No raw innerHTML with user input?
[ ] Server-side fetch: user-supplied URL validated? SSRF prevention?
[ ] File paths: user-supplied path segments validated? Path traversal prevention?
```

### Dependencies
```
[ ] New npm package added: age ≥7 days?
[ ] New npm package: check Socket.dev for supply-chain risk
[ ] New npm package: weekly downloads >10K? (below this = abandonment risk)
[ ] Locked version or version range? (ranges introduce supply-chain risk)
```

---

## DATA INTEGRITY LENS

### Transactions
```
[ ] Multi-step DB writes: wrapped in a transaction?
[ ] Partial failure scenario: does it leave data consistent?
[ ] File + DB operation: which order? (DB first, then file — not reverse)
```

### Idempotency
```
[ ] Can this mutation be retried without creating duplicates?
[ ] Webhook handler: is it idempotent? Dedupe key used?
[ ] Payment/charge handler: idempotency key passed to provider?
```

### Deletion
```
[ ] DELETE operation: has a WHERE clause?
[ ] DELETE: does it match the soft-delete convention (if project uses one)?
[ ] Cascade: defined and correct? Does deleting X orphan Y?
[ ] Blob/file delete: DB record deleted first?
```

### Durability
```
[ ] New module-level Map/Set/Array: is it read back across requests?
[ ] If yes: is it backed by a durable store (DB, Redis)?
[ ] New in-memory queue or buffer: what happens on server restart?
```

---

## CONCURRENCY LENS

```
[ ] Read-then-write pattern: is it atomic? (SELECT then UPDATE is not atomic)
[ ] Check-then-act: is there a window between check and action?
    Pattern: if (balance > amount) { deduct() } — NOT ATOMIC
[ ] Cache read-then-write: distributed lock for high-traffic keys?
[ ] Counter increment: atomic DB operation? (UPDATE SET count = count + 1)
[ ] File write: multiple processes could write simultaneously?
[ ] Webhook: same event could be processed twice? Handler idempotent?
```

---

## ERROR PATH LENS

For every external call in the diff (DB, API, cache, filesystem):
```
[ ] Timeout: what happens if it times out?
[ ] Error: is the error caught, logged, and handled?
[ ] Silent catch: is there an empty catch block? (BLOCK)
[ ] Unawaited promise: is the promise awaited or .catch()-chained?
[ ] Null/undefined propagation: optional chaining hiding a deeper bug?
[ ] React tree: is there an error boundary for new data-fetching components?
```

---

## EDGE CASE LENS

Mentally test the diff against these inputs:
```
[ ] Empty array input → does it crash or return correctly?
[ ] null / undefined → handled without TypeError?
[ ] Zero amount / zero count → does division by zero or negative logic trigger?
[ ] Maximum allowed value → does it overflow or exceed DB column limits?
[ ] Concurrent duplicate requests → creates duplicates? Race condition?
[ ] Expired token at moment of use → handled gracefully?
[ ] Malformed but valid-looking input → e.g., "2025-13-45" as a date
[ ] Maximum payload size → is there a body size limit?
[ ] User with no permissions → correct 403, not 500?
```

---

## REGRESSION CHECK

```
[ ] Bug pattern found in diff: searched rest of codebase for same pattern?
[ ] List of sibling locations to fix in follow-up:
    - [file:line]
    - [file:line]
[ ] Affected test coverage: do tests cover the change?
[ ] If no tests: is a test being added?
```

---

## VERDICT RUBRIC

| Verdict | Condition |
|---|---|
| ✅ **LGTM** | Zero BLOCK items, all CONCERN items documented and accepted |
| ⚠️ **REQUEST CHANGES** | One or more CONCERN items that must be addressed before merge |
| 🚫 **BLOCK** | Any BLOCK item found (security hole, data loss, silent failure in critical path) |

**The reviewer has the final word on depth.** If a "CONCERN" is found during a scope that
didn't call for it, escalate to BLOCK or REQUEST CHANGES on your own initiative.
A reviewer who stays in their lane when they spot risk is not doing their job.
