"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ComponentProps } from "react";

import { getAuthClient } from "@/lib/auth/client";

type AuthProviderProps = {
  children: React.ReactNode;
};

function SafeLink({ href, ...props }: ComponentProps<typeof Link>) {
  if (typeof href !== "string") {
    return null;
  }
  return <Link href={href} {...props} />;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (typeof href === "string" && href.startsWith("/")) {
        router.push(href);
      }
    },
    [router],
  );

  const replace = useCallback(
    (href: string) => {
      if (typeof href === "string" && href.startsWith("/")) {
        router.replace(href);
      }
    },
    [router],
  );

  if (!ready) {
    return <>{children}</>;
  }

  const authClient = getAuthClient();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={navigate}
      replace={replace}
      onSessionChange={() => router.refresh()}
      Link={SafeLink}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
