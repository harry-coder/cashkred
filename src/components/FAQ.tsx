import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'What are the basic requirements to get an CashKred loan?',
      a: 'To be eligible, you must be a resident of India of 21 years or older, have a valid Permanent Account Number (PAN) and Aadhaar Card, and have an active bank account. No physical paperwork or collateral is required.',
    },
    {
      q: 'How long does the loan approval and disbursement take?',
      a: 'Our underwriting scoring engine reviews your application instantly. Most applicants receive their credit decision in less than 5 minutes. Once approved, the funds are automatically disbursed via IMPS directly to your bank account in seconds.',
    },
    {
      q: 'How do I repay my CashKred loan?',
      a: 'Repayment is simple and secure. You can pay directly using any UPI app (Google Pay, PhonePe, Paytm, BHIM UPI) or via direct IMPS NetBanking transfer to our designated virtual bank account, which is unique to your loan statement details sent to your registered email.',
    },
    {
      q: 'Can I repay early, and does it increase my limit?',
      a: 'Yes, absolutely! Settle your outstanding balance early with zero prepayment penalties. On-time repayments automatically elevate your credit profile and report positively to credit bureaus (like CIBIL), unlocking larger borrowing limits (up to ₹80,000) and reduced interest rates on future applications.',
    },
    {
      q: 'What happens if I delay making my loan repayment?',
      a: 'Delaying repayments beyond your chosen tenure can lead to late payment penalty interest and negatively affect your CIBIL credit score. This will reduce your creditworthiness, making it difficult to qualify for other loans or credit cards across banks in India.',
    },
  ];

  return (
    <section id="faq" className="bg-white py-24 border-b border-slate-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-brand-600">Got Questions?</h2>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-brand-500" />
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Everything you need to know about our instant mobile loans, limits, fees, and safe repayment workflows.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? 'border-brand-500/30 bg-brand-50/10 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
                  id={`faq-toggle-${index}`}
                >
                  <span className="font-display text-base sm:text-lg pr-4">{faq.q}</span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isOpen ? 'bg-brand-100 text-brand-700 rotate-180' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-0 text-sm sm:text-base leading-relaxed text-slate-500 border-t border-slate-100/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Live support helper card */}
        <div className="mt-12 text-center rounded-2xl bg-slate-50 border border-slate-100 p-6">
          <HelpCircle className="h-8 w-8 text-brand-600 mx-auto mb-2" />
          <h4 className="font-display font-semibold text-slate-900">Have a different question?</h4>
          <p className="text-xs text-slate-500 mt-1">Our support desk operates around the clock. Get quick answers anytime.</p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-brand-700">
            <span>Email: support@cashkred.com</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>Tel: +91 80 4000 0000</span>
          </div>
        </div>

      </div>
    </section>
  );
}
