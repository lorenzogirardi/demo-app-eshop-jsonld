import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "unknown";
  return ip;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // Rate limiting: AI endpoints cost money, public agent endpoints are cheap but open to anyone.
  const path = request.nextUrl.pathname;
  const group = path.startsWith("/api/ai/") ? "ai" : "agent";
  const maxRequests =
    group === "ai"
      ? parseInt(process.env.AI_RATE_LIMIT || "10")
      : parseInt(process.env.AGENT_RATE_LIMIT || "60");
  const key = `${group}:${getRateLimitKey(request)}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    entry.count++;
    if (entry.count > maxRequests) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000)) },
        }
      );
    }
  }

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    const entries = Array.from(rateLimitMap.entries());
    for (const [k, v] of entries) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/ai/:path*", "/api/mcp", "/api/products/:path*", "/api/products", "/api/cart/preview"],
};
