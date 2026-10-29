/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a phone on the same Wi-Fi use the dev server (http://10.0.0.250:3100);
  // without it Next blocks the page's scripts there. Development only.
  allowedDevOrigins: ["10.0.0.250"],

  // The site is the home page, /services (and a page for each service) and
  // /work. The pages that used to sit beside them send their visitors to the
  // nearest of those, for good: V3's service pages to the service that took
  // their place.
  async redirects() {
    return [
      { source: "/pricing", destination: "/services", permanent: true },
      { source: "/team", destination: "/#us", permanent: true },
      { source: "/services/websites", destination: "/services/websites-and-getting-found", permanent: true },
      { source: "/services/ai-receptionist", destination: "/services/phones-booking-follow-up", permanent: true },
      { source: "/services/booking-systems", destination: "/services/phones-booking-follow-up", permanent: true },
      { source: "/services/sales-intelligence", destination: "/services/custom-tools", permanent: true },
    ];
  },
};

export default nextConfig;
