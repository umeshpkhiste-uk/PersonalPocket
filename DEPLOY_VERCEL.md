# Deploying PersonalPocket (web) to Vercel

PersonalPocket is a React Native/Expo app; Vercel hosts the **web export**
(Expo Router's `web.output: "single"` → one static SPA bundle), not the
native Android/iOS app. Use this for UI testing/previews only — see the
security note at the bottom before treating it as anything more.

## What was added

- `vercel.json` (repo root) — since there's no `package.json` at the repo
  root (only in `frontend/`), Vercel can't auto-detect the project without
  this file. It explicitly runs:
  - `installCommand`: `cd frontend && npm install`
  - `buildCommand`: `cd frontend && npx expo export --platform web`
  - `outputDirectory`: `frontend/dist`
  - a SPA rewrite (`/(.*)` → `/index.html`) — Vercel only falls back to this
    when no static file matches the request path, so real assets
    (`_expo/static/...`, `favicon.ico`) are still served directly.
- `.vercelignore` — excludes `backend/`, `store/`, and other non-web files
  from the upload, since the web build never touches them.
- `frontend/package-lock.json` — committed so the Vercel install is
  deterministic (see the note below on why npm instead of yarn).

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
npm install
npx expo export --platform web
npx serve dist
```

## Why `npm install` instead of `yarn install`
`frontend/package.json` pins `"packageManager": "yarn@1.22.22"`, which is
what local dev and EAS Build use. The first Vercel deploy with
`installCommand: cd frontend && yarn install` failed at the install step —
most likely Vercel's build image not resolving the pinned Yarn version
through corepack the way local `yarn install` does. Rather than debug
Vercel's corepack behavior blind, this was switched to `npm install`
(verified end-to-end locally: clean install → `expo export --platform web`
→ correct `dist/` output) since npm needs no corepack step and is always
present in Vercel's Node build image. `frontend/package-lock.json` is
committed so this install is reproducible rather than re-resolving from
scratch on every build.

## Security note — read before sharing the Vercel link

On native (iOS/Android), your PIN-derived encryption key material (salt,
verifier, biometric key) is stored in the OS Keychain/Keystore. **The web
build has no Keychain** — `frontend/src/utils/storage/index.web.ts` falls
back to browser `localStorage`/IndexedDB for everything, including that key
material. The vault records are still AES-encrypted, but the web version is
meaningfully less secure than the native app and should be treated as a
UI/functional preview, not a place to store real financial data. Biometric
unlock and screenshot-blocking are also disabled on web (they no-op rather
than error).

If you want the Vercel preview to be harder to stumble onto publicly, use
Vercel's Deployment Protection (Project Settings → Deployment Protection)
since `vercel.json` doesn't set that for you.
