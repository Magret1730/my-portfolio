/**
 * Neon Auth uses the `__Secure-neon-auth.*` cookie prefix. Browsers require the
 * Secure attribute on those names, so they are dropped on http://localhost when
 * we strip Secure. For local HTTP dev we rename to `neon-auth.*` on the wire and
 * map back to `__Secure-neon-auth.*` for the Neon Auth handler.
 */

export const NEON_AUTH_SECURE_PREFIX = "__Secure-neon-auth";
export const NEON_AUTH_LOCAL_PREFIX = "neon-auth";

export function isLocalhostHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function shouldApplyLocalCookieFix(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  if (!isLocalhostHostname(hostname)) {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}

function rewriteCookieNameForBrowser(name: string): string {
  if (name.startsWith(NEON_AUTH_SECURE_PREFIX)) {
    return NEON_AUTH_LOCAL_PREFIX + name.slice(NEON_AUTH_SECURE_PREFIX.length);
  }
  return name;
}

function rewriteCookieNameForServer(name: string): string {
  if (name.startsWith(`${NEON_AUTH_LOCAL_PREFIX}.`)) {
    return NEON_AUTH_SECURE_PREFIX + name.slice(NEON_AUTH_LOCAL_PREFIX.length);
  }
  return name;
}

function parseCookieHeader(cookieHeader: string): Array<{ name: string; value: string }> {
  const pairs: Array<{ name: string; value: string }> = [];
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    pairs.push({
      name: trimmed.slice(0, eq),
      value: trimmed.slice(eq + 1),
    });
  }
  return pairs;
}

export function rewriteRequestCookieHeader(cookieHeader: string): {
  header: string;
  modified: boolean;
} {
  const pairs = parseCookieHeader(cookieHeader);
  let modified = false;
  const rewritten = pairs.map(({ name, value }) => {
    const serverName = rewriteCookieNameForServer(name);
    if (serverName !== name) {
      modified = true;
    }
    return `${serverName}=${value}`;
  });
  return {
    header: rewritten.join("; "),
    modified,
  };
}

export function applyLocalAuthRequestCookies(request: Request): Request {
  if (!shouldApplyLocalCookieFix(request)) {
    return request;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return request;
  }

  const { header, modified } = rewriteRequestCookieHeader(cookieHeader);
  if (!modified) {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("cookie", header);
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error duplex required when body is present in Node 18+
    duplex: request.body ? "half" : undefined,
  });
}

function fixSetCookieForLocalhost(setCookie: string): string {
  const eqIndex = setCookie.indexOf("=");
  let fixed =
    eqIndex > 0
      ? rewriteCookieNameForBrowser(setCookie.slice(0, eqIndex)) + setCookie.slice(eqIndex)
      : setCookie;

  fixed = fixed.replace(/;\s*Secure/gi, "").replace(/;\s*Domain=[^;]*/gi, "");
  return fixed;
}

export function applyLocalDevCookies(response: Response, request: Request): Response {
  if (!shouldApplyLocalCookieFix(request)) {
    return response;
  }

  const setCookies = response.headers.getSetCookie();
  if (setCookies.length === 0) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");

  for (const cookie of setCookies) {
    headers.append("Set-Cookie", fixSetCookieForLocalhost(cookie));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function listNeonAuthCookieNames(cookieHeader: string | null): string[] {
  if (!cookieHeader) {
    return [];
  }
  return parseCookieHeader(cookieHeader)
    .map((p) => p.name)
    .filter(
      (name) =>
        name.startsWith(NEON_AUTH_SECURE_PREFIX) || name.startsWith(NEON_AUTH_LOCAL_PREFIX),
    );
}
