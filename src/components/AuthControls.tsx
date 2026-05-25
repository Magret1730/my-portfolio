"use client";

import { Button, Row, Text } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAuthClient } from "@/lib/auth/client";
import { useAuthUser } from "@/lib/auth/useAuthUser";

export function AuthControls() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { user, loading, refresh } = useAuthUser();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  const signInHref = `/auth/sign-in?redirect=${encodeURIComponent(pathname)}`;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await getAuthClient().signOut();
      refresh();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Row s={{ hide: true }}>
        <Button href={signInHref} size="s" variant="secondary">
          Sign in
        </Button>
      </Row>
    );
  }

  return (
    <Row gap="8" vertical="center" s={{ hide: true }}>
      <Text variant="body-default-s" onBackground="neutral-weak">
        {user.name}
      </Text>
      <Button size="s" variant="tertiary" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? "…" : "Sign out"}
      </Button>
    </Row>
  );
}
