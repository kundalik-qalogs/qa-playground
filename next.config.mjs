/** @type {import('next').NextConfig} */

// T20 — Security headers applied to all routes
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
];

const nextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client", "@prisma/adapter-pg"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Practice page slug renames — 301 permanent redirects
      { source: "/practice/input", destination: "/practice/input-fields", permanent: true },
      { source: "/practice/button", destination: "/practice/buttons", permanent: true },
      { source: "/practice/select", destination: "/practice/dropdowns", permanent: true },
      { source: "/practice/alert", destination: "/practice/alerts-dialogs", permanent: true },
      { source: "/practice/radio", destination: "/practice/radio-checkbox", permanent: true },
      { source: "/practice/calendar", destination: "/practice/date-picker", permanent: true },
      { source: "/practice/window", destination: "/practice/tabs-windows", permanent: true },
      { source: "/practice/waits", destination: "/practice/dynamic-waits", permanent: true },
      { source: "/practice/simple-table", destination: "/practice/data-table", permanent: true },
      { source: "/practice/upload-download", destination: "/practice/file-upload", permanent: true },
      { source: "/bank/login", destination: "/login", permanent: true },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
