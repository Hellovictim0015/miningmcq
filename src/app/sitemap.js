import db from "./lib/db";

const siteUrl = "https://www.miningshiksha.com";

export default async function sitemap() {
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/Courses",
    "/navlinkmcq",
    "/navlinkvideo",
    "/navlinkmaterials",
    "/privacyandpolicy",
    "/termsandconditions",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  let courseRoutes = [];
  try {
    const [mcqCourses] = await db.query("SELECT slug FROM courses");
    const [videoCourses] = await db.query("SELECT slug FROM videocourses");

    courseRoutes = [
      ...mcqCourses.map((c) => ({
        url: `${siteUrl}/coursedetails/${c.slug}`,
        lastModified: new Date(),
      })),
      ...videoCourses.map((c) => ({
        url: `${siteUrl}/coursevideo/${c.slug}`,
        lastModified: new Date(),
      })),
    ];
  } catch (error) {
    console.error("Error building sitemap course routes:", error);
  }

  return [...staticRoutes, ...courseRoutes];
}
