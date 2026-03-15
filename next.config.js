// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Enable React strict mode for development warnings
//   reactStrictMode: true,

//   // Image domains for Next.js Image component
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         pathname: '/**',
//       },
//     ],
//   },

//   // API proxy — avoids CORS issues in development
//   // All /api/v1/* calls proxied to backend
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
//       },
//     ];
//   },

//   // Security headers
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           { key: 'X-Frame-Options', value: 'DENY' },
//           { key: 'X-Content-Type-Options', value: 'nosniff' },
//           { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
//         ],
//       },
//     ];
//   },
// };

// module.exports = nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com', 'cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/p/:shortCode',
        headers: [{ key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' }],
      },
    ];
  },
  async redirects() {
    return [{ source: '/home', destination: '/dashboard', permanent: true }];
  },
};
module.exports = nextConfig;
