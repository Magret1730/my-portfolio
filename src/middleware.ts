import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import {
  applyLocalDevCookies,
  rewriteRequestCookieHeader,
  shouldApplyLocalCookieFix,
} from "@/lib/auth/local-cookies";

/**
 * Completes OAuth sign-in on /auth/callback (verifier exchange).
 * Site routes stay public; only the callback path uses auth middleware.
 */
const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

function nextWithRewrittenCookies(request: NextRequest): NextResponse {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.next();
  }

  const { header, modified } = rewriteRequestCookieHeader(cookieHeader);
  if (!modified) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.set("cookie", header);
  return NextResponse.next({ request: { headers } });
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    const response = await authMiddleware(request);
    return applyLocalDevCookies(response, request);
  }

  if (shouldApplyLocalCookieFix(request)) {
    return nextWithRewrittenCookies(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/callback",
    "/api/auth/:path*",
    "/api/upload",
    "/api/comments",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
