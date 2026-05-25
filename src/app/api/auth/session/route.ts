import {
  handleAuthGetSession,
  handleAuthPostSession,
} from "@/lib/auth/route-handler";

export const runtime = "nodejs";

/** Alias for Better Auth get-session (Neon Auth standard path). */
export const GET = handleAuthGetSession;
export const POST = handleAuthPostSession;
