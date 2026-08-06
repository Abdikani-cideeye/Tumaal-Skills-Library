export function tsconfigBase(): string {
  return JSON.stringify(
    {
      $schema: 'https://json.schemastore.org/tsconfig',
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        noFallthroughCasesInSwitch: true,
        skipLibCheck: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        composite: false,
        noEmit: true,
        incremental: true,
      },
      exclude: ['node_modules', 'dist', '.next', '.turbo'],
    },
    null,
    2,
  );
}
