import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/views/HomeView';
import { CatalogView } from './components/views/CatalogView';
import { ProductDetailView } from './components/views/ProductDetailView';
import { CertificatesView } from './components/views/CertificatesView';
import { CompareView } from './components/views/CompareView';
import { FinderView } from './components/views/FinderView';
import { QuoteView } from './components/views/QuoteView';
import { AboutView } from './components/views/AboutView';
import { ContactView } from './components/views/ContactView';
import { CustomPageView } from './components/views/CustomPageView';
import { AdminView } from './components/admin/AdminView';
import { SeoManager } from './components/SeoManager';
import { QuoteRequestModal } from './components/QuoteRequestModal';
import { CertificateModal } from './components/CertificateModal';
import { Language, Product, Certificate } from './types';
import { productsData } from './data/products';
import { StorageService } from './services/storage';
import { Scale, CheckCircle2, ArrowUp } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function MainAppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect language from URL prefix
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
    return getLangFromPath(window.location.pathname) || 'ru';
  });

  // Sync language when URL path changes
  useEffect(() => {
    const detected = getLangFromPath(location.pathname);
    if (detected && detected !== currentLang) {
      setCurrentLang(detected);
    }
  }, [location.pathname]);

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

  // Modals & overlay state
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Comparison State
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll to top visibility
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

  const handleToggleCompare = (product: Product) => {
    if (comparedProductIds.includes(product.id)) {
      setComparedProductIds(comparedProductIds.filter((id) => id !== product.id));
      showToast(
        currentLang === 'uz_cyrl'
          ? `«${product.model}» солиштиришдан олиб ташланди.`
          : `«${product.model}» solishtirishdan olib tashlandi.`
      );
    } else {
      if (comparedProductIds.length >= 4) {
        showToast(
          currentLang === 'uz_cyrl'
            ? 'Солиштириш учун максимум 4 та ускуна танлаш мумкин.'
            : 'Solishtirish uchun maksimum 4 ta uskuna tanlash mumkin.'
        );
        return;
      }
      setComparedProductIds([...comparedProductIds, product.id]);
      showToast(
        currentLang === 'uz_cyrl'
          ? `«${product.model}» солиштиришга қўшилди.`
          : `«${product.model}» solishtirishga qo'shildi.`
      );
    }
  };

  const handleOpenQuote = (product?: Product) => {
    setQuoteProduct(product || null);
    setIsQuoteModalOpen(true);
  };

  const renderAppRoutes = () => (
    <>
      {/* Home Page */}
      <Route
        path=""
        element={
          <HomeView
            currentLang={currentLang}
            onOpenQuote={handleOpenQuote}
            comparedProducts={comparedProductIds}
            onToggleCompare={handleToggleCompare}
          />
        }
      />

      {/* Catalog & Category Pages */}
      <Route
        path="catalog"
        element={
          <CatalogView
            currentLang={currentLang}
            onOpenQuote={handleOpenQuote}
            comparedProducts={comparedProductIds}
            onToggleCompare={handleToggleCompare}
          />
        }
      />
      <Route
        path="catalog/:categoryId"
        element={
          <CatalogView
            currentLang={currentLang}
            onOpenQuote={handleOpenQuote}
            comparedProducts={comparedProductIds}
            onToggleCompare={handleToggleCompare}
          />
        }
      />

      {/* Dedicated Standalone Product Details Page */}
      <Route
        path="product/:productId"
        element={
          <ProductDetailView
            currentLang={currentLang}
            onOpenQuote={handleOpenQuote}
            comparedProducts={comparedProductIds}
            onToggleCompare={handleToggleCompare}
            onShowToast={showToast}
          />
        }
      />

      {/* Redirect Services and Projects to Catalog */}
      <Route path="services" element={<Navigate to="/catalog" replace />} />
      <Route path="projects" element={<Navigate to="/catalog" replace />} />

      {/* Official Certificates Page */}
      <Route
        path="certificates"
        element={
          <CertificatesView
            currentLang={currentLang}
            onSelectCertificate={(c) => setSelectedCertificate(c)}
            onShowToast={showToast}
          />
        }
      />

      {/* Full-Page Side-by-Side Equipment Comparison */}
      <Route
        path="compare"
        element={
          <CompareView
            currentLang={currentLang}
            comparedProductIds={comparedProductIds}
            onRemoveProduct={(id) => {
              setComparedProductIds(comparedProductIds.filter((pId) => pId !== id));
            }}
            onClearAll={() => setComparedProductIds([])}
            onOpenQuote={(p) => handleOpenQuote(p)}
            onShowToast={showToast}
          />
        }
      />

      {/* Dedicated Equipment Selector Wizard */}
      <Route
        path="equipment-finder"
        element={
          <FinderView
            currentLang={currentLang}
            onOpenQuote={handleOpenQuote}
            comparedProducts={comparedProductIds}
            onToggleCompare={handleToggleCompare}
          />
        }
      />

      {/* Official Commercial Proposal / RFQ Request */}
      <Route
        path="quote"
        element={
          <QuoteView
            currentLang={currentLang}
            onShowToast={showToast}
          />
        }
      />

      {/* About Company */}
      <Route
        path="about"
        element={
          <AboutView
            currentLang={currentLang}
            onOpenQuote={() => handleOpenQuote()}
          />
        }
      />
      <Route
        path="about.uz"
        element={
          <AboutView
            currentLang={currentLang}
            onOpenQuote={() => handleOpenQuote()}
          />
        }
      />

      {/* Contact & Branches */}
      <Route
        path="contact"
        element={
          <ContactView
            currentLang={currentLang}
            onShowToast={showToast}
          />
        }
      />

      {/* Dynamic CMS Custom Pages */}
      <Route
        path="page/:slug"
        element={
          <CustomPageView
            currentLang={currentLang}
            onOpenQuoteModal={() => handleOpenQuote()}
            onShowToast={showToast}
          />
        }
      />
      <Route
        path="p/:slug"
        element={
          <CustomPageView
            currentLang={currentLang}
            onOpenQuoteModal={() => handleOpenQuote()}
            onShowToast={showToast}
          />
        }
      />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white">
      <ScrollToTop />

      {/* SEO & Open Graph (OG) Meta Manager */}
      <SeoManager currentLang={currentLang} />

      {/* Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        compareCount={comparedProductIds.length}
        onOpenQuoteModal={() => handleOpenQuote()}
      />

      {/* Main Multi-Page Route Outlet */}
      <main className="flex-1 pt-20 md:pt-28">
        <Routes>
          {/* Admin Management Panel */}
          <Route
            path="/admin"
            element={<AdminView currentLang={currentLang} />}
          />

          {/* Root standard routes */}
          <Route path="/">
            {renderAppRoutes()}
          </Route>

          {/* Language-prefixed routes: /uz, /ru, /en, /uz_cyrl, /oz */}
          <Route path="/:langPrefix">
            {renderAppRoutes()}
          </Route>
          <Route path="/:langPrefix/*">
            {renderAppRoutes()}
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onOpenQuoteModal={() => handleOpenQuote()}
      />

      {/* Floating Action Bar for Comparison */}
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

      {/* Scroll to top button */}
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

      {/* Quick RFQ Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedProduct={quoteProduct}
        currentLang={currentLang}
        onShowToast={showToast}
      />

      {/* State Metrology Certificate Viewer */}
      <CertificateModal
        certificate={selectedCertificate}
        currentLang={currentLang}
        onClose={() => setSelectedCertificate(null)}
        onShowToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MainAppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
