const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Returns true when Turnstile isn't configured (e.g. local dev without a
// secret key set) so forms keep working; the client only renders the widget
// when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, matching that same guard.
export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;
  if (!token) return false;

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });

  const data = (await response.json()) as { success: boolean };
  return data.success;
}
