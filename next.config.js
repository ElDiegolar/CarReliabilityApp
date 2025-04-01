/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Add webpack configuration to handle server-only modules
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
        "pg-hstore": false  // Use quotes for property names with hyphens
      };
    }
    return config;
  },
  
  env: {
    // You can add public environment variables here if needed
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api' // Development API URL
      : 'https://your-production-domain.com/api', // Production API URL
  },
}

module.exports = nextConfig;