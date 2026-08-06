import type { ScaffoldContext } from '../wizard';

export function githubDependabot(ctx: ScaffoldContext): string {
  const hasApi = ctx.projectType === 'fullstack' || ctx.projectType === 'api-only';
  const hasFrontend = ctx.projectType === 'fullstack' || ctx.projectType === 'frontend-only';

  const appEntries = [
    ...(hasApi ? [depEntry('/apps/api')] : []),
    ...(hasFrontend ? [depEntry('/apps/frontend')] : []),
  ].join('\n');

  const pkgEntries = [
    depEntry('/packages/shared-schemas'),
    depEntry('/packages/eslint-config'),
    ...(ctx.includeSupabase ? [depEntry('/packages/database')] : []),
  ].join('\n');

  return `version: 2
updates:
  # Root package.json
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10

${appEntries}
${pkgEntries}
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
`;
}

function depEntry(dir: string): string {
  return `  - package-ecosystem: "npm"
    directory: "${dir}"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 5
`;
}
