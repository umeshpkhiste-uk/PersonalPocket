# Deploying PersonalPocket (web) to Netlify

PersonalPocket is a React Native/Expo app; Netlify hosts the **web export**
(Expo Router's `web.output: "single"` → one static SPA bundle), not the
native Android/iOS app. Use this for UI testing/previews only — see the
security note at the bottom before treating it as anything more.

## What was changed for this

- `netlify.toml` (repo root) — `base: frontend`, build command
  `npx expo export --platform web`, publish dir `dist`, SPA catch-all
  redirect to `index.html`, pinned `NODE_VERSION = 20`.
- `frontend/package.json` — added a `build:web` script (`expo export --platform web`)
  for testing the export locally before pushing.
- Verified: no native-only code path runs unguarded on web — `storage/index.web.ts`
  already swaps SecureStore for AsyncStorage, `PrivacyCover` no-ops on web, and
  the biometric/screen-capture calls in `VaultContext.tsx` are wrapped so they
  no-op on web too. No changes were needed there.

## Steps

### 1. Push to GitHub
```bash
cd "/Users/umeshkhiste/Downloads/My Projects/PersonalPocket/PersonalPocket-main"
git add -A
git commit -m "Initial commit"
gh repo create personalpocket --private --source=. --remote=origin --push
# or, without gh: create the repo on github.com, then
#   git remote add origin <your-repo-url>
#   git branch -M main
#   git push -u origin main
```

### 2. Connect Netlify
1. https://app.netlify.com → Add new site → Import an existing project → pick the GitHub repo.
2. Netlify will read `netlify.toml` automatically — base directory, build
   command, and publish directory are already set, nothing to fill in manually.
3. Deploy. First build installs the full RN/Expo toolchain, so expect a few minutes.

### 3. Test locally first (recommended, catches failures before they cost a Netlify build)
```bash
cd frontend
yarn install   # or npm install, if you don't have yarn
yarn build:web
npx serve dist   # or any static server; open the printed localhost URL
```

## Security note — read before sharing the Netlify link

On native (iOS/Android), your PIN-derived encryption key material (salt,
verifier, biometric key) is stored in the OS Keychain/Keystore. **The web
build has no Keychain** — `storage/index.web.ts` falls back to browser
`localStorage`/IndexedDB for everything, including that key material. The
vault records are still AES-encrypted, but the web version is meaningfully
less secure than the native app and should be treated as a UI/functional
preview, not a place to store real financial data. Biometric unlock and
screenshot-blocking are also disabled on web (they no-op rather than error).

If you want the Netlify preview to be harder to stumble onto publicly,
enable Netlify's password protection (Site settings → Visitor access) since
`netlify.toml` doesn't set that for you.
