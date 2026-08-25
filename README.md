# Karimu Field Audit

Offline-first maintenance audit app for Karimu Foundation volunteers. Approved
by Nelson to go live for **water point audits**: pick a Ward, Village,
optional Sub-Village, and Asset Tag from the Water Assets registry, work the
maintenance checklist without any connection, then Sync when back online.
School building / school bathroom / health post audits are built and still
in the code (`available:false` in `lib/checklists.js`), but are not in active
use right now — flip that flag back on if/when they're needed again.

Ported from an interactive prototype — see `lib/checklists.js` for the full
item lists and applicability rules, `lib/waterAssets.js` for the embedded
Water Assets registry powering the picker, and `lib/engine.js` for the app
itself (screens, offline storage, sync).

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

## Water Assets registry

`lib/waterAssets.js` embeds the full "Water Assets" tab of the [Water Assets
sheet](https://docs.google.com/spreadsheets/d/1HLnqnP8wUJjV-MfVO9o7cio693qG220MpOHbFLRLrFE)
— 1,717 assets across the Ayalagaya, Arri, and Kiru wards, as of the
2026-08-25 export — so the Ward → Village → Sub-Village → Asset Tag picker
works fully offline, same as everything else in this app.

Of those, 1,693 are Water Points and 24 are Water Tanks. **Only Water Points
are in the picker right now** — Nelson's scope decision, confirmed
2026-08-25 — via a filter on `WATER_ASSETS` in `lib/waterAssets.js`; the
raw 1,717-row list stays in the file either way. If tanks come into scope
later, dropping that one filter brings them back, and the 51-item "Tanks
and Intake" checklist in `lib/checklists.js` (`WATER_TANK_SECTIONS`) is
already written and wired up to `assetType === "T"` — it's just unreachable
while every asset in the picker is a Water Point.

The Water Point checklist itself (`WATER_POINT_SECTIONS` in
`lib/checklists.js`) is sourced from the "Maintanence checklist-Water
Project" tab of a separate sheet, and picked automatically based on the
selected asset's type.

**This data goes stale as the registry sheet changes** — new water points,
renamed villages, corrected wards. There's no live sync back to the sheet;
re-export it and regenerate `lib/waterAssets.js` (a plain array of
`[assetTag, assetType, ward, village, subVillage, location]` tuples) when
it's meaningfully out of date. Two Kiru assets have no village/sub-village
on file and use `""` — that's the sheet's data, not a bug here.

The 81 individual checklist statements (in both the Water Point and Tanks
and Intake sections) are kept verbatim from Nelson's checklist and are only
in English — see the i18n note below on why that's an acceptable gap for
now, and how to close it later.

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

Both tabs now carry `Ward` / `Village` / `Sub-Village` / `Asset Tag` columns
(and `Audits` has `Asset Type` too) alongside the original `School` / `Unit`
columns — empty for water point audits, and vice versa for any legacy
school/bathroom audit that still gets synced. See `SHEET_TABS` in
`lib/googleWorkspace.js` for the exact column order.

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

The water point checklist's section/group names and all 58 unique
statement strings (`WATER_POINT_SECTIONS` and — dormant for now, see
above — `WATER_TANK_SECTIONS` in `lib/checklists.js`) are translated into
es/pt in `TEXT`. (An earlier version of this app shipped with only the
section/group names translated; a field test in pt surfaced English
statement text throughout the checklist, which is what prompted adding
the rest.) If new statements are ever added to those sections, add
matching `es`/`pt` entries in `TEXT` in the same pass — `tr()`'s English
fallback means a missed one won't error, it'll just quietly show English.

## What's ported from the prototype, what's new

- Newest: water point audits (this is the audit type actually in use —
  see above). Ward/Village/Sub-Village/Asset Tag picker in
  `lib/waterAssets.js`, checklist content in `lib/checklists.js`
  (`WATER_POINT_SECTIONS` / `WATER_TANK_SECTIONS`), setup screen and
  review screen changes in `lib/engine.js`.
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
