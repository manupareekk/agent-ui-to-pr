# Config (PR-bot target)

- **`experiment-defaults.json`** — canonical defaults for `demo_cta` (tracked). Promote workflows and `scripts/patch-defaults.mjs` update this file; **`scripts/sync-config-to-public.mjs`** copies it to `public/experiment-defaults.json` before dev/build (`public/` copy is gitignored).
- **`ui-pattern-policy.json`** — segment count, exploration rate, template catalog, and per-segment **`segmentWinners`** for pattern families (e.g. `confirm_surface`). Updated locally via **`npm run promote:patterns`** or Actions **`promote-pattern-from-data.yml`**. Synced to `public/ui-pattern-policy.json` (gitignored).
- **`experiment-defaults.example.json`** — starting shape if you fork and want a template without real values.
