export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-purple-900 tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
          <p className="text-lg">
            At Elevate(Her), we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
          </p>

          <p>
            By using our website, you agree to the collection and use of information in accordance with this policy.
          </p>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">1. Information We Collect</h2>
            <p className="text-sm text-gray-500 mb-4">Effective Date: March 1st, 2025<br />Last Updated: March 1st, 2025</p>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Professional information (job title, company)</li>
              <li>Communication preferences</li>
              <li>Information you provide through our contact forms or questionnaires</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">2. Legal Basis for Processing (GDPR)</h2>
            <p>Under the General Data Protection Regulation (GDPR), we process your personal data under the following legal bases:</p>
            <ul className="list-none space-y-2">
              <li>✔ Consent – When you opt in to receive marketing communications.</li>
              <li>✔ Legitimate Interest – To provide services, respond to inquiries, or improve our offerings.</li>
              <li>✔ Contractual Obligation – If you enter into a service agreement with us.</li>
              <li>✔ Legal Compliance – If we are required by law to store or share data.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Communicate with you about our services</li>
              <li>Send you updates and marketing materials (with your consent)</li>
              <li>Respond to your inquiries</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">4. How We Share Your Information</h2>
            <p>We do not sell your data. However, we may share it with:</p>
            <ul className="list-none space-y-2">
              <li>🔸 Service Providers: Email marketing platforms, CRM tools, analytics services.</li>
              <li>🔸 Legal Authorities: If required by law or to protect our rights.</li>
            </ul>
            <p className="mt-4">Under CCPA, you have the right to request that we do not "sell" your information. However, we do not sell personal data in the traditional sense.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">5. Your Rights</h2>
            
            <h3 className="text-xl font-semibold text-purple-900 mb-3">For European Users (GDPR Rights)</h3>
            <p>📌 You have the right to:</p>
            <ul className="list-none space-y-2">
              <li>✔ Access – Request a copy of your data.</li>
              <li>✔ Correction – Ask us to fix inaccurate data.</li>
              <li>✔ Deletion ("Right to Be Forgotten") – Request that we erase your data.</li>
              <li>✔ Restriction – Limit how we process your data.</li>
              <li>✔ Portability – Receive a copy of your data in a standard format.</li>
              <li>✔ Object – Withdraw consent for marketing communications.</li>
            </ul>
            <p className="mt-4">📩 To exercise these rights, contact us at <a href="mailto:info@elevateher.tech" className="text-purple-600 hover:text-purple-700">info@elevateher.tech</a>.</p>

            <h3 className="text-xl font-semibold text-purple-900 mt-6 mb-3">For California Users (CCPA Rights)</h3>
            <p>📌 You have the right to:</p>
            <ul className="list-none space-y-2">
              <li>✔ Know what personal information we collect and how we use it.</li>
              <li>✔ Request deletion of your personal data.</li>
              <li>✔ Opt out of data "sale" (though we do not sell data).</li>
              <li>✔ Non-discrimination for exercising these rights.</li>
            </ul>
            <p className="mt-4">📩 To exercise these rights, contact us at <a href="mailto:info@elevateher.tech" className="text-purple-600 hover:text-purple-700">info@elevateher.tech</a>.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">6. Cookies & Tracking (GDPR & CCPA Compliance)</h2>
            <p>We use cookies to improve website functionality and analyze traffic.</p>
            <p>🍪 You can opt out of cookies by adjusting your browser settings.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">7. Data Security</h2>
            <p>We implement security measures to protect your personal information from unauthorized access or disclosure.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">8. Retention Policy</h2>
            <p>We store your data only for as long as necessary to provide services or comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">9. Contact Us</h2>
            <p>If you have any questions about this policy, you can contact us at:</p>
            <ul className="list-none space-y-2">
              <li>📧 Email: <a href="mailto:info@elevateher.tech" className="text-purple-600 hover:text-purple-700">info@elevateher.tech</a></li>
              <li>🌍 Website: <a href="https://elevateher.tech" className="text-purple-600 hover:text-purple-700">elevateher.tech</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 