import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, Smartphone, Landmark, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface RepayPageProps {
  onPageChange: (page: string) => void;
}

interface SimulatedLoan {
  id: string;
  amount: number;
  interest: number;
  serviceFee: number;
  totalPayable: number;
  repaymentDate: string;
  daysRemaining: number;
  status: string;
}

export default function RepayPage({ onPageChange }: RepayPageProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [simulatedLoan, setSimulatedLoan] = useState<SimulatedLoan | null>(null);
  
  // Payment states
  const [repayMethod, setRepayMethod] = useState<'upi' | 'imps'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'verify' | 'success'>('idle');
  const [amountToPay, setAmountToPay] = useState(0);

  const handleSearchLoan = (e: FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 10) return;

    setIsSearching(true);
    setSearchAttempted(true);

    setTimeout(() => {
      setIsSearching(false);
      // Generate an active loan example for demonstration, making it feel organic and professional
      const cleaned = phoneNumber.replace(/\D/g, '');
      const digitSum = cleaned.split('').reduce((acc, char) => acc + (parseInt(char) || 0), 0);
      
      if (digitSum % 2 === 0) {
        // Mock active loan
        const amt = 15000;
        const interest = 900;
        const service = 250;
        setSimulatedLoan({
          id: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: amt,
          interest: interest,
          serviceFee: service,
          totalPayable: amt + interest + service,
          repaymentDate: new Date(Date.now() + 12 * 86400000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          daysRemaining: 12,
          status: 'active',
        });
        setAmountToPay(amt + interest + service);
      } else {
        setSimulatedLoan(null);
      }
    }, 1200);
  };

  const triggerUpiRepay = () => {
    if (repayMethod === 'upi' && !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g., mobile@upi or name@okaxis)');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    setTimeout(() => {
      setPaymentStep('verify');
      setIsProcessing(false);
    }, 1800);
  };

  const confirmUpiReceived = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
      setSimulatedLoan(null);
    }, 1500);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Easy & Quick Settlement
          </span>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Repay Your <span className="text-brand-600">CashKred Loan</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Settle your loan balance instantly from any location in India using standard digital channels: Unified Payments Interface (UPI), NetBanking, or virtual IMPS transfer.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column: Official Instructions & Bank Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-50 pb-3">
                Official Repayment Channels
              </h3>

              {/* UPI Option Info */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900">1. Instant UPI Repayment (Recommended)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter your UPI ID inside our secure panel to receive an instant collect request on Google Pay, PhonePe, Paytm, or BHIM. Approve the request with your secret 4 or 6-digit UPI PIN to settle the loan immediately.
                  </p>
                </div>
              </div>

              {/* IMPS Bank Transfer Info */}
              <div className="flex gap-4 border-t border-slate-50 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">2. Bank Transfer via Virtual Account (IMPS/NEFT)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You can pay from any bank account inside India (ICICI, HDFC, SBI, Axis, etc.) directly via online banking to our designated company settlement coordinates:
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 font-mono text-[11px] text-slate-600 leading-normal">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beneficiary Name</span>
                      <span className="font-bold text-slate-800">CASHKRED DIGITAL SYSTEMS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Name</span>
                      <span className="font-bold text-slate-800">HDFC BANK LTD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Virtual IFSC Code</span>
                      <span className="font-bold text-slate-800">HDFC0000240</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Number</span>
                      <span className="font-bold text-teal-600">CKRED{phoneNumber ? phoneNumber.replace(/\D/g, '').slice(-10) : '9999999999'}</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 italic leading-normal">
                    *Your Account Number is uniquely generated for your loan. Transferring to this virtual account triggers automatic reconciliation within 10 minutes.*
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Notice */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-xs text-red-800 leading-relaxed">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Important Safety Advisory</span>
                CashKred does NOT collect loan repayments on personal bank accounts, personal phone numbers, or private UPI IDs. Always utilize our secure web portal or verify that the bank transfer name strictly resolves to <strong>CASHKRED DIGITAL SYSTEMS</strong>.
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Statement lookup & Repayment Panel */}
          <div className="lg:col-span-6">
            
            {/* Interactive Section Card */}
            <div className="bg-white border border-slate-100 rounded-[30px] p-6 sm:p-8 shadow-xs">
              
              <AnimatePresence mode="wait">
                {paymentStep === 'idle' && (
                  <motion.div
                    key="lookup-stage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Check Outstanding Balance</h3>
                      <p className="text-xs text-slate-500">Enter your 10-digit Indian mobile number to fetch your active micro-credit details.</p>
                    </div>

                    <form onSubmit={handleSearchLoan} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indian Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-sm text-slate-400 font-bold">+91</span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full rounded-2xl border border-slate-200 pl-13 pr-4 py-3.5 text-sm font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSearching || phoneNumber.length < 10}
                        className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white font-bold py-3.5 text-sm shadow-md shadow-brand-600/10 transition cursor-pointer"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Retrieving records...</span>
                          </>
                        ) : (
                          <>
                            <span>Retrieve Loan Details</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {searchAttempted && !isSearching && (
                      <div className="border-t border-slate-50 pt-5">
                        {simulatedLoan ? (
                          <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-brand-50/40 border border-brand-100/50 rounded-2xl p-5 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Micro-Credit</span>
                              <span className="text-[11px] text-slate-400 font-mono font-bold">Loan ID: {simulatedLoan.id}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-100 pb-4">
                              <div>
                                <span className="text-slate-400 text-[10px] block font-sans">Principal Amount</span>
                                <span className="font-bold text-slate-700 text-sm">₹{simulatedLoan.amount.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block font-sans">Interest & Fees</span>
                                <span className="font-bold text-slate-700 text-sm">₹{(simulatedLoan.interest + simulatedLoan.serviceFee).toLocaleString()}</span>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-400 text-[10px] block font-sans">Repayment Due</span>
                                <span className="font-bold text-slate-700 text-xs">{simulatedLoan.repaymentDate}</span>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-400 text-[10px] block font-sans">Days Remaining</span>
                                <span className={`font-bold text-xs ${simulatedLoan.daysRemaining < 3 ? 'text-red-500 font-extrabold' : 'text-slate-700'}`}>{simulatedLoan.daysRemaining} Days</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-baseline pt-1">
                              <span className="text-xs font-bold text-slate-600">Total Outstanding Balance:</span>
                              <span className="font-display text-2xl font-black text-brand-700 font-mono">₹{amountToPay.toLocaleString()}</span>
                            </div>

                            {/* Method Selector */}
                            <div className="space-y-2.5 pt-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Settle Mode</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setRepayMethod('upi')}
                                  className={`py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                                    repayMethod === 'upi' ? 'border-brand-600 bg-brand-50/50 text-brand-800' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <Smartphone className="h-4 w-4" />
                                  <span>Pay via UPI</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRepayMethod('imps')}
                                  className={`py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                                    repayMethod === 'imps' ? 'border-teal-600 bg-teal-50/40 text-teal-800' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <Landmark className="h-4 w-4" />
                                  <span>Pay via IMPS</span>
                                </button>
                              </div>
                            </div>

                            {repayMethod === 'upi' ? (
                              <div className="space-y-3.5 pt-1">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enter UPI ID</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. mobile@upi or name@okaxis"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={triggerUpiRepay}
                                  className="w-full flex items-center justify-center space-x-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 text-xs shadow-md shadow-brand-600/10 transition cursor-pointer"
                                >
                                  <span>Pay ₹{amountToPay.toLocaleString()} Instantly</span>
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                                <p className="font-bold text-slate-700">Bank Transfer Repayment Guide:</p>
                                <p className="text-slate-500 text-[11px] leading-normal">
                                  Transfer exactly <strong>₹{amountToPay.toLocaleString()}</strong> via IMPS to our HDFC virtual account coordinates shown on the left side of this page. Settle within today to avoid system automated daily late fee accruals.
                                </p>
                                <p className="text-[10px] text-slate-400 italic mt-1">
                                  Our auto-reconcile bots monitor HDFC IMPS streams every 10 mins. Keep your IMPS transaction reference ID handy.
                                </p>
                              </div>
                            )}

                          </motion.div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                            <Check className="h-8 w-8 text-teal-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-800">No Outstanding Balance!</p>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              There is no active debt linked to <strong>+91 {phoneNumber.replace(/\D/g, '').slice(-10)}</strong>. Enjoy your high CIBIL credit ranking!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {paymentStep === 'processing' && (
                  <motion.div
                    key="processing-stage"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-brand-500 animate-spin mx-auto" />
                    <div>
                      <p className="font-bold text-slate-800 text-base">Requesting collect trigger...</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Tying secure API tunnels to National Payments Corporation of India (NPCI) gateway to dispatch UPI collect prompt...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'verify' && (
                  <motion.div
                    key="verify-stage"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto border border-brand-100">
                      <Smartphone className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">UPI Collect Order Issued!</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        An instant UPI collect request of <strong>₹{amountToPay.toLocaleString()}</strong> has been dispatched to <strong>{upiId}</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-left space-y-2 font-medium text-slate-500">
                      <p className="font-bold text-slate-700">How to Approve on your Mobile:</p>
                      <p>1. Unlock your device and open your preferred UPI application (Google Pay, GPay, PhonePe, or Paytm).</p>
                      <p>2. Tap on the pending Collect Order from <strong>CASHKRED DIGITAL SYSTEMS</strong>.</p>
                      <p>3. Confirm amount <strong>₹{amountToPay.toLocaleString()}</strong>, enter your UPI PIN, and press Submit.</p>
                    </div>

                    <button
                      onClick={confirmUpiReceived}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center space-x-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 text-xs shadow-md shadow-brand-600/10 transition cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Validating NPCI settlement...</span>
                        </>
                      ) : (
                        <span>I have successfully entered UPI PIN</span>
                      )}
                    </button>
                  </motion.div>
                )}

                {paymentStep === 'success' && (
                  <motion.div
                    key="success-stage"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center space-y-5"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 border border-teal-100 mx-auto">
                      <Check className="h-8 w-8 stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-black text-slate-900">Loan Repayment Cleared!</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Your transaction has been finalized in our bank records. A confirmation receipt will land shortly on <strong>+91 {phoneNumber.replace(/\D/g, '').slice(-10)}</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] font-mono text-slate-600 max-w-xs mx-auto leading-normal">
                      <div className="flex justify-between">
                        <span>Transaction Ref</span>
                        <span className="font-bold text-slate-800">NPCI9238472938</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Settled Balance</span>
                        <span className="font-bold text-slate-800">₹{amountToPay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>CIBIL Credit Score</span>
                        <span className="font-bold text-teal-600 font-sans flex items-center gap-1">
                          <Sparkles className="h-3 w-3 fill-teal-500 text-teal-500" /> Upgraded!
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPaymentStep('idle');
                        setSearchAttempted(false);
                      }}
                      className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                    >
                      Make Another Repayment
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
