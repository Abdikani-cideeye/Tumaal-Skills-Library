# TUMAAL AI CODING RULES — PRE-FLIGHT LINTING

> **Scope:** Applies to ALL AI-assisted coding tasks across every package in
> every Tumaal project. This is a standing, non-optional protocol.

---

## THE PRE-FLIGHT LINTING RULE

> **AI coding assistants frequently break CI/CD pipelines by appending imports
> to files without respecting ESLint's strict `import/order` rules. This has a
> zero-tolerance policy. Every task concludes with a passing lint run.**

### The Rule

**BEFORE declaring any coding task complete, the AI MUST:**

1. Run the auto-fix lint command on every package it modified.
2. Verify the output shows **zero errors**.
3. Only then stage, commit, and push.

**This is non-negotiable.** A push that breaks CI lint is equivalent to
shipping broken code. The human should never have to fix import ordering.

---

## REQUIRED COMMANDS

### Monorepo (pnpm + Turborepo)

```bash
# Fix ALL modified packages at once
pnpm turbo lint --filter=...[HEAD^1]

# Or — fix a specific package by name
pnpm --filter @yourorg/package-name lint --fix

# Or — fix ALL packages (safest fallback)
pnpm turbo lint -- --fix
```

### Next.js packages specifically

Next.js ships its own ESLint runner. If the package uses `next lint`, run:

```bash
pnpm --filter @yourorg/next-app exec eslint src/ --fix
```

> ⚠️ `next lint --fix` works but is deprecated in Next.js 15+.
> Prefer calling `eslint` directly via `exec`.

---

## THE STANDARD IMPORT ORDER

Every TypeScript/JavaScript file must follow this exact order, with a **blank
line between each group:**

```
Group 1 — Node.js built-ins      (fs, path, crypto, ...)
Group 2 — External packages      (react, next, hono, zod, ...)
Group 3 — Internal monorepo      (@yourorg/database, @yourorg/shared-schemas)
Group 4 — Internal path aliases  (@/lib/..., @/components/..., ../utils/...)
Group 5 — Type-only imports      (import type { Foo } from '...')
```

**Within each group**, imports are sorted alphabetically (ESLint enforces this).

**Value imports always precede type-only imports from the same module:**

```typescript
// ✅ CORRECT
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ❌ WRONG — type before value from the same package
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
```

---

## COMMON VIOLATION PATTERNS & FIXES

### Pattern 1: `@org/internal` package mixed with external

```typescript
// ❌ WRONG
import { Hono } from 'hono';
import { ArticleInsert } from '@visitpuntland/database';
import { zValidator } from '@hono/zod-validator';

// ✅ CORRECT — external group first, then blank line, then internal group
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { ArticleInsert } from '@visitpuntland/database';
```

### Pattern 2: Type import before value import from same module

```typescript
// ❌ WRONG
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ✅ CORRECT — value first, then type
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
```

### Pattern 3: No blank line between groups

```typescript
// ❌ WRONG — external and internal in the same block
import { Hono } from 'hono';
import { supabase } from '../lib/supabase';

// ✅ CORRECT — blank line separates groups
import { Hono } from 'hono';

import { supabase } from '../lib/supabase';
```

---

## AI EXECUTION CHECKLIST

After completing any task that modifies TypeScript or JavaScript files, run
through this checklist **before pushing**:

- [ ] Did I add any new `import` statements?
- [ ] Are all new imports in the correct group (built-in / external / internal / alias)?
- [ ] Is there a blank line between each group?
- [ ] Are value imports listed before type-only imports from the same package?
- [ ] Have I run `pnpm --filter <package> lint --fix` on every modified package?
- [ ] Does the lint command exit with **0 errors** and **0 warnings**?
- [ ] Only now: `git add`, `git commit`, `git push`.

**If any check fails → fix it before committing. Never push a known-broken file.**

---

## WHY THIS MATTERS

The Tumaal ESLint config (`packages/eslint-config/base.js`) enforces:

| Rule | What it checks |
|------|----------------|
| `import/order` | Import groups and blank lines between them |
| `@typescript-eslint/consistent-type-imports` | Value imports before `import type` |
| `import/no-duplicates` | No two imports from the same source |

These run in CI on every push. A single out-of-order import **blocks the entire
pipeline** — the Lint job fails before Type-Check, Test, or Build can run.

One `lint --fix` command fixes all of the above automatically. There is no
excuse for skipping it.
