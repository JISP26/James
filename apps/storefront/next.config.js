/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jisp/ui", "@jisp/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // Demo/seed product photos only — remove once real product images
        // are uploaded through Admin > Products (which store to Supabase
        // Storage and are covered by the *.supabase.co pattern above).
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
