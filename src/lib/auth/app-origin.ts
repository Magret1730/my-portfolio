/**
 * Canonical app origin for auth callbacks and Neon Auth trusted-origin checks.
 * Local dev uses the request origin; production uses env / Vercel URLs (never localhost).
 */

const DEFAULT_PRODUCTION_ORIGIN = "https://cursor-magret-portfolio.vercel.app";

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/** Origins that must be registered in Neon Auth → trusted domains (production + previews). */
export function getAuthTrustedOrigins(): string[] {
  const origins = new Set<string>();

  const add = (value: string | undefined) => {
    const origin = value ? normalizeOrigin(value) : null;
    if (origin) {
      origins.add(origin);
    }
  };

  add(process.env.AUTH_APP_ORIGIN);
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.SITE_URL);
  add(process.env.NEXT_PUBLIC_APP_URL);
  add(DEFAULT_PRODUCTION_ORIGIN);
  add("https://my-portfolio-blond-ten-56.vercel.app");

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (process.env.VERCEL_URL) {
    add(process.env.VERCEL_URL);
  }

  return [...origins];
}

/**
 * Origin sent to Neon Auth on API proxy requests.
 * On Vercel, prefer configured production URL over accidental localhost in headers.
 */
export function getAuthAppOrigin(request: Request): string {
  const fromRequest =
    request.headers.get("origin") ||
    request.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
    new URL(request.url).origin;

  const isVercel = Boolean(process.env.VERCEL);
  const isLocalRequest =
    fromRequest.includes("localhost") || fromRequest.includes("127.0.0.1");

  if (isVercel && isLocalRequest) {
    const configured = getAuthTrustedOrigins().find(
      (o) => !o.includes("localhost") && !o.includes("127.0.0.1"),
    );
    if (configured) {
      return configured;
    }
  }

  if (!isVercel) {
    return fromRequest;
  }

  const configured = getAuthTrustedOrigins().find(
    (o) => !o.includes("localhost") && !o.includes("127.0.0.1"),
  );
  if (configured && (isLocalRequest || !fromRequest.startsWith("https://"))) {
    return configured;
  }

  return fromRequest;
}

export function getAuthAppOriginFromEnv(): string {
  const configured = getAuthTrustedOrigins().find(
    (o) => !o.includes("localhost") && !o.includes("127.0.0.1"),
  );
  return configured ?? DEFAULT_PRODUCTION_ORIGIN;
}

/** Build absolute URL for auth redirects (Neon Auth UI) in production. */
export function resolveAuthRedirectPath(
  path: string,
  request?: Request,
): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  if (!process.env.VERCEL) {
    return path;
  }

  const origin = request ? getAuthAppOrigin(request) : getAuthAppOriginFromEnv();
  return `${origin}${path}`;
}

export function withAuthOriginHeaders(request: Request): Request {
  const origin = getAuthAppOrigin(request);
  const headers = new Headers(request.headers);
  headers.set("Origin", origin);
  headers.set("Referer", `${origin}/`);

  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error duplex required when body is present in Node 18+
    duplex: request.body ? "half" : undefined,
  });
}
