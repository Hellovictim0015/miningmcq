// pages/terms-and-conditions.js
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms & Conditions for using Mining Shiksha's courses and services.",
  alternates: {
    canonical: "/termsandconditions",
  },
};

export default function TermsAndConditions() {
  const effectiveDate = "December 3, 2025";

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
              <p className="mt-2 text-sm text-gray-600">
                Effective date: <span className="font-medium">{effectiveDate}</span>
              </p>
            </header>

            <section className="space-y-6 text-sm text-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
              <p>
                By accessing or using <strong>MiningShiksha</strong> (the “Website”) at <Link href="https://www.miningshiksha.com" className="text-orange-600 hover:underline">miningshiksha.com</Link>, you (“User”, “you”, or “your”) agree to be bound by these Terms & Conditions (“Terms”). If you do not agree to all of these Terms, do not use the Website.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">2. Services Provided</h2>
              <p>
                MiningShiksha is an online platform offering educational courses, training programs, digital content, and related services (“Courses”). Use of the Courses or any related service is subject to these Terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">3. Account Registration & Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate, complete registration information including name, contact details, Aadhaar (if required) or other identity as specified.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials. You accept responsibility for all activities that occur under your account.</li>
                <li>You must be above the legal age (as per Indian law) to register and use the platform.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800">4. Course Purchase & License</h2>
              <p>
                When you purchase a Course, you are granted a limited, non-exclusive, non-transferable license to access and use the course material for personal and educational use only.
              </p>
              <p>
                Distribution, sharing, copying, or resale of any Course content (videos, PDFs, images, exercises, etc.) outside the platform is strictly prohibited. Violation may lead to account termination and legal consequences.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">5. Payment & Fees</h2>
              <p>
                All course fees are displayed in Indian Rupees (INR) and are inclusive or exclusive of applicable taxes (GST) based on what is shown at checkout. You agree to pay applicable taxes. Payment methods provided on the site must be used. 
              </p>
              <p>
                We reserve the right to change price or features of Courses. However, once you have paid for a Course, the fee locked at that time will apply.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">6. Intellectual Property Rights</h2>
              <p>
                All content on the Website — text, images, videos, logos, design, course material — is owned or licensed by MiningShiksha. All rights reserved. You may not copy, reproduce, distribute, create derivative works, or publicly display any portion without prior written permission.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">7. User Conduct</h2>
              <p>
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for any unlawful or prohibited purpose.</li>
                <li>Share or distribute your account credentials, or allow multiple persons to access under a single account.</li>
                <li>Copy, record, or redistribute course content outside the website or upload to other services.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800">8. Termination</h2>
              <p>
                We may suspend or terminate your account and access to Courses without prior notice if you violate these Terms. You will remain liable for any outstanding payments or damages incurred due to the violation.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">9. Disclaimer of Warranties & Limitation of Liability</h2>
              <p>
                The Website and Services are provided “as is” without warranties of any kind, either express or implied. We do not guarantee that the content is error-free, up-to-date, or suitable for your purpose. Your use is at your own risk.
              </p>
              <p>
                Under no circumstances shall MiningShiksha, its owners, affiliates or partners be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the Website or Services, even if advised of the possibility of such damages.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">10. Amendments to Terms</h2>
              <p>
                We may update or change these Terms at any time. The “Effective date” above will change accordingly. Your continued use of the Website after changes means you accept the updated Terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">11. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of India. Any dispute, controversy or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of courts in India, and in particular, the competent courts at your registered address or at our company registered address.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms, contact us at:  
              </p>
              <ul className="list-none pl-0 space-y-1">
                <li>Email: <a href="mailto: helpminingshiksha@gmail.com" className="text-orange-600 hover:underline"> helpminingshiksha@gmail.com</a></li>
                <li>Website: <Link href="https://www.miningshiksha.com" className="text-orange-600 hover:underline">miningshiksha.com</Link></li>
              </ul>
            </section>

            <footer className="mt-8 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} MiningShiksha — All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
