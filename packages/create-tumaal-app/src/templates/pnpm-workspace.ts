import type { ScaffoldContext } from '../wizard';

export function pnpmWorkspace(_ctx: ScaffoldContext): string {
  return `packages:\n  - "apps/*"\n  - "packages/*"\n`;
}
