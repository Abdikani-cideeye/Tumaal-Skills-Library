export function npmrc(): string {
  return `# Supply-chain security: blocks npm packages published less than 7 days ago.
# This prevents compromised packages (published then yanked within hours) from
# entering the lockfile. See: https://docs.npmjs.com/cli/v11/configuring-npm/npmrc
min-release-age=7
`;
}
