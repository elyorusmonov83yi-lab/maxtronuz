"use client";

import React, { useState, useRef } from 'react';
import { 
  Building, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  ImageIcon, 
  Upload, 
  Loader2, 
  Share2,
  Trash,
  Plus,
  Truck,
  Megaphone,
  Users
} from 'lucide-react';
import { AboutContent, PageSeoSettings } from '../../../types';
import { ApiService } from '../../../services/api';

type AdminLang = 'uz' | 'ru';

interface AdminAboutSettingsProps {
  aboutContent: AboutContent;
  setAboutContent: React.Dispatch<React.SetStateAction<AboutContent>>;
  pageSeoSettings: PageSeoSettings;
  setPageSeoSettings: React.Dispatch<React.SetStateAction<PageSeoSettings>>;
  handleSaveAbout: (e: React.FormEvent) => void;
}

export const AdminAboutSettings: React.FC<AdminAboutSettingsProps> = ({
  aboutContent,
  setAboutContent,
  pageSeoSettings,
  setPageSeoSettings,
  handleSaveAbout
}) => {
  const [aboutLang, setAboutLang] = useState<AdminLang>('uz');
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const ogInputRef = useRef<HTMLInputElement>(null);

  // Ijtimoiy tarmoqlar uchun OG rasmini yuklash
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Fayl hajmi 20 MB dan oshmasligi kerak!');
      return;
    }

    try {
      setIsUploadingOg(true);
      const url = await ApiService.uploadFile(file);
      setPageSeoSettings((prev) => ({
        ...prev,
        about: {
          ...prev.about,
          ogImage: url
        }
      }));
    } catch (err: any) {
      alert('Rasmni yuklashda xatolik: ' + (err?.message || 'Server xatosi'));
    } finally {
      setIsUploadingOg(false);
    }
  };

  // Har qanday ko'p tilli obyekt yoki satrdan joriy til qiymatini xavfsiz olish
  const getVal = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') return field[aboutLang] || '';
    return '';
  };

  // Ko'p tilli matnlarni xavfsiz yangilash (bir til boshqasini aslo o'chirmaydi)
  const handleTextChange = (fieldName: string, value: string) => {
    setAboutContent((prev: any) => {
      const prevField = prev?.[fieldName];
      const currentObj = (typeof prevField === 'object' && prevField !== null && !Array.isArray(prevField))
        ? { ...prevField }
        : { uz: typeof prevField === 'string' ? prevField : '', ru: '' };

      currentObj[aboutLang] = value;

      return {
        ...prev,
        [fieldName]: currentObj
      };
    });
  };

  // Har bir til uchun afzalliklar ro'yxatini alohida xavfsiz olish
  const getBenefitsList = (): string[] => {
    const raw = (aboutContent as any)?.benefits;
    if (!raw) return [];
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      return Array.isArray(raw[aboutLang]) ? raw[aboutLang] : [];
    }
    if (Array.isArray(raw)) {
      return aboutLang === 'uz' ? raw : [];
    }
    return [];
  };

  const currentBenefits = getBenefitsList();

  // Afzallik bandini o'zgartirish
  const handleBenefitChange = (index: number, val: string) => {
    setAboutContent((prev: any) => {
      const raw = prev?.benefits;
      let uzList: string[] = [];
      let ruList: string[] = [];

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        uzList = Array.isArray(raw.uz) ? [...raw.uz] : [];
        ruList = Array.isArray(raw.ru) ? [...raw.ru] : [];
      } else if (Array.isArray(raw)) {
        uzList = [...raw];
      }

      if (aboutLang === 'uz') {
        uzList[index] = val;
      } else {
        ruList[index] = val;
      }

      return {
        ...prev,
        benefits: {
          uz: uzList,
          ru: ruList
        }
      };
    });
  };

  // Yangi afzallik bandini qo'shish
  const handleAddBenefit = () => {
    setAboutContent((prev: any) => {
      const raw = prev?.benefits;
      let uzList: string[] = [];
      let ruList: string[] = [];

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        uzList = Array.isArray(raw.uz) ? [...raw.uz] : [];
        ruList = Array.isArray(raw.ru) ? [...raw.ru] : [];
      } else if (Array.isArray(raw)) {
        uzList = [...raw];
      }

      if (aboutLang === 'uz') {
        uzList.push('');
      } else {
        ruList.push('');
      }

      return {
        ...prev,
        benefits: {
          uz: uzList,
          ru: ruList
        }
      };
    });
  };

  // Afzallik bandini o'chirish
  const handleRemoveBenefit = (index: number) => {
    setAboutContent((prev: any) => {
      const raw = prev?.benefits;
      let uzList: string[] = [];
      let ruList: string[] = [];

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        uzList = Array.isArray(raw.uz) ? [...raw.uz] : [];
        ruList = Array.isArray(raw.ru) ? [...raw.ru] : [];
      } else if (Array.isArray(raw)) {
        uzList = [...raw];
      }

      if (aboutLang === 'uz') {
        uzList.splice(index, 1);
      } else {
        ruList.splice(index, 1);
      }

      return {
        ...prev,
        benefits: {
          uz: uzList,
          ru: ruList
        }
      };
    });
  };

  // Ta'minot bosqichlarini xavfsiz olish
  const supplySteps = (aboutContent as any)?.supplySteps || [
    { stage: 'MAXTRON SUPPLY STAGE 01', title: { uz: '', ru: '' }, desc: { uz: '', ru: '' } },
    { stage: 'MAXTRON SUPPLY STAGE 02', title: { uz: '', ru: '' }, desc: { uz: '', ru: '' } },
    { stage: 'MAXTRON SUPPLY STAGE 03', title: { uz: '', ru: '' }, desc: { uz: '', ru: '' } },
    { stage: 'MAXTRON SUPPLY STAGE 04', title: { uz: '', ru: '' }, desc: { uz: '', ru: '' } }
  ];

  const handleSupplyStepChange = (index: number, field: 'title' | 'desc', val: string) => {
    setAboutContent((prev: any) => {
      const currentSteps = prev?.supplySteps || supplySteps;
      const updated = currentSteps.map((s: any, idx: number) => {
        if (idx !== index) return s;
        const currentObj = typeof s[field] === 'object' && s[field] !== null ? { ...s[field] } : { uz: '', ru: '' };
        currentObj[aboutLang] = val;
        return {
          ...s,
          [field]: currentObj
        };
      });
      return { ...prev, supplySteps: updated };
    });
  };

  // SEO sozlamalarini yangilash
  const aboutSeo = (pageSeoSettings?.about || {}) as any;

  const handleSeoChange = (field: string, value: string) => {
    setPageSeoSettings((prev: any) => {
      const currentAbout = prev?.about || {};
      const currentObj = typeof currentAbout[field] === 'object' && currentAbout[field] !== null
        ? { ...currentAbout[field] }
        : { uz: '', ru: '' };

      currentObj[aboutLang] = value;

      return {
        ...prev,
        about: {
          ...currentAbout,
          [field]: currentObj
        }
      };
    });
  };

  return (
    <form onSubmit={handleSaveAbout} className="space-y-6">
      
      {/* Tillarni tanlash va saqlash tugmasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-3xl border border-gray-800">
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
          {[
            { code: 'uz' as const, label: "🇺🇿 O'zbekcha" },
            { code: 'ru' as const, label: "🇷🇺 Русский" }
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setAboutLang(lang.code)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                aboutLang === lang.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Sozlamalarni saqlash</span>
        </button>
      </div>

      {/* 1. HERO BANNER BLOKI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>1. Asosiy banner (Hero) ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Beydj / Yuqori qismdagi yozuv ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="MAXTRON Industrial Supply & Trading"
              value={getVal(aboutContent.heroBadge)}
              onChange={(e) => handleTextChange('heroBadge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Asosiy sarlavha H1 ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder={aboutLang === 'uz' ? "Sanoat va o'lchov uskunalari ishonchli ta'minoti" : "Ведущий поставщик измерительного оборудования"}
              value={getVal(aboutContent.heroTitle)}
              onChange={(e) => handleTextChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Sarlavha ostidagi qisqacha tavsif ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder={aboutLang === 'uz' ? "O'zbekiston bo'ylab to'g'ridan-to'g'ri import va rasmiy kafolat..." : "Надежный национальный поставщик сертифицированных приборов..."}
              value={getVal(aboutContent.heroSubtitle)}
              onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. KOMPANIYA HAQIDA, AFZALLIKLAR VA STATISTIKA */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>2. Kompaniya haqida, afzalliklar va ko'rsatkichlar ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Kompaniya tarixi sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "O'zbekiston sanoat korxonalari uchun ishonchli ta'minot hamkori" : "Надежный поставщик измерительного оборудования для предприятий Узбекистана"}
              value={getVal(aboutContent.storyTitle)}
              onChange={(e) => handleTextChange('storyTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Kompaniya tavsifi matni ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              placeholder={aboutLang === 'uz' ? "MAXTRON — O'zbekiston sanoat korxonalari uchun zamonaviy uskunalar yetkazib beradi..." : "Компания с 2018 года поставляет предприятиям необходимое оборудование..."}
              value={getVal(aboutContent.storyText)}
              onChange={(e) => handleTextChange('storyText', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Tugmalar matnlari */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Moviy tugma matni ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Katalogni ko'rish" : "Смотреть каталог"}
                value={getVal((aboutContent as any)?.btnCatalogText)}
                onChange={(e) => handleTextChange('btnCatalogText', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Qora tugma matni ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Sertifikatlar" : "Сертификаты"}
                value={getVal((aboutContent as any)?.btnCertsText)}
                onChange={(e) => handleTextChange('btnCertsText', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Afzalliklar / Cheklist */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-300">
                Afzalliklar / Belgili ro'yxat ({aboutLang.toUpperCase()})
              </label>
              <button
                type="button"
                onClick={handleAddBenefit}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Band qo'shish ({aboutLang.toUpperCase()})</span>
              </button>
            </div>

            {currentBenefits.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-950/40 border border-dashed border-gray-800 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {aboutLang === 'uz' ? "Hozircha o'zbekcha afzalliklar bandi qo'shilmagan." : "Пока нет пунктов преимуществ на русском языке."}
                </p>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{aboutLang === 'uz' ? "Birinchi bandni qo'shish" : "Добавить первый пункт"}</span>
                </button>
              </div>
            ) : (
              currentBenefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <input
                    type="text"
                    value={b || ''}
                    onChange={(e) => handleBenefitChange(idx, e.target.value)}
                    placeholder={aboutLang === 'uz' ? `Afzallik ${idx + 1}` : `Преимущество ${idx + 1}`}
                    className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-2 text-gray-500 hover:text-rose-400 transition cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 4 ta Statistika ko'rsatkichlari (SONI HAM, YOZUVI HAM HAR BIR TIL UCHUN ALOHIDA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            {/* 1. Tajriba */}
            <div className="space-y-2 p-3 rounded-2xl bg-gray-950 border border-gray-800">
              <label className="block text-[11px] font-semibold text-gray-300">
                Tajriba (soni) ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "8+ yil" : "8+ лет"}
                value={getVal(aboutContent.yearsExp)}
                onChange={(e) => handleTextChange('yearsExp', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <label className="block text-[11px] font-semibold text-gray-400">
                Yozuvi ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Bozordagi faoliyat" : "Опыт на рынке Узбекистана"}
                value={getVal((aboutContent as any)?.statExpLabel)}
                onChange={(e) => handleTextChange('statExpLabel', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* 2. Yetkazilgan uskunalar */}
            <div className="space-y-2 p-3 rounded-2xl bg-gray-950 border border-gray-800">
              <label className="block text-[11px] font-semibold text-gray-300">
                Yetkazilgan (soni) ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder="1,500+"
                value={getVal(aboutContent.equipmentDelivered)}
                onChange={(e) => handleTextChange('equipmentDelivered', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <label className="block text-[11px] font-semibold text-gray-400">
                Yozuvi ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Yetkazilgan uskunalar" : "Поставлено единиц оборудования"}
                value={getVal((aboutContent as any)?.statDeliveredLabel)}
                onChange={(e) => handleTextChange('statDeliveredLabel', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* 3. Omborda */}
            <div className="space-y-2 p-3 rounded-2xl bg-gray-950 border border-gray-800">
              <label className="block text-[11px] font-semibold text-gray-300">
                Omborda (soni) ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder="200+"
                value={getVal(aboutContent.warehouseItems)}
                onChange={(e) => handleTextChange('warehouseItems', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <label className="block text-[11px] font-semibold text-gray-400">
                Yozuvi ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Toshkent omborida mavjud" : "Моделей на складе в Ташкенте"}
                value={getVal((aboutContent as any)?.statWarehouseLabel)}
                onChange={(e) => handleTextChange('statWarehouseLabel', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* 4. Mijozlar */}
            <div className="space-y-2 p-3 rounded-2xl bg-gray-950 border border-gray-800">
              <label className="block text-[11px] font-semibold text-gray-300">
                Mijozlar (soni) ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder="500+"
                value={getVal(aboutContent.partnerClients)}
                onChange={(e) => handleTextChange('partnerClients', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <label className="block text-[11px] font-semibold text-gray-400">
                Yozuvi ({aboutLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder={aboutLang === 'uz' ? "Hamkor korxonalar" : "Постоянных клиентов и заводов"}
                value={getVal((aboutContent as any)?.statPartnersLabel)}
                onChange={(e) => handleTextChange('statPartnersLabel', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUPPLY MODEL */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-400" />
          <span>3. Ta'minot zanjiri / Supply Model ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Ta'minot bloki sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Ta'minot va savdo jarayoni qanday ishlaydi?" : "Как устроена система поставок MAXTRON?"}
              value={getVal((aboutContent as any)?.supplySectionTitle)}
              onChange={(e) => handleTextChange('supplySectionTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Ta'minot bloki ostki sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Zavoddan to korxonangiz omborigacha shaffof ta'minot zanjiri" : "Прозрачная и надежная цепочка поставок"}
              value={getVal((aboutContent as any)?.supplySectionSubtitle)}
              onChange={(e) => handleTextChange('supplySectionSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {supplySteps.map((step: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
              <span className="text-[10px] font-mono font-bold text-blue-400">
                {step.stage || `MAXTRON SUPPLY STAGE 0${idx + 1}`}
              </span>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Bosqich nomi</label>
                <input
                  type="text"
                  value={getVal(step.title)}
                  onChange={(e) => handleSupplyStepChange(idx, 'title', e.target.value)}
                  placeholder={aboutLang === 'uz' ? `${idx + 1}-bosqich nomi` : `Название этапа ${idx + 1}`}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Bosqich tavsifi</label>
                <textarea
                  rows={2}
                  value={getVal(step.desc)}
                  onChange={(e) => handleSupplyStepChange(idx, 'desc', e.target.value)}
                  placeholder={aboutLang === 'uz' ? `${idx + 1}-bosqich tavsifi` : `Описание этапа ${idx + 1}`}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. HAMKORLAR VA MIJOZLAR */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>4. Hamkorlar va mijozlar bo'limi ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Bo'lim sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Mijozlarimiz va rasmiy hamkorlar" : "Наши клиенты и партнеры"}
              value={getVal((aboutContent as any)?.partnersTitle)}
              onChange={(e) => handleTextChange('partnersTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Bo'lim ostki sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Katta sanoat korxonalari MAXTRON ta'minotiga ishonadi" : "Крупнейшие холдинги доверяют поставкам MAXTRON"}
              value={getVal((aboutContent as any)?.partnersSubtitle)}
              onChange={(e) => handleTextChange('partnersSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 5. CTA BANNER */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-yellow-400" />
          <span>5. Pastki murojaat banneri (CTA) ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Banner sarlavhasi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Loyihangiz uchun uskunalar kerakmi?" : "Требуется оборудование под ваш проект?"}
              value={getVal((aboutContent as any)?.ctaTitle)}
              onChange={(e) => handleTextChange('ctaTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-yellow-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Banner tavsifi ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Bizga texnik topshirig'ingizni yuboring..." : "Отправьте нам техническое задание..."}
              value={getVal((aboutContent as any)?.ctaSubtitle)}
              onChange={(e) => handleTextChange('ctaSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* 6. SEO & OPENGRAPH */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>6. SEO & OpenGraph sozlamalari ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Meta Title ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "Kompaniya haqida — MAXTRON Industrial" : "О компании — MAXTRON Industrial Supply"}
              value={getVal(aboutSeo.title || aboutSeo.metaTitle)}
              onChange={(e) => handleSeoChange('title', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Meta Description ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder={aboutLang === 'uz' ? "MAXTRON — O'zbekiston sanoat korxonalari uchun ishonchli ta'minotchi." : "MAXTRON — Надежный поставщик измерительного оборудования."}
              value={getVal(aboutSeo.description || aboutSeo.metaDescription)}
              onChange={(e) => handleSeoChange('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Kalit so'zlar / Keywords ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "maxtron kompaniyasi, ulchov asboblari" : "о компании maxtron, измерительные приборы"}
              value={getVal(aboutSeo.keywords)}
              onChange={(e) => handleSeoChange('keywords', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>OpenGraph Title ({aboutLang.toUpperCase()})</span>
            </label>
            <input
              type="text"
              placeholder={aboutLang === 'uz' ? "MAXTRON Industrial — Biz haqimizda" : "MAXTRON Industrial — О компании"}
              value={getVal(aboutSeo.ogTitle)}
              onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* OG Rasm */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>OpenGraph rasmi</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">1200x630 px</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 flex justify-center">
                <div className="w-32 h-20 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden flex items-center justify-center relative">
                  {aboutSeo.ogImage ? (
                    <img src={aboutSeo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  )}

                  {isUploadingOg && (
                    <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-2">
                <input 
                  type="file" 
                  ref={ogInputRef} 
                  onChange={handleOgImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingOg}
                    onClick={() => ogInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingOg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Rasm yuklash</span>
                  </button>

                  {aboutSeo.ogImage && (
                    <button
                      type="button"
                      onClick={() => setPageSeoSettings((prev) => ({ ...prev, about: { ...prev.about, ogImage: '' } }))}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                      title="Tozalash"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Yoki rasm havolasi..."
                  value={aboutSeo.ogImage || ''}
                  onChange={(e) => setPageSeoSettings((prev) => ({ ...prev, about: { ...prev.about, ogImage: e.target.value } }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saqlash tugmasi */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>«Biz haqimizda» sozlamalarini saqlash</span>
        </button>
      </div>

    </form>
  );
};