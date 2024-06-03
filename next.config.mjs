/** @type {import('next').NextConfig} */

const productionConfig = {
    output: "export",
    basePath: "/zerosicx",
    assetPrefix: "/zerosicx"
}
const devConfig = {
};

export default process.env.NODE_ENV === "production" ? productionConfig : devConfig;
