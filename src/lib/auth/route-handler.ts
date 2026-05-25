import { auth } from "@/lib/auth/server";
import { withAuthOriginHeaders } from "@/lib/auth/app-origin";
import {
  applyLocalAuthRequestCookies,
  applyLocalDevCookies,
} from "@/lib/auth/local-cookies";
import { logAuthSessionDebug } from "@/lib/auth/session-debug";

type RouteContext = { params: Promise<{ path: string[] }> };

const neonHandler = auth.handler();

async function withLocalCookies(
  response: Response,
  request: Request,
): Promise<Response> {
  return applyLocalDevCookies(response, request);
}

function withLocalRequest(request: Request): Request {
  return applyLocalAuthRequestCookies(withAuthOriginHeaders(request));
}

export async function handleAuthGet(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const req = withLocalRequest(request);
  const response = await neonHandler.GET(req, context);
  return withLocalCookies(response, request);
}

export async function handleAuthPost(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const req = withLocalRequest(request);
  const response = await neonHandler.POST(req, context);
  const final = await withLocalCookies(response, request);

  if (
    process.env.NODE_ENV === "development" &&
    (await context.params).path.join("/") === "sign-in/email"
  ) {
    console.info("[auth/sign-in]", {
      status: final.status,
      setCookieCount: final.headers.getSetCookie().length,
      setCookieNames: final.headers.getSetCookie().map((c) => c.split("=")[0]),
    });
  }

  return final;
}

export async function handleAuthPut(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const req = withLocalRequest(request);
  const response = await neonHandler.PUT(req, context);
  return withLocalCookies(response, request);
}

export async function handleAuthDelete(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const req = withLocalRequest(request);
  const response = await neonHandler.DELETE(req, context);
  return withLocalCookies(response, request);
}

export async function handleAuthPatch(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const req = withLocalRequest(request);
  const response = await neonHandler.PATCH(req, context);
  return withLocalCookies(response, request);
}

export async function handleAuthGetSession(request: Request): Promise<Response> {
  logAuthSessionDebug("request", request);
  const req = withLocalRequest(request);
  const context: RouteContext = { params: Promise.resolve({ path: ["get-session"] }) };
  const response = await neonHandler.GET(req, context);
  const final = await withLocalCookies(response, request);
  logAuthSessionDebug("response", req, final);
  return final;
}

export async function handleAuthPostSession(request: Request): Promise<Response> {
  logAuthSessionDebug("request", request);
  const req = withLocalRequest(request);
  const context: RouteContext = { params: Promise.resolve({ path: ["get-session"] }) };
  const response = await neonHandler.POST(req, context);
  const final = await withLocalCookies(response, request);
  logAuthSessionDebug("response", req, final);
  return final;
}
