"use client";

import { useEffect } from "react";

/** Neon Auth UI uses Tailwind `.dark`; Once UI uses `data-theme`. Keep both in sync. */
export function ThemeClassSync() {
  useEffect(() => {
    const sync = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      document.documentElement.classList.toggle("dark", theme === "dark");
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
