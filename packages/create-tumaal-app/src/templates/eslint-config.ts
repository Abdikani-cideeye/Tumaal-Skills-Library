import type { ScaffoldContext } from '../wizard';

export function eslintConfig(ctx: ScaffoldContext): Record<string, string> {
  const scope = ctx.packageScope;

  const packageJson = JSON.stringify(
    {
      name: `${scope}/eslint-config`,
      version: '0.1.0',
      private: true,
      type: 'commonjs',
      exports: {
        './base': './base.js',
      },
      devDependencies: {
        '@eslint/js': '^9.0.0',
        'typescript-eslint': '^8.0.0',
      },
    },
    null,
    2,
  );

  const baseJs = `const { configs } = require('typescript-eslint');

module.exports = [
  ...configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
`;

  return {
    'packages/eslint-config/package.json': packageJson,
    'packages/eslint-config/base.js': baseJs,
  };
}
