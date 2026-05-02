# Config (PR-bot target)

- **`experiment-defaults.json`** — canonical defaults for `demo_cta` (tracked). Promote workflows and `scripts/patch-defaults.mjs` update this file; **`scripts/sync-config-to-public.mjs`** copies it to `public/experiment-defaults.json` before dev/build (`public/` copy is gitignored).
- **`experiment-defaults.example.json`** — starting shape if you fork and want a template without real values.
