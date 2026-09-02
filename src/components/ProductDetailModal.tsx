import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Layers, 
  Send, 
  FileText, 
  Scale, 
  Share2, 
  PhoneCall,
  Sparkles,
  Check
} from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText, getProductName, getSpecName, getLocalizedArray } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  currentLang: Language;
  onClose: () => void;
  onOpenQuote: (product: Product) => void;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentLang,
  onClose,
  onOpenQuote,
  isCompared,
  onToggleCompare,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'applications'>('specs');
  const [downloading, setDownloading] = useState(false);

  if (!product) return null;

  const t = translations[currentLang];

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onShowToast(
        currentLang === 'uz_cyrl' 
          ? `«${product.model}» техник паспорти ва сертификати тайёрланди.` 
          : `«${product.model}» texnik pasporti yuklab olindi.`
      );
    }, 1200);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    onShowToast(currentLang === 'uz_cyrl' ? 'Ҳавола нусхаланди!' : 'Havola nusxalandi!');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      id="product-detail-modal"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {product.model}
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline-block">
              {product.standardCert}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleCompare(product)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isCompared
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
              <span>{isCompared ? t.btn_in_compare : t.btn_add_compare}</span>
            </button>

            <button
              onClick={handleShare}
              title="Ulashish"
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-8">
          
          {/* Main Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Image Column */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 aspect-[4/3] md:aspect-square flex items-center justify-center">
              <img
                src={product.image || ''}
                alt={getProductName(product, currentLang)}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                {product.inStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    {t.product_in_stock}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                    {t.product_on_order}
                  </span>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  MAXTRON Industrial Certified
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {getProductName(product, currentLang)}
                </h2>
                <p className="text-sm text-gray-300 font-medium mt-2 leading-relaxed">
                  {getLocalizedText(product.tagline, currentLang)}
                </p>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed border-t border-gray-800/80 pt-4">
                {getLocalizedText(product.description, currentLang)}
              </p>

              {/* Guarantees & Cert Highlights */}
              <div className="grid grid-cols-2 gap-3 py-3">
                <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                  <div className="text-xs text-gray-500">{t.product_warranty}</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {product.warrantyMonths} ой расмий кафолат
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800">
                  <div className="text-xs text-gray-500">Метрологик қиёслаш</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Ўзстандарт 100%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onOpenQuote(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 text-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.btn_request_quote}</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl border border-gray-700 text-sm transition"
                >
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? 'Тайёрланмоқда...' : 'PDF Паспорт'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex border-b border-gray-800 gap-6">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'specs'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.product_specs}
              </button>

              <button
                onClick={() => setActiveTab('features')}
                className={`pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'features'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.product_features}
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.product_applications}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-6">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(product.specs || []).map((spec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-400">{getSpecName(spec, currentLang)}</span>
                      <span className="font-mono font-bold text-gray-100 text-right">
                        {typeof spec.value === 'object' ? getLocalizedText(spec.value, currentLang) : spec.value}
                      </span>
                    </div>
                  ))}
                  <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs sm:col-span-2">
                    <span className="text-gray-400">Сертификат ва Давлат Реестри</span>
                    <span className="font-mono font-bold text-blue-400 text-right">
                      {product.standardCert}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalizedArray(product.features, currentLang).map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 flex items-start gap-3 text-xs text-gray-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getLocalizedArray(product.applications, currentLang).map((app, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center gap-3 text-xs text-gray-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
