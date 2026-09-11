import { motion } from 'motion/react';
import { Sliders, UserCheck, Cpu, ArrowDownToLine, PhoneCall } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Choose Loan Amount',
      desc: 'Use our real-time loan calculator to adjust your desired cash limit and repayment timeline.',
      icon: Sliders,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      num: '02',
      title: 'Submit Basic Details',
      desc: 'Provide your PAN, Aadhaar number, and active mobile number for instant digital verification.',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      num: '03',
      title: 'Automated Check',
      desc: 'Our RBI-compliant scoring algorithm evaluates your creditworthiness in less than 5 minutes.',
      icon: Cpu,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      num: '04',
      title: 'Direct Disbursement',
      desc: 'Receive your approved funds directly into your verified bank account with zero delay. Simple, fast, and secure.',
      icon: ArrowDownToLine,
      color: 'bg-brand-50 text-brand-600 border-brand-100',
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24 border-y border-slate-100 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title / Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-brand-600">Simple Process</h2>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Four Simple Steps to Funding
          </p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-brand-500" />
          <p className="mt-4 text-slate-500">
            We have stripped away complex forms, lengthy wait periods, and hidden fees. Getting financial help is now as simple as a few taps on your mobile screen.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[12.5%] right-[12.5%] h-0.5 bg-dashed border-t-2 border-dashed border-slate-100 -z-0" />

          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex flex-col items-center md:items-start text-center md:text-left bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-6.5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 group z-10"
              >
                {/* Badge Number */}
                <span className="absolute top-4 right-4 font-mono text-xs font-bold text-slate-300 uppercase tracking-widest group-hover:text-brand-300 transition-colors">
                  Step {step.num}
                </span>

                {/* Icon block */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 shadow-sm ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6" />
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {step.title}
                </h3>
                
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Tip Banner */}
        <div className="mt-16 rounded-3xl bg-slate-50 border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900">Need some assistance?</h4>
              <p className="text-sm text-slate-500 mt-0.5">Our 24/7 client care desk is ready to assist you at any stage of your application.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const element = document.getElementById('faq');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="shrink-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition active:scale-95 shadow-sm cursor-pointer"
          >
            Read FAQs
          </button>
        </div>

      </div>
    </section>
  );
}
