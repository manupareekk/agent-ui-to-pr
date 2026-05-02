#!/usr/bin/env node
/**
 * Reminder script. Real PR flow: GitHub → Actions → "promote experiment (open PR)".
 * Or locally: npm run promote:patch -- B && git commit && gh pr create ...
 */
console.log(`
Promote flow is wired in CI:
  Repo → Actions → "promote experiment (open PR)" → pick A or B → opens a real PR.

Local patch only (no PR):
  npm run promote:patch -- B

See docs/PR_BOT.md
`);
