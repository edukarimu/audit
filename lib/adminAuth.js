// Single shared-password gate for the /admin page and its API routes.
//
// This is deliberately simple — one keyword everyone with access shares,
// not per-person accounts — matching what was actually asked for. Set a
// real ADMIN_PASSWORD in the Vercel project's environment variables
// before this goes live for real; "K@rimu" below is only a working
// default so the page isn't dead on arrival, and it's sitting in this
// (private) repo's source in plain sight, which is not where a real
// secret belongs long-term.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "K@rimu";
const COOKIE_NAME = "karimu_admin";

export function checkPassword(pw) {
  return typeof pw === "string" && pw === ADMIN_PASSWORD;
}

/** Accepts any of: the login cookie (browser), a `key` query param, or an
 * `Authorization: Bearer <password>` header (both for machine callers —
 * Claude fetching on Edu's behalf, or the daily Drive-photos routine). */
export function isAuthorized(request) {
  const cookie = request.cookies?.get?.(COOKIE_NAME)?.value;
  if (checkPassword(cookie)) return true;

  const url = new URL(request.url);
  if (checkPassword(url.searchParams.get("key"))) return true;

  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (checkPassword(bearer)) return true;

  return false;
}

export function loginCookie() {
  return {
    name: COOKIE_NAME,
    value: ADMIN_PASSWORD,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export function logoutCookie() {
  return { ...loginCookie(), value: "", maxAge: 0 };
}
