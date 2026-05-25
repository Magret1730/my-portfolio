import { auth } from "@/lib/auth/server";
import { applyLocalDevCookies } from "@/lib/auth/local-cookies";

type RouteContext = { params: Promise<{ path: string[] }> };

const neonHandler = auth.handler();

async function withLocalCookies(
  response: Response,
  request: Request,
): Promise<Response> {
  return applyLocalDevCookies(response, request);
}

export async function handleAuthGet(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const response = await neonHandler.GET(request, context);
  return withLocalCookies(response, request);
}

export async function handleAuthPost(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const response = await neonHandler.POST(request, context);
  return withLocalCookies(response, request);
}

export async function handleAuthPut(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const response = await neonHandler.PUT(request, context);
  return withLocalCookies(response, request);
}

export async function handleAuthDelete(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const response = await neonHandler.DELETE(request, context);
  return withLocalCookies(response, request);
}

export async function handleAuthPatch(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const response = await neonHandler.PATCH(request, context);
  return withLocalCookies(response, request);
}

export async function handleAuthGetSession(request: Request): Promise<Response> {
  const context: RouteContext = { params: Promise.resolve({ path: ["get-session"] }) };
  return handleAuthGet(request, context);
}

export async function handleAuthPostSession(request: Request): Promise<Response> {
  const context: RouteContext = { params: Promise.resolve({ path: ["get-session"] }) };
  return handleAuthPost(request, context);
}
