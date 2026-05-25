#!/usr/bin/env node
/**
 * Sync selected env vars from .env / .env.local to Vercel (production + preview).
 * Never prints secret values.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const KEYS = [
  "DATABASE_URL",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "AUTH_APP_ORIGIN",
  "BLOB_READ_WRITE_TOKEN",
  "BLOB_STORE_ID",
  "GEMINI_API_KEY",
];

const ENVIRONMENTS = ["production", "preview"];

function parseEnvFile(path) {
  const out = {};
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
  } catch {
    // missing file
  }
  return out;
}

function runVercel(args, input) {
  return spawnSync("npx", ["--yes", "vercel", ...args], {
    input,
    stdio: ["pipe", "pipe", "pipe"],
    encoding: "utf8",
    timeout: 90_000,
  });
}

const PRODUCTION_SITE_URL = "https://cursor-magret-portfolio.vercel.app";

const merged = {
  ...parseEnvFile(".env"),
  ...parseEnvFile(".env.local"),
};

if (!merged.NEXT_PUBLIC_SITE_URL?.trim()) {
  merged.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
}
if (!merged.AUTH_APP_ORIGIN?.trim()) {
  merged.AUTH_APP_ORIGIN = PRODUCTION_SITE_URL;
}

let synced = 0;
let skipped = 0;
let failed = 0;

for (const key of KEYS) {
  const value = merged[key]?.trim();
  if (!value) {
    console.log(`skip ${key} (not set locally)`);
    skipped += 1;
    continue;
  }

  for (const env of ENVIRONMENTS) {
    runVercel(["env", "rm", key, env, "--yes"], undefined);
    const result = runVercel(["env", "add", key, env, "--yes", "--force"], value);
    if (result.status === 0) {
      console.log(`ok ${key} -> ${env}`);
      synced += 1;
    } else {
      const hint = result.stderr?.includes("already exists")
        ? " (exists; run vercel env rm first)"
        : "";
      console.error(`fail ${key} -> ${env}${hint}`);
      failed += 1;
    }
  }
}

console.log(`done: ${synced} synced, ${skipped} skipped keys, ${failed} failures`);
process.exit(failed > 0 ? 1 : 0);
