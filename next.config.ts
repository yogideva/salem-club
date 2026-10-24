import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Enforce HTTPS Strict Transport Security
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 2. Prevent Clickjacking Attacks
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 3. Prevent MIME-type Sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 4. Cross-Site Scripting (XSS) Protection
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // 5. Referrer Policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 6. Permissions Policy
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // 7. Content Security Policy (CSP)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.netlify.app",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: upi: tez: phonepe: paytmmp:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // 8. Cross Domain Policies
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
