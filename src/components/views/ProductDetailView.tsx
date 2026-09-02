import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { translations } from '../../data/translations';
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
import { SeoManager } from '../SeoManager';

interface ProductDetailViewProps {
  currentLang: Language;
  onOpenQuote: (product: Product) => void;
  comparedProducts: string[];
  onToggleCompare: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  currentLang,
  onOpenQuote,
  comparedProducts,
  onToggleCompare,
  onShowToast,
}) => {
  const params = useParams<{ slug?: string; productId?: string; productSlug?: string }>();
  const rawIdentifier = (params.slug || params.productId || params.productSlug || '').trim();
  const currentIdentifier = decodeURIComponent(rawIdentifier).toLowerCase().trim();
  
  const navigate = useNavigate();
  const t = translations[currentLang] || translations.ru;

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Tab holati: 'description' | 'specs' | 'features' | 'applications' | 'docs'
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'features' | 'applications' | 'docs'>('description');
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  // API (MariaDB) va Storage'dan mahsulotlarni yuklash
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

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
  }, []);

  // Mahsulotni barcha maydonlar bo'yicha qidirish
  const product = useMemo(() => {
    if (!currentIdentifier || currentIdentifier === '[object object]') return undefined;

    return productsList.find((p) => {
      if (!p) return false;

      const pId = String(typeof p.id === 'object' ? (p.id?.ru || p.id?.uz || '') : p.id).toLowerCase();
      if (pId && pId === currentIdentifier) return true;

      if (p.slug) {
        if (typeof p.slug === 'string' && p.slug.toLowerCase() === currentIdentifier) return true;
        if (typeof p.slug === 'object') {
          const slugValues = Object.values(p.slug).map(v => String(v).toLowerCase().trim());
          if (slugValues.includes(currentIdentifier)) return true;
        }
      }

      const slugUz = getSafeProductSlug(p, 'uz').toLowerCase();
      const slugRu = getSafeProductSlug(p, 'ru').toLowerCase();
      if (slugUz === currentIdentifier || slugRu === currentIdentifier) return true;

      if (p.model) {
        const modelStr = String(typeof p.model === 'object' ? (p.model?.ru || p.model?.uz || '') : p.model)
          .toLowerCase()
          .replace(/\s+/g, '-');
        if (modelStr === currentIdentifier || currentIdentifier.includes(modelStr)) return true;
      }

      return false;
    });
  }, [productsList, currentIdentifier]);

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
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.btn_view_catalog || (currentLang === 'ru' ? 'В каталог' : 'Katalogga o‘tish')}</span>
        </Link>
      </div>
    );
  }

  const categoryObj = categoriesList.find((c) => c.id === product.category || (c.slug && c.slug === product.category));
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
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast(
        currentLang === 'ru'
          ? 'Ссылка на товар скопирована в буфер обмена!'
          : 'Mahsulot havolasi xotiraga nusxalandi!'
      );
    }
  };

  const modelText = typeof product.model === 'object' ? getLocalizedText(product.model, currentLang) : (product.model || '—');

  const breadcrumbs = [
    { label: t.breadcrumb_catalog || (currentLang === 'ru' ? 'Каталог' : 'Katalog'), to: '/catalog' },
    { label: categoryName, to: `/catalog/${categorySlug}` },
    { label: modelText }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Product-Specific SEO & Open Graph Meta Tags */}
      <SeoManager currentLang={currentLang} product={product} />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Main Top Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Chap tomon: Rasm va Tezkor Nishonlar */}
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
              /* Rasm bo'lmaganda yoki yuklanmaganda chiqadigan chiroyli Placeholder */
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

            {/* Badges */}
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

            {/* Share button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 backdrop-blur-md transition shadow-lg cursor-pointer"
              title="Havolani nusxalash"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Badges */}
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

        {/* O'ng tomon: Ma'lumotlar, Narx va Harakatlar */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/catalog/${categorySlug}`}
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

            {/* Model va Brend Nishonlari */}
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

            {/* Qisqa Ta'rif (Tagline) */}
            <p className="text-sm text-gray-300 leading-relaxed pt-2">
              {getLocalizedText(product.tagline, currentLang, fullDescription.slice(0, 160))}
            </p>
          </div>

          {/* Narx va Tijorat Taklifi Qutisi */}
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

            {/* Tugmalar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onOpenQuote(product)}
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

          {/* Tezkor Xususiyatlar */}
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

      {/* Tablar (Tavsif, Parametrlar, Afzalliklar, Qo'llanishi, Hujjatlar) */}
      <div className="mt-16 space-y-6">
        <div className="flex border-b border-gray-800 space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          
          {/* 🌟 1-Tab: Kengaytirilgan Tavsif (Opisaniya) */}
          <button
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

          {/* 2-Tab: Parametrlar */}
          <button
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

          {/* 3-Tab: Afzalliklar */}
          <button
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

          {/* 4-Tab: Qo'llanilishi */}
          <button
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

          {/* 5-Tab: Hujjatlar */}
          <button
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

        {/* Tab 1: Kengaytirilgan Tavsif (Opisaniya) Kontenti */}
        {activeTab === 'description' && (
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>{modelText} — {currentLang === 'ru' ? 'Подробное описание и назначение прибора' : 'Uskunaning to‘liq tavsifi va vazifasi'}</span>
            </h3>

            {fullDescription ? (
              <div 
                className="text-sm text-gray-300 leading-relaxed space-y-3 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: fullDescription }}
              />
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentLang === 'ru' 
                  ? 'Высокоточное сертифицированное оборудование для промышленного и метрологического применения. Поставляется с официальной заводской гарантией и сертификатом соответствия.'
                  : 'Sanoat va metrologik maqsadlar uchun yuqori aniqlikdagi sertifikatlangan uskuna. Rasmiy zavod kafolati va muvofiqlik sertifikati bilan yetkazib beriladi.'}
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Texnik Parametrlar Jadvali */}
        {activeTab === 'specs' && (
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>{modelText} — {currentLang === 'ru' ? 'Полные метрологические и технические параметры' : 'To‘liq texnik va metrologik parametrlar'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <tbody>
                  {(product.specs || []).map((s, idx) => (
                    <tr 
                      key={idx} 
                      className={`border-b border-gray-800/80 ${idx % 2 === 0 ? 'bg-gray-900/40' : 'bg-transparent'}`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-400 w-1/2 sm:w-2/5">
                        {getSpecName(s, currentLang)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-100 font-mono">
                        {typeof s.value === 'object' ? getLocalizedText(s.value, currentLang) : s.value}
                      </td>
                    </tr>
                  ))}
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
        )}

        {/* Tab 3: Afzalliklar */}
        {activeTab === 'features' && (
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
        )}

        {/* Tab 4: Qo'llanilishi */}
        {activeTab === 'applications' && (
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
        )}

        {/* Tab 5: PDF Hujjatlar */}
        {activeTab === 'docs' && (
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>{currentLang === 'ru' ? 'Официальная документация и руководства' : 'Rasmiy hujjatlar va qo‘llanmalar'}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {currentLang === 'ru' 
                  ? 'Вы можете скачать техническую документацию к прибору в формате PDF.' 
                  : 'Quyidagi texnik hujjatlarni PDF formatida yuklab olishingiz mumkin.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{currentLang === 'ru' ? 'Технический паспорт' : 'Texnik pasport'}</h4>
                  <p className="text-xs text-gray-400 mt-1">PDF • 3.8 MB • {modelText}</p>
                </div>
                <button
                  onClick={() => handleDownloadDoc(`Паспорт_${modelText}.pdf`)}
                  disabled={downloadingDoc === `Паспорт_${modelText}.pdf`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{downloadingDoc === `Паспорт_${modelText}.pdf` ? (currentLang === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...') : (currentLang === 'ru' ? 'Скачать' : 'Yuklab olish')}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{currentLang === 'ru' ? 'Сертификат поверки Узстандарт' : 'O‘zstandart qiyoslash sertifikati'}</h4>
                  <p className="text-xs text-gray-400 mt-1">PDF • 1.4 MB • O'z DSt</p>
                </div>
                <button
                  onClick={() => handleDownloadDoc(`Сертификат_${modelText}.pdf`)}
                  disabled={downloadingDoc === `Сертификат_${modelText}.pdf`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{downloadingDoc === `Сертификат_${modelText}.pdf` ? (currentLang === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...') : (currentLang === 'ru' ? 'Скачать' : 'Yuklab olish')}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{currentLang === 'ru' ? 'Руководство по эксплуатации' : 'Foydalanish qo‘llanmasi'}</h4>
                  <p className="text-xs text-gray-400 mt-1">PDF • 5.2 MB</p>
                </div>
                <button
                  onClick={() => handleDownloadDoc(`Manual_${modelText}.pdf`)}
                  disabled={downloadingDoc === `Manual_${modelText}.pdf`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{downloadingDoc === `Manual_${modelText}.pdf` ? (currentLang === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...') : (currentLang === 'ru' ? 'Скачать' : 'Yuklab olish')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Yondosh / O'xshash Mahsulotlar */}
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
              to={`/catalog/${categorySlug}`}
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
                  onSelect={() => navigate(`/product/${relSlug}`)}
                  onOpenQuote={onOpenQuote}
                  isCompared={comparedProducts.includes(relSlug) || comparedProducts.includes(String(rel.id))}
                  onToggleCompare={onToggleCompare}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
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
          onClick={() => onOpenQuote(product)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 text-sm whitespace-nowrap transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          {t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
        </button>
      </div>

    </div>
  );
};