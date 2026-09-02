import React, { useState, useRef } from 'react';
import { 
  Building, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Truck,
  Users,
  ImageIcon, 
  Upload, 
  Loader2, 
  Share2,
  Trash,
  HelpCircle
} from 'lucide-react';
import { AboutContent, PageSeoSettings, LocalizedString } from '../../../types';
import { ApiService } from '../../../services/api';

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
  const [aboutLang, setAboutLang] = useState<'uz' | 'ru'>('ru');
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const ogInputRef = useRef<HTMLInputElement>(null);

  // SEO OpenGraph rasmini yuklash
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      alert('OG расм юклашда хатолик: ' + (err?.message || 'Сервер хатоси'));
    } finally {
      setIsUploadingOg(false);
    }
  };

  // Matnli (LocalizedString) maydonlarni xavfsiz yangilash
  const handleTextChange = (field: keyof AboutContent, value: string) => {
    setAboutContent((prev) => ({
      ...prev,
      [field]: {
        ...((prev[field] as LocalizedString) || { uz: '', ru: '' }),
        [aboutLang]: value
      }
    }));
  };

  // SEO maydonlarini yangilash
  const aboutSeo = (pageSeoSettings?.about || {}) as any;

  const handleSeoChange = (field: string, value: string) => {
    setPageSeoSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: {
          ...(prev.about as any)?.[field],
          [aboutLang]: value
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSaveAbout} className="space-y-6">
      
      {/* 2 ta Til Switcheri (Русский / O'zbekcha) */}
      <div className="flex items-center justify-between bg-gray-900/80 p-4 rounded-3xl border border-gray-800">
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
          {[
            { code: 'ru' as const, label: "🇷🇺 Русский" },
            { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
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
          <span>Сақлаш</span>
        </button>
      </div>

      {/* 1. HERO QISMI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>1. Асосий Hero сарлавҳалари ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Белги / Badge ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="MAXTRON Industrial Supply & Trading"
              value={aboutContent.heroBadge?.[aboutLang] || ''}
              onChange={(e) => handleTextChange('heroBadge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Катта Бош Сарлавҳа ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder="Ведущий поставщик измерительного оборудования в промышленности"
              value={aboutContent.heroTitle?.[aboutLang] || ''}
              onChange={(e) => handleTextChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Қисқача таъриф / Hero Subtitle ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder="MAXTRON — высокое качество, метрологическая гарантия и профессиональные инженерные решения."
              value={aboutContent.heroSubtitle?.[aboutLang] || ''}
              onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. KOMPANIYA TAVSIFI VA 4 TA STATISTIKA */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>2. Компания ҳақида матн ва 4 та статистика ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Блок Сарлавҳаси ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="Надежный поставщик измерительного оборудования для предприятий Узбекистана"
              value={aboutContent.storyTitle?.[aboutLang] || ''}
              onChange={(e) => handleTextChange('storyTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Асосий таъриф матни ({aboutLang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              placeholder="Компания с 2018 года поставляет предприятиям необходимое измерительное оборудование."
              value={aboutContent.storyText?.[aboutLang] || ''}
              onChange={(e) => handleTextChange('storyText', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 4 ta Statistika */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Тажриба (рақам)</label>
              <input
                type="text"
                placeholder="8+"
                value={aboutContent.yearsExp || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, yearsExp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-gray-500">Опыт на рынке Узбекистана</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Етказилган (рақам)</label>
              <input
                type="text"
                placeholder="1,500+"
                value={aboutContent.equipmentDelivered || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, equipmentDelivered: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-gray-500">Поставлено единиц</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Омборда (рақам)</label>
              <input
                type="text"
                placeholder="200+"
                value={aboutContent.warehouseItems || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, warehouseItems: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-gray-500">Моделей на складе</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Мижозлар (рақам)</label>
              <input
                type="text"
                placeholder="500+"
                value={aboutContent.partnerClients || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, partnerClients: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-gray-500">Постоянных клиентов</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEO & OPENGRAPH META SOZLAMALARI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>3. SEO & OpenGraph созламалари ({aboutLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Meta Title ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="О компании — MAXTRON Industrial Supply"
              value={aboutSeo.title?.[aboutLang] || aboutSeo.metaTitle?.[aboutLang] || ''}
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
              placeholder="MAXTRON — Надежный поставщик измерительного оборудования для предприятий Узбекистана."
              value={aboutSeo.description?.[aboutLang] || aboutSeo.metaDescription?.[aboutLang] || ''}
              onChange={(e) => handleSeoChange('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Калит сўзлар / Keywords ({aboutLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="о компании maxtron, измерительные приборы, склад ташкент"
              value={aboutSeo.keywords?.[aboutLang] || ''}
              onChange={(e) => handleSeoChange('keywords', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>OpenGraph Title (Telegram / Facebook) ({aboutLang.toUpperCase()})</span>
            </label>
            <input
              type="text"
              placeholder="MAXTRON Industrial — О компании"
              value={aboutSeo.ogTitle?.[aboutLang] || ''}
              onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* OpenGraph Image */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>OpenGraph Preview расми (Telegram / Facebook баннери)</span>
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
                <input type="file" ref={ogInputRef} onChange={handleOgImageUpload} accept="image/*" className="hidden" />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingOg}
                    onClick={() => ogInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingOg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Расм юклаш</span>
                  </button>

                  {aboutSeo.ogImage && (
                    <button
                      type="button"
                      onClick={() => setPageSeoSettings((prev) => ({ ...prev, about: { ...prev.about, ogImage: '' } }))}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                      title="Тозалаш"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Ёки тўғридан-тўғри расм ҳаволаси..."
                  value={aboutSeo.ogImage || ''}
                  onChange={(e) => setPageSeoSettings((prev) => ({ ...prev, about: { ...prev.about, ogImage: e.target.value } }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pastki Saqlash Tugmasi */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>«Биз ҳақимизда» созламаларини сақлаш</span>
        </button>
      </div>

    </form>
  );
};