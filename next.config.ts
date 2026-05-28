import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    compiler: {
        removeConsole: true,
    },
}

export default nextConfig