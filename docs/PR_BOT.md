# PR promotion

## If the workflow fails

1. **Repo settings → Actions → General → Workflow permissions** — set **Read and write**, and allow **GitHub Actions to create and approve pull requests** (same page; wording varies). Otherwise `git push` or `gh pr create` returns **403**.
2. **Default branch** — workflow uses `github.event.repository.default_branch` as the PR base. Rename default branch? Update the workflow or keep `main`.
3. **Re-run** after fixing settings; no code change needed.

## What works today

**`.github/workflows/promote-experiment.yml`** — run manually (**Actions → Promote experiment PR → Run workflow**), pick **A** or **B**. It:

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
