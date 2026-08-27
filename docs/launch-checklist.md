# Pre-launch checklist

Things deliberately deferred during the sign-up flow build (see git history
around the `/signup`, `/verify-email`, Google OAuth, and Turnstile work) that
need to be revisited once there's a real production domain, or before real
users start signing up.

## Needs a real domain

- [x] Create a real Cloudflare Turnstile widget scoped to the production
      domain → get a real site key + secret key.
- [x] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to that real site key in
      production env vars (Vercel project `venturo-bhtp`, Production
      environment).
- [x] Supabase Dashboard → Authentication → Attack Protection → enable
      CAPTCHA, select Turnstile, paste the real **secret** key.
- [x] Supabase Dashboard → Authentication → URL Configuration → Redirect
      URLs → add `https://<production-domain>/auth/callback`.
- [x] Resend → verified the production domain (SPF/DKIM DNS records), then
      changed `FROM_EMAIL` in `src/lib/email.ts` to
      `Venturo <hello@venturocoliving.com.au>`.

## Needs doing regardless of domain (still outstanding)

- [x] Supabase Dashboard → Authentication → Providers → Email → turn
      **"Confirm email"** ON.
- [x] Google OAuth configured: Google Cloud OAuth client created, Client
      ID/Secret added in Supabase Dashboard → Authentication → Providers →
      Google.
- [ ] Get the Terms of Service / Privacy Policy content (`src/lib/legal-content.ts`)
      reviewed by a qualified Australian lawyer — it's placeholder copy
      modelled on common Australian rental-site conventions, not drafted or
      reviewed by one.
- [ ] Supabase Dashboard → Authentication → Emails → SMTP Settings → configure
      Custom SMTP using Resend (same verified domain used by
      `src/lib/email.ts`) instead of Supabase's default/shared mailer.
      Discovered 2026-08-26: repeated signups for the same unconfirmed email
      within a few minutes returned a raw 500 from GoTrue (rendered as a
      useless literal `"{}"` in the UI before the `signup/actions.ts` fix) —
      consistent with Supabase's built-in mailer's very low free-tier rate
      limit, since Resend was only ever wired up for the app's own
      transactional emails, not Supabase Auth's confirmation emails.
- [x] The `/contact` form now verifies Turnstile server-side itself (see
      `src/lib/turnstile.ts`) instead of relying on Supabase Auth's built-in
      check, since it doesn't go through Supabase Auth. Add `TURNSTILE_SECRET_KEY`
      (the same real secret key already pasted into Supabase's Attack
      Protection settings) to Vercel project env vars, Production environment.
- [ ] Added 2026-08-27: signup and verify-email/resend now verify Turnstile
      manually via `verifyTurnstileToken()` (same pattern as `/contact`)
      instead of relying on Supabase Auth's built-in CAPTCHA check, so that
      login can be captcha-free — Supabase's Attack Protection CAPTCHA
      toggle is global and can't be scoped to signup only. **Must** turn
      OFF Supabase Dashboard → Authentication → Attack Protection → "Enable
      CAPTCHA protection" in the same deploy window as this code change —
      leaving it on would reject login (which stops sending a token) and
      double-reject signup/resend (which now verify manually, not via the
      option Supabase used to check).
- [ ] Added 2026-08-27: run `npx tsx prisma/scrub-stale-deleted-emails.ts`
      against production once. Fixes accounts soft-deleted before `8eead4a`
      (which still hold their original, un-scrubbed email) so they don't
      collide with a real re-signup via the unique `email` constraint — see
      the fix in `signup/actions.ts` / `require-user.ts` for why this
      previously surfaced as a crash after the confirmation email was
      already sent.

## Already fixed, no action needed

- `DIRECT_URL` in `.env` uses Supabase's IPv4 session pooler instead of the
  IPv6-only direct connection — this is the correct free-tier setup, not a
  workaround to revisit later (the IPv4 add-on is a paid Pro-plan feature).
