# Play Console "Data safety" form — answers for PersonalPocket

Play Console → Policy → App content → Data safety. Fill it out exactly as below.
This reflects reality: the app has no backend for user data (the FastAPI/MongoDB
template in `/backend` is unused — nothing in the app calls it).

## Step 1 — Data collection and security

**Does your app collect or share any of the required user data types?**
→ **No**

This is the single most important answer. Because PersonalPocket never transmits
any data off the device (no network calls for vault data, no analytics SDK, no
crash reporter phoning home), you can truthfully declare zero data collection.

If Play Console still forces you through the per-category questions (older flow),
answer "No data collected" for every category: Location, Personal info,
Financial info, Health & fitness, Messages, Photos/videos, Audio, Files/docs,
Calendar, Contacts, App activity, Web browsing, App info/performance, Device/other IDs.

## Step 2 — Security practices

- **Is all user data encrypted in transit?** → Not applicable (no data leaves the device).
  If the form requires an answer anyway: **Yes** (there is no transit, so this is vacuously true — but prefer "No data collected" at Step 1 so this section is skipped).
- **Do you provide a way for users to request data deletion?** → **Yes** —
  the in-app "Wipe data" feature, plus uninstalling the app removes everything.
- **Is data encrypted at rest?** → **Yes** — AES-encrypted with a PIN-derived key,
  stored in device secure storage (Keystore/Keychain for key material).

## Step 3 — Independent security review
Not required unless you want to pursue it; skip.

## Why this is accurate, not just favorable
- `VaultContext` and all storage (`expo-secure-store`, encrypted records) operate
  entirely client-side.
- The `/backend` FastAPI + MongoDB service in this repo is a template that ships
  unused — no API base URL is wired into the deployed app's data flow.
- Before submitting, do a final grep of the frontend for any `fetch(`/`axios`
  calls to confirm no accidental network calls were introduced, so the Data
  Safety answers stay truthful. (`grep -rn "fetch(\|axios" frontend/src frontend/app`)

## Reminder
If this changes in the future — e.g., you add cloud sync, crash reporting, or
analytics — you must update both the Data Safety form in Play Console *and*
`store/privacy-policy.html` before releasing that update. Misrepresenting data
collection is a common cause of Play Store suspensions.
