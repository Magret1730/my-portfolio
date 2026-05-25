"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
};

type GetSessionResponse = {
  user?: { id?: string; name?: string | null; email?: string | null } | null;
  session?: { user?: { id?: string; name?: string | null; email?: string | null } | null } | null;
};

function mapSessionUser(data: GetSessionResponse | null): AuthUser | null {
  const user = data?.user ?? data?.session?.user;
  if (!user?.id) {
    return null;
  }
  const name =
    (typeof user.name === "string" && user.name.trim()) ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "User";
  return { id: user.id, name: name.slice(0, 80) };
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/get-session", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as GetSessionResponse;
      setUser(mapSessionUser(data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return { user, loading, refresh: loadSession };
}
