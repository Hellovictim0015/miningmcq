import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalChrome from "@/com/ConditionalChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.miningshiksha.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mining Shiksha — Learn • Grow • Succeed",
    template: "%s | Mining Shiksha",
  },
  description:
    "India's trusted learning platform for DGMS, Mining Statutory & Competitive Exams — MCQ test series, video courses and study materials.",
  keywords: [
    "Mining Shiksha",
    "DGMS exam preparation",
    "Mining statutory exams",
    "Mining MCQ tests",
    "Mining education",
    "Mining courses online",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mining Shiksha",
    title: "Mining Shiksha — Learn • Grow • Succeed",
    description:
      "India's trusted learning platform for DGMS, Mining Statutory & Competitive Exams.",
    images: [
      {
        url: "/Frame 1000003961.png",
        width: 800,
        height: 800,
        alt: "Mining Shiksha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mining Shiksha — Learn • Grow • Succeed",
    description:
      "India's trusted learning platform for DGMS, Mining Statutory & Competitive Exams.",
    images: ["/Frame 1000003961.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mining Shiksha",
  url: siteUrl,
  logo: `${siteUrl}/Frame 1000003961.png`,
  email: "helpminingshiksha@gmail.com",
  description:
    "India's trusted learning platform for DGMS, Mining Statutory & Competitive Exams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}
