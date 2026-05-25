import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";
import { applyLocalDevCookies } from "@/lib/auth/local-cookies";

/**
 * Completes OAuth sign-in on /auth/callback (verifier exchange).
 * Site routes stay public; only the callback path uses auth middleware.
 */
const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export default async function middleware(request: NextRequest) {
  const response = await authMiddleware(request);
  return applyLocalDevCookies(response, request);
}

export const config = {
  matcher: ["/auth/callback"],
};
