import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/business-case', destination: '/business-case.html' },
      { source: '/pathways', destination: '/pathways.html' },
      { source: '/guide', destination: '/guide.html' },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: '',
  project: '',
});
