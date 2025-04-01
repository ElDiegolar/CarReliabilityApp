

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
      : 'https://https://car-reliability-app.vercel.app/api', // Production API URL
  },
}

module.exports = nextConfig;
