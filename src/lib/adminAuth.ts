import { timingSafeEqual } from "crypto";

/**
 * Admin endpoints are protected by a shared ADMIN_TOKEN (Bearer or x-admin-token).
 * The demo's session is a mock, so it cannot be used to tell admins apart.
 * Without a token configured the endpoints are open only outside production.
 */
export function isAdminRequest(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("authorization");
  const provided =
    request.headers.get("x-admin-token") ||
    (header?.toLowerCase().startsWith("bearer ") ? header.slice(7) : "");

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
