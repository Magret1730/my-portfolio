"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

type AuthClient = ReturnType<typeof createAuthClient>;

let authClientInstance: AuthClient | null = null;

export function getAuthClient(): AuthClient {
  if (typeof window === "undefined") {
    throw new Error("getAuthClient() can only be called in the browser.");
  }
  if (!authClientInstance) {
    authClientInstance = createAuthClient(`${window.location.origin}/api/auth`, {
      adapter: BetterAuthReactAdapter(),
    });
  }
  return authClientInstance;
}
