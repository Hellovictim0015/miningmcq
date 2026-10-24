export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/results", "/mcq", "/tests", "/testss"],
      },
    ],
    sitemap: "https://www.miningshiksha.com/sitemap.xml",
  };
}
