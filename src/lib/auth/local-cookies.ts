/**
 * Neon Auth upstream cookies default to Secure, which browsers reject on http://localhost.
 * Strip Secure (and optional Domain) for local development so sessions persist after login.
 */
export function applyLocalDevCookies(response: Response, request: Request): Response {
  const hostname = new URL(request.url).hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (process.env.NODE_ENV === "production" && !isLocalhost) {
    return response;
  }
  if (!isLocalhost) {
    return response;
  }

  const setCookies = response.headers.getSetCookie();
  if (setCookies.length === 0) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");

  for (const cookie of setCookies) {
    const fixed = cookie
      .replace(/;\s*Secure/gi, "")
      .replace(/;\s*Domain=[^;]*/gi, "");
    headers.append("Set-Cookie", fixed);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
