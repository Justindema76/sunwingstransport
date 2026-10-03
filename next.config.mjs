/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/residential-services', destination: '/services/residential-moving', permanent: true },
      { source: '/business-services', destination: '/services/commercial-transport', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/contacts', destination: '/contact', permanent: true },
    ];
  },
};

export default nextConfig;
