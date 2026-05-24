import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://pagead2.googlesyndication.com https://adservice.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.firebasedatabase.app wss://*.firebasedatabase.app https://*.firebasestorage.app https://*.googleapis.com https://freeipapi.com https://api.country.is https://ipapi.co https://ipwho.is stun:*; font-src 'self' data:; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; child-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; frame-ancestors 'none';"
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
