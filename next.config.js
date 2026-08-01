/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'maps.googleapis.com'],
    unoptimized: true,
  },
}
module.exports = nextConfig
