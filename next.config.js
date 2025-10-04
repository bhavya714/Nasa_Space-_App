/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper server configuration for deployment platforms
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configure for production deployment
  output: 'standalone',
  // Image configuration
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Webpack configuration
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })
    return config
  },
  // API configuration for deployment
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
