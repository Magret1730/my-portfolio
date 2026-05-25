#!/usr/bin/env node
/**
 * Register production/preview origins in Neon Auth trusted domains.
 * Requires NEON_API_KEY in .env or environment.
 * NEON_PROJECT_ID is optional — resolved from DATABASE_URL when missing.
 */
import { readFileSync } from "node:fs";

const API_BASE = "https://console.neon.tech/api/v2";

const DEFAULT_ORIGINS = [
  "https://cursor-magret-portfolio.vercel.app",
  "https://my-portfolio-blond-ten-56.vercel.app",
  "https://*.belloabiodun17-9745s-projects.vercel.app",
];

function loadEnvFile(path) {
  const out = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[trimmed.slice(0, eq).trim()] = value;
    }
  } catch {
    // missing file
  }
  return out;
}

function loadNeonCtlApiKey() {
  try {
    const path = `${process.env.HOME}/.config/neonctl/credentials.json`;
    const creds = JSON.parse(readFileSync(path, "utf8"));
    return creds.api_key?.trim() || "";
  } catch {
    return "";
  }
}

function getEnv() {
  const merged = { ...loadEnvFile(".env"), ...loadEnvFile(".env.local"), ...process.env };
  if (!merged.NEON_API_KEY?.trim()) {
    const fromCli = loadNeonCtlApiKey();
    if (fromCli) merged.NEON_API_KEY = fromCli;
  }
  return merged;
}

function endpointIdFromDatabaseUrl(databaseUrl) {
  if (!databaseUrl?.trim()) return null;
  try {
    const parsed = new URL(databaseUrl.replace(/^postgresql:/, "postgres:"));
    return parsed.hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

async function api(path, { method = "GET", body } = {}) {
  const env = getEnv();
  const apiKey = env.NEON_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("NEON_API_KEY is not set (Neon Console → Account → API keys).");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { ok: res.ok, status: res.status, json };
}

async function listBranches(projectId) {
  const { ok, status, json } = await api(`/projects/${projectId}/branches`);
  if (!ok) {
    throw new Error(`list branches failed (${status})`);
  }
  return json.branches ?? [];
}

async function listEndpoints(projectId, branchId) {
  const { ok, status, json } = await api(
    `/projects/${projectId}/branches/${branchId}/endpoints`,
  );
  if (!ok) {
    return [];
  }
  return json.endpoints ?? [];
}

async function resolveProjectAndBranch(env) {
  const explicitProject = env.NEON_PROJECT_ID?.trim();
  const explicitBranch = env.NEON_BRANCH_ID?.trim();
  if (explicitProject && explicitBranch) {
    return { projectId: explicitProject, branchId: explicitBranch };
  }

  const endpointId = endpointIdFromDatabaseUrl(env.DATABASE_URL);
  if (!endpointId) {
    if (explicitProject) {
      const branches = await listBranches(explicitProject);
      const primary =
        branches.find((b) => b.primary) ?? branches.find((b) => b.default) ?? branches[0];
      if (!primary?.id) {
        throw new Error("Could not resolve branch id. Set NEON_BRANCH_ID in .env.");
      }
      return { projectId: explicitProject, branchId: primary.id };
    }
    throw new Error(
      "Set NEON_PROJECT_ID or DATABASE_URL so the script can find your Neon project.",
    );
  }

  let cursor = null;
  for (;;) {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const { ok, status, json } = await api(`/projects?${query}`);
    if (!ok) {
      throw new Error(`list projects failed (${status})`);
    }

    for (const project of json.projects ?? []) {
      const branches = await listBranches(project.id);
      for (const branch of branches) {
        const endpoints = await listEndpoints(project.id, branch.id);
        const match = endpoints.some(
          (ep) =>
            ep.host?.includes(endpointId) ||
            ep.id === endpointId ||
            ep.endpoint_id === endpointId,
        );
        if (match) {
          console.log(`resolved project ${project.id} branch ${branch.name ?? branch.id}`);
          return { projectId: project.id, branchId: branch.id };
        }
      }
    }

    cursor = json.pagination?.cursor;
    if (!cursor) break;
  }

  if (explicitProject) {
    const branches = await listBranches(explicitProject);
    const primary =
      branches.find((b) => b.primary) ?? branches.find((b) => b.default) ?? branches[0];
    if (!primary?.id) {
      throw new Error("Could not resolve branch id. Set NEON_BRANCH_ID in .env.");
    }
    return { projectId: explicitProject, branchId: primary.id };
  }

  throw new Error(
    `No Neon project found for endpoint "${endpointId}". Set NEON_PROJECT_ID in .env.`,
  );
}

async function listDomains(projectId, branchId) {
  const { ok, json } = await api(
    `/projects/${projectId}/branches/${branchId}/auth/domains`,
  );
  if (!ok) return [];
  return json.domains ?? json.data ?? [];
}

async function addDomain(projectId, branchId, domain) {
  const { ok, status, json } = await api(
    `/projects/${projectId}/branches/${branchId}/auth/domains`,
    {
      method: "POST",
      body: { domain, auth_provider: "better_auth" },
    },
  );

  if (ok || status === 409) {
    console.log(`ok domain ${domain} (${status === 409 ? "already exists" : "added"})`);
    return true;
  }

  console.error(`fail domain ${domain} (${status})`, json?.message ?? json);
  return false;
}

async function main() {
  const env = getEnv();
  const { projectId, branchId } = await resolveProjectAndBranch(env);

  const origins = new Set(DEFAULT_ORIGINS);

  for (const key of [
    "AUTH_APP_ORIGIN",
    "NEXT_PUBLIC_SITE_URL",
    "SITE_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ]) {
    const value = env[key]?.trim();
    if (!value) continue;
    const origin = value.startsWith("http") ? value : `https://${value}`;
    try {
      origins.add(new URL(origin).origin);
    } catch {
      // skip invalid
    }
  }

  const existing = await listDomains(projectId, branchId);
  if (existing.length) {
    console.log(
      "existing trusted domains:",
      existing.map((d) => d.domain ?? d).join(", "),
    );
  }

  let okCount = 0;
  for (const origin of origins) {
    if (await addDomain(projectId, branchId, origin)) {
      okCount += 1;
    }
  }

  console.log(`done: ${okCount}/${origins.size} domains processed`);
  console.log(
    "If sign-in still fails, open Neon Console → Auth → Configuration → Domains and confirm the production URL is listed.",
  );
}

main().catch((err) => {
  console.error(err.message);
  console.error(
    "Manual fix: Neon Console → Auth → Configuration → Domains → add https://cursor-magret-portfolio.vercel.app",
  );
  process.exit(1);
});
