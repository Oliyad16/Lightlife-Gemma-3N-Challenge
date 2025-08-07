import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove static export for development
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // distDir: 'out',
  
  // Enable WebAssembly support for Gemma models
  experimental: {
    // esmExternals: 'loose', // Remove this as it's causing issues
  },
  
  // Configure headers for AI model serving (only for production)
  // async headers() {
  //   return [
  //     {
  //       source: '/models/:path*',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable',
  //         },
  //         {
  //           key: 'Cross-Origin-Embedder-Policy',
  //           value: 'require-corp',
  //         },
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin',
  //         },
  //       ],
  //     },
  //     {
  //       source: '/data/:path*',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=3600',
  //         },
  //       ],
  //     },
  //   ];
  // },
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // Configure webpack for AI libraries
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mlc-ai/web-llm': require.resolve('@mlc-ai/web-llm'),
    };
    
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // PWA configuration for offline support
  reactStrictMode: true,
  
  // Capacitor integration
  basePath: '',
  assetPrefix: '',
};

export default nextConfig;