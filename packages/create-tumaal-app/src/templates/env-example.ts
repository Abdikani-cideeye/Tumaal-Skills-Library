import type { ScaffoldContext } from '../wizard';

export function envExample(ctx: ScaffoldContext): string {
  const supabaseVars = ctx.includeSupabase
    ? `# ── Supabase ─────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`
    : '';

  const frontendVars =
    ctx.projectType === 'fullstack' || ctx.projectType === 'frontend-only'
      ? `# ── Frontend ─────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:4001
`
      : '';

  const apiVars =
    ctx.projectType === 'fullstack' || ctx.projectType === 'api-only'
      ? `# ── API ──────────────────────────────────────────────────────
PORT=4001
ADMIN_FRONTEND_URL=http://localhost:3001
`
      : '';

  return `# ─────────────────────────────────────────────────────────────
# ${ctx.projectName} — .env.example
# Copy to .env and fill in real values. NEVER commit .env.
# ─────────────────────────────────────────────────────────────

${supabaseVars}${apiVars}${frontendVars}`;
}
