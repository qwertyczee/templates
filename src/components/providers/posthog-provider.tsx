"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  PostHogProvider as PostHogReactProvider,
} from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

let posthogInitialized = false;

export function PostHogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!POSTHOG_KEY || posthogInitialized) {
      return;
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
    });

    posthogInitialized = true;
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !posthogInitialized) {
      return;
    }

    const query = searchParams?.toString();
    const url = pathname
      ? `${window.location.origin}${pathname}${query ? `?${query}` : ""}`
      : window.location.href;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogReactProvider client={posthog}>
      {children}
    </PostHogReactProvider>
  );
}
