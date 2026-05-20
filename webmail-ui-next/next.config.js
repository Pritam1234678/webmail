/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND: 'https://mail.codecoder.in',
  },
  // Note: /api/v1/* is handled by app/api/v1/[...path]/route.ts
  // which acts as a proper cookie-forwarding proxy to the backend
}

module.exports = nextConfig
