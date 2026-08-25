import { isConfigured, saveAudit } from "@/lib/blobStore";

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
          "This deployment isn't connected to storage yet — missing " +
          "BLOB_READ_WRITE_TOKEN. Ask whoever manages this deployment to " +
          "add a Blob store in the Vercel project's Storage tab.",
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
    const result = await saveAudit(audit);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("sync failed for audit", audit.id, err);
    return Response.json(
      { ok: false, code: "upstream_error", message: err.message || "Could not save this audit." },
      { status: 502 }
    );
  }
}
