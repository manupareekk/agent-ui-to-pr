#!/usr/bin/env node
/**
 * Placeholder for “promote winning variant” automation.
 * Real version: use `gh pr create` or octokit with a GitHub App installation token.
 *
 *   node scripts/open-pr-placeholder.mjs
 */
console.log(`
Next steps (manual or CI):
  1. Decide winner from analyzer output or your warehouse.
  2. Edit src/demoMessages.ts (or move copy to config/*.json) for the default CTA.
  3. gh pr create --title "chore(experiments): promote demo_cta winner" --body "$(cat decision.md)"

Secrets: GH_TOKEN with contents:write + pull_requests (fine-grained) or a GitHub App.
See docs/PR_BOT.md
`);
