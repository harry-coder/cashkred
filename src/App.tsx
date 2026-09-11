import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

// Sub-pages
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import RepayPage from './components/RepayPage';
import ContactPage from './components/ContactPage';
import RatesPage from './components/RatesPage';
import TermsPage from './components/TermsPage';
import ApplyPage from './components/ApplyPage';

export default function App() {
  // Page Navigation State: 'home' | 'apply' | 'repay' | 'rates' | 'about' | 'contact' | 'terms' | 'privacy'
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [calculatorPreset, setCalculatorPreset] = useState({ amount: 15000, duration: 91 });

  // Application preset triggered from Hero Calculator
  const handleApplyWithDetails = (amount: number, duration: number) => {
    setCalculatorPreset({ amount, duration });
    setCurrentPage('apply');
  };

  // Navigation page handler (sync window view top)
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-900 bg-slate-50 selection:bg-brand-500/10 selection:text-brand-800">
      
      {/* Navigation Header */}
      <Header
        onPageChange={handlePageChange}
        currentPage={currentPage}
      />

      {/* Main Content Area */}
      <main className="grow">
        
        {/* Render pages conditionally */}
        {currentPage === 'home' && (
          <>
            <Hero
              onApplyWithDetails={handleApplyWithDetails}
            />
            {/* Landing content only on home page */}
            <HowItWorks />
            <Benefits />
            <FAQ />
          </>
        )}

        {currentPage === 'apply' && (
          <ApplyPage 
            calculatorPreset={calculatorPreset}
            onPageChange={handlePageChange}
          />
        )}

        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
        
        {currentPage === 'repay' && (
          <RepayPage 
            onPageChange={handlePageChange}
          />
        )}

        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'rates' && <RatesPage />}
        {currentPage === 'terms' && <TermsPage />}

      </main>

      {/* Footer and disclosures */}
      <Footer onPageChange={handlePageChange} />

    </div>
  );
}
