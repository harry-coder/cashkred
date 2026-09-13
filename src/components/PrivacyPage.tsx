import { Shield, Eye, Database, HelpCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-2">Legal Declarations</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-2">Last Updated: June 27, 2026</p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-600" />
              <span>1. Introduction & Scope</span>
            </h2>
            <p className="mb-3">
              CashKred ("we", "our", "us") values your privacy and is committed to protecting your personal data. This Privacy Policy details how we collect, process, store, and secure your information in connection with our mobile finance application and services in India, in strict accordance with the <strong>Information Technology Act, 2000</strong>, the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, and the <strong>Reserve Bank of India (RBI)</strong> Digital Lending Guidelines.
            </p>
            <p>
              By accessing our platform, registering an account, or submitting a loan application, you explicitly consent to the collection and use of information as detailed in this policy.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-600" />
              <span>2. Information We Collect & Why</span>
            </h2>
            <p className="mb-3">
              To evaluate your creditworthiness, process loan disbursements, and prevent identity theft, we collect the following types of information under strict consent protocols:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li><strong>KYC and Identity Data:</strong> Full name, Permanent Account Number (PAN), Aadhaar number, date of birth, and email address. This is required for identity verification and anti-money laundering compliance.</li>
              <li><strong>Financial & Bank Details:</strong> Bank Name, Account Number, IFSC code, and employment details. This is used solely to verify income credentials and execute instant IMPS loan disbursements.</li>
              <li><strong>Contact & Mobile Data:</strong> Ten-digit Indian mobile number. This is our primary channel for OTP verifications and security notifications.</li>
              <li><strong>Selfie (Camera Permission):</strong> We request one-time access to your camera to take a real-time selfie during the application to perform active liveness checks and match with your KYC document, preventing fraudulent takeovers.</li>
            </ul>
            <div className="p-4 bg-amber-50 border border-amber-100/50 rounded-2xl text-amber-900 text-xs font-semibold">
              Note on Mobile Permissions: In accordance with RBI guidelines, CashKred DOES NOT access your private contact lists, upload your local media files (photos/videos), or continuously track your GPS coordinates in the background. All permission prompts are one-off, explicit, and fully auditable.
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-brand-600" />
              <span>3. Data Storage & Security Controls</span>
            </h2>
            <p className="mb-3">
              We employ military-grade security infrastructure to safeguard your information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All data transmitted between your device and our servers is encrypted using <strong>256-bit AES</strong> transport layer protocols (SSL/TLS).</li>
              <li>Data is housed in secure cloud databases situated physically within Indian territorial borders, in accordance with the data localization guidelines prescribed by the RBI and Indian authorities.</li>
              <li>Access to your personal information is strictly restricted to authorized compliance officers and the specific partner NBFC underwriting your micro-credit line.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-600" />
              <span>4. Your Rights: Right to be Forgotten</span>
            </h2>
            <p className="mb-3">
              You possess complete authority over your personal digital footprint:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Data Erasure:</strong> You can submit a request to support@cashkred.com to permanently delete your account and erase your KYC details from our databases. *Note: If you have an active, outstanding loan, the data erasure request will only be processed upon full settlement of the debt.*</li>
              <li><strong>Consent Withdrawal:</strong> You may opt-out or revoke app permissions at any time through your mobile device settings. This may, however, limit your ability to unlock higher credit scores or request immediate disbursements.</li>
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Privacy & Grievance Contact</h3>
            <p className="text-xs">
              If you have any questions regarding data processing or wish to contact our Grievance Redressal Officer, please reach out via email at <strong>grievance@cashkred.com</strong> or support@cashkred.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
