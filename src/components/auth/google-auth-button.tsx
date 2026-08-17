"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleAuthButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createClient();
    // Redirects the browser to Google, then Google redirects to
    // /auth/callback (see src/app/auth/callback/route.ts), which exchanges
    // the code for a session — no server action involved on this hop.
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={handleClick}
      disabled={pending}
    >
      Continue with Google
    </Button>
  );
}
