/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 15, no need for experimental flag
  serverRuntimeConfig: {
    // Only use localhost, don't detect network interfaces
  },
  publicRuntimeConfig: {
    // Only use localhost, don't detect network interfaces
  },
  eslint: {
    // ESLint is run separately via `npm run lint`.
    // Disabled here to avoid ESLint v8/v9 config incompatibilities during build.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
