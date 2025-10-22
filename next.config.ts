import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // السماح لأي مسار داخل هذا النطاق
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ تعطيل ESLint أخطاء/تحذيرات في Vercel
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ تعطيل TypeScript أخطاء/تحذيرات في Vercel
  },
};

export default nextConfig;
