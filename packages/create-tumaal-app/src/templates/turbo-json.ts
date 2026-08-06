import type { ScaffoldContext } from '../wizard';

export function turboJson(_ctx: ScaffoldContext): string {
  return JSON.stringify(
    {
      $schema: 'https://turbo.build/schema.json',
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['.next/**', '!.next/cache/**', 'dist/**'],
        },
        dev: {
          cache: false,
          persistent: true,
        },
        lint: {
          dependsOn: ['^build'],
        },
        'type-check': {
          dependsOn: ['^build'],
        },
        test: {
          dependsOn: ['^build'],
          cache: false,
        },
        clean: {
          cache: false,
        },
      },
    },
    null,
    2,
  );
}
