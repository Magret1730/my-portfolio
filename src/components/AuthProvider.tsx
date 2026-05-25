"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type ComponentProps } from "react";

import { authClient } from "@/lib/auth/client";
import { AuthSessionProvider } from "@/lib/auth/session-context";

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
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [sessionVersion, setSessionVersion] = useState(0);
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/";

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

  const onSessionChange = useCallback(async () => {
    setSessionVersion((v) => v + 1);
    await authClient.getSession({ query: { disableCookieCache: "true" } });
    if (pathname.startsWith("/auth") && redirectTo !== "/") {
      router.replace(redirectTo);
      return;
    }
    router.refresh();
  }, [pathname, redirectTo, router]);

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={navigate}
      replace={replace}
      onSessionChange={() => {
        void onSessionChange();
      }}
      redirectTo={redirectTo}
      Link={SafeLink}
    >
      <AuthSessionProvider sessionVersion={sessionVersion}>
        {children}
      </AuthSessionProvider>
    </NeonAuthUIProvider>
  );
}
