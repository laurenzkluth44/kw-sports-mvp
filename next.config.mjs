/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src"]
  },
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // KW player CV PDFs (max 10 MB) are uploaded through a server action.
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
