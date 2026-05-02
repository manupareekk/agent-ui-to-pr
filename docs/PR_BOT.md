# PR promotion

## What works today

**`.github/workflows/promote-experiment.yml`** — run manually (**Actions → promote experiment → Run workflow**), pick **A** or **B**. It:

1. Runs `node scripts/patch-defaults.mjs <winner>` (updates `public/experiment-defaults.json`).
2. Pushes branch `promote/demo-cta-<run_id>` and opens a **pull request** to `main` using `gh` + `github.token`.

After merge + deploy, the static app fetches `/experiment-defaults.json` with `cache: no-store` and forces that variant for everyone (see `loadExperimentDefaults()` in `src/experiment.ts`).

### Local patch (no PR)

```bash
npm run promote:patch -- B
npm run build
```

## Next upgrades

1. **Decision input** — drive the workflow from `npm run analyze`, PostHog, or BigQuery instead of a manual **winner** input.
2. **Policy** — minimum sample size + guardrail checks before `patch-defaults`.
3. **GitHub App** — swap `github.token` for an installation token if you need cross-repo writes.

### Legacy placeholder script

```bash
npm run pr:hint
```
