export function prettierrc(): string {
  return JSON.stringify(
    {
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      printWidth: 100,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'lf',
    },
    null,
    2,
  );
}
