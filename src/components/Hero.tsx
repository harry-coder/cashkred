import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
} from 'lucide-react';
import videoUrl from '../assets/video.mp4';

interface HeroProps {
  onApplyWithDetails: (amount: number, duration: number) => void;
}

export default function Hero({ onApplyWithDetails }: HeroProps) {
  const [amount, setAmount] = useState<number>(15000);
  const [duration, setDuration] = useState<number>(30);
  const [repaymentDate, setRepaymentDate] = useState<string>('');

  // Live transactions simulation state
  const [liveTransactions, setLiveTransactions] = useState<Array<{ name: string; action: string; amt: number; time: string }>>([
    { name: 'Ramesh K.', action: 'repaid', amt: 10600, time: 'Just now' },
    { name: 'Priya D.', action: 'disbursed', amt: 25000, time: '2 mins ago' },
    { name: 'Amit S.', action: 'disbursed', amt: 15000, time: '5 mins ago' },
  ]);

  useEffect(() => {
    // Generate simulated live transactions with Indian names
    const names = ['Vikram S.', 'Sneha R.', 'Amit P.', 'Neha G.', 'Rohan M.', 'Karan T.', 'Divya N.', 'Sunita B.'];
    const actions = ['disbursed', 'repaid', 'disbursed', 'repaid'];
    const amounts = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomAmt = amounts[Math.floor(Math.random() * amounts.length)];
      const newTx = {
        name: randomName,
        action: randomAction,
        amt: randomAction === 'repaid' ? randomAmt + Math.round(randomAmt * 0.08) : randomAmt,
        time: 'Just now',
      };
      setLiveTransactions((prev) => [newTx, prev[0], prev[1]].slice(0, 3));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Calculate fees and rates
  const getInterestRate = (days: number) => {
    if (days === 30) return 0.06;
    if (days === 120) return 0.08;
    return 0.12;
  };

  const getServiceFeeRate = (days: number) => {
    if (days === 30) return 0.015;
    if (days === 120) return 0.02;
    return 0.03;
  };

  const interestRate = getInterestRate(duration);
  const serviceFeeRate = getServiceFeeRate(duration);

  const interestAmount = Math.round(amount * interestRate);
  const serviceFee = Math.round(amount * serviceFeeRate);
  const totalRepayable = amount + interestAmount + serviceFee;

  // Calculate repayment date
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + duration);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    setRepaymentDate(today.toLocaleDateString('en-IN', options));
  }, [duration]);

  const handleApply = () => {
    onApplyWithDetails(amount, duration);
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50/50 pt-12 pb-24 md:py-28">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-100/40 bg-radial from-brand-50/20 to-transparent blur-3xl"></div>
      <div className="absolute top-20 right-10 -z-10 h-72 w-72 rounded-full bg-teal-100/10 blur-2xl"></div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-50 border border-brand-100 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <Zap className="h-3.5 w-3.5 text-brand-600 fill-brand-600 animate-pulse" />
              <span>Instant Bank Account credit up to ₹80,000</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-tight">
              Instant Cash on <span className="text-brand-600 bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">Your Own Terms</span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
              No physical paperwork, no collateral, no long wait times. Settle cash demands with direct-to-bank IMPS transfers in under 5 minutes. Compliant, safe, and built for your financial speed with CashKred.
            </p>

            {/* Quick stats tags */}
            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5 text-center lg:text-left max-w-md mx-auto lg:mx-0">
              <div>
                <p className="font-display text-2xl font-bold text-slate-900">5 Min</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Disbursal Time</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900">1.2M+</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Happy Customers</p>
              </div>
            </div>

            {/* Live Feed Component */}
            <div className="hidden sm:block max-w-md mx-auto lg:mx-0 bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  Live Disbursement Feed
                </span>
                <span className="font-mono text-[10px] text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-full">Secure</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {liveTransactions.map((tx, idx) => (
                    <motion.div
                      key={`${tx.name}-${idx}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 text-slate-600">
                        <div className={`h-2 w-2 rounded-full ${tx.action === 'repaid' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                        <span>{tx.name}</span>
                        <span className="text-slate-400">{tx.action === 'repaid' ? 'successfully repaid' : 'received loan'}</span>
                      </div>
                      <span className={`font-mono font-semibold ${tx.action === 'repaid' ? 'text-blue-600' : 'text-teal-600'}`}>
                        ₹{tx.amt.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Hero Right Content - Instant Loan Calculator */}
          <div id="calculator" className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto w-full max-w-none overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100"
            >
              <video
                className="block h-auto w-full"
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden relative mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 to-blue-400" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Loan Calculator</h3>
                  <p className="text-xs text-slate-500">Select amount & flexible duration</p>
                </div>
                <div className="flex items-center space-x-1 bg-brand-50 text-brand-700 px-2.5 py-1 rounded-xl text-xs font-semibold">
                  <span>Interest rate from 6%</span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-500">Loan Amount</span>
                  <span className="font-display text-3xl font-extrabold text-slate-900 font-mono">
                    <span className="text-lg font-bold text-slate-400 mr-0.5">₹</span>
                    {amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="relative group pt-2 pb-4">
                  <input
                    type="range"
                    min="5000"
                    max="80000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-hidden"
                    id="loan-amount-slider"
                  />
                  {/* Slider limits */}
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 font-mono mt-2">
                    <span>₹5,000</span>
                    <span className="text-slate-300">₹40,000</span>
                    <span>₹80,000</span>
                  </div>
                </div>
              </div>

              {/* Term Selection */}
              <div className="space-y-3 mb-6">
                <span className="text-sm font-medium text-slate-500">Repayment Period</span>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 120, 180].map((days) => (
                    <button
                      key={days}
                      onClick={() => setDuration(days)}
                      className={`relative flex flex-col items-center justify-center py-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        duration === days
                          ? 'border-brand-600 bg-brand-50/50 text-brand-800 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                      id={`term-btn-${days}`}
                    >
                      {duration === days && (
                        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-600" />
                      )}
                      <span className="font-display text-base leading-none">{days}</span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Days</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-2.5 mb-6 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Interest rate ({interestRate * 100}%)</span>
                  <span className="font-semibold text-slate-800 font-mono">₹{interestAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Processing Fee ({serviceFeeRate * 100}%)</span>
                  <span className="font-semibold text-slate-800 font-mono">₹{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Repayment Date</span>
                  <span className="font-semibold text-slate-800">{repaymentDate}</span>
                </div>
                <div className="border-t border-slate-200/60 pt-2.5 mt-2.5 flex justify-between items-baseline">
                  <span className="font-bold text-slate-700">Total Payable</span>
                  <span className="font-display text-xl font-black text-brand-700 font-mono">
                    <span className="text-xs font-bold text-brand-500/80 mr-0.5">₹</span>
                    {totalRepayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Apply / Prompt Action Button */}
              <button
                onClick={handleApply}
                className="group w-full flex items-center justify-center space-x-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-4.5 text-base shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20 hover:shadow-md transition-all active:scale-98 cursor-pointer"
                id="calculator-apply-btn"
              >
                <span>Apply for ₹{amount.toLocaleString()}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 mt-4 text-center text-xs text-slate-400 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <span>Safeguarded by National bank-grade encryption</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
