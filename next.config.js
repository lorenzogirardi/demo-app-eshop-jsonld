/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "media.gucci.com" },
      { hostname: "s.gravatar.com" },
    ],
  },
  output: "standalone",
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' https://images.unsplash.com https://media.gucci.com https://ui-avatars.com data:",
            "font-src 'self'",
            "connect-src 'self' http://localhost:10000 http://localhost:11434",
            "frame-ancestors 'none'",
          ].join("; "),
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
