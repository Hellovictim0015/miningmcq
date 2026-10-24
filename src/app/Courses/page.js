import CoursesPageClient from "./CoursesPageClient";

export const metadata = {
  title: "MCQ Courses",
  description:
    "Browse Mining Shiksha's full catalog of MCQ test series for DGMS and mining statutory exam preparation.",
  alternates: {
    canonical: "/Courses",
  },
};

export default function AllMCQCoursesPage() {
  return <CoursesPageClient />;
}
