// next.config.js - SEO and performance optimized
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,

  // SEO and Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['lemnaed.com', 'source.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/car-reliability-check',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/reliability-checker',
        destination: '/search', 
        permanent: true,
      },
      {
        source: '/vehicle-check',
        destination: '/search',
        permanent: true,
      },
    ];
  },

  // Webpack configuration for client-side fallback
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', etc. on the client to prevent errors
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        pg: false,
        pgpass: false,
        "pg-hstore": false, // Use quotes for property names with hyphens
      };
    }
    return config;
  },

  env: {
    // Add public environment variables if needed
  },

  serverRuntimeConfig: {
    // Only available on the server side
  },

  publicRuntimeConfig: {
    // Available on both client and server
    apiUrl: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api' // Development API URL
      : 'https://www.lemnaed.com/api', // Production API URL
  },
};

module.exports = nextConfig;