import type { ScaffoldContext } from '../wizard';

export function sharedSchemas(ctx: ScaffoldContext): Record<string, string> {
  const scope = ctx.packageScope;

  const packageJson = JSON.stringify(
    {
      name: `${scope}/shared-schemas`,
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
      dependencies: { zod: '^3.25.0' },
      devDependencies: { typescript: '^5.8.0' },
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

  const indexTs = `import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
`;

  return {
    'packages/shared-schemas/package.json': packageJson,
    'packages/shared-schemas/tsconfig.json': tsconfig,
    'packages/shared-schemas/src/index.ts': indexTs,
  };
}
