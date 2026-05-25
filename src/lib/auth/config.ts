/**
 * Resolves Neon Auth base URL from NEON_AUTH_BASE_URL or derives it from DATABASE_URL.
 * Format: https://{endpoint}.neonauth.{branch-path}.{region}.aws.neon.tech/{db}/auth
 */
export function getNeonAuthBaseUrl(): string {
  const explicit = process.env.NEON_AUTH_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "NEON_AUTH_BASE_URL is not set. Enable Neon Auth in the Neon console and add NEON_AUTH_BASE_URL to .env, or set DATABASE_URL so it can be derived.",
    );
  }

  const parsed = new URL(databaseUrl.replace(/^postgresql:/, "postgres:"));
  const hostname = parsed.hostname;
  const dbName = parsed.pathname.replace(/^\//, "").split("?")[0] || "neondb";

  // ep-name.c-7.us-east-1.aws.neon.tech -> ep-name.neonauth.c-7.us-east-1.aws.neon.tech
  const authHost = hostname.replace(
    /^([^.]+)\.(c-\d+\.[^.]+\.aws\.neon\.tech)$/,
    "$1.neonauth.$2",
  );

  if (authHost === hostname) {
    throw new Error(
      "Could not derive NEON_AUTH_BASE_URL from DATABASE_URL. Set NEON_AUTH_BASE_URL in .env (Neon Console → Auth → Configuration).",
    );
  }

  return `https://${authHost}/${dbName}/auth`;
}
