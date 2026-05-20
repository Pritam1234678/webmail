/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE: 'https://mail.codecoder.in/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mail.codecoder.in/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
