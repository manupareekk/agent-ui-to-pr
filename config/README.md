# Config (PR-bot target)

- **`experiment-defaults.example.json`** — duplicate to `experiment-defaults.json` (gitignored if you want) and teach your CI to patch **only** this file when an experiment wins.
- Today, variant assignment still lives in `src/experiment.ts` (client-side hash). Moving winners here is the natural “promotion” step once you add a small loader or build-time embed.
