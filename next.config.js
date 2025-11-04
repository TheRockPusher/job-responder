/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  // This creates a minimal server bundle in .next/standalone
  output: 'standalone',
}

module.exports = nextConfig
