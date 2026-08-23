// Google Drive + Sheets access for the audit backend, using a service
// account (no per-volunteer OAuth). Everything here is gated on
// environment variables — see README.md "Google service account setup".
//
// NOTE: written against the documented googleapis v1 REST surface, but
// NOT yet exercised against a real Drive/Sheet — no service account has
// been available to test with. Run scripts/smoke-test-google.js once
// credentials exist, before trusting this in the field.

import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];

export function isConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY &&
    process.env.KARIMU_DRIVE_FOLDER_ID &&
    process.env.KARIMU_SHEET_ID
  );
}

function getAuth() {
  // Private keys stored in env vars usually have literal "\n" — restore
  // real newlines, or Google's JWT signer rejects the key.
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: SCOPES,
  });
}

function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(5, comma); // "image/jpeg;base64"
  const mimeType = meta.split(";")[0] || "image/jpeg";
  const buffer = Buffer.from(dataUrl.slice(comma + 1), "base64");
  return { buffer, mimeType };
}

/** Upload one photo (data: URL) to the Karimu audits Drive folder. Returns {id, webViewLink}. */
async function uploadPhoto(drive, filename, dataUrl) {
  const { buffer, mimeType } = dataUrlToBuffer(dataUrl);
  const { Readable } = await import("stream");
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.KARIMU_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
  });
  return res.data;
}

const SHEET_TABS = {
  audits: {
    title: "Audits",
    header: [
      "Synced at", "Audit ID", "Type", "School", "Unit",
      "Inspector", "Date", "GPS", "Answered", "Total", "Issues",
    ],
  },
  findings: {
    title: "Findings",
    header: [
      "Synced at", "Audit ID", "School", "Unit", "Section", "Group",
      "Statement", "Note", "Photo links",
    ],
  },
};

/** Make sure the target spreadsheet has the tabs we need, in the shape we expect. */
async function ensureTabs(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set((meta.data.sheets || []).map(s => s.properties.title));
  const toAdd = Object.values(SHEET_TABS).filter(t => !existing.has(t.title));

  if (toAdd.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: toAdd.map(t => ({ addSheet: { properties: { title: t.title } } })),
      },
    });
    for (const t of toAdd) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${t.title}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [t.header] },
      });
    }
  }
}

/**
 * Sync one completed audit: upload its photos, then append one "Audits"
 * row and one "Findings" row per issue. Returns a small summary object.
 */
export async function syncAuditToWorkspace(audit) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  await ensureTabs(sheets, process.env.KARIMU_SHEET_ID);

  const syncedAt = new Date().toISOString();
  const issues = audit.checklist.filter(c => c.value === "issue");

  // Upload photos first so the Findings rows can link to them.
  const findingRows = [];
  for (const item of issues) {
    const links = [];
    for (let i = 0; i < (item.photos || []).length; i++) {
      const filename = `${audit.id}_${slug(item.section)}_${slug(item.group)}_${i + 1}.jpg`;
      try {
        const uploaded = await uploadPhoto(drive, filename, item.photos[i]);
        links.push(uploaded.webViewLink || uploaded.id);
      } catch (err) {
        links.push(`(upload failed: ${err.message})`);
      }
    }
    findingRows.push([
      syncedAt, audit.id, audit.school, audit.unit,
      item.section, item.group, item.statement, item.note || "",
      links.join(", "),
    ]);
  }

  if (findingRows.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.KARIMU_SHEET_ID,
      range: "Findings!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: findingRows },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.KARIMU_SHEET_ID,
    range: "Audits!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        syncedAt, audit.id, audit.typeLabel, audit.school, audit.unit,
        audit.inspector, audit.date,
        audit.gps ? `${audit.gps.lat}, ${audit.gps.lon}` : "",
        audit.answeredCount, audit.totalCount, audit.issueCount,
      ]],
    },
  });

  return { syncedAt, findingsWritten: findingRows.length, photosUploaded: findingRows.reduce((n, r) => n + (r[8] ? r[8].split(", ").length : 0), 0) };
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
