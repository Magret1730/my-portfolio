"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Same-origin proxy at /api/auth — must match [src/app/api/auth/[...path]/route.ts]. */
export const authClient = createAuthClient();
