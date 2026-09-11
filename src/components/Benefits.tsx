import { motion } from 'motion/react';
import { 
  Zap, 
  Lock, 
  TrendingUp, 
  ShieldCheck, 
  PiggyBank, 
  Activity 
} from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      title: 'Lightning Fast Payout',
      desc: 'No waiting for days. Once approved, the funds are wired directly into your registered Indian bank account in seconds via IMPS.',
      icon: Zap,
      gradient: 'from-amber-500/10 to-teal-500/10',
      iconColor: 'text-amber-500',
    },
    {
      title: 'High-Level Encryption',
      desc: 'We protect your personal data with industrial-grade bank encryption. We will never sell, lease, or share your info with third parties.',
      icon: Lock,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Graduate Your Limits',
      desc: 'Every timely repayment boosts your credit scoring. Graduate from ₹5,000 limits to ₹80,000 alongside reduced interest rates.',
      icon: TrendingUp,
      gradient: 'from-brand-500/10 to-blue-500/10',
      iconColor: 'text-brand-600',
    },
    {
      title: 'Absolute Transparency',
      desc: 'What you see is exactly what you pay. There are no rollover tricks, hidden administrative fees, or late penalty surprises.',
      icon: PiggyBank,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <section id="benefits" className="bg-slate-50 py-24 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-brand-600">The CashKred Advantage</h2>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Why Thousands Choose CashKred
          </p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-brand-500" />
          <p className="mt-4 text-slate-500">
            Built on trust, speed, and absolute clarity. We strive to offer the most dependable mobile financial service in India.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl p-6.5 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Background soft color block */}
                <div className={`absolute top-0 right-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br ${benefit.gradient} opacity-50 blur-xl group-hover:scale-125 transition-transform duration-500`} />

                {/* Icon wrapper */}
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                  <Icon className={`h-6 w-6 ${benefit.iconColor}`} />
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 relative z-10">
                  {benefit.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Security Statement Card */}
        <div className="mt-16 bg-gradient-to-r from-brand-800 to-slate-950 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-brand-950/10">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 border border-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide">
                <ShieldCheck className="h-4 w-4 text-brand-300" />
                <span>100% Data Protection Guaranteed</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                Your Financial Security is Our Greatest Commitment
              </h3>
              <p className="text-brand-100 text-sm md:text-base max-w-xl leading-relaxed">
                CashKred strictly conforms to the Digital Personal Data Protection (DPDP) Act, 2023 of India. We utilize 256-bit Secure Socket Layer (SSL) encryption protocol to encapsulate all communication, keeping your identity safe.
              </p>
            </div>
            
            <div className="md:col-span-4 flex justify-start md:justify-end">
              <div className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-5 space-y-3.5 w-full max-w-xs">
                <div className="flex items-center justify-between text-xs text-brand-200 border-b border-white/10 pb-2">
                  <span className="font-medium">COMPLIANCE STATS</span>
                  <Activity className="h-3.5 w-3.5 text-brand-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-100">RBI Facilitated</span>
                    <span className="font-semibold text-brand-300">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-100">DPDP Compliant</span>
                    <span className="font-semibold text-brand-300">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-100">SSL Encrypted</span>
                    <span className="font-semibold text-brand-300">256-Bit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
