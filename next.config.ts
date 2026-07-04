import type { NextConfig } from "next";

const NAADAM_PATHS = [
  'about', 'chess', 'darts', 'groups', 'history', 'live', 'matches',
  'medals', 'register', 'results', 'schedule', 'sports', 'teams',
]

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async redirects() {
    const naadamRedirects = NAADAM_PATHS.flatMap(p => [
      { source: `/${p}`, destination: `/sport/v-naadam/${p}`, permanent: true },
      { source: `/${p}/:path*`, destination: `/sport/v-naadam/${p}/:path*`, permanent: true },
    ])
    return naadamRedirects
  },
};

export default nextConfig;
