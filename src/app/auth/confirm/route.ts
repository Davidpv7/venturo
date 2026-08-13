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
      return NextResponse.redirect(`${origin}${next}?emailConfirmed=1`);
    }
  }

  return NextResponse.redirect(`${origin}/account/profile?emailError=confirmation-failed`);
}
