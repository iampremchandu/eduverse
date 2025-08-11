/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  compress: true,
};
module.exports = nextConfig;
