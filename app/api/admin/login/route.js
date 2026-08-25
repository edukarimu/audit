import { checkPassword, loginCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }
  if (!checkPassword(body && body.password)) {
    return Response.json({ ok: false, message: "Wrong password." }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  const c = loginCookie();
  res.headers.append(
    "Set-Cookie",
    `${c.name}=${encodeURIComponent(c.value)}; Path=${c.path}; Max-Age=${c.maxAge}; HttpOnly; SameSite=${c.sameSite}${c.secure ? "; Secure" : ""}`
  );
  return res;
}
