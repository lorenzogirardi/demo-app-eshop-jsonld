/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" }, // For testing & demo images.
      { hostname: "media.gucci.com" }, // For Gucci Digital specific testing.
      { hostname: "s.gravatar.com" }, // For Auth0 user profle images. 
  ]},
  output: "standalone",
};

module.exports = nextConfig;
