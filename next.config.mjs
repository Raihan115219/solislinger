/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a second dev/build run use its own folder so it never clobbers a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  transpilePackages: ['three'],
};

export default nextConfig;
