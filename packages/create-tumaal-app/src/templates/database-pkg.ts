import type { ScaffoldContext } from '../wizard';

export function databasePkg(ctx: ScaffoldContext): Record<string, string> {
  const scope = ctx.packageScope;

  const packageJson = JSON.stringify(
    {
      name: `${scope}/database`,
      version: '0.1.0',
      private: true,
      type: 'module',
      exports: {
        '.': { types: './src/index.ts', default: './src/index.ts' },
      },
      scripts: {
        'type-check': 'tsc --noEmit',
        clean: 'rimraf dist',
      },
      dependencies: {
        '@supabase/supabase-js': '^2.110.0',
      },
      devDependencies: {
        typescript: '^5.8.0',
      },
    },
    null,
    2,
  );

  const tsconfig = JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      include: ['src'],
    },
    null,
    2,
  );

  const indexTs = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'] ?? '';
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'] ?? '';
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
`;

  const readme = `# ${scope}/database

Shared Supabase client package. Import \`supabase\` (anon/public client) or
\`supabaseAdmin\` (service-role client, server-side only) from this package.

\`\`\`typescript
import { supabase, supabaseAdmin } from '${scope}/database';
\`\`\`

**Never expose \`supabaseAdmin\` to the client bundle.** It bypasses Row Level Security.
`;

  return {
    'packages/database/package.json': packageJson,
    'packages/database/tsconfig.json': tsconfig,
    'packages/database/src/index.ts': indexTs,
    'packages/database/README.md': readme,
  };
}
