'use client';

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from '@/utils/navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { Header } from './Header';
import { Footer } from './Footer';
import { QuoteRequestModal } from './QuoteRequestModal';
import { CertificateModal } from './CertificateModal';
import { Language, Product, Certificate } from '../types';
import { StorageService } from '../services/storage';
import { Scale, CheckCircle2, ArrowUp } from 'lucide-react';

interface MainLayoutClientProps {
  children: React.ReactNode;
}

export const MainLayoutClient: React.FC<MainLayoutClientProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getLangFromPath = (pathname: string): Language | null => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const first = parts[0].toLowerCase();
      if (first === 'uz') return 'uz';
      if (first === 'ru') return 'ru';
      if (first === 'en') return 'en';
      if (first === 'uz_cyrl' || first === 'oz') return 'uz_cyrl';
    }
    return null;
  };

  const [currentLang, setCurrentLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return getLangFromPath(window.location.pathname) || 'ru';
    }
    return 'ru';
  });

  useEffect(() => {
    const detected = getLangFromPath(location.pathname);
    if (detected && detected !== currentLang) {
      setCurrentLang(detected);
    }
  }, [location.pathname, currentLang]);

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    const parts = location.pathname.split('/').filter(Boolean);
    let subpath = '';
    if (['uz', 'ru', 'en', 'uz_cyrl', 'oz'].includes(parts[0]?.toLowerCase())) {
      subpath = '/' + parts.slice(1).join('/');
    } else {
      subpath = location.pathname;
    }

    if (newLang === 'ru') {
      navigate(subpath || '/');
    } else {
      const prefix = `/${newLang}`;
      navigate(`${prefix}${subpath === '/' ? '' : subpath}`);
    }
  };

  // Modallar va solishtirish holatlari
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    StorageService.syncWithDatabase();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleOpenQuote = (product?: Product) => {
    setQuoteProduct(product || null);
    setIsQuoteModalOpen(true);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white">
        
        {/* Header */}
        <Header
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          compareCount={comparedProductIds.length}
          onOpenQuoteModal={() => handleOpenQuote()}
        />

        {/* Sahifalar kontenti (Next.js har bir sahifani shu yerga render qiladi) */}
        <main className="flex-1 pt-20 md:pt-28">
          {children}
        </main>

        {/* Footer */}
        <Footer
          currentLang={currentLang}
          onOpenQuoteModal={() => handleOpenQuote()}
        />

        {/* Solishtirish paneli */}
        {comparedProductIds.length > 0 && (
          <div className="fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom-5">
            <button
              onClick={() => navigate('/compare')}
              className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/40 border border-blue-400/40 backdrop-blur-md transition-transform hover:scale-105"
            >
              <Scale className="w-4 h-4" />
              <span className="text-xs">
                {currentLang === 'uz_cyrl' ? 'Солиштириш' : 'Solishtirish'} ({comparedProductIds.length})
              </span>
            </button>
          </div>
        )}

        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 p-3 bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white rounded-2xl border border-gray-800 shadow-xl backdrop-blur-md transition-all hover:scale-110"
            title="Tepaga"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gray-900/95 border border-blue-500/40 shadow-2xl text-xs font-semibold text-white backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Modallar */}
        <QuoteRequestModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          selectedProduct={quoteProduct}
          currentLang={currentLang}
          onShowToast={showToast}
        />

        <CertificateModal
          certificate={selectedCertificate}
          currentLang={currentLang}
          onClose={() => setSelectedCertificate(null)}
          onShowToast={showToast}
        />
      </div>
    </ErrorBoundary>
  );
};