export function gitignore(): string {
  return `# ─────────────────────────────────────────────────────────────
# .gitignore — Tumaal Monorepo
# ─────────────────────────────────────────────────────────────

# ── Dependencies ─────────────────────────────────────────────
node_modules/
.pnpm-store/

# ── Build Outputs ─────────────────────────────────────────────
dist/
build/
out/
.next/
.nuxt/
.output/

# ── Turborepo ─────────────────────────────────────────────────
.turbo/

# ── Environment Variables — NEVER commit secrets ──────────────
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.staging
.env.staging.local
# (keep only .env.example — no secrets inside)

# ── TypeScript Build Info ──────────────────────────────────────
*.tsbuildinfo

# ── Logs ──────────────────────────────────────────────────────
*.log
*.err.log
*.out.log
logs/
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*

# ── Cache & Temp ──────────────────────────────────────────────
.cache/
.temp/
.tmp/
tmp/
temp/
*.cache

# ── OS Files ──────────────────────────────────────────────────
.DS_Store
.DS_Store?
Thumbs.db
ehthumbs.db
Desktop.ini

# ── IDE / Editor ──────────────────────────────────────────────
.vscode/settings.json
.vscode/launch.json
.idea/
*.swp
*.swo
*~

# ── Test Coverage ─────────────────────────────────────────────
coverage/
.nyc_output/

# ── Vercel / Deployment ───────────────────────────────────────
.vercel
`;
}
