# Deploying PersonalPocket (web) to Vercel

Same web export as the Netlify setup (`DEPLOY_NETLIFY.md`) — Expo Router's
static SPA build (`web.output: "single"` in `frontend/app.json`), just wired
for Vercel instead. Read the security note in `DEPLOY_NETLIFY.md` before
sharing the link either way; it applies here too.

## What was added

- `vercel.json` (repo root) — since there's no `package.json` at the repo
  root (only in `frontend/`), Vercel can't auto-detect the project without
  this file. It explicitly runs:
  - `installCommand`: `cd frontend && yarn install`
  - `buildCommand`: `cd frontend && npx expo export --platform web`
  - `outputDirectory`: `frontend/dist`
  - a SPA rewrite (`/(.*)` → `/index.html`) — Vercel only falls back to this
    when no static file matches the request path, so real assets
    (`_expo/static/...`, `favicon.ico`) are still served directly.
- `.vercelignore` — excludes `backend/`, `store/`, and other non-web files
  from the upload, since the web build never touches them.

## Steps

### Option A — Vercel dashboard (no local CLI needed)
1. https://vercel.com/new → Import Git Repository → pick
   `umeshpkhiste-uk/PersonalPocket`.
2. Framework Preset: leave as "Other" (or it may say "Vercel will use your
   `vercel.json`" — either way, don't set a Root Directory override; the
   `cd frontend &&` commands in `vercel.json` already handle that).
3. Deploy. First build installs the full Expo/RN toolchain, so expect a few
   minutes.

### Option B — Vercel CLI
```bash
npm install -g vercel
cd "/Users/umeshkhiste/Downloads/My Projects/PersonalPocket/PersonalPocket-main"
vercel login
vercel          # preview deploy
vercel --prod   # production deploy
```

### Test the export locally first (optional, catches failures before Vercel does)
```bash
cd frontend
yarn install   # or npm install
npx expo export --platform web
npx serve dist
```

## Why `yarn install` is spelled out explicitly
`frontend/package.json` pins `"packageManager": "yarn@1.22.22"`, and there's
no lockfile at the repo root for Vercel to auto-detect a package manager
from (the repo root has no `package.json` at all — it only exists under
`frontend/`). Spelling out `installCommand` avoids Vercel guessing wrong and
installing with npm instead.
