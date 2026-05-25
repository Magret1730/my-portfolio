"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth/client";

export type AuthUser = {
  id: string;
  name: string;
};

type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    id: string;
    userId: string;
  };
};

type AuthSessionContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function mapSessionToUser(data: SessionData | null | undefined): AuthUser | null {
  if (!data?.user?.id) {
    return null;
  }
  const name =
    data.user.name?.trim() ||
    data.user.email?.split("@")[0] ||
    "User";
  return { id: data.user.id, name: name.slice(0, 80) };
}

export function AuthSessionProvider({
  children,
  sessionVersion = 0,
}: {
  children: ReactNode;
  sessionVersion?: number;
}) {
  const { data, isPending, refetch } = authClient.useSession();

  useEffect(() => {
    if (sessionVersion > 0) {
      void refetch();
    }
  }, [sessionVersion, refetch]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user: mapSessionToUser(data ?? null),
      loading: isPending,
      refresh,
    }),
    [data, isPending, refresh],
  );

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  );
}

export function useAuthUser(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthUser must be used within AuthSessionProvider");
  }
  return context;
}
