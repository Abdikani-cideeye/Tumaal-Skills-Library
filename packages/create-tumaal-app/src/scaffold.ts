import path from 'node:path';
import { execSync } from 'node:child_process';
import type { ScaffoldContext } from './wizard';
import { writeFile, exists } from './utils/fs';
import { logger } from './utils/logger';

import { rootPackageJson } from './templates/root-package-json';
import { pnpmWorkspace } from './templates/pnpm-workspace';
import { turboJson } from './templates/turbo-json';
import { tsconfigBase } from './templates/tsconfig-base';
import { editorconfig } from './templates/editorconfig';
import { prettierrc } from './templates/prettierrc';
import { gitignore } from './templates/gitignore';
import { npmrc } from './templates/npmrc';
import { githubCi } from './templates/github-ci';
import { githubSecurityScan } from './templates/github-security-scan';
import { githubDependabot } from './templates/github-dependabot';
import { apiApp } from './templates/api-app';
import { frontendApp } from './templates/frontend-app';
import { sharedSchemas } from './templates/shared-schemas';
import { eslintConfig } from './templates/eslint-config';
import { databasePkg } from './templates/database-pkg';
import { skillsMd } from './templates/skills-md';
import { envExample } from './templates/env-example';

export async function scaffold(ctx: ScaffoldContext): Promise<void> {
  const root = path.resolve(process.cwd(), ctx.projectName);

  if (exists(root)) {
    logger.fatal(`Directory "${ctx.projectName}" already exists. Aborting.`);
    process.exit(1);
  }

  logger.step(`Creating project in ${root}`);

  // Root config files
  write(root, 'package.json', rootPackageJson(ctx));
  write(root, 'pnpm-workspace.yaml', pnpmWorkspace(ctx));
  write(root, 'turbo.json', turboJson(ctx));
  write(root, 'tsconfig.base.json', tsconfigBase());
  write(root, '.editorconfig', editorconfig());
  write(root, '.prettierrc', prettierrc());
  write(root, '.gitignore', gitignore());
  write(root, '.npmrc', npmrc());
  write(root, '.env.example', envExample(ctx));
  write(root, 'SKILLS.md', skillsMd(ctx));
  logger.success('Root config files');

  // GitHub CI/CD
  write(root, '.github/workflows/ci.yml', githubCi(ctx));
  write(root, '.github/workflows/security-scan.yml', githubSecurityScan());
  write(root, '.github/dependabot.yml', githubDependabot(ctx));
  logger.success('GitHub CI/CD workflows');

  // Shared packages
  writeFileMap(root, sharedSchemas(ctx));
  writeFileMap(root, eslintConfig(ctx));
  logger.success('Shared packages (schemas, eslint-config)');

  // Database package (conditional)
  if (ctx.includeSupabase) {
    writeFileMap(root, databasePkg(ctx));
    logger.success('Database package (Supabase)');
  }

  // API app (conditional)
  if (ctx.projectType === 'fullstack' || ctx.projectType === 'api-only') {
    writeFileMap(root, apiApp(ctx));
    logger.success('API app (Hono)');
  }

  // Frontend app (conditional)
  if (ctx.projectType === 'fullstack' || ctx.projectType === 'frontend-only') {
    writeFileMap(root, frontendApp(ctx));
    logger.success('Frontend app (Next.js 15)');
  }

  // Install dependencies
  logger.step('Installing dependencies with pnpm...');
  try {
    execSync('pnpm install', { cwd: root, stdio: 'inherit' });
    logger.success('Dependencies installed');
  } catch {
    logger.warn('pnpm install failed — run it manually: cd ' + ctx.projectName + ' && pnpm install');
  }
}

function write(root: string, relativePath: string, content: string): void {
  writeFile(path.join(root, relativePath), content);
}

function writeFileMap(root: string, files: Record<string, string>): void {
  for (const [filePath, content] of Object.entries(files) as [string, string][]) {
    write(root, filePath, content);
  }
}
