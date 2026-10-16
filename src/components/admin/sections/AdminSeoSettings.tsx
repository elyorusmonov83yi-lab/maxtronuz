"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Download, FileText, ExternalLink, Layers, Globe } from 'lucide-react';
import { SeoSettings } from '../../../types';

interface AdminSeoSettingsProps {
  seoSettings: SeoSettings & { catalog_seo?: any };
  setSeoSettings: React.Dispatch<React.SetStateAction<any>>;
  handleSaveSeo: (e: React.FormEvent) => void;
  downloadSitemap: () => void;
  downloadRobotsTxt: () => void;
}

export const AdminSeoSettings: React.FC<AdminSeoSettingsProps> = ({
  seoSettings,
  setSeoSettings,
  handleSaveSeo,
  downloadSitemap,
  downloadRobotsTxt
}) => {
  const [catalogLang, setCatalogLang] = useState<'uz' | 'ru'>('uz');

  // catalog_seo xavfsiz obyektini olish
  const catalogSeo = (seoSettings as any)?.catalog_seo || {};

  const handleCatalogChange = (field: string, value: string, lang?: 'uz' | 'ru') => {
    setSeoSettings((prev: any) => {
      const currentCatalog = prev.catalog_seo || {};
      if (lang) {
        return {
          ...prev,
          catalog_seo: {
            ...currentCatalog,
            [field]: {
              ...(currentCatalog[field] || {}),
              [lang]: value
            }
          }
        };
      }
      return {
        ...prev,
        catalog_seo: {
          ...currentCatalog,
          [field]: value
        }
      };
    });
  };

  return (
    <form onSubmit={handleSaveSeo} className="space-y-6">
      
      {/* 1. Qidiruv tizimlari verifikatsiyasi va Asosiy SEO */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>SEO & Qidiruv Tizimlari Verifikatsiyasi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Google Search Console Tag</label>
            <input
              type="text"
              value={seoSettings?.googleVerification || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, googleVerification: e.target.value })}
              placeholder="Tasdiqlash kodi (content qiymati)"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Yandex Webmaster Tag</label>
            <input
              type="text"
              value={seoSettings?.yandexVerification || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, yandexVerification: e.target.value })}
              placeholder="Tasdiqlash kodi (content qiymati)"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Google Analytics ID</label>
            <input
              type="text"
              value={seoSettings?.googleAnalyticsId || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Yandex Metrika ID</label>
            <input
              type="text"
              value={seoSettings?.yandexMetrikaId || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, yandexMetrikaId: e.target.value })}
              placeholder="XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Asosiy sayt nomi (Site Name)</label>
            <input
              type="text"
              value={seoSettings?.siteName || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, siteName: e.target.value })}
              placeholder="MAXTRON Industrial Supply & Trading"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-bold focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Standart Meta Title (Bosh sahifa)</label>
            <input
              type="text"
              value={seoSettings?.defaultTitle || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultTitle: e.target.value })}
              placeholder="MAXTRON — Sanoat va O'lchov Uskunalari"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Standart Meta Description (Bosh sahifa)</label>
            <input
              type="text"
              value={seoSettings?.defaultDescription || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescription: e.target.value })}
              placeholder="O'zbekistonda sanoat nazorat-o'lchov asboblari va datchiklar yetkazib berish..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Defolt Meta Kalit so'zlar (Keywords)</label>
            <input
              type="text"
              value={seoSettings?.defaultKeywords || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultKeywords: e.target.value })}
              placeholder="maxtron, sanoat uskunalari, datchik, manometr, toshkent"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 2. YANGI: Asosiy Katalog Sahifasi (/catalog) SEO Sozlamalari */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-emerald-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Katalog Sahifasi SEO (/catalog)</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Ushbu parametrlar asosiy <span className="text-emerald-400 font-mono">/catalog</span> sahifasining sarlavhasi va tavsifini belgilaydi
            </p>
          </div>

          {/* Til almashtirgich (UZ / RU) */}
          <div className="flex items-center gap-1 p-1 bg-gray-950 rounded-xl border border-gray-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCatalogLang('uz')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                catalogLang === 'uz'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>O‘zbekcha (UZ)</span>
            </button>
            <button
              type="button"
              onClick={() => setCatalogLang('ru')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                catalogLang === 'ru'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Русский (RU)</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Katalog Title ({catalogLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={catalogSeo.title?.[catalogLang] || ''}
              onChange={(e) => handleCatalogChange('title', e.target.value, catalogLang)}
              placeholder={catalogLang === 'uz' ? "Sanoat asboblari va uskunalari katalogi" : "Каталог промышленного оборудования и КИПиА"}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Katalog Description ({catalogLang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              value={catalogSeo.description?.[catalogLang] || ''}
              onChange={(e) => handleCatalogChange('description', e.target.value, catalogLang)}
              placeholder={
                catalogLang === 'uz'
                  ? "Barcha turdagi datchiklar, klapanlar, nasoslar va sanoat avtomatika vositalari katalogi..."
                  : "Полный перечень контрольно-измерительных приборов, насосов и запорной арматуры с доставкой по Узбекистану..."
              }
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Katalog Keywords ({catalogLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={catalogSeo.keywords?.[catalogLang] || ''}
                onChange={(e) => handleCatalogChange('keywords', e.target.value, catalogLang)}
                placeholder="uskunalar, datchik, avtomatika, maxtron"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Katalog OpenGraph Rasm URL (Banner yoki rasm havolasi)
              </label>
              <input
                type="text"
                value={catalogSeo.ogImageUrl || ''}
                onChange={(e) => handleCatalogChange('ogImageUrl', e.target.value)}
                placeholder="/images/catalog-og.jpg yoki https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dinamik Robots.txt Muharriri */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Robots.txt Qoidalari (Dinamik Boshqaruv)</span>
          </h3>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition"
          >
            <span>/robots.txt ochish</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <p className="text-xs text-gray-400">
          Bu yerdagi matn to‘g‘ridan-to‘g‘ri <span className="font-mono text-cyan-300">maxtron.uz/robots.txt</span> orqali qidiruv robotlariga beriladi.
        </p>

        <div>
          <textarea
            rows={7}
            value={seoSettings?.robotsTxt || ''}
            onChange={(e) => setSeoSettings({ ...seoSettings, robotsTxt: e.target.value })}
            placeholder={`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://maxtron.uz/sitemap.xml`}
            className="w-full px-4 py-3 rounded-2xl bg-gray-950 border border-gray-800 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500 leading-relaxed transition"
          />
        </div>
      </div>

      {/* 4. Sitemap & Fayl Eksporti */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Sitemap.xml va Favqulodda Yuklab Olish</span>
          </h3>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
          >
            <span>/sitemap.xml ochish</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-gray-400">
          Next.js App Router bazadagi barcha mahsulotlar va toifalarni inobatga olgan holda sitemapni avtomatik uzatadi. Zarurat tug‘ilsa, fayllarni qo‘lda saqlab olishingiz mumkin:
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={downloadSitemap}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition flex items-center gap-2 border border-gray-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>sitemap.xml yuklab olish</span>
          </button>

          <button
            type="button"
            onClick={downloadRobotsTxt}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition flex items-center gap-2 border border-gray-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>robots.txt yuklab olish</span>
          </button>
        </div>
      </div>

      {/* Saqlash tugmasi */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>SEO sozlamalarini saqlash</span>
        </button>
      </div>

    </form>
  );
};