import type { ScaffoldContext } from '../wizard';

export function frontendApp(ctx: ScaffoldContext): Record<string, string> {
  const scope = ctx.packageScope;

  const packageJson = JSON.stringify(
    {
      name: `${scope}/frontend`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'next dev --port 3001',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'type-check': 'tsc --noEmit',
        test: 'vitest run',
        clean: 'rimraf .next .turbo',
      },
      dependencies: {
        next: '^15.3.0',
        react: '^19.1.0',
        'react-dom': '^19.1.0',
        'server-only': '^0.0.1',
        ...(ctx.includeSupabase
          ? {
              '@supabase/ssr': '^0.12.0',
              '@supabase/supabase-js': '^2.110.0',
            }
          : {}),
        [`${scope}/shared-schemas`]: 'workspace:*',
        zod: '^3.25.0',
      },
      devDependencies: {
        '@tailwindcss/postcss': '^4.1.0',
        '@testing-library/jest-dom': '^7.0.0',
        '@testing-library/react': '^16.3.2',
        '@types/node': '^22.0.0',
        '@types/react': '^19.1.0',
        '@types/react-dom': '^19.1.0',
        [`${scope}/eslint-config`]: 'workspace:*',
        jsdom: '^30.0.1',
        tailwindcss: '^4.1.0',
        typescript: '^5.8.0',
        vitest: '^4.1.10',
      },
    },
    null,
    2,
  );

  const tsconfig = JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        jsx: 'preserve',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        plugins: [{ name: 'next' }],
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    null,
    2,
  );

  const nextConfig = `import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { typedRoutes: true },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default config;
`;

  const rootLayout = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${ctx.projectName}',
  description: 'Built with Tumaal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  const rootPage = `export default function HomePage() {
  return (
    <main>
      <h1>Welcome to ${ctx.projectName}</h1>
      <p>Your Tumaal project is ready. Edit <code>apps/frontend/src/app/page.tsx</code> to get started.</p>
    </main>
  );
}
`;

  const globalsCss = `@import "tailwindcss";

:root {
  --font-sans: system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-sans);
  margin: 0;
}
`;

  const envExample = ctx.includeSupabase
    ? `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n`
    : `NEXT_PUBLIC_API_URL=http://localhost:4001\n`;

  return {
    'apps/frontend/package.json': packageJson,
    'apps/frontend/tsconfig.json': tsconfig,
    'apps/frontend/next.config.ts': nextConfig,
    'apps/frontend/.env.example': envExample,
    'apps/frontend/src/app/layout.tsx': rootLayout,
    'apps/frontend/src/app/page.tsx': rootPage,
    'apps/frontend/src/app/globals.css': globalsCss,
  };
}
