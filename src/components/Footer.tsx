import { Wallet, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

export default function Footer({ onPageChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 font-sans border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Upper Footer Grid */}
        <div className="grid gap-8 lg:grid-cols-12 mb-12">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onPageChange('home')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex items-center">
                <span className="font-display text-lg font-extrabold tracking-tight text-white">Cash</span>
                <span className="font-display text-lg font-extrabold tracking-tight text-brand-500">Kred</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
              CashKred is a premier digital credit platform providing instant, secure, and hassle-free micro-loans directly to personal bank accounts across India.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Daksh lefins limited 207 second floor, allied house, inderlok, New Delhi, 110035</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="h-4 w-4 text-brand-500 shrink-0" />
                <span>+91 80 4000 0000 (Corporate desk)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                <span>support@cashkred.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-sm font-bold tracking-wider text-white uppercase">Platform Pages</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onPageChange('home')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  Home / Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('apply')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  Apply Now (Disbursement Form)
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('about')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('repay')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  Repayment Info
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('rates')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  Rates & Terms
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('contact')} className="hover:text-brand-400 transition text-left cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Indian Repayment Box */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5.5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Repay via Bank IMPS</span>
              <span className="text-[10px] font-semibold text-teal-500 bg-teal-950/40 border border-teal-900/40 px-2 py-0.5 rounded-full">Automated</span>
            </div>
            
            <div className="space-y-2.5 text-xs leading-normal">
              <div className="flex justify-between items-center text-slate-300">
                <span>Bank Name</span>
                <span className="font-mono font-bold text-slate-100">HDFC BANK LTD</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>IFSC Code</span>
                <span className="font-mono font-bold text-brand-400">HDFC0000240</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Virtual Account</span>
                <span className="font-mono font-bold text-slate-100">CKRED + Mobile No</span>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-2.5">
                Each applicant gets a dedicated virtual account. Settle via IMPS, NEFT, or UPI to trigger auto-reconciliation.
              </p>
            </div>
          </div>

        </div>

        {/* Regulatory Disclosure Statement */}
        <div className="border-t border-slate-800 pt-8 mt-8 text-[11px] leading-relaxed text-slate-500 space-y-4">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-xs block mb-1">Financial Disclosure & RBI Statement</span>
            CashKred acts as a technology platform connecting borrowers with registered NBFC partners. We operate in accordance with the regulatory boundaries of the Reserve Bank of India (RBI) Digital Lending Guidelines.
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-xs block mb-1">Interest Rates and Terms</span>
            Loan Amounts range from ₹5,000 to ₹80,000. Repayment periods are flexible from 91 days to 180 days. Our Annual Percentage Rate (APR) varies between 12% and 36% maximum, depending on your underwriting profile.
            <br />
            *For example: A ₹10,000 micro-loan with a duration of 91 days has a qualified interest rate of 6% (₹600) and an underwriting fee of 1.5% (₹150). Total repayable amount is ₹10,750.*
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {currentYear} CashKred Ltd. All Rights Reserved.
          </div>
          <div className="flex space-x-6">
            <button onClick={() => onPageChange('terms')} className="hover:text-brand-400 transition cursor-pointer">Terms & Conditions</button>
            <button onClick={() => onPageChange('privacy')} className="hover:text-brand-400 transition cursor-pointer">Privacy Policy</button>
            <button onClick={() => onPageChange('rates')} className="hover:text-brand-400 transition cursor-pointer">Rates & Terms</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
