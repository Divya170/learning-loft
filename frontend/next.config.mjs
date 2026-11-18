/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL ?? 'http://localhost:4000/api';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The browser talks to the NestJS API through same-origin /api/* — no CORS needed in the browser.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
