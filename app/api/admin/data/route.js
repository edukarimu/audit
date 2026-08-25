import { isAuthorized } from "@/lib/adminAuth";
import { isConfigured, listAudits, findingsFrom } from "@/lib/blobStore";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, message: "Not authorized." }, { status: 401 });
  }
  if (!isConfigured()) {
    return Response.json({ ok: false, code: "not_configured", message: "Blob storage isn't set up yet (missing BLOB_READ_WRITE_TOKEN)." }, { status: 503 });
  }
  const audits = await listAudits();
  const findings = findingsFrom(audits);
  return Response.json({ ok: true, audits, findings });
}
