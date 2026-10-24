// pages/privacy-policy.js
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy, Shipping Policy, Terms & Conditions and Refund & Cancellation policy for Mining Shiksha - online courses and training.",
  alternates: {
    canonical: "/privacyandpolicy",
  },
};

export default function PrivacyPolicy() {
  const effectiveDate = "December 3, 2025"; // update as needed

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy & Terms</h1>
              <p className="mt-2 text-sm text-gray-600">
                Effective date: <span className="font-medium">{effectiveDate}</span>
              </p>
            </header>

            {/* Table of Contents */}
            <nav className="mb-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#privacy" className="text-orange-600 font-medium hover:underline">Privacy Policy</a></li>
                <li><a href="#shipping" className="text-orange-600 font-medium hover:underline">Shipping Policy</a></li>
                <li><a href="#terms" className="text-orange-600 font-medium hover:underline">Terms & Conditions</a></li>
                <li><a href="#refunds" className="text-orange-600 font-medium hover:underline">Cancellations & Refunds</a></li>
                <li><a href="#contact" className="text-orange-600 font-medium hover:underline">Contact</a></li>
              </ul>
            </nav>

            {/* Privacy */}
            <section id="privacy" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Privacy Policy</h2>
              <p className="text-sm text-gray-700 mb-3">
                At <strong>MiningShiksha</strong> ({" "}
                <Link href="https://www.miningshiksha.com" className="text-orange-600 hover:underline">miningshiksha.com</Link> ), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what we collect, why we collect it, and how we use it.
              </p>

              <h3 className="text-lg font-medium mt-4">Information We Collect</h3>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li><strong>Account Information:</strong> name, email, phone number, Aadhaar or identification (if voluntarily provided), and billing address.</li>
                <li><strong>Payment Information:</strong> we do not store full card details on our servers. Payment is processed via third-party providers (Razorpay, Stripe, PayPal, etc.).</li>
                <li><strong>Course Usage:</strong> courses purchased, progress, quiz results, timestamps, and interactions for analytics and product improvement.</li>
                <li><strong>Device & Log Data:</strong> IP address, browser type, device identifiers, and pages visited for security and analytics.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">How We Use Your Information</h3>
              <p className="text-sm text-gray-700">
                We use collected data to provide, operate and improve our services, process payments, send transactional emails (order receipts, course access), personalize content, prevent fraud, and comply with the law.
              </p>

              <h3 className="text-lg font-medium mt-4">Cookies & Tracking</h3>
              <p className="text-sm text-gray-700">
                We use cookies and similar technologies to remember preferences, analyze usage, and aid in advertising. You can control cookie settings via your browser; disabling cookies may affect site functionality.
              </p>

              <h3 className="text-lg font-medium mt-4">Data Sharing</h3>
              <p className="text-sm text-gray-700">
                We do not sell personal data. We may share data with service providers (payment gateways, analytics, email providers) who process data on our behalf under contract. We may disclose data to comply with legal obligations.
              </p>

              <h3 className="text-lg font-medium mt-4">Security</h3>
              <p className="text-sm text-gray-700">
                We use reasonable administrative and technical safeguards to protect personal information, but no online transmission is 100% secure. If you suspect unauthorized access, contact us (see Contact section).
              </p>

              <h3 className="text-lg font-medium mt-4">Retention</h3>
              <p className="text-sm text-gray-700">
                We retain personal information as long as necessary to provide services, fulfill legal obligations, resolve disputes, and enforce agreements.
              </p>
            </section>

            {/* Shipping */}
            <section id="shipping" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Shipping Policy</h2>

              <p className="text-sm text-gray-700 mb-3">
                <strong>MiningShiksha</strong> is primarily a <strong>digital course</strong> marketplace. Most products sold on our platform are delivered electronically — you will receive course access links, login credentials, or downloadable resources via email or your account dashboard.
              </p>

              <h3 className="text-lg font-medium mt-3">Digital Delivery</h3>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li>Immediately after successful payment, you will receive a confirmation email with course access instructions.</li>
                <li>If you do not receive the email within 30 minutes, check your spam/junk folder or contact support.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Physical Materials</h3>
              <p className="text-sm text-gray-700 mb-2">
                In rare cases, certain courses may include physical materials (books, printed certificates). If physical shipping is applicable:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li>Shipping timelines depend on courier and destination — estimated delivery times will be shown at checkout.</li>
                <li>Shipping charges (if any) will be displayed at checkout.</li>
                <li>We are not responsible for delays caused by the courier, customs clearance, or incorrect address input by the buyer.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Address Changes</h3>
              <p className="text-sm text-gray-700">
                Please provide the correct shipping address at checkout. Requests to change shipping address after dispatch may not be possible; additional charges may apply.
              </p>
            </section>

            {/* Terms & Conditions */}
            <section id="terms" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Terms & Conditions</h2>

              <p className="text-sm text-gray-700 mb-3">
                By using MiningShiksha and purchasing courses, you agree to these Terms & Conditions. Please read carefully.
              </p>

              <h3 className="text-lg font-medium mt-3">Course Access & License</h3>
              <p className="text-sm text-gray-700">
                Once purchased, you are granted a limited, non-exclusive, non-transferable license to access the course content for personal, non-commercial use only. Redistribution, copying, or sharing course videos, materials, or downloadable content outside the platform is strictly prohibited.
              </p>

              <h3 className="text-lg font-medium mt-4">User Responsibilities</h3>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li>Provide accurate information at registration and checkout.</li>
                <li>Keep your account credentials secure. You are responsible for activity on your account.</li>
                <li>Respect intellectual property and do not record or redistribute course materials.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Pricing & Taxes</h3>
              <p className="text-sm text-gray-700">
                Course prices are displayed on the product page. Applicable taxes (GST, etc.) or fees will be shown at checkout. We reserve the right to change pricing; orders placed before a change are honored at the price at time of purchase.
              </p>

              <h3 className="text-lg font-medium mt-4">Changes to Service</h3>
              <p className="text-sm text-gray-700">
                We may modify, update, or discontinue courses or features with notice. We will attempt to provide advance notice for major changes.
              </p>

              <h3 className="text-lg font-medium mt-4">Intellectual Property</h3>
              <p className="text-sm text-gray-700">
                All content on MiningShiksha (text, images, videos, logos) is owned or licensed by us. Unauthorized use is prohibited and may lead to legal action.
              </p>
            </section>

            {/* Refunds */}
            <section id="refunds" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Cancellations & Refunds</h2>

              <p className="text-sm text-gray-700 mb-3">
                <strong>Our general policy is: No refunds.</strong> Please read the details and limited exceptions below.
              </p>

              <h3 className="text-lg font-medium mt-3">No Refunds (Digital Products)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Because our courses are digital and access is granted immediately after purchase, we do not offer refunds once access has been provided. By purchasing you acknowledge and accept this no-refund policy.
              </p>

              <h3 className="text-lg font-medium mt-4">Limited Exceptions</h3>
              <p className="text-sm text-gray-700 mb-2">
                In rare circumstances we may consider refunds or partial credits — for example:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li>If we are unable to provide the course you purchased (course cancelled by instructor) and no suitable alternative is available.</li>
                <li>If there is a duplicate charge or clear technical failure verified by our team.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">How to Request an Exception</h3>
              <p className="text-sm text-gray-700">
                To request a refund exception, email <strong> helpminingshiksha@gmail.com</strong> with:
              </p>
              <ul className="list-disc pl-6 mt-2 text-sm text-gray-700 space-y-1">
                <li>Your order ID and full name.</li>
                <li>Reason for refund request and any supporting evidence/screenshots.</li>
                <li>We will review and respond within <strong>7–14 business days</strong>. Refunds, if approved, will be at our discretion and may be subject to deductions (transaction fees). We may offer store credit or course transfer as alternatives.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Chargebacks</h3>
              <p className="text-sm text-gray-700">
                Initiating a chargeback with your payment provider without contacting us first may delay resolution. We reserve the right to dispute chargebacks supported by our records and evidence.
              </p>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Contact</h2>
              <p className="text-sm text-gray-700 mb-2">
                If you have questions about these policies, please contact us:
              </p>

              <ul className="list-none pl-0 text-sm text-gray-700 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:helpminingshiksha@gmail.com" className="text-orange-600 hover:underline">helpminingshiksha@gmail.com</a></li>
                <li><strong>Website:</strong> <a href="https://www.miningshiksha.com" className="text-orange-600 hover:underline">miningshiksha.com</a></li>
              </ul>

              <p className="text-xs text-gray-500 mt-4">
                Note: This page may be updated from time to time. The &quot;Effective date&quot; at the top indicates when this version became active.
              </p>
            </section>

            <footer className="mt-6 text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} MiningShiksha — All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
