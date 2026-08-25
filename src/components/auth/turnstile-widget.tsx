"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; appearance?: "always" | "execute" | "interaction-only" },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Server Actions call `redirect()` on failure, which is a client-side
// navigation in the App Router — it unmounts and remounts this div without a
// full page load. Cloudflare's script only auto-renders `.cf-turnstile`
// elements it finds on its own load ("implicit" mode), so a remounted div
// would be left without a widget. Rendering explicitly here, tied to this
// component's own mount/unmount, keeps the widget in sync with React instead.
export function TurnstileWidget({
  siteKey,
  appearance = "interaction-only",
}: {
  siteKey: string;
  appearance?: "always" | "execute" | "interaction-only";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        appearance,
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile"]',
      );
      script?.addEventListener("load", renderWidget);
      return () => script?.removeEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, appearance]);

  return (
    <>
      <div ref={containerRef} />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
    </>
  );
}
