import type { ScaffoldContext } from '../wizard';

export function rootPackageJson(ctx: ScaffoldContext): string {
  const apps = [];
  if (ctx.projectType === 'fullstack' || ctx.projectType === 'api-only') apps.push('api');
  if (ctx.projectType === 'fullstack' || ctx.projectType === 'frontend-only') apps.push('frontend');

  return JSON.stringify(
    {
      name: ctx.projectName,
      version: '0.1.0',
      private: true,
      packageManager: 'pnpm@10.12.1',
      scripts: {
        dev: 'turbo run dev',
        build: 'turbo run build',
        lint: 'turbo run lint',
        'type-check': 'turbo run type-check',
        test: 'turbo run test',
        clean: 'turbo run clean && rimraf node_modules',
        format: 'prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"',
      },
      devDependencies: {
        prettier: '^3.5.0',
        rimraf: '^6.0.1',
        turbo: '^2.5.0',
        typescript: '^5.8.0',
        vitest: '^4.1.10',
      },
    },
    null,
    2,
  );
}
