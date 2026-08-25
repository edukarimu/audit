import { logoutCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST() {
  const res = Response.json({ ok: true });
  const c = logoutCookie();
  res.headers.append("Set-Cookie", `${c.name}=; Path=${c.path}; Max-Age=0; HttpOnly; SameSite=${c.sameSite}`);
  return res;
}
