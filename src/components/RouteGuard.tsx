"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/resources";
import { Flex, Spinner } from "@once-ui-system/core";
import NotFound from "@/app/not-found";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performChecks = () => {
      setLoading(true);
      setIsRouteEnabled(false);

      const checkRouteEnabled = () => {
        if (!pathname) return false;

        if (pathname in routes) {
          return routes[pathname as keyof typeof routes];
        }

        const dynamicRoutes = ["/blog", "/work", "/auth"] as const;
        for (const route of dynamicRoutes) {
          if (pathname?.startsWith(route)) {
            if (route === "/auth") return true;
            if (routes[route as "/blog" | "/work"]) return true;
          }
        }

        return false;
      };

      setIsRouteEnabled(checkRouteEnabled());
      setLoading(false);
    };

    performChecks();
  }, [pathname]);

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export { RouteGuard };
