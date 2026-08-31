import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Landing page for the confirmation link Supabase emails out for flows like
// email change — supabase.auth.updateUser({ email }) doesn't take effect
// until the user clicks through here and we exchange the token for them.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account/profile";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      // Recovery doesn't need a success flag — landing on /reset-password is
      // itself the signal, and it already has a session to act on.
      return NextResponse.redirect(
        type === "recovery" ? `${origin}${next}` : `${origin}${next}?emailConfirmed=1`,
      );
    }
    if (type === "recovery") {
      return NextResponse.redirect(
        `${origin}/forgot-password?error=${encodeURIComponent("That reset link is invalid or has expired. Please request a new one.")}`,
      );
    }
    // "email" is what a signup-confirmation link uses (this app has no
    // magic-link flow, so it can't mean anything else) — the visitor here
    // has no session, unlike an email-change confirmation failure below,
    // so send them somewhere that can send a new link without one.
    if (type === "email") {
      return NextResponse.redirect(`${origin}/signup/link-expired`);
    }
  }

  return NextResponse.redirect(`${origin}/account/profile?emailError=confirmation-failed`);
}
