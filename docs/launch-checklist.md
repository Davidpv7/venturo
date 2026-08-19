# Pre-launch checklist

Things deliberately deferred during the sign-up flow build (see git history
around the `/signup`, `/verify-email`, Google OAuth, and Turnstile work) that
need to be revisited once there's a real production domain, or before real
users start signing up.

## Needs a real domain

- [ ] Create a real Cloudflare Turnstile widget scoped to the production
      domain → get a real site key + secret key (currently using
      Cloudflare's public test key, which always passes — no real bot
      protection is active).
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to that real site key in
      production env vars (e.g. Vercel project settings).
- [ ] Supabase Dashboard → Authentication → Attack Protection → enable
      CAPTCHA, select Turnstile, paste the real **secret** key. (This is the
      step that actually makes Supabase verify the token — without it,
      nothing is enforced regardless of which site key is set.)
- [ ] Supabase Dashboard → Authentication → URL Configuration → Redirect
      URLs → add `https://<production-domain>/auth/callback` (Google
      sign-in will silently fail on the new domain until this is added).
- [ ] Resend → verify the production domain (SPF/DKIM DNS records), then
      change `FROM_EMAIL` in `src/lib/email.ts` from the shared
      `onboarding@resend.dev` test sender to a verified address on that
      domain — without a verified domain, Resend restricts the test sender
      to only deliver to the email address the Resend account is
      registered under, so notify-me/contact/application emails won't
      reliably reach real users until this is done.

## Needs doing regardless of domain (still outstanding)

- [ ] Supabase Dashboard → Authentication → Providers → Email → turn
      **"Confirm email"** ON. Without this, email verification isn't
      actually mandatory — `requireVerifiedUser()` is ready but this is what
      makes it bite.
- [ ] Google OAuth isn't configured yet: create a Google Cloud OAuth client
      (authorized redirect URI is Supabase's own callback —
      `https://wihjpfpmnnbwvgiertpg.supabase.co/auth/v1/callback`, not the
      app's), then add the Client ID/Secret in Supabase Dashboard →
      Authentication → Providers → Google, and add
      `http://localhost:3000/auth/callback` to the Redirect URLs allow-list
      for local testing.
- [ ] Get the Terms of Service / Privacy Policy content (`src/lib/legal-content.ts`)
      reviewed by a qualified Australian lawyer — it's placeholder copy
      modelled on common Australian rental-site conventions, not drafted or
      reviewed by one.

## Already fixed, no action needed

- `DIRECT_URL` in `.env` uses Supabase's IPv4 session pooler instead of the
  IPv6-only direct connection — this is the correct free-tier setup, not a
  workaround to revisit later (the IPv4 add-on is a paid Pro-plan feature).
