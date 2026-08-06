export function githubSecurityScan(): string {
  return `name: Scheduled Security Scan

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 09:00 UTC
  workflow_dispatch:       # Allow manual trigger

jobs:
  audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Audit all workspaces
        run: pnpm audit --audit-level=moderate

      - name: Check for outdated packages
        run: pnpm outdated || true
`;
}
