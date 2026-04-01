/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/zghairon/:path*',
        headers: [
          // Prevent clickjacking — page can't be embedded in an iframe
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Stop referrer leaking to third-party sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Allow images from TripAdvisor CDN + Google Fonts, block everything else unexpected
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",   // Next.js needs unsafe-inline for its runtime
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://dynamic-media-cdn.tripadvisor.com",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // Disable browser features not needed by the café page
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig
