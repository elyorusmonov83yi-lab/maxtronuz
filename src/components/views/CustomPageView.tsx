"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/utils/navigation';
import { 
  ChevronRight, 
  Share2, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  PhoneCall,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, CustomPage } from '../../types';
import { StorageService } from '../../services/storage';
import { translations } from '../../data/translations';
import { getLocalizedText } from '../../utils/formatters';

interface CustomPageViewProps {
  currentLang: Language;
  onOpenQuoteModal: () => void;
  onShowToast: (msg: string) => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  currentLang,
  onOpenQuoteModal,
  onShowToast
}) => {
  const params = useParams() as { slug?: string };
  const targetSlug = params?.slug || '';
  const t = translations[currentLang] || translations.ru;

  const [page, setPage] = useState<CustomPage | null>(null);
  const [allPages, setAllPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPageData = () => {
    setIsLoading(true);
    const pages = StorageService.getPages();
    setAllPages(pages);

    if (targetSlug) {
      const found = StorageService.getPageBySlug(targetSlug);
      setPage(found || null);
    } else {
      setPage(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPageData();

    const handlePagesUpdated = () => {
      loadPageData();
    };

    window.addEventListener('maxtron_pages_updated', handlePagesUpdated);
    return () => {
      window.removeEventListener('maxtron_pages_updated', handlePagesUpdated);
    };
  }, [targetSlug]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast(
        currentLang === 'uz_cyrl' 
          ? 'Саҳифа ҳаволаси нусхаланди!' 
          : currentLang === 'uz' 
            ? 'Sahifa havolasi nusxalandi!' 
            : 'Ссылка на страницу скопирована!'
      );
    }
  };

  const getLocalized = (obj: any) => {
    if (!obj) return '';
    return obj[currentLang] || obj.uz_cyrl || obj.uz || obj.ru || obj.en || '';
  };

  const getLocalizedUrl = (path: string) => {
    if (currentLang === 'ru') {
      return path;
    }
    return `/${currentLang}${path === '/' ? '' : path}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!page || (!page.isPublished && !StorageService.isAdminAuthenticated())) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 text-gray-400 mx-auto flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          {currentLang === 'uz_cyrl' 
            ? 'Саҳифа топилмади' 
            : currentLang === 'uz' 
              ? 'Sahifa topilmadi' 
              : 'Страница не найдена'}
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
          {currentLang === 'uz_cyrl'
            ? 'Сиз қидираётган саҳифа мавжуд эмас ёки маъмурият томонидан янгиланмоқда.'
            : currentLang === 'uz'
              ? 'Siz qidirayotgan sahifa mavjud emas yoki ma\'muriyat tomonidan yangilanmoqda.'
              : 'Запрошенная страница не найдена или находится на обновлении.'}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href={getLocalizedUrl('/catalog')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            {t.nav_catalog || 'Katalog'}
          </Link>
          <Link
            href={getLocalizedUrl('/')}
            className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 font-semibold text-xs transition cursor-pointer"
          >
            {t.nav_home || 'Bosh sahifa'}
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = getLocalized(page.title);
  const pageSubtitle = getLocalized(page.subtitle);
  const pageContent = getLocalized(page.content);
  const otherPages = allPages.filter((p) => p.id !== page.id && p.isPublished);

  return (
    <div className="min-h-screen pb-20">
      {/* Non ushoqlari (Breadcrumbs) */}
      <div className="bg-gray-950/80 border-b border-gray-800/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href={getLocalizedUrl('/')} className="hover:text-blue-400 transition flex items-center gap-1">
              <span>{t.nav_home || 'Bosh sahifa'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span className="text-gray-500">
              {currentLang === 'uz_cyrl' ? 'Саҳифалар' : currentLang === 'uz' ? 'Sahifalar' : 'Страницы'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <span className="text-white font-medium truncate max-w-xs">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 cursor-pointer"
              title="Ulashish"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentLang === 'uz_cyrl' ? 'Улашиш' : currentLang === 'uz' ? 'Ulashish' : 'Поделиться'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative border-b border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-gray-950 py-12 sm:py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MAXTRON Rasmiy Axboroti</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
              {pageSubtitle}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 mt-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>
                {new Date(page.updatedAt || page.createdAt || Date.now()).toLocaleDateString(
                  currentLang === 'ru' ? 'ru-RU' : currentLang === 'en' ? 'en-US' : 'uz-UZ'
                )}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'uz_cyrl' 
                  ? 'Расмий маълумот' 
                  : currentLang === 'uz' 
                    ? 'Rasmiy ma\'lumot' 
                    : 'Официальные данные'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asosiy Matn Maydoni */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {page.coverImage && (
          <div className="mb-10 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900">
            <img
              src={page.coverImage}
              alt={pageTitle}
              className="w-full h-64 sm:h-96 object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {pageContent && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-900/60 border border-gray-800 mb-10 shadow-xl">
            <div className="prose prose-invert max-w-none text-gray-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {pageContent}
            </div>
          </div>
        )}

        {/* Maxsus Bo'lim Bloklari */}
        {page.sections && page.sections.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Layers className="w-4 h-4" />
              <span>
                {currentLang === 'uz_cyrl' 
                  ? 'Батафсил бўлимлар' 
                  : currentLang === 'uz' 
                    ? 'Batafsil bo\'limlar' 
                    : 'Подробные разделы'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.sections.map((sec, idx) => {
                const secTitle = getLocalized(sec.title);
                const secContent = getLocalized(sec.content);
                const secBadge = getLocalized(sec.badge);

                return (
                  <div 
                    key={sec.id || idx}
                    className="p-6 rounded-3xl bg-gray-900/80 border border-gray-800/90 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-mono font-bold">
                          0{idx + 1}
                        </span>
                        {secBadge && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {secBadge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {secTitle}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {secContent}
                      </p>
                    </div>

                    {sec.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-gray-800 mt-2">
                        <img 
                          src={sec.imageUrl} 
                          alt={secTitle} 
                          className="w-full h-40 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tijorat Taklifi CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/80 via-gray-900 to-cyan-950/80 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 block">
              MAXTRON Корпоратив Хизмати
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentLang === 'uz_cyrl' 
                ? 'Ушбу йўналиш бўйича саволингиз борми?' 
                : currentLang === 'uz' 
                  ? 'Ushbu yo\'nalish bo\'yicha savolingiz bormi?' 
                  : 'Есть вопросы по данному направлению?'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              {currentLang === 'uz_cyrl'
                ? 'Бизнинг мутахассисларимиз 30 дақиқа ичида расмий тижорат таклифи ва техник маслаҳат тақдим этишади.'
                : currentLang === 'uz'
                  ? 'Bizning mutaxassislarimiz 30 daqiqa ichida rasmiy tijorat taklifi va texnik maslahat taqdim etishadi.'
                  : 'Наши инженеры подготовят официальное коммерческое предложение и проконсультируют в течение 30 минут.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenQuoteModal}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              {t.cta_btn || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
            </button>
            <a
              href="tel:+998712004577"
              className="px-5 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 font-semibold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>+998 (71) 200-45-77</span>
            </a>
          </div>
        </div>

        {/* Boshqa Sahifalar */}
        {otherPages.length > 0 && (
          <div className="border-t border-gray-800 pt-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              {currentLang === 'uz_cyrl' ? 'Бошқа бўлимлар ва саҳифалар' : currentLang === 'uz' ? 'Boshqa bo\'limlar va sahifalar' : 'Другие разделы'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {otherPages.map((op) => (
                <Link
                  key={op.id}
                  href={getLocalizedUrl(`/page/${op.slug}`)}
                  className="p-4 rounded-2xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-blue-500/30 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-300 group-hover:text-white truncate">
                      {getLocalized(op.title)}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};