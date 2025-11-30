/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Use Edge Runtime by default to avoid serverless function limits
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'x-runtime',
            value: 'edge',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
