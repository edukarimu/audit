import { isConfigured, syncAuditToWorkspace } from "@/lib/googleWorkspace";

export const runtime = "nodejs";
// Photos are embedded as base64 in the JSON body, so a few of them adds
// up fast. Vercel's default body-size limit for this runtime is 4.5 MB;
// keep audits under that on the client side (compress photos, and warn
// the volunteer if one audit alone is too big to sync).
export const maxDuration = 60;

export async function POST(request) {
  if (!isConfigured()) {
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        message:
          "The server isn't connected to Google Drive/Sheets yet — missing " +
          "GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY, " +
          "KARIMU_DRIVE_FOLDER_ID or KARIMU_SHEET_ID. Ask whoever manages " +
          "this deployment to add them in the Vercel project settings.",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: "bad_request", message: "Malformed request body." }, { status: 400 });
  }

  const audit = body && body.audit;
  if (!audit || !audit.id || !Array.isArray(audit.checklist)) {
    return Response.json({ ok: false, code: "bad_request", message: "Request is missing an audit record." }, { status: 400 });
  }

  try {
    const result = await syncAuditToWorkspace(audit);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("sync failed for audit", audit.id, err);
    return Response.json(
      { ok: false, code: "upstream_error", message: err.message || "Could not reach Google Drive/Sheets." },
      { status: 502 }
    );
  }
}
