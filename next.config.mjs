/** @type {import('next').NextConfig} */

const productionConfig = {
  output: "export",
  images: {
    domains: ['res.cloudinary.com'],
  },
};

const devConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
};

const nextConfig = process.env.NODE_ENV === "production" ? productionConfig : devConfig;

export default nextConfig;
