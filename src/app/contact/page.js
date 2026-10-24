import ContactPageClient from "./ContactPageClient";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Mining Shiksha for questions about courses, MCQ tests, video content or your account.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
