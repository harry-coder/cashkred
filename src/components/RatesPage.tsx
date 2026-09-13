import { Percent, Shield, Receipt, Scale } from 'lucide-react';

export default function RatesPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Pricing Transparency
          </span>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Interest Rates & <span className="text-brand-600">Borrowing Terms</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            At CashKred, we have zero tolerance for hidden fees or obscure billing. Review our RBI-compliant pricing metrics, Annual Percentage Rates (APR), and sample calculations.
          </p>
        </div>

        {/* Pricing Matrix */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Percentage Rate (APR)</h4>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">12% - 36%</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your credit assessment CIBIL ratings. Consistent timely repayments automatically qualify you for lower interest tiers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing & Admin Fees</h4>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">1.5% - 3%</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Covers administrative verification and instant IMPS gateway fees. Zero fee deductions upfront. 100% principal is disbursed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flexible Tenures</h4>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">30 Days</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose comfortable settlement windows suited for your salary calendar. Pay off early at any time with zero prepayment charges.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Penalty Charges</h4>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">2% One-Off</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If overdue, a flat non-compounding 2% administrative fee is applied to the principal. No compound daily penalties.
            </p>
          </div>

        </div>

        {/* Key Fact Statement (KFS) Representative Example */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs mb-12">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-5 mb-6">
            <Receipt className="h-6 w-6 text-brand-600 shrink-0" />
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Key Fact Statement (KFS) - Model Illustration</h3>
              <p className="text-xs text-slate-400">Representative model calculation in accordance with RBI Digital Lending Rules</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-12 items-start">
            
            {/* Left table of charges */}
            <div className="md:col-span-7 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Below is a precise breakdown for a customer who borrows a principal sum of <strong>₹10,000</strong> for a standard duration of <strong>30 Days</strong> at a qualified interest rate of <strong>18% Annualized (APR)</strong>:
              </p>

              <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50/50 p-3 font-bold border-b border-slate-100">
                  <span>Parameter Description</span>
                  <span className="text-right">Value (₹)</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">A. Loan Principal Amount</span>
                  <span className="text-right font-mono font-bold text-slate-800">₹10,000.00</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">B. Net Amount Disbursed to Bank Account</span>
                  <span className="text-right font-mono font-bold text-slate-800">₹10,000.00</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">C. Annual Percentage Rate (APR)</span>
                  <span className="text-right font-mono font-bold text-slate-800">18.00%</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">D. Processing & Underwriting Fee (2%)</span>
                  <span className="text-right font-mono font-bold text-slate-800">₹200.00</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">E. Total Interest Accrued (over 30 Days)</span>
                  <span className="text-right font-mono font-bold text-slate-800">₹450.00</span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-brand-50/20 font-bold">
                  <span className="text-brand-800 font-semibold">F. Total Repayable Amount (A + D + E)</span>
                  <span className="text-right font-mono font-bold text-brand-700">₹10,650.00</span>
                </div>
              </div>
            </div>

            {/* Right highlight summary */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-5 flex flex-col justify-center">
              <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-200/60 pb-2">Repayment Calendar Example</h4>
              
              <div className="space-y-4 text-xs">
                <div className="relative pl-5 border-l-2 border-brand-500">
                  <div className="absolute top-1 -left-1.5 h-3 w-3 rounded-full bg-brand-600" />
                  <span className="font-bold text-slate-800 block">30-Day Repayment</span>
                  <span className="text-slate-400">Amount: <strong>₹3,550.00</strong></span>
                </div>

              </div>

              <div className="pt-2 text-[10px] text-slate-400 italic leading-normal border-t border-slate-200/60">
                *The processing fee is amortized and paid together with your installments. There are absolutely no upfront deductions from your approved principal amount.*
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
