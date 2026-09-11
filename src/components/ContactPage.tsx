import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // clear form
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            We are here to <span className="text-brand-600">Assist You</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Have questions about digital credit limits, repayment periods, or verification guidelines? Our professional customer desk in Bangalore, India is ready to support you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-12 items-stretch">
          
          {/* Left: Contact Info */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-slate-900 text-white rounded-[32px] p-8 space-y-8 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600 rounded-full blur-3xl opacity-20 -z-10" />
              
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold">Contact Details</h3>
                <p className="text-xs text-slate-400">Feel free to reach out to us during corporate working hours (9:00 AM - 6:00 PM, Monday - Friday).</p>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Our Corporate Address</h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Daksh lefins limited 207 second floor, allied house, inderlok, New Delhi, 110035
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Email Enquiries</h4>
                    <p className="text-xs text-slate-400 font-mono">support@cashkred.com</p>
                    <p className="text-[10px] text-slate-500 font-sans">Expect response within 2 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Customer Helpline</h4>
                    <p className="text-xs text-slate-400 font-mono">+91 80 4000 0000</p>
                    <p className="text-[10px] text-slate-500 font-sans">Corporate helpline for grievance details</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 text-[11px] text-slate-500">
                CashKred Ltd (Digital Platform Technology Provider) in partnership with RBI-licensed NBFCs.
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="md:col-span-7">
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-xs h-full flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Submit a Support Ticket</h3>
                      <p className="text-xs text-slate-500">Provide details below and our team will get back to you shortly.</p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 font-medium rounded-xl">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">10-Digit Mobile Phone *</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="e.g. 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ramesh.kumar@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inquiry Subject</label>
                        <input
                          type="text"
                          placeholder="e.g. Query on Loan Repayment or Limit Graduation"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Message *</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Describe your questions or concerns in detail..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide transition focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 text-xs shadow-md shadow-brand-600/10 transition cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending Ticket...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Secure Message</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-5"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 border border-teal-100 mx-auto">
                      <CheckCircle2 className="h-9 w-9 stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-black text-slate-900">Message Dispatched Successfully!</h4>
                      <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                        Thank you for contacting CashKred support. Our compliance desk has registered Ticket <strong>#{Math.floor(100000 + Math.random() * 900000)}</strong>. A customer support representative will reach out to you within 2 working hours.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                    >
                      Submit Another Ticket
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
