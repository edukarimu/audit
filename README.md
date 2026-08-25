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

Of the 1,693 Water Points, the sheet's "Ownership" column marks 332 as
**Public** and 1,361 as **Private**. **Only Public Water Points are in the
picker** — Edu's scope decision, confirmed 2026-08-26: private water points
aren't part of Karimu's audit program. Same reversible-filter pattern as
Water Tanks above (an `isPublic` flag on each row, checked alongside the
Water Point type check in `WATER_ASSETS`) — the 1,361 private rows stay in
the file, just unreachable from the picker, route, or map anywhere in the
app. Two of the 332 Public Water Points (in Kiru) have no village on file
and so don't surface in the Ward → Village → ... picker either — that's
the sheet's data (see the Kiru note below), not something this filter did.

The Water Point checklist itself (`WATER_POINT_SECTIONS` in
`lib/checklists.js`) is sourced from the "Maintanence checklist-Water
Project" tab of a separate sheet, and picked automatically based on the
selected asset's type.

**This data goes stale as the registry sheet changes** — new water points,
renamed villages, corrected wards, ownership changes. There's no live sync
back to the sheet; re-export it and regenerate `lib/waterAssets.js` (a
plain array of `[assetTag, assetType, ward, village, subVillage, location,
lat, lon, volunteer, routeOrder, isPublic]` tuples — see "Volunteer
identification and routes" below for the volunteer/routeOrder pair) when
it's meaningfully out of date. Two Kiru assets have no village/sub-village
on file and use `""` — that's the sheet's data, not a bug here.

The 81 individual checklist statements (in both the Water Point and Tanks
and Intake sections) are kept verbatim from Nelson's checklist and are only
in English — see the i18n note below on why that's an acceptable gap for
now, and how to close it later.

## Volunteer identification and routes

Added 2026-08-25. Right after picking a language, a volunteer now picks
their name from a fixed list (`VOLUNTEERS` in `lib/waterAssets.js`: Thuler,
Arake, Gui Lacerda, Rafa Braga, Sergio, Padilha) — remembered on that device
from then on, same as language, and changeable later from the same screen
(globe icon → scroll down). It only decides which Water Points show up on
"My route" from the home screen; it isn't sent anywhere and doesn't gate
which audits someone can start.

"My route" shows that volunteer's assigned Water Points on a map (OpenStreetMap
tiles via Leaflet — needs a connection to load the map itself, though the
stop list below it works offline like everything else) with a suggested
visiting order, plus a tap-to-start shortcut into a pre-filled audit for
that asset. The assignment and order are **precomputed and baked into
`lib/waterAssets.js`**, not calculated on the device, so every volunteer's
phone shows the same plan:

- Of the **332 Public** Water Points (private ones are entirely out of
  scope — see "Water Assets registry" above), **302 (91%) have GPS
  coordinates** in the sheet's "Coordinates in decimal" column; the other
  30 (9%) don't. Only the 302 go into the routing math below;
  re-collecting GPS for the rest and regenerating this file would bring
  them in too.
- Those 302 were split into 6 **equal-sized** (~50 each), geographically
  compact groups via a recursive median-cut partition (repeatedly slice the
  point cloud in half along whichever axis — latitude or longitude —
  currently spans further), then each group assigned to one volunteer,
  west to east. This is a straight geographic split, not a request from
  Nelson about who covers what — if there's an existing human assignment,
  swap it in instead.
- Within each volunteer's group, the visiting order is a nearest-neighbor
  walk starting from the westmost point — **straight-line distance**, since
  there's no detailed road network here to route against. The map draws
  that straight-line path; it is not turn-by-turn driving directions.
- The 30 without coordinates are still assigned to a volunteer (by
  majority vote of their own village's coordinate-bearing points, falling
  back to ward, then to the single largest group — only 2 assets, both in
  Kiru, hit that last fallback), but with no position to place them in the
  order, so the app lists them after the route, unordered, flagged "No GPS."
  This means volunteer workloads are **not perfectly even** once those are
  included (ranging ~50–65 per volunteer as of this export) — whichever
  villages have poor GPS coverage weigh down whoever's group they landed in.

To regenerate this after the sheet changes (new points, GPS added for the
30-point gap above, or ownership changes): re-export "Water Assets",
re-run the same pipeline (Public-only filter → recursive median-cut →
nearest-neighbor, seeded from the "Ownership" and "Coordinates in decimal"
columns) to rebuild `WATER_ASSET_ROWS` in `lib/waterAssets.js` with fresh
`lat`/`lon`/`volunteer`/`routeOrder`/`isPublic` values. There's no saved
script committed here yet — it was run ad hoc; worth turning into a real
`scripts/` file if this becomes a recurring task.

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
- Newer still: volunteer identification and "My route" (map + suggested
  visiting order + tap-to-start) — see "Volunteer identification and
  routes" above.
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
