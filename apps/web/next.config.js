/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@grand-bandhan/shared', '@grand-bandhan/validation'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
