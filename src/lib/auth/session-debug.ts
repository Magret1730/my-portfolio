import { listNeonAuthCookieNames } from "@/lib/auth/local-cookies";

export function logAuthSessionDebug(
  phase: "request" | "response",
  request: Request,
  response?: Response,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const cookieNames = listNeonAuthCookieNames(request.headers.get("cookie"));
  const payload: Record<string, unknown> = {
    phase,
    path: new URL(request.url).pathname,
    neonAuthCookies: cookieNames,
  };

  if (response) {
    const setCookies = response.headers.getSetCookie();
    payload.setCookieCount = setCookies.length;
    payload.setCookieNames = setCookies.map((c) => c.split("=")[0] ?? c);
    if (response.headers.get("content-type")?.includes("application/json")) {
      response
        .clone()
        .json()
        .then((body) => {
          const hasUser =
            body !== null &&
            typeof body === "object" &&
            "user" in body &&
            !!(body as { user?: { id?: string } }).user?.id;
          console.info("[auth/session-debug]", {
            ...payload,
            sessionHasUser: hasUser,
            sessionNull: body === null,
          });
        })
        .catch(() => {
          console.info("[auth/session-debug]", payload);
        });
      return;
    }
  }

  console.info("[auth/session-debug]", payload);
}
