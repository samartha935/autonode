"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { authClient } from "@/lib/auth-client";

/**
 * Syncs the Better-Auth session with Sentry's user context on the browser.
 * Renders nothing — just keeps Sentry's scope up to date reactively.
 *
 * Place this inside any client-side provider that wraps the whole app (e.g. layout.tsx).
 */
export function SentryUserSync() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
        username: session.user.name ?? undefined,
      });
    } else {
      // User is logged out — clear Sentry's user context
      Sentry.setUser(null);
    }
  }, [session, isPending]);

  return null;
}
