import { BookOpen, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-2">Legal Declarations</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-2">Last Updated: June 27, 2026</p>
        </div>

        {/* Content Box */}
        <div className="space-y-8 text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs">
          
          {/* Section 1 */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-600" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p className="mb-3">
              This digital document constitutes a legally binding agreement between you ("Borrower", "User") and CashKred ("we", "us", "our", "Lending Platform"). By downloading, accessing, browsing, or executing a loan application via our mobile financial platform, you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions.
            </p>
            <p>
              If you do not agree to these terms, you must immediately terminate usage of our software and close any pending applications.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <span>2. Eligibility Criteria</span>
            </h2>
            <p className="mb-3">
              To be eligible for credit limits or micro-loans on the CashKred platform, you must meet the following baseline conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be a citizen and legal resident of the <strong>Republic of India</strong>.</li>
              <li>You must be at least <strong>21 years of age</strong> at the time of application.</li>
              <li>You must possess a valid, active <strong>Permanent Account Number (PAN)</strong> and <strong>Aadhaar Card</strong> registered with your mobile number.</li>
              <li>You must have an active personal bank account in your name with a licensed Indian bank, supported by NetBanking credentials or UPI capabilities.</li>
              <li>You must have a verifiable, regular source of monthly income (salaried or organized self-employed).</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-brand-600" />
              <span>3. Bureau Check & Consent</span>
            </h2>
            <p className="mb-3">
              By submitting a loan application or registering on CashKred, you grant us and our partner Non-Banking Financial Companies (NBFCs) explicit, irrevocable consent to:
            </p>
            <p className="mb-3">
              Query, pull, and analyze your credit history statements and scores from licensed Credit Information Companies in India (including but not limited to <strong>CIBIL, Experian, Equifax, and CRIF High Mark</strong>).
            </p>
            <p>
              Your verified score and historical repayment behavior will dictate your initial credit tier and interest rate structure. You acknowledge that timely repayment of CashKred credit lines will report positively to these bureaus, thereby improving your national CIBIL score.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-brand-600" />
              <span>4. Non-Repayment & Collections Code</span>
            </h2>
            <p className="mb-3">
              In the event that you default or fail to settle your outstanding debt by the agreed-upon repayment date:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>A flat, non-compounding administrative penalty of 2% of the principal will be applied.</li>
              <li>Your delinquent status will be officially reported to CIBIL and all major credit rating agencies, which may severely restrict your future eligibility for credit cards, vehicle financing, or home loans across India.</li>
              <li>We will engage in standard, respectful, and fully compliant debt recovery protocols in strict accordance with the <strong>RBI Fair Practices Code</strong>.</li>
            </ul>
            <div className="p-4 bg-teal-50 border border-teal-100/50 rounded-2xl text-teal-900 text-xs font-semibold leading-relaxed">
              Our Commitment to Respectful Collections: We operate in complete alignment with RBI guidelines. We strictly prohibit any form of verbal harassment, threats, or unauthorized contact with persons in your contact list. Our recovery agents are trained professionals who only contact you directly on your verified number during regulatory hours (9:00 AM - 6:00 PM).
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-brand-600" />
              <span>5. Governing Law & Jurisdiction</span>
            </h2>
            <p>
              These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of the <strong>Republic of India</strong>. Any dispute, difference, or claim arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Bengaluru, Karnataka, India</strong>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
