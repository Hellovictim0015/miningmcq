import db from "../../lib/db";
import CourseVideoClient from "./CourseVideoClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const [rows] = await db.query(
      "SELECT course_name, description, img_url FROM videocourses WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (rows.length === 0) {
      return { title: "Course Not Found" };
    }

    const course = rows[0];
    const description = course.description
      ? course.description.slice(0, 155)
      : `${course.course_name} — video course on Mining Shiksha.`;

    return {
      title: course.course_name,
      description,
      alternates: {
        canonical: `/coursevideo/${slug}`,
      },
      openGraph: {
        title: course.course_name,
        description,
        images: course.img_url ? [{ url: course.img_url }] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating course metadata:", error);
    return { title: "Video Course" };
  }
}

export default function CourseVideoPage({ params }) {
  return <CourseVideoClient />;
}
