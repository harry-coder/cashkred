import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Landmark,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ApplyPageProps {
  calculatorPreset: { amount: number; duration: number };
  onPageChange: (page: string) => void;
}

export default function ApplyPage({ calculatorPreset, onPageChange }: ApplyPageProps) {
  // Form State
  const [loanAmount, setLoanAmount] = useState<number>(calculatorPreset.amount);
  const [loanTenure, setLoanTenure] = useState<number>(calculatorPreset.duration);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [employmentType, setEmploymentType] = useState('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [successDetails, setSuccessDetails] = useState<{ smtpConfigured: boolean; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculations
  const getInterestRate = (days: number) => {
    if (days === 91) return 0.06;
    if (days === 120) return 0.08;
    return 0.12;
  };

  const getServiceFeeRate = (days: number) => {
    if (days === 91) return 0.015;
    if (days === 120) return 0.02;
    return 0.03;
  };

  const interestRate = getInterestRate(loanTenure);
  const serviceFeeRate = getServiceFeeRate(loanTenure);

  const interestAmount = Math.round(loanAmount * interestRate);
  const serviceFee = Math.round(loanAmount * serviceFeeRate);
  const totalRepayable = loanAmount + interestAmount + serviceFee;

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};

    if (!fullName.trim()) tempErrors.fullName = 'Full Name is required';

    // 10-digit Indian mobile number
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !cleanPhone.match(/^[6-9]\d{9}$/)) {
      tempErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!email.trim() || !email.includes('@')) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!dob) tempErrors.dob = 'Date of birth is required';

    // PAN Format validation: 5 alphabetic, 4 numbers, 1 alphabetic
    const cleanPan = panNumber.trim().toUpperCase();
    if (!cleanPan || !cleanPan.match(/^[A-Z]{5}\d{4}[A-Z]{1}$/)) {
      tempErrors.panNumber = 'Please enter a valid 10-character PAN Card Number (e.g. ABCDE1234F)';
    }

    // Aadhaar number validation: 12 digits
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      tempErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar Card Number';
    }

    if (!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
      tempErrors.monthlyIncome = 'Net monthly income is required';
    }

    if (!bankName.trim()) tempErrors.bankName = 'Bank Name is required';
    if (!accountNumber.trim() || accountNumber.length < 9) {
      tempErrors.accountNumber = 'Please enter a valid Bank Account Number';
    }

    // IFSC Code validation: 4 letters, 0, 6 alpha-numeric
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!cleanIfsc || !cleanIfsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
      tempErrors.ifscCode = 'Please enter a valid 11-digit IFSC code (e.g. HDFC0000240)';
    }

    if (!accountHolderName.trim()) {
      tempErrors.accountHolderName = 'Account Holder Name is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    //console.log(`SMTP Configured: ${process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS ? "Yes" : "No"}`);

    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('.text-red-500');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          dob,
          gender,
          panNumber: panNumber.toUpperCase(),
          aadhaarNumber,
          employmentType,
          monthlyIncome: Number(monthlyIncome),
          companyName,
          designation,
          loanAmount,
          loanTenure,
          bankName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
          accountHolderName,
          address,
          pinCode
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessDetails({
          smtpConfigured: data.smtpConfigured,
          message: data.message
        });
        setSubmissionStatus('success');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setErrorMessage(data.error || 'Failed to submit application. Please verify details and try again.');
        setSubmissionStatus('error');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrorMessage('Network error occurred. Please ensure your backend dev server is running and try again.');
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-600" />

          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-6">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Application Received!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
            Your instant micro-loan file has been officially submitted and is queuing in our underwriting ledger.
          </p>

          {/* Smtp state info widget */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 max-w-lg mx-auto text-left space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mail Delivery Status</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {successDetails?.message}
                </p>
              </div>
            </div>

            {!successDetails?.smtpConfigured && (
              <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-[11px] text-brand-800 leading-normal font-medium">
                <strong>Developer Notice:</strong> Since no real SMTP server config was discovered in your local environment settings (`.env` variables), all submitted application fields have been logged safely in full HTML format straight to your active development container terminal. Check your CLI logs!
              </div>
            )}
          </div>

          {/* Details summary list */}
          <div className="border-t border-b border-slate-100 py-5 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Applicant Name:</span>
              <span className="text-slate-800 font-bold">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Registered Mobile:</span>
              <span className="text-slate-800 font-mono font-bold">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Requested Principal:</span>
              <span className="text-slate-800 font-mono font-bold">₹{loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Authorized Term:</span>
              <span className="text-slate-800 font-bold">{loanTenure} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Disbursal Account:</span>
              <span className="text-slate-800 font-mono font-bold">{bankName} ({accountNumber.slice(-4).padStart(accountNumber.length, '•')})</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onPageChange('home')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 transition cursor-pointer"
            >
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => {
                setSubmissionStatus('idle');
                setFullName('');
                setEmail('');
                setPhone('');
                setPanNumber('');
                setAadhaarNumber('');
                setMonthlyIncome('');
                setCompanyName('');
                setDesignation('');
                setBankName('');
                setAccountNumber('');
                setIfscCode('');
                setAccountHolderName('');
                setAddress('');
                setPinCode('');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 transition cursor-pointer"
            >
              <span>Submit Another Form</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="bg-slate-50 py-12 min-h-screen font-sans">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <button
          onClick={() => onPageChange('home')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        {/* Heading */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Apply for CashKred Instant Credit
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-normal max-w-2xl">
            Settle your loan application by submitting your details below. Settle in minutes, with direct email notification on submission.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-12 items-start">

          {/* Left Form Panel */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. Loan preferences section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
                <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Requested Credit Configuration</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Loan Amount (₹)</label>
                  <input
                    type="number"
                    min="5000"
                    max="80000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Valid range: ₹5,000 - ₹80,000</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Loan Tenure (Days)</label>
                  <select
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value={91}>91 Days</option>
                    <option value={120}>120 Days</option>
                    <option value={180}>180 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Personal info section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
                <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Personal Identity Information</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Full Name (As on PAN Card)</label>
                  <input
                    type="text"
                    placeholder="Enter your full legal name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.fullName ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.fullName}</p>}
                </div>

                {/* Email address */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.email ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email}</p>}
                </div>

                {/* Phone number */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Mobile Number (+91)
                  </label>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.phone ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
                </div>

                {/* Date of birth */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.dob ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.dob && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.dob}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* PAN number */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono font-bold tracking-wider uppercase transition focus:outline-hidden ${errors.panNumber ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.panNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.panNumber}</p>}
                </div>

                {/* Aadhaar number */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Aadhaar Card Number</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar number"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono tracking-wider transition focus:outline-hidden ${errors.aadhaarNumber ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.aadhaarNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.aadhaarNumber}</p>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </label>
                  <input
                    type="text"
                    placeholder="Building name, Flat/House No., Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:ring-1 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                {/* Pin code */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="400001"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono tracking-widest transition focus:ring-1 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 3. Employment details section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
                <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Employment & Net Monthly Income</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Employment Type */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value="Salaried">Salaried Employee</option>
                    <option value="Self-employed">Self-employed / Business Owner</option>
                    <option value="Freelancer">Freelance / Consultant</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Net monthly income */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Net Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold font-mono transition focus:outline-hidden ${errors.monthlyIncome ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.monthlyIncome && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.monthlyIncome}</p>}
                </div>

                {/* Company name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Company / Business Name</label>
                  <input
                    type="text"
                    placeholder="Enter your employer or firm"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:ring-1 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Designation</label>
                  <input
                    type="text"
                    placeholder="Your role (e.g. Executive, Manager)"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:ring-1 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 4. Bank Account Details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
                <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Landmark className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Disbursal Bank Details</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Bank Name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, ICICI, SBI"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.bankName ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.bankName && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.bankName}</p>}
                </div>

                {/* Account Number */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Bank Account Number</label>
                  <input
                    type="password"
                    placeholder="Enter your account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono transition focus:outline-hidden ${errors.accountNumber ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.accountNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.accountNumber}</p>}
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. HDFC0000240"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono font-bold uppercase transition focus:outline-hidden ${errors.ifscCode ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.ifscCode && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.ifscCode}</p>}
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Name as registered with Bank"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-hidden ${errors.accountHolderName ? 'border-red-300 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-brand-500'
                      }`}
                  />
                  {errors.accountHolderName && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.accountHolderName}</p>}
                </div>
              </div>
            </div>

          </div>

          {/* Right Summary Side Panel */}
          <div className="lg:col-span-4 space-y-6">

            {/* Calculation summary block */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
              <h4 className="font-display font-bold text-slate-900 text-sm border-b border-slate-50 pb-3">Loan Offer Overview</h4>

              <div className="space-y-3.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Loan Amount (Principal)</span>
                  <span className="font-bold text-slate-800 font-mono">₹{loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest rate ({interestRate * 100}%)</span>
                  <span className="font-bold text-slate-800 font-mono">₹{interestAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing fee ({serviceFeeRate * 100}%)</span>
                  <span className="font-bold text-slate-800 font-mono">₹{serviceFee.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline">
                  <span className="font-bold text-slate-700">Total Settle Balance</span>
                  <span className="font-display text-lg font-black text-brand-600 font-mono">₹{totalRepayable.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-600/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Transmitting File...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                <span>Encrypted RBI-Compliant Transmission</span>
              </div>
            </div>

          </div>

        </form>

      </div>
    </section>
  );
}
