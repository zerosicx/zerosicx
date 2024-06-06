/** @type {import('next').NextConfig} */

const productionConfig = {
    output: "export",
    basePath: "/zerosicx",
    assetPrefix: "/zerosicx",
    images: {
        domains: ['res.cloudinary.com'],
    },
}
const devConfig = {
    images: {
        domains: ['res.cloudinary.com'],
    },
};

export default process.env.NODE_ENV === "production" ? productionConfig : devConfig;
