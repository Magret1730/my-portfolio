import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

const handler = auth.handler();

/**
 * Alias for Better Auth's get-session endpoint.
 * Neon Auth clients may call /api/auth/session; upstream only supports get-session.
 */
export async function GET(request: Request) {
  return handler.GET(request, { params: Promise.resolve({ path: ["get-session"] }) });
}

export async function POST(request: Request) {
  return handler.POST(request, { params: Promise.resolve({ path: ["get-session"] }) });
}
