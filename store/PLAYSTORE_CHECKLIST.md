# Play Store Submission Checklist — PersonalPocket

Everything generated for you lives in `store/` and `frontend/eas.json` /
`frontend/app.json`. This file is the order of operations.

## Files already created

| File | Purpose |
|---|---|
| `frontend/eas.json` | EAS Build profiles (dev/preview/production → `.aab`) |
| `frontend/app.json` | Updated with final package ID `com.umeshkhiste.personalpocket` and `versionCode: 1` |
| `store/playstore-assets/hi-res-icon-512.png` | 512×512 store icon, alpha channel removed (Play requires no transparency) |
| `store/playstore-assets/feature-graphic-1024x500.png` | Store listing banner graphic |
| `store/privacy-policy.html` | Full privacy policy — must be hosted at a public URL |
| `store/store-listing.md` | Title, short/full description, category, content rating guidance |
| `store/data-safety.md` | Exact answers for the Data Safety form |

## What you still need to do manually

### 1. Replace the placeholder app icon (do this first)
`frontend/assets/images/icon.png` and `adaptive-icon.png` are still Emergent's
generic template icon (the blue "e" swirl), not a PersonalPocket brand icon.
Design a real icon (teal brand palette — `#0A4250` / `#1B6C7D`, see
`frontend/src/theme.ts`) and replace:
- `frontend/assets/images/icon.png` (512×512, no transparency needed but fine with it)
- `frontend/assets/images/adaptive-icon.png` (512×512, foreground only, transparent bg)
- `frontend/assets/images/splash-image.png`
- Then re-run the icon/feature-graphic generation (or regenerate manually)
  so the Play Store assets in `store/playstore-assets/` match the real icon.

### 2. Host the privacy policy
Play Console requires a **live public URL**, not a file. Options:
- GitHub Pages (free): push `store/privacy-policy.html` to a repo, enable Pages.
- Or any static host (Vercel, Netlify, your own domain).
Once hosted, put the URL into `store/store-listing.md` → Contact details, and
into Play Console → App content → Privacy policy.

### 3. Set up EAS and build the release bundle
```bash
npm install -g eas-cli
cd frontend
eas login                 # create a free Expo account if you don't have one
eas build:configure       # links this project to your Expo account
eas build --platform android --profile production
```
This produces a signed `.aab` (Android App Bundle) — the file format Play
Store requires for new apps. EAS manages your signing key for you (or you can
provide your own upload key).

### 4. Create the Play Console app
1. Go to https://play.google.com/console (requires the one-time $25 developer
   registration fee if you haven't registered before).
2. Create app → name "PersonalPocket" → Finance category → Free.
3. Upload `store/playstore-assets/hi-res-icon-512.png` as the app icon.
4. Upload `store/playstore-assets/feature-graphic-1024x500.png` as the feature graphic.
5. Paste in the short/full description from `store/store-listing.md`.
6. Complete the Data Safety form using `store/data-safety.md`.
7. Complete the Content Rating questionnaire (guidance in `store/store-listing.md`).
8. Add the privacy policy URL from step 2.

### 5. Screenshots (required — minimum 2 phone screenshots)
These must come from the actual running app, so I can't generate them for
you statically. Easiest path:
```bash
cd frontend
npx expo start
```
Run it in an Android emulator or on a device, navigate to a few key screens
(unlock, the main tab list, a detail view, add/edit form), and capture
screenshots. Phone screenshots need to be JPEG/PNG, 16:9 or 9:16, between
320px and 3840px on the long edge.

### 6. Upload and release
1. Upload the `.aab` from step 3 to a testing track first (Internal testing
   is fastest — instant, no review).
2. Test the installed build on a real device.
3. Once satisfied, promote to Production, or submit Production directly for
   review (takes anywhere from a few hours to a few days).

## Irreversible decisions already locked in
- **Package name**: `com.umeshkhiste.personalpocket` — cannot be changed after
  the first publish. If you'd rather use a domain you actually own, change it
  in `frontend/app.json` (`ios.bundleIdentifier` and `android.package`) now,
  before your first build.
