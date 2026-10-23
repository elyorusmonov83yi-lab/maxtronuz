"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate, Link } from '@/utils/navigation';
import { 
  ShieldCheck, 
  Scale, 
  Check, 
  Download, 
  PhoneCall, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Wrench, 
  Share2, 
  Info, 
  Calendar, 
  Sparkles, 
  PackageCheck, 
  ChevronRight, 
  Loader2, 
  Tag, 
  BookOpen 
} from 'lucide-react';
import { Language, Product, CategoryInfo } from '../../types';
import { translations as staticTranslations } from '../../data/translations';
import { Breadcrumbs } from '../Breadcrumbs';
import { ProductCard } from '../ProductCard';
import { 
  formatPrice, 
  getLocalizedText, 
  getLocalizedArray, 
  getSpecName, 
  getSafeProductSlug, 
  getSafeCategorySlug 
} from '../../utils/formatters';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';

export interface ProductDetailViewProps {
  product?: Product;
  currentLang: Language;
  onOpenQuote: (product: Product) => void;
  comparedProducts: string[];
  onToggleCompare: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product: initialProduct,
  currentLang = 'ru',
  onOpenQuote,
  comparedProducts,
  onToggleCompare,
  onShowToast,
}) => {
  const params = useParams() as { slug?: string; productId?: string; productSlug?: string };
  const rawIdentifier = (params?.slug || params?.productId || params?.productSlug || '').trim();
  const currentIdentifier = decodeURIComponent(rawIdentifier).toLowerCase().trim();
  
  const navigate = useNavigate();
  const t = staticTranslations[currentLang] || staticTranslations.ru;

  const getLocalizedUrl = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (currentLang === 'ru') return cleanPath;
    return `/uz${cleanPath === '/' ? '' : cleanPath}`;
  };

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(!initialProduct);
  const [imageError, setImageError] = useState(false);

  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'features' | 'applications' | 'docs'>('description');
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  const handleOpenQuoteClick = (prod?: Product) => {
    const targetProduct = prod || product;
    if (typeof onOpenQuote === 'function' && targetProduct) {
      try {
        onOpenQuote(targetProduct);
      } catch (err) {
        console.warn('onOpenQuote prop error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-quote-modal', {
          detail: { product: targetProduct }
        })
      );
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!initialProduct) setLoading(true);

    Promise.all([
      ApiService.getProducts().catch(() => StorageService.getProducts()),
      ApiService.getCategories().catch(() => StorageService.getCategories())
    ]).then(([prods, cats]) => {
      if (isMounted) {
        if (Array.isArray(prods) && prods.length > 0) {
          setProductsList(prods);
        } else {
          setProductsList(StorageService.getProducts());
        }

        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        } else {
          setCategoriesList(StorageService.getCategories());
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setProductsList(StorageService.getProducts());
        setCategoriesList(StorageService.getCategories());
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialProduct]);

  const product = useMemo(() => {
    if (initialProduct) return initialProduct;
    if (!currentIdentifier || currentIdentifier === '[object object]') return undefined;

    return productsList.find((p) => {
      if (!p) return false;

      const pId = String(p.id || '').toLowerCase();
      if (pId && pId === currentIdentifier) return true;

      if (p.slug) {
        const slugValues = Object.values(p.slug).map(v => String(v).toLowerCase().trim());
        if (slugValues.includes(currentIdentifier)) return true;
      }

      const slugUz = getSafeProductSlug(p, 'uz').toLowerCase();
      const slugRu = getSafeProductSlug(p, 'ru').toLowerCase();
      if (slugUz === currentIdentifier || slugRu === currentIdentifier) return true;

      if (p.model) {
        const modelStr = String(p.model)
          .toLowerCase()
          .replace(/\s+/g, '-');
        if (modelStr === currentIdentifier || currentIdentifier.includes(modelStr)) return true;
      }

      return false;
    });
  }, [initialProduct, productsList, currentIdentifier]);

  useEffect(() => {
    setImageError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIdentifier]);

  if (loading) {
    return (
      <div className="py-32 max-w-7xl mx-auto px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
        <p className="text-sm text-gray-400 font-medium">
          {currentLang === 'ru' ? 'Загрузка данных оборудования...' : 'Uskuna ma’lumotlari yuklanmoqda...'}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 mb-4">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentLang === 'ru' ? 'Прибор не найден' : 'Uskuna topilmadi'}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {currentLang === 'ru' 
            ? 'Запрашиваемый товар не найден или был удален.' 
            : 'Siz qidirgan mahsulot mavjud emas yoki o‘chirilgan.'}
        </p>
        <Link
          href={getLocalizedUrl('/catalog')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.btn_view_catalog || (currentLang === 'ru' ? 'В каталог' : 'Katalogga o‘tish')}</span>
        </Link>
      </div>
    );
  }

  const categoryObj = categoriesList.find((c) => c.id === product.category || Object.values(c.slug || {}).includes(product.category));
  const categoryName = categoryObj ? getLocalizedText(categoryObj.name, currentLang, String(product.category)) : String(product.category || '');
  const categorySlug = categoryObj ? getSafeCategorySlug(categoryObj, currentLang) : String(product.category || 'all');

  const safeProductId = getSafeProductSlug(product, currentLang);
  const isCompared = comparedProducts.includes(safeProductId) || comparedProducts.includes(String(product.id));

  const standardCertText = getLocalizedText(
    product.standardCert, 
    currentLang, 
    currentLang === 'ru' ? 'ГОСТ / Узстандарт' : 'GOST / O‘zstandart'
  );

  const fullDescription = getLocalizedText(
    product.description, 
    currentLang, 
    getLocalizedText(product.tagline, currentLang, '')
  );

  const relatedProducts = productsList
    .filter((p) => p.category === product.category && getSafeProductSlug(p, currentLang) !== safeProductId)
    .slice(0, 3);

  const handleDownloadDoc = (docName: string) => {
    setDownloadingDoc(docName);
    setTimeout(() => {
      setDownloadingDoc(null);
      onShowToast(
        currentLang === 'ru'
          ? `«${docName}» успешно скачан!`
          : `«${docName}» muvaffaqiyatli yuklab olindi!`
      );
    }, 1200);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast(
        currentLang === 'ru'
          ? 'Ссылка на товар скопирована в буфер обмена!'
          : 'Mahsulot havolasi xotiraga nusxalandi!'
      );
    }
  };

  const modelText = typeof product.model === 'object' ? getLocalizedText(product.model, currentLang) : (product.model || '');
  
  const rawTitle = (product as any).title || product.name;
  const productName = getLocalizedText(rawTitle, currentLang, '').trim();

  const breadcrumbProductLabel = productName 
    ? (modelText && !productName.toLowerCase().includes(modelText.toLowerCase()) ? `${productName} (${modelText})` : productName)
    : (modelText || '—');

  const breadcrumbs = [
    { label: t.breadcrumb_catalog || (currentLang === 'ru' ? 'Каталог' : 'Katalog'), to: getLocalizedUrl('/catalog') },
    { label: categoryName, to: getLocalizedUrl(`/catalog/${categorySlug}`) },
    { label: breadcrumbProductLabel }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
     
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Chap tomon: Rasm va Nishonlar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl group flex items-center justify-center">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={getLocalizedText(product.name || (product as any).title, currentLang, '')}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-600 p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-500">
                  <Layers className="w-8 h-8 text-blue-500/70" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-400 block">{modelText}</span>
                  <span className="text-[11px] font-mono text-gray-600 mt-0.5 block">
                    {currentLang === 'ru' ? 'Фото оборудования готовится' : 'Uskuna fotosurati tez orada yuklanadi'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {product.inStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                  {t.product_in_stock || (currentLang === 'ru' ? 'В наличии' : 'Mavjud')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                  {t.product_on_order || (currentLang === 'ru' ? 'Под заказ' : 'Buyurtma asosida')}
                </span>
              )}

              {product.isPopular && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {currentLang === 'ru' ? 'ХИТ ПРОДАЖ' : 'OMMABOP'}
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 backdrop-blur-md transition shadow-lg cursor-pointer"
              title="Havolani nusxalash"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
              <ShieldCheck className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t.product_passport || (currentLang === 'ru' ? 'Стандарт' : 'Standart')}</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">{standardCertText}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
              <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t.product_warranty || (currentLang === 'ru' ? 'Гарантия' : 'Kafolat')}</div>
              <div className="text-xs font-bold text-white mt-0.5">
                {product.warrantyMonths || 12} {currentLang === 'ru' ? 'мес.' : 'oy'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
              <PackageCheck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{currentLang === 'ru' ? 'Доставка' : 'Yetkazish'}</div>
              <div className="text-xs font-bold text-white mt-0.5">{currentLang === 'ru' ? 'По всему РУз' : 'O‘zbekiston bo‘ylab'}</div>
            </div>
          </div>
        </div>

        {/* O'ng tomon: Ma'lumotlar va Harakatlar */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                href={getLocalizedUrl(`/catalog/${categorySlug}`)}
                className="text-xs font-semibold text-blue-400 hover:underline uppercase tracking-wider"
              >
                {categoryName}
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-400 font-mono">ID: {safeProductId}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {getLocalizedText(product.name || (product as any).title, currentLang, '—')}
            </h1>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <div className="inline-block px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-blue-300 font-mono text-sm font-semibold">
                {currentLang === 'ru' ? 'Модель' : 'Model'}: {modelText}
              </div>

              {product.brand && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  <span>{product.brand}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-300 leading-relaxed pt-2">
              {getLocalizedText(product.tagline, currentLang, fullDescription.slice(0, 160))}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-800/40 space-y-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs text-gray-400 block mb-1">
                  {currentLang === 'ru' ? 'Стоимость / Цена:' : 'Narxi:'}
                </span>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono text-blue-400">
                    {product.price ? formatPrice(product.price, currentLang) : getLocalizedText(product.priceFormatted, currentLang, currentLang === 'ru' ? 'По запросу' : "So'rov bo'yicha")}
                  </span>
                  {product.oldPrice ? (
                    <span className="text-base text-gray-500 line-through font-mono">
                      {formatPrice(product.oldPrice, currentLang)}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> 
                {currentLang === 'ru' ? 'С учетом НДС (12%)' : 'QQS bilan (12%)'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleOpenQuoteClick(product)}
                id="product-detail-quote-btn"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}</span>
              </button>

              <button
                onClick={() => onToggleCompare(product)}
                id="product-detail-compare-btn"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  isCompared
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-800/80 border-gray-700 hover:border-gray-600 text-gray-200 hover:text-white'
                }`}
              >
                {isCompared ? <Check className="w-4 h-4 text-blue-400" /> : <Scale className="w-4 h-4" />}
                <span>{isCompared ? (t.btn_in_compare || 'В сравнении') : (t.btn_add_compare || 'Сравнить')}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.product_features || (currentLang === 'ru' ? 'Преимущества' : 'Xususiyatlar')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getLocalizedArray(product.features, currentLang).slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mr-2 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Tablar (SEO uchun to'liq HTML render + CSS orqali ko'rsatish) */}
      <div className="mt-16 space-y-6">
        <div className="flex border-b border-gray-800 space-x-2 sm:space-x-4 overflow-x-auto pb-px" role="tablist">
          
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            onClick={() => setActiveTab('description')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'description'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{currentLang === 'ru' ? 'Описание' : 'Batafsil tavsif'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'specs'}
            onClick={() => setActiveTab('specs')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.product_specs || (currentLang === 'ru' ? 'Характеристики' : 'Xarakteristikalar')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'features'}
            onClick={() => setActiveTab('features')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{t.product_features || (currentLang === 'ru' ? 'Особенности' : 'Afzalliklar')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t.product_applications || (currentLang === 'ru' ? 'Применение' : 'Qo‘llanishi')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'docs'}
            onClick={() => setActiveTab('docs')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'docs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.product_passport || 'Паспорт'} & {currentLang === 'ru' ? 'Документы' : 'Hujjatlar'}</span>
          </button>
        </div>

        {/* 1. Tavsif (Description) */}
        <section 
          className={activeTab === 'description' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'description'}
        >
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4 overflow-hidden">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>{modelText} — {currentLang === 'ru' ? 'Подробное описание и назначение прибора' : 'Uskunaning to‘liq tavsifi va vazifasi'}</span>
            </h3>

            {fullDescription ? (
              <div 
                className="text-sm text-gray-300 leading-relaxed space-y-4 max-w-none break-words whitespace-pre-line overflow-hidden"
                dangerouslySetInnerHTML={{ 
                  __html: fullDescription.replace(/\r\n/g, '\n') 
                }}
              />
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentLang === 'ru' 
                  ? 'Высокоточное сертифицированное оборудование для промышленного и метрологического применения. Поставляется с официальной заводской гарантией и сертификатом соответствия.'
                  : 'Sanoat va metrologik maqsadlar uchun yuqori aniqlikdagi sertifikatlangan uskuna. Rasmiy zavod kafolati va muvofiqlik sertifikati bilan yetkazib beriladi.'}
              </p>
            )}
          </div>
        </section>

        {/* 2. Xarakteristikalar (Specs) — Google va Yandex botlari to'liq o'qiydi */}
        <section 
          className={activeTab === 'specs' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'specs'}
        >
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>{modelText} — {currentLang === 'ru' ? 'Полные метрологические и технические параметры' : 'To‘liq texnik va metrologik parametrlar'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <tbody>
                  {(() => {
                    let specsList = product.specs;
                    if (typeof specsList === 'string') {
                      try {
                        specsList = JSON.parse(specsList);
                      } catch {
                        specsList = [];
                      }
                    }
                    const safeSpecs = Array.isArray(specsList) ? specsList : [];
                    return safeSpecs.map((s: any, idx: number) => (
                      <tr 
                        key={idx} 
                        className={`border-b border-gray-800/80 ${idx % 2 === 0 ? 'bg-gray-900/40' : 'bg-transparent'}`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-400 w-1/2 sm:w-2/5">
                          {getSpecName(s, currentLang)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-100 font-mono">
                          {typeof s?.value === 'object' ? getLocalizedText(s.value, currentLang) : (s?.value || '—')}
                        </td>
                      </tr>
                    ));
                  })()}
                  <tr className="border-b border-gray-800/80">
                    <td className="py-3 px-4 font-medium text-gray-400">
                      {currentLang === 'ru' ? 'Межповерочный интервал' : 'Qiyoslash davriyligi'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-400">
                      {currentLang === 'ru' ? '12 месяцев (1 год)' : '12 oy (1 yil)'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800/80">
                    <td className="py-3 px-4 font-medium text-gray-400">
                      {currentLang === 'ru' ? 'Стандарт соответствия' : 'Muvofiqlik standarti'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-100">
                      {standardCertText}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-400">
                      {currentLang === 'ru' ? 'Официальная заводская гарантия' : 'Ishlab chiqaruvchi rasmiy kafolati'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">
                      {product.warrantyMonths || 12} {currentLang === 'ru' ? 'мес. сервисной гарантии' : 'oy to‘liq kafolat'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. Xususiyatlar (Features) */}
        <section 
          className={activeTab === 'features' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'features'}
        >
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>{currentLang === 'ru' ? 'Конструктивные и технологические особенности' : 'Konstruktiv va texnologik xususiyatlari'}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getLocalizedArray(product.features, currentLang).map((feat, i) => (
                <div key={i} className="flex items-start p-4 rounded-2xl bg-gray-900 border border-gray-800/80 space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-gray-200 leading-relaxed font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Qo'llanilishi (Applications) */}
        <section 
          className={activeTab === 'applications' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'applications'}
        >
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>{currentLang === 'ru' ? 'Рекомендуемые области применения' : 'Tavsiya etilgan qo‘llanish sohalari'}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getLocalizedArray(product.applications, currentLang).map((app, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-900 border border-gray-800/80 flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm text-gray-200 font-medium">{app}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Hujjatlar (Docs) - Dinamik R2 / Baza */}
        <section 
          className={activeTab === 'docs' ? 'block' : 'hidden'}
          aria-hidden={activeTab !== 'docs'}
        >
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>{currentLang === 'ru' ? 'Официальная документация и руководства' : 'Rasmiy hujjatlar va qo‘llanmalar'}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {currentLang === 'ru' 
                  ? 'Вы можете ознакомиться и скачать техническую документацию к прибору.' 
                  : 'Quyidagi texnik hujjatlarni ko‘rib chiqishingiz va yuklab olishingiz mumkin.'}
              </p>
            </div>

            {(() => {
              let rawDocs = product.documents;
              if (typeof rawDocs === 'string') {
                try {
                  rawDocs = JSON.parse(rawDocs);
                } catch {
                  rawDocs = [];
                }
              }
              const safeDocs: any[] = Array.isArray(rawDocs) ? [...rawDocs] : [];

              if (product.pdfCatalogUrl && !safeDocs.some(d => d.fileUrl === product.pdfCatalogUrl)) {
                safeDocs.unshift({
                  id: 'catalog-pdf',
                  title: {
                    uz: 'Texnik katalog (PDF)',
                    ru: 'Технический каталог (PDF)'
                  },
                  fileUrl: product.pdfCatalogUrl,
                  size: 'PDF',
                  type: 'PDF'
                });
              }

              if (safeDocs.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-gray-950/70 border border-gray-800 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {currentLang === 'ru' ? 'Электронная документация готовится' : 'Elektron hujjatlar tayyorlanmoqda'}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {currentLang === 'ru'
                          ? `Паспорт, сертификат поверки и руководство для модели ${modelText} предоставляются по официальному запросу.`
                          : `${modelText} modeli uchun pasport, qiyoslash sertifikati va yo‘riqnoma rasmiy so‘rov asosida taqdim etiladi.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenQuoteClick(product)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ru' ? 'Запросить документацию у инженера' : 'Muhandisdan hujjatlarni so‘rash'}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {safeDocs.map((doc, idx) => {
                    const docTitle = typeof doc.title === 'object'
                      ? getLocalizedText(doc.title, currentLang, 'Документ')
                      : (doc.title || (currentLang === 'ru' ? 'Документ' : 'Hujjat'));

                    const fileUrl = doc.fileUrl || doc.url || '';
                    const docType = doc.type || 'PDF';
                    const docSize = doc.size || 'PDF';

                    return (
                      <div 
                        key={doc.id || idx} 
                        className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/40 transition flex flex-col justify-between space-y-4 group"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-3">
                            <FileText className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                            {docTitle}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            {docType} • {docSize} • {modelText}
                          </p>
                        </div>

                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition cursor-pointer shadow-md"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                            <span>{currentLang === 'ru' ? 'Скачать / Открыть' : 'Yuklab olish / Ochish'}</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenQuoteClick(product)}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800/80 hover:bg-gray-700 text-xs font-semibold text-gray-300 hover:text-white rounded-xl transition cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                            <span>{currentLang === 'ru' ? 'Запросить файл' : 'Faylni so‘rash'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold block">
                {categoryName}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentLang === 'ru' ? 'Похожее и сопутствующее оборудование' : 'O‘xshash va yondosh uskunalar'}
              </h3>
            </div>
            <Link
              href={getLocalizedUrl(`/catalog/${categorySlug}`)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>{currentLang === 'ru' ? 'Смотреть все' : 'Barchasini ko‘rish'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => {
              const relSlug = getSafeProductSlug(rel, currentLang);
              return (
                <ProductCard
                  key={relSlug || Math.random()}
                  product={rel}
                  currentLang={currentLang}
                  onSelect={() => navigate(getLocalizedUrl(`/product/${relSlug}`))}
                  onOpenQuote={onOpenQuote}
                  isCompared={comparedProducts.includes(relSlug) || comparedProducts.includes(String(rel.id))}
                  onToggleCompare={onToggleCompare}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-gray-900 to-cyan-950/60 border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xl font-extrabold text-white">
            {modelText} {currentLang === 'ru' ? '— Получить официальное коммерческое предложение' : 'bo‘yicha rasmiy tijorat taklifi olish'}
          </h4>
          <p className="text-xs text-gray-400">
            {currentLang === 'ru' 
              ? 'Оставьте заявку и получите официальное КП с ценами и сроками в течение 15 минут.' 
              : 'Buyurtma qoldiring va 15 daqiqa ichida narx va yetkazish muddati ko‘rsatilgan rasmiy taklifni oling.'}
          </p>
        </div>
        <button
          onClick={() => handleOpenQuoteClick(product)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 text-sm whitespace-nowrap transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          {t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
        </button>
      </div>

    </div>
  );
};