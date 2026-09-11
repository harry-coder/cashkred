import { motion } from 'motion/react';
import { Target, Users, Landmark, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              Our Journey & Mission
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Empowering India's <span className="text-brand-600">Financial Future</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We leverage advanced mobile technology and alternative risk scoring parameters to deliver instant, secure, and hassle-free micro-credit solutions directly to bank accounts across India.
            </p>
          </motion.div>
        </div>

        {/* Narrative & Visual Grid */}
        <div className="grid gap-12 md:grid-cols-2 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Who We Are
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              CashKred is a pioneer in digital lending solutions in India. Originally conceptualized to solve the micro-credit crunch in fast-paced emerging markets, we have built a credit ecosystem designed for modern Indian salaried professionals, freelancers, and small business owners.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We believe that access to credit should be a simple, seamless utility, not a stressful ordeal. By removing paper documentation, physical branch visits, and arbitrary collateral requirements, we empower millions of deserving Indians to access financial support whenever and wherever they need it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl opacity-70 -z-10" />
            
            <h3 className="font-display text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-brand-600" />
              <span>Regulatory Compliance</span>
            </h3>
            
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                CashKred acts as a Digital Lending Platform (Lending Service Provider) and operates in full compliance with the <strong>Reserve Bank of India (RBI)</strong> Digital Lending Guidelines.
              </p>
              <p>
                All loans initiated through the CashKred platform are facilitated and disbursed directly by our partner RBI-registered Non-Banking Financial Companies (NBFCs). We do not disburse credit directly nor do we operate an independent ledger without regulatory oversight.
              </p>
              <div className="p-4 bg-brand-50 border border-brand-100/50 rounded-2xl text-brand-800 font-semibold flex items-start gap-2.5 mt-4">
                <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <span>Our Principal NBFC Partner: KreditKred Finance Private Limited (RBI Reg No: B-14.XXXX)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pillars / Values */}
        <div className="grid gap-6 sm:grid-cols-3 mb-16">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base">Customer First</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hidden fees, no compounding penalties, and clear key fact statements so you know exactly what you owe.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base">Inclusion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creating custom credit products for individuals without a high traditional CIBIL score, helping them build credit responsibly.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base">Top-Tier Safety</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your banking data and identity parameters are protected under AES-256 encryption standards. We never sell your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
