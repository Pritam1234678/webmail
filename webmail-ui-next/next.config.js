/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND: 'https://mailbackend.codecoder.in',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mailbackend.codecoder.in/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
