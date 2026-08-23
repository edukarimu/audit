# Karimu Field Audit

Offline-first maintenance audit app for Karimu Foundation volunteers. Pick an audit
type (School building / School bathroom for now), work the checklist without any
connection, then Sync when back online. Ported from an interactive prototype —
see `lib/checklists.js` for the full item lists and applicability rules, and
`lib/engine.js` for the app itself (screens, offline storage, sync).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

This is a stock Next.js App Router project — deploy it to Vercel by connecting
this repository (Import Project → this repo) or with `vercel deploy` from a
machine that can reach vercel.com. No special build settings needed.

## Google Drive / Sheets sync setup

`app/api/sync/route.js` is the only thing standing between "audits queue on
the phone" and "photos land in Drive + a spreadsheet gets a row per finding."
It's written and ready, but **has not been exercised against real Google
APIs yet** — there was no service account available to test with while this
was built. Treat the first real sync as a test, not as production-ready.

To activate it, set these environment variables in the Vercel project
(Project Settings → Environment Variables):

| Variable | What it is |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The service account's `...@...iam.gserviceaccount.com` address. |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | The service account's private key (the `private_key` field from its JSON key file, including the `-----BEGIN PRIVATE KEY-----` lines). |
| `KARIMU_DRIVE_FOLDER_ID` | The Drive folder ID where photos should be uploaded. The folder must be shared with the service account's email (Editor access), or owned by it. |
| `KARIMU_SHEET_ID` | The spreadsheet ID (from its URL) where results should be written. Also needs to be shared with the service account. The app creates `Audits` and `Findings` tabs in it automatically if they don't already exist. |

Until all four are set, `/api/sync` returns a clear "not configured" response
and the app keeps every audit queued locally — nothing is lost, it just can't
leave the device automatically yet. The client already has a manual "Export
JSON" backup button for that gap.

**Required Google Cloud API access:** the service account's project needs the
Drive API and Sheets API enabled, and the service account needs `drive.file`
and `spreadsheets` scopes (already what the code requests).

**Before trusting this with real field data:** run one audit through with a
real photo, confirm the photo actually appears in the Drive folder and a row
appears in both the `Audits` and `Findings` tabs of the sheet. If anything
about the request/response shape is off, `lib/googleWorkspace.js` is a single
small file — easy to fix in one place.

## Language / i18n

The interface can be shown in English, Spanish, or Portuguese. A volunteer
picks a language the first time they open the app (before starting any
audit); it's remembered on that device from then on, and can be changed
any time from the globe icon in the top bar.

This is a **display-only** layer — `lib/i18n.js` holds the UI strings and
translated checklist labels for `es`/`pt`, looked up through two helpers
(`tr()` for checklist/label text, `ui()` for interface strings) that fall
back to English if a translation is ever missing. Everything that gets
saved locally and sent to `/api/sync` — section/group/statement text,
school names, building names, dates, notes — always comes from
`lib/checklists.js` in canonical English, completely untouched by the
selected display language. That's deliberate: the spreadsheet and Drive
records stay in one consistent language regardless of which volunteer
audited which building.

Adding a fourth language means adding one more entry to `LANGUAGES` and
one more language block to `TEXT`/`UI_STRINGS` in `lib/i18n.js` — nothing
in `lib/checklists.js` or the backend needs to change.

## What's ported from the prototype, what's new

- Same checklists, same applicability rules, same offline-first local
  storage, same "All OK" / "Rest OK" shortcuts, same completed-audit gate.
- New: this runs as a normal website, not inside a sandboxed preview, so it
  can be installed as a PWA (`app/manifest.js`, `public/sw.js`) and — this is
  the actual point of moving it here — it can make real network calls. Sync
  now POSTs to `/api/sync` instead of only offering a local file save.
- Known gap carried over: audit data (including photos) is still cached in
  the browser's `localStorage`, which has a several-MB ceiling. Fine for the
  MVP; worth moving to IndexedDB before a volunteer with a very photo-heavy
  audit hits the limit.
