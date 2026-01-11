/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 15, no need for experimental flag
  serverRuntimeConfig: {
    // Only use localhost, don't detect network interfaces
  },
  publicRuntimeConfig: {
    // Only use localhost, don't detect network interfaces
  },
}

module.exports = nextConfig
