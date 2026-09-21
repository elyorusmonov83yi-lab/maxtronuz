"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/utils/navigation';
import { translations } from '@/data/translations';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  SlidersHorizontal,
  Award,
  Sparkles,
  Activity,
  Info
} from 'lucide-react';
import { Language, Product, CategoryInfo, HomeContent, AboutContent } from '../../types';

import { ProductCard } from '../ProductCard';
import { StorageService } from '../../services/storage';
import { getLocalizedText } from '../../utils/formatters';
import { ClientsSlider } from '../ClientsSlider';
import { DynamicIcon } from '../DynamicIcon';
import { SeoManager } from '../SeoManager';

interface HomeViewProps {
  currentLang: Language;
  onOpenQuote: (product?: Product) => void;
  comparedProducts: string[];
  onToggleCompare: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentLang,
  onOpenQuote,
  comparedProducts,
  onToggleCompare,
}) => {
  const navigate = useNavigate();
  const t = translations[currentLang] || translations.ru;
  
  const [allProducts, setAllProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>(() => StorageService.getCategories());
  const [homeCms, setHomeCms] = useState<HomeContent>(() => StorageService.getHomeContent());
  const [aboutCms, setAboutCms] = useState<AboutContent>(() => StorageService.getAboutContent());

  useEffect(() => {
    setHomeCms(StorageService.getHomeContent());
    setAboutCms(StorageService.getAboutContent());
    setAllProducts(StorageService.getProducts());
    setCategoriesList(StorageService.getCategories());

    const handleProducts = (e: any) => { if (e.detail) setAllProducts(e.detail); };
    const handleCategories = (e: any) => { if (e.detail) setCategoriesList(e.detail); };
    const handleHome = (e: any) => { if (e.detail) setHomeCms(e.detail); };
    const handleAbout = (e: any) => { if (e.detail) setAboutCms(e.detail); };

    window.addEventListener('maxtron_products_updated', handleProducts);
    window.addEventListener('maxtron_categories_updated', handleCategories);
    window.addEventListener('maxtron_home_updated', handleHome);
    window.addEventListener('maxtron_about_updated', handleAbout);

    return () => {
      window.removeEventListener('maxtron_products_updated', handleProducts);
      window.removeEventListener('maxtron_categories_updated', handleCategories);
      window.removeEventListener('maxtron_home_updated', handleHome);
      window.removeEventListener('maxtron_about_updated', handleAbout);
    };
  }, [currentLang]);

  const featuredProducts = (allProducts.filter((p) => p.isPopular).length > 0
    ? allProducts.filter((p) => p.isPopular)
    : allProducts
  ).slice(0, 6);

  const mainParentCategories = categoriesList.filter(c => !c.parentId);

  const heroBadgeText = getLocalizedText(homeCms?.heroBadge, currentLang, 'Zavod ta’minoti');
  const heroTitleText = getLocalizedText(homeCms?.heroTitle, currentLang, 'MAXTRON — Sanoat va O\'lchov Uskunalari');
  const heroSubtitleText = getLocalizedText(homeCms?.heroSubtitle, currentLang, '');
  const bannerNoticeText = getLocalizedText(homeCms?.bannerNotice, currentLang, '');

  const whyUsTitleText = getLocalizedText(homeCms?.whyUsTitle, currentLang, 'Nega aynan MAXTRON?');
  const whyUsSubtitleText = getLocalizedText(homeCms?.whyUsSubtitle, currentLang, 'Sanoat korxonalari uchun ishonchli yechimlar');

  const adv1TitleText = getLocalizedText(homeCms?.adv1Title, currentLang, 'Tezkor yetkazib berish');
  const adv1DescText = getLocalizedText(homeCms?.adv1Desc, currentLang, '');
  
  const adv2TitleText = getLocalizedText(homeCms?.adv2Title, currentLang, 'Rasmiy kafolat');
  const adv2DescText = getLocalizedText(homeCms?.adv2Desc, currentLang, '');

  const adv3TitleText = getLocalizedText(homeCms?.adv3Title, currentLang, 'Davlat sertifikatlari');
  const adv3DescText = getLocalizedText(homeCms?.adv3Desc, currentLang, '');

  const adv4TitleText = getLocalizedText(homeCms?.adv4Title, currentLang, 'Texnik servis');
  const adv4DescText = getLocalizedText(homeCms?.adv4Desc, currentLang, '');

  const catSectionTitleText = getLocalizedText(homeCms?.catSectionTitle, currentLang, 'Uskunalar toifalari');
  const catSectionSubtitleText = getLocalizedText(homeCms?.catSectionSubtitle, currentLang, '');

  const featuredTitleText = getLocalizedText(homeCms?.featuredTitle, currentLang, 'Ommabop uskunalar');
  const featuredSubtitleText = getLocalizedText(homeCms?.featuredSubtitle, currentLang, '');

  const quizTitleText = getLocalizedText(homeCms?.quizTitle, currentLang, 'Qaysi uskuna mos kelishini bilmayapsizmi?');
  const quizSubtitleText = getLocalizedText(homeCms?.quizSubtitle, currentLang, '');

  return (
    <div>
      <SeoManager currentLang={currentLang} homeContent={homeCms} />

      {/* 1. Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden border-b border-gray-800/50 pt-12 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>{heroBadgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-blue-200 bg-clip-text text-transparent">
              {heroTitleText}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {heroSubtitleText}
          </p>

          {bannerNoticeText && (
            <div className="mb-10 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs sm:text-sm font-medium backdrop-blur-md max-w-2xl mx-auto">
              <Info className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{bannerNoticeText}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>{t.btn_view_catalog || (currentLang === 'ru' ? 'В каталог' : 'Katalog')}</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>

            <Link
              href="/equipment-finder"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-gray-900/90 hover:bg-gray-800 text-gray-200 hover:text-white font-semibold rounded-xl border border-gray-800 hover:border-blue-500/40 transition-all gap-2"
            >
              <SlidersHorizontal className="w-5 h-5 text-blue-400" />
              <span>{t.btn_finder || (currentLang === 'ru' ? 'Подбор прибора' : 'Asbob tanlash')}</span>
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-gray-950 hover:bg-gray-900 text-gray-300 hover:text-white font-semibold rounded-xl border border-gray-800 transition-all"
            >
              <span>{t.btn_consult_expert || (currentLang === 'ru' ? 'Консультация' : 'Bog‘lanish')}</span>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-gray-800/60">
            <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{homeCms.statClientsNum || aboutCms.partnerClients || '500+'}</div>
              <div className="text-xs text-gray-400 mt-1">{getLocalizedText(homeCms.statClientsText, currentLang, 'Mijozlar')}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight">{homeCms.statDevicesNum || aboutCms.equipmentDelivered || '1,500+'}</div>
              <div className="text-xs text-gray-400 mt-1">{getLocalizedText(homeCms.statDevicesText, currentLang, 'Yetkazilgan')}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{homeCms.statWarrantyNum || aboutCms.warehouseItems || '200+'}</div>
              <div className="text-xs text-gray-400 mt-1">{getLocalizedText(homeCms.statWarrantyText, currentLang, 'Omborda')}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">{homeCms.statSupportNum || '24/7'}</div>
              <div className="text-xs text-gray-400 mt-1">{getLocalizedText(homeCms.statSupportText, currentLang, 'Qo‘llab-quvvatlash')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Advantages Section */}
      <section className="py-24 bg-gray-900/50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              {whyUsTitleText}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {whyUsSubtitleText}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{adv1TitleText}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{adv1DescText}</p>
            </div>

            <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{adv2TitleText}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{adv2DescText}</p>
            </div>

            <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{adv3TitleText}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{adv3DescText}</p>
            </div>

            <div className="p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{adv4TitleText}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{adv4DescText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid Section */}
      <section className="py-24 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                MAXTRON Catalog
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-3">
                {catSectionTitleText}
              </h2>
              <p className="text-gray-400 text-sm max-w-xl">
                {catSectionSubtitleText}
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden md:inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition mt-4 md:mt-0"
            >
              <span>{t.cat_view_all || (currentLang === 'ru' ? 'Все категории' : 'Barcha toifalar')}</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainParentCategories.map((cat) => {
              const catSlug = currentLang === 'ru' ? (cat.slug?.ru || cat.id) : (cat.slug?.uz || cat.id);
              const children = categoriesList.filter(c => c.parentId === cat.id);
              const childIds = children.map(c => c.id);
              const totalProductsCount = allProducts.filter(p => p.category === cat.id || childIds.includes(p.category)).length;

              return (
                <Link
                  key={cat.id}
                  href={`/catalog/${catSlug}`}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition duration-300 hover:shadow-xl hover:shadow-blue-500/5 group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <DynamicIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {getLocalizedText(cat.name, currentLang, cat.id)}
                    </h3>

                    <div 
                      className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: getLocalizedText(cat.description, currentLang, '') 
                      }}
                    />

                    {children.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {children.slice(0, 3).map((ch) => (
                          <span 
                            key={ch.id}
                            className="px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800 text-[11px] text-gray-400"
                          >
                            {getLocalizedText(ch.name, currentLang, ch.id)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/80">
                    <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                      {currentLang === 'ru' ? 'Перейти' : 'Ko‘rish'} →
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {totalProductsCount} {currentLang === 'ru' ? 'моделей' : 'ta model'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Equipment Section */}
      <section className="py-24 bg-gray-900/30 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                TOP SELECTION
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-3">
                {featuredTitleText}
              </h2>
              <p className="text-gray-400 text-sm max-w-xl">
                {featuredSubtitleText}
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition mt-4 md:mt-0"
            >
              <span>{currentLang === 'ru' ? 'Посмотреть все' : 'Barchasi'}</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const prodSlug = currentLang === 'ru' ? (product.slug?.ru || product.id) : (product.slug?.uz || product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentLang={currentLang}
                  onSelect={() => navigate(`/product/${prodSlug}`)}
                  onOpenQuote={(p) => onOpenQuote(p)}
                  isCompared={comparedProducts.includes(product.id)}
                  onToggleCompare={onToggleCompare}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Interactive Equipment Finder Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/80 via-gray-900 to-cyan-950/80 border border-blue-800/50 p-8 sm:p-12 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" /> 
                <span>{currentLang === 'ru' ? '3-минутный тест' : '3 daqiqali test'}</span>
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {quizTitleText}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {quizSubtitleText}
              </p>
            </div>

            <Link
              href="/equipment-finder"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 whitespace-nowrap text-sm cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentLang === 'ru' ? 'Подобрать прибор' : 'Asbob tanlash'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Clients & Partners Slider */}
      <ClientsSlider currentLang={currentLang} />
    </div>
  );
};