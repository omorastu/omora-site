/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is the home page, /services and /work. The pages that used to
  // sit beside them send their visitors to the nearest of those, for good.
  async redirects() {
    return [
      { source: "/pricing", destination: "/services", permanent: true },
      { source: "/team", destination: "/#us", permanent: true },
      { source: "/services/:slug", destination: "/services", permanent: true },
    ];
  },
};

export default nextConfig;
