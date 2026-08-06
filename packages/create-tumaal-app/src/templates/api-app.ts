import type { ScaffoldContext } from '../wizard';

export function apiApp(ctx: ScaffoldContext): Record<string, string> {
  const scope = ctx.packageScope;
  const deps: Record<string, string> = {
    '@hono/node-server': '^1.14.0',
    '@hono/zod-validator': '^0.9.0',
    hono: '^4.7.0',
    zod: '^3.25.0',
  };
  if (ctx.includeSupabase) {
    deps['@supabase/supabase-js'] = '^2.110.0';
    deps[`${scope}/database`] = 'workspace:*';
  }
  deps[`${scope}/shared-schemas`] = 'workspace:*';

  const packageJson = JSON.stringify(
    {
      name: `${scope}/api`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        lint: 'eslint src/',
        'type-check': 'tsc --noEmit',
        test: "echo 'No tests yet'",
        clean: 'rimraf dist .turbo',
      },
      dependencies: deps,
      devDependencies: {
        '@types/node': '^22.0.0',
        [`${scope}/eslint-config`]: 'workspace:*',
        eslint: '^9.29.0',
        tsx: '^4.19.0',
        typescript: '^5.8.0',
      },
    },
    null,
    2,
  );

  const tsconfig = JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        outDir: 'dist',
        noEmit: false,
      },
      include: ['src'],
    },
    null,
    2,
  );

  const supabaseLib = ctx.includeSupabase
    ? `import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
`
    : '';

  const envLib = `import fs from 'fs';
import path from 'path';

if (!process.env['${ctx.includeSupabase ? 'SUPABASE_URL' : 'PORT'}']) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split(/\\r?\\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  } catch {}
}

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4001),
  ${ctx.includeSupabase ? `SUPABASE_URL: z.string().url(),\n  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),` : ''}
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      \`Invalid environment variables:\\n\${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}\`,
    );
  }
  return parsed.data;
}

export const env = validateEnv();
`;

  const authMiddleware = ctx.includeAuth && ctx.includeSupabase
    ? `import type { Context, Next } from 'hono';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.js';

export type AuthVariables = { user: User };

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ success: false, error: { message: 'Missing Authorization header', code: 'UNAUTHORIZED' } }, 401);
  }
  const token = header.slice('Bearer '.length).trim();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ success: false, error: { message: error?.message ?? 'Invalid token', code: 'UNAUTHORIZED' } }, 401);
  }
  c.set('user', user);
  await next();
}
`
    : '';

  const securityHeadersMiddleware = `import type { Context, Next } from 'hono';

export async function securityHeaders(c: Context, next: Next) {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '0');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.header('X-Powered-By', '');
}
`;

  const healthRoute = `import { Hono } from 'hono';

export const healthRoute = new Hono();

healthRoute.get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
`;

  const indexTs = ctx.includeAuth && ctx.includeSupabase
    ? `import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AuthVariables } from './middleware/auth.js';
import { requireAuth } from './middleware/auth.js';
import { securityHeaders } from './middleware/security-headers.js';
import { healthRoute } from './routes/health.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', securityHeaders);
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3001',
      process.env['FRONTEND_URL'] ?? '',
    ].filter(Boolean),
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.route('/health', healthRoute);
app.use('/api/*', requireAuth);

const PORT = Number(process.env['PORT']) || 4001;
console.log(\`API server starting on port \${String(PORT)}\`);

serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' });
export default app;
`
    : `import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { securityHeaders } from './middleware/security-headers.js';
import { healthRoute } from './routes/health.js';

const app = new Hono();
app.use('*', securityHeaders);
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3001', process.env['FRONTEND_URL'] ?? ''].filter(Boolean),
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.route('/health', healthRoute);

const PORT = Number(process.env['PORT']) || 4001;
serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' });
export default app;
`;

  const files: Record<string, string> = {
    'apps/api/package.json': packageJson,
    'apps/api/tsconfig.json': tsconfig,
    'apps/api/.env.example': `PORT=4001\nFRONTEND_URL=http://localhost:3001\n${ctx.includeSupabase ? 'SUPABASE_URL=\nSUPABASE_SERVICE_ROLE_KEY=\n' : ''}`,
    'apps/api/src/index.ts': indexTs,
    'apps/api/src/lib/env.ts': envLib,
    'apps/api/src/routes/health.ts': healthRoute,
    'apps/api/src/middleware/security-headers.ts': securityHeadersMiddleware,
  };

  if (ctx.includeSupabase) files['apps/api/src/lib/supabase.ts'] = supabaseLib;
  if (authMiddleware) files['apps/api/src/middleware/auth.ts'] = authMiddleware;

  return files;
}
