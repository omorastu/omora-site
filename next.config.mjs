/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a phone on the same Wi-Fi use the dev server (http://10.0.0.250:3100);
  // without it Next blocks the page's scripts there. Development only.
  allowedDevOrigins: ["10.0.0.250"],

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
