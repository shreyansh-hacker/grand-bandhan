const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@grand-bandhan/shared', '@grand-bandhan/validation', '@grand-bandhan/ui'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grand-bandhan.onrender.com';
    return {
      afterFiles: [
        {
          source: '/invite-studio',
          destination: '/invite-studio/index.html',
        },
        {
          source: '/invite-studio/:path*',
          destination: '/invite-studio/index.html',
        },
        {
          source: '/i/:slug',
          destination: '/invite-studio/index.html',
        },
      ],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
