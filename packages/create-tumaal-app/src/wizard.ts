import prompts from 'prompts';
import { validateProjectName, validateScope, toKebabCase } from './utils/validate';

export type ProjectType = 'fullstack' | 'api-only' | 'frontend-only';
export type DeployTarget = 'vercel-railway' | 'flyio' | 'docker';

export interface ScaffoldContext {
  projectName: string;
  packageScope: string;
  projectType: ProjectType;
  includeSupabase: boolean;
  includeAuth: boolean;
  deployTarget: DeployTarget;
}

export async function runWizard(): Promise<ScaffoldContext> {
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name?',
        initial: 'my-tumaal-app',
        validate: validateProjectName,
        format: (value: string) => toKebabCase(value),
      },
      {
        type: 'select',
        name: 'projectType',
        message: 'Project type?',
        choices: [
          { title: 'Full-Stack Monorepo (API + Frontend)', value: 'fullstack' },
          { title: 'Standalone API only (Hono)', value: 'api-only' },
          { title: 'Frontend only (Next.js)', value: 'frontend-only' },
        ],
        initial: 0,
      },
      {
        type: 'text',
        name: 'packageScope',
        message: 'Package scope?',
        initial: (prev: unknown, values: Partial<ScaffoldContext>) =>
          `@${values.projectName ?? 'my-app'}`,
        validate: validateScope,
      },
      {
        type: 'confirm',
        name: 'includeSupabase',
        message: 'Include Supabase (database + auth)?',
        initial: true,
      },
      {
        type: (prev: boolean) => (prev ? 'confirm' : null),
        name: 'includeAuth',
        message: 'Include JWT authentication middleware?',
        initial: true,
      },
      {
        type: 'select',
        name: 'deployTarget',
        message: 'Primary deployment target?',
        choices: [
          { title: 'Vercel (frontend) + Railway (API)', value: 'vercel-railway' },
          { title: 'Fly.io (both)', value: 'flyio' },
          { title: 'Docker / Self-Hosted', value: 'docker' },
        ],
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        console.log('\n  Cancelled. No files were created.\n');
        process.exit(0);
      },
    },
  );

  return {
    projectName: response.projectName as string,
    packageScope: response.packageScope as string,
    projectType: response.projectType as ProjectType,
    includeSupabase: response.includeSupabase as boolean,
    includeAuth: (response.includeAuth as boolean | undefined) ?? false,
    deployTarget: response.deployTarget as DeployTarget,
  };
}
