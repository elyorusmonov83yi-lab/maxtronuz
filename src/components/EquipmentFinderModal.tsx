"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Check, 
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
import { Product, Language, IndustryInfo } from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { translations } from '../data/translations';
import { getLocalizedText, getProductName } from '../utils/formatters';

interface EquipmentFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectProduct: (product: Product) => void;
  onOpenQuote: (product: Product) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Building2,
  Zap,
  Wrench,
  Shield,
  Layers
};

export const EquipmentFinderModal: React.FC<EquipmentFinderModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectProduct,
  onOpenQuote,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');

  const [industries, setIndustries] = useState<IndustryInfo[]>(() => StorageService.getIndustries?.() || []);
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());

  const t = translations[currentLang] || translations.ru;

  // Escape tugmasi orqali yopish
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;

    ApiService.getIndustries?.()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setIndustries(data);
        } else {
          setIndustries(StorageService.getIndustries?.() || []);
        }
      })
      .catch(() => {
        setIndustries(StorageService.getIndustries?.() || []);
      });

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
  }, [isOpen]);

  if (!isOpen) return null;

  const currentIndustryObj = industries.find(
    (ind) => String(ind.id) === String(selectedIndustry) || ind.slug === selectedIndustry
  );
  const taskOptions = currentIndustryObj?.tasks || [];

  const getMatchingProducts = (): Product[] => {
    if (!selectedIndustry) return [];

    const matched = products.filter((p: any) => {
      const indIds: string[] = Array.isArray(p.industries)
        ? p.industries.map(String)
        : (Array.isArray(p.industryIds) ? p.industryIds.map(String) : []);

      const taskIds: string[] = Array.isArray(p.tasks)
        ? p.tasks.map(String)
        : (Array.isArray(p.industryTaskIds) ? p.industryTaskIds.map(String) : []);

      const industryMatched = indIds.includes(String(selectedIndustry));

      if (selectedTask) {
        return industryMatched && taskIds.includes(String(selectedTask));
      }

      return industryMatched;
    });

    if (matched.length === 0 && selectedIndustry) {
      const fallback = products.filter((p: any) => {
        const indIds: string[] = Array.isArray(p.industries)
          ? p.industries.map(String)
          : (Array.isArray(p.industryIds) ? p.industryIds.map(String) : []);
        return indIds.includes(String(selectedIndustry));
      });
      return fallback.length > 0 ? fallback : products.slice(0, 4);
    }

    return matched.length > 0 ? matched : products.slice(0, 4);
  };

  const matchingProducts = getMatchingProducts();

  const resetWizard = () => {
    setStep(1);
    setSelectedIndustry('');
    setSelectedTask('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      id="equipment-finder-modal"
    >
      <div 
        className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t.finder_title || (currentLang === 'ru' ? 'Мастер подбора КИПиА' : 'Uskuna tanlash ustasi')}
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-gray-400">
                {t.finder_subtitle || (currentLang === 'ru' ? 'Подберите прибор под конкретную отрасль' : 'Sohangizga mos uskunani 3 qadamda toping')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-3 bg-gray-950/40 border-b border-gray-800/80 flex items-center justify-between text-xs font-medium shrink-0">
          <span className={step === 1 ? 'text-blue-400 font-bold' : step > 1 ? 'text-emerald-400' : 'text-gray-500'}>
            1. {currentLang === 'ru' ? 'Отрасль' : 'Soha'}
          </span>
          <span className="text-gray-600">→</span>
          <span className={step === 2 ? 'text-blue-400 font-bold' : step > 2 ? 'text-emerald-400' : 'text-gray-500'}>
            2. {currentLang === 'ru' ? 'Задача' : 'Vazifa'}
          </span>
          <span className="text-gray-600">→</span>
          <span className={step === 3 ? 'text-blue-400 font-bold' : 'text-gray-500'}>
            3. {currentLang === 'ru' ? 'Результат' : 'Tavsiya'}
          </span>
        </div>

        {/* Wizard Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* STEP 1: Select Industry */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">
                {currentLang === 'ru' ? 'Выберите отрасль применения:' : 'Faoliyat sohangizni tanlang:'}
              </h3>

              {industries.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  {currentLang === 'ru' ? 'Отрасли загружаются...' : 'Sohalar yuklanmoqda...'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {industries.map((ind) => {
                    const Icon = (ind.icon && iconMap[ind.icon]) || Building2;
                    const isSelected = String(selectedIndustry) === String(ind.id);
                    const indName = getLocalizedText(ind.name, currentLang, ind.id);
                    const indDesc = getLocalizedText(ind.desc || (ind as any).description, currentLang, '');

                    return (
                      <div
                        key={ind.id}
                        onClick={() => {
                          setSelectedIndustry(String(ind.id));
                          setSelectedTask('');
                          setStep(2);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                            : 'bg-gray-950/80 border-gray-800 hover:border-gray-700 hover:bg-gray-950'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-900 text-blue-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{indName}</h4>
                          {indDesc && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{indDesc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Select Task */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">
                  {currentLang === 'ru' ? 'Укажите конкретную задачу:' : 'Aniq texnik vazifani belgilang:'}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-gray-800 transition cursor-pointer"
                >
                  {currentLang === 'ru' ? '← Назад' : '← Orqaga'}
                </button>
              </div>

              {taskOptions.length === 0 ? (
                <div className="text-center py-8 bg-gray-950/50 rounded-2xl border border-gray-800 space-y-3">
                  <p className="text-xs text-gray-400">
                    {currentLang === 'ru' ? 'Для этой отрасли нет отдельных задач. Показать товары?' : 'Ushbu soha uchun alohida vazifalar yo‘q. Mahsulotlarni ko‘rish:'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {currentLang === 'ru' ? 'Показать оборудование' : 'Mahsulotlarni ko‘rish'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {taskOptions.map((task) => {
                    const taskName = getLocalizedText(task.name, currentLang, task.id);
                    const taskDesc = getLocalizedText(task.desc || (task as any).description, currentLang, '');

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(String(task.id));
                          setStep(3);
                        }}
                        className="p-4 rounded-2xl border bg-gray-950/80 border-gray-800 hover:border-blue-500/60 hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                            {taskName}
                          </h4>
                          {taskDesc && <p className="text-xs text-gray-400 mt-1">{taskDesc}</p>}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Results */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-1">
                    <Check className="w-3.5 h-3.5" /> 
                    {currentLang === 'ru' ? '100% подходящие решения' : 'Mos keluvchi uskunalar'}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {currentLang === 'ru' ? 'Рекомендации под вашу задачу:' : 'Texnik vazifangiz uchun tavsiyalar:'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetWizard}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> {currentLang === 'ru' ? 'Начать заново' : 'Qayta boshlash'}
                </button>
              </div>

              {matchingProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  {currentLang === 'ru' ? 'По данному запросу пока нет товаров.' : 'Mos uskunalar topilmadi.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-blue-500/50 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-full h-32 bg-gray-900 rounded-xl mb-3 overflow-hidden p-2 flex items-center justify-center">
                          <img
                            src={p.image || (p as any).imageUrl || ''}
                            alt={getProductName(p, currentLang)}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-400">
                          {p.model}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                          {getProductName(p, currentLang)}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {getLocalizedText(p.tagline, currentLang)}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                          className="py-1.5 px-3 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 transition cursor-pointer"
                        >
                          {currentLang === 'ru' ? 'Подробнее' : 'Batafsil'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenQuote(p);
                          }}
                          className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                        >
                          {currentLang === 'ru' ? 'Запросить КП' : 'KP olish'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};