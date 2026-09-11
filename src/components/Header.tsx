import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export default function Header({
  onPageChange,
  currentPage,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', name: 'Home' },
    { id: 'apply', name: 'Apply Now' },
    { id: 'repay', name: 'Repayment Info' },
    { id: 'rates', name: 'Rates & Terms' },
    { id: 'about', name: 'About Us' },
    { id: 'contact', name: 'Contact Us' },
  ];

  const handleNavClick = (id: string) => {
    onPageChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-2" 
          onClick={() => onPageChange('home')}
          id="logo-container"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <svg className="h-5.5 w-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">Cash</span>
              <span className="font-display text-xl font-extrabold tracking-tight text-brand-600">Kred</span>
            </div>
            <p className="font-mono text-[9px] font-semibold tracking-wider text-slate-400 uppercase leading-none">Instant Loans</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-sm font-medium transition-colors hover:text-brand-600 cursor-pointer ${
                currentPage === item.id ? 'text-brand-600 font-semibold' : 'text-slate-600'
              }`}
              id={`nav-item-${item.id}`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500 border border-slate-100">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>RBI-Compliant Portal</span>
          </div>

          <button
            onClick={() => onPageChange('apply')}
            className="group flex items-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20 transition-all active:scale-95 cursor-pointer"
            id="header-apply-btn"
          >
            <span>Apply Now</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-expanded="false"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white"
            id="mobile-menu"
          >
            <div className="space-y-1.5 px-4 pt-2 pb-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium transition cursor-pointer ${
                    currentPage === item.id ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                  }`}
                  id={`mobile-nav-item-${item.id}`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="border-t border-slate-100 pt-4 pb-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onPageChange('apply');
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-3 text-base font-semibold text-white shadow-md shadow-brand-600/10 hover:bg-brand-700 transition cursor-pointer"
                  id="mobile-menu-apply-btn"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
