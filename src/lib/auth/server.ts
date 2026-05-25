import { createNeonAuth } from "@neondatabase/auth/next/server";

import { getNeonAuthBaseUrl } from "@/lib/auth/config";

export const auth = createNeonAuth({
  baseUrl: getNeonAuthBaseUrl(),
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
