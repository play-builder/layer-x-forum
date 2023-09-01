/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      process.env.NEXT_PUBLIC_IMAGE_DOMAIN || "localhost",
    ].filter(Boolean),
    minimumCacheTTL: 60,
  },
  env: {
    NEXT_PUBLIC_SERVER_BASE_URL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  },
  swcMinify: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
