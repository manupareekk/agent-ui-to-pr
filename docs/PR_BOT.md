# PR bot (placeholder architecture)

This repo does **not** open real PRs yet. Intended shape:

1. **Decision input** — JSON or SQL from your analyzer (see `npm run analyze` or PostHog Experiments).
2. **Policy** — minimum sample size, primary KPI winner, guardrails must pass.
3. **Patch** — change a small config file (e.g. default variant, copy map, feature flag JSON), not random TSX.
4. **PR** — GitHub App or `gh` with a token that can push a branch and open a PR.
5. **CI** — required checks (lint, typecheck) before merge.

### GitHub Actions

See `.github/workflows/experiment-decision.yml` (`workflow_dispatch` stub). Duplicate and add secrets:

- `GH_TOKEN` or use `GITHUB_TOKEN` with permissions if same-repo only.

### Local dry run

```bash
node scripts/open-pr-placeholder.mjs
```

Replace the script with `octokit` + branch + commit + `createPullRequest` when you are ready.
