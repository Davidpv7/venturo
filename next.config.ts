import type { NextConfig } from "next";

// Derived from the env var rather than hardcoded so this doesn't silently
// break if the Supabase project ever changes.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // prisma/seed.ts still seeds placeholder photos from here — keep this
      // until real listings all have Storage-uploaded photos.
      { protocol: "https" as const, hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Default 1MB is too small for real photo uploads via admin forms.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
