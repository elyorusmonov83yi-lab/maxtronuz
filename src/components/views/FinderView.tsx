import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Flame, 
  Wrench, 
  Shield, 
  Zap, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Product, Language, IndustryInfo } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { translations } from '../../data/translations';
import { Breadcrumbs } from '../Breadcrumbs';
import { ProductCard } from '../ProductCard';
import { getLocalizedText } from '../../utils/formatters';

interface FinderViewProps {
  currentLang: Language;
  onOpenQuote: (product: Product) => void;
  comparedProducts: string[];
  onToggleCompare: (product: Product) => void;
}

// Iconlar xaritasi (agar bazada icon nomi kelsa)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Building2,
  Zap,
  Wrench,
  Shield,
  Layers
};

export const FinderView: React.FC<FinderViewProps> = ({
  currentLang,
  onOpenQuote,
  comparedProducts,
  onToggleCompare,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');

  // 🌟 Dinamik ma'lumotlar state'i
  const [industries, setIndustries] = useState<IndustryInfo[]>(() => StorageService.getIndustries());
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());

  const t = translations[currentLang] || {};

  // Bazadan yuklash va sinxronlash
  useEffect(() => {
    // 1. Sohalarni olish
    ApiService.getIndustries?.()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setIndustries(data);
        }
      })
      .catch(() => {
        setIndustries(StorageService.getIndustries());
      });

    // 2. Mahsulotlarni olish
    ApiService.getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        setProducts(StorageService.getProducts());
      });

    const handleIndustriesUpdate = (e: any) => e.detail && setIndustries(e.detail);
    const handleProductsUpdate = (e: any) => e.detail && setProducts(e.detail);

    window.addEventListener('maxtron_industries_updated', handleIndustriesUpdate);
    window.addEventListener('maxtron_products_updated', handleProductsUpdate);

    return () => {
      window.removeEventListener('maxtron_industries_updated', handleIndustriesUpdate);
      window.removeEventListener('maxtron_products_updated', handleProductsUpdate);
    };
  }, []);

  // Tanlangan sohaga tegishli vazifalar
  const currentIndustryObj = industries.find(
    (ind) => String(ind.id) === String(selectedIndustry) || ind.slug === selectedIndustry
  );
  const taskOptions = currentIndustryObj?.tasks || [];

  // 🌟 Tavsiya etilgan mahsulotlarni filtrlovchi funksiya
  const getRecommendedProducts = (): Product[] => {
    if (!selectedIndustry) return [];

    const matchedProducts = products.filter((p: any) => {
      // 1. Soha ID lari massivini olish
      const indIds: string[] = Array.isArray(p.industries)
        ? p.industries.map(String)
        : (Array.isArray(p.industryIds) ? p.industryIds.map(String) : []);

      // 2. Vazifa ID lari massivini olish
      const taskIds: string[] = Array.isArray(p.tasks)
        ? p.tasks.map(String)
        : (Array.isArray(p.industryTaskIds) ? p.industryTaskIds.map(String) : []);

      const industryMatched = indIds.includes(String(selectedIndustry));

      // Agar vazifa ham tanlangan bo'lsa, ikkalasini solishtiradi
      if (selectedTask) {
        return industryMatched && taskIds.includes(String(selectedTask));
      }

      return industryMatched;
    });

    // Agar vazifa bo'yicha topilmasa, hech bo'lmaganda shu sohadagi tovarlarni qaytaradi
    if (matchedProducts.length === 0 && selectedIndustry) {
      const fallbackIndustryMatched = products.filter((p: any) => {
        const indIds: string[] = Array.isArray(p.industries)
          ? p.industries.map(String)
          : (Array.isArray(p.industryIds) ? p.industryIds.map(String) : []);
        return indIds.includes(String(selectedIndustry));
      });
      return fallbackIndustryMatched.length > 0 ? fallbackIndustryMatched : products.slice(0, 3);
    }

    return matchedProducts.length > 0 ? matchedProducts : products.slice(0, 3);
  };

  const recommendedProducts = getRecommendedProducts();

  const handleReset = () => {
    setStep(1);
    setSelectedIndustry('');
    setSelectedTask('');
  };

  const breadcrumbs = [
    { label: t.breadcrumb_finder || 'Uskuna tanlash' }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" /> 
          {currentLang === 'ru' ? 'Инженерный подбор оборудования' : 'Muhandislik tanlov algoritmi'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {t.finder_title || (currentLang === 'ru' ? 'Мастер интеллектуального подбора КИПиА' : 'Intellektual uskuna tanlash ustasi')}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {t.finder_subtitle || (currentLang === 'ru' ? 'В 3 шага подберите прибор под конкретную отрасль и задачу' : '3 qadamda sohangiz va texnik vazifangizga mos eng ma’qul uskunani toping')}
        </p>
      </div>

      {/* Step Indicators */}
      <div className="max-w-2xl mx-auto flex items-center justify-between relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
        
        {/* Step 1 */}
        <div 
          onClick={() => setStep(1)}
          className="relative z-10 flex flex-col items-center cursor-pointer"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${
            step >= 1 ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-900 border-gray-700 text-gray-400'
          }`}>
            1
          </div>
          <span className="text-[11px] font-semibold text-gray-300 mt-2 text-center">
            {currentLang === 'ru' ? 'Отрасль' : 'Soha'}
          </span>
        </div>

        {/* Step 2 */}
        <div 
          onClick={() => selectedIndustry && setStep(2)}
          className={`relative z-10 flex flex-col items-center ${selectedIndustry ? 'cursor-pointer' : 'opacity-60'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${
            step >= 2 ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-900 border-gray-700 text-gray-400'
          }`}>
            2
          </div>
          <span className="text-[11px] font-semibold text-gray-300 mt-2 text-center">
            {currentLang === 'ru' ? 'Задача' : 'Vazifa'}
          </span>
        </div>

        {/* Step 3 */}
        <div 
          className={`relative z-10 flex flex-col items-center ${step === 3 ? 'cursor-pointer' : 'opacity-60'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${
            step === 3 ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-900 border-gray-700 text-gray-400'
          }`}>
            3
          </div>
          <span className="text-[11px] font-semibold text-gray-300 mt-2 text-center">
            {currentLang === 'ru' ? 'Результат' : 'Tavsiya'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-gray-900/80 border border-gray-800 shadow-2xl">
        
        {/* Step 1: Industry Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white">
                {currentLang === 'ru' ? '1-Шаг: Выберите отрасль применения' : '1-Qadam: Faoliyat sohangizni tanlang'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {currentLang === 'ru' ? 'Для какого сектора или объекта подбирается контрольно-измерительный прибор?' : 'Qaysi tarmoq yoki obekt uchun o‘lchov asbobi zarur?'}
              </p>
            </div>

            {industries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                {currentLang === 'ru' ? 'Отрасли загружаются или еще не добавлены.' : 'Sohalar yuklanmoqda...'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {industries.map((ind) => {
                  const IconComponent = (ind.icon && iconMap[ind.icon]) || Building2;
                  const isSel = String(selectedIndustry) === String(ind.id);
                  const indName = getLocalizedText(ind.name, currentLang, ind.id);
                  const indDesc = getLocalizedText(ind.desc || (ind as any).description, currentLang, '');

                  return (
                    <button
                      key={ind.id}
                      onClick={() => {
                        setSelectedIndustry(String(ind.id));
                        setSelectedTask('');
                        setStep(2);
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all flex items-start space-x-4 cursor-pointer ${
                        isSel
                          ? 'bg-blue-600/20 border-blue-500 shadow-xl'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                      }`}
                    >
                      <div className={`p-3 rounded-xl shrink-0 ${isSel ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-400'}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{indName}</h4>
                        {indDesc && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{indDesc}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Task Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {currentLang === 'ru' ? '2-Шаг: Выберите инженерную задачу' : '2-Qadam: Asosiy texnik vazifani tanlang'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {currentLang === 'ru' ? 'Какой параметр или технологический процесс необходимо контролировать?' : 'Ushbu uskuna yordamida aynan qanday ko‘rsatkichni aniqlash lozim?'}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 transition cursor-pointer"
              >
                {currentLang === 'ru' ? 'Назад' : 'Orqaga'}
              </button>
            </div>

            {taskOptions.length === 0 ? (
              <div className="text-center py-8 bg-gray-950/50 rounded-2xl border border-gray-800 space-y-4">
                <p className="text-xs text-gray-400">
                  {currentLang === 'ru' ? 'Для выбранной отрасли нет подразделов. Показать все модели?' : 'Ushbu soha uchun alohida vazifalar kiritilmagan. Mahsulotlarni ko‘rish:'}
                </p>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {currentLang === 'ru' ? 'Показать оборудование' : 'Uskunalarni ko‘rsatish'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {taskOptions.map((task) => {
                  const isSel = String(selectedTask) === String(task.id);
                  const taskName = getLocalizedText(task.name, currentLang, task.id);
                  const taskDesc = getLocalizedText(task.desc || (task as any).description, currentLang, '');

                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(String(task.id));
                        setStep(3);
                      }}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSel
                          ? 'bg-blue-600/20 border-blue-500 shadow-xl'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{taskName}</h4>
                        {taskDesc && <p className="text-xs text-blue-400 mt-1">{taskDesc}</p>}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Recommended Results */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> 
                  {currentLang === 'ru' ? 'Подобранные решения по вашим критериям:' : 'Sizning topshirig‘ingizga mos uskunalar:'}
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {currentLang === 'ru' ? 'Рекомендованные профессиональные модели' : 'Tavsiya etilgan professional modellar'}
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{currentLang === 'ru' ? 'Сбросить фильтр' : 'Qayta tanlash'}</span>
              </button>
            </div>

            {/* Results Grid */}
            {recommendedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {currentLang === 'ru' ? 'По данному запросу пока нет товаров.' : 'Mos uskunalar topilmadi.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((p) => {
                  const productSlug = typeof p.slug === 'object' 
                    ? (p.slug[currentLang as 'uz' | 'ru'] || p.slug.ru || p.slug.uz || p.id)
                    : (p.slug || p.id);

                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currentLang={currentLang}
                      onSelect={() => navigate(`/product/${productSlug}`)}
                      onOpenQuote={onOpenQuote}
                      isCompared={comparedProducts.includes(p.id)}
                      onToggleCompare={onToggleCompare}
                    />
                  );
                })}
              </div>
            )}

            {/* Expert Assistance banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-gray-900 to-cyan-950/60 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {currentLang === 'ru' ? 'Нужна помощь в составлении ТЗ?' : 'Boshqa nostandart parametrlar kerakmi?'}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentLang === 'ru' ? 'Наши сертифицированные инженеры подберут аналоги и оборудование под проект.' : 'Muhandislarimiz individual texnik topshiriq bo‘yicha maxsus modellarni topib beradi.'}
                </p>
              </div>
              <button
                onClick={() => onOpenQuote(recommendedProducts[0] || ({} as any))}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                {t.btn_consult_expert || (currentLang === 'ru' ? 'Консультация инженера' : 'Mutaxassis maslahati')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};