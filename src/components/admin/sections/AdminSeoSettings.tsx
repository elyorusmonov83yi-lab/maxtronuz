import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Download } from 'lucide-react';
import { SeoSettings } from '../../../types';

interface AdminSeoSettingsProps {
  seoSettings: SeoSettings;
  setSeoSettings: React.Dispatch<React.SetStateAction<SeoSettings>>;
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
  return (
    <form onSubmit={handleSaveSeo} className="space-y-6">
      
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>SEO & Қидирув Тизимлари Верификацияси</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Google Search Console Tag</label>
            <input
              type="text"
              value={seoSettings.googleVerification || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, googleVerification: e.target.value })}
              placeholder="Tasdiqlash kodi (meta-tegdagi content qiymati)"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Yandex Webmaster Tag</label>
            <input
              type="text"
              value={seoSettings.yandexVerification || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, yandexVerification: e.target.value })}
              placeholder="Tasdiqlash kodi (meta-tegdagi content qiymati)"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Google Analytics ID</label>
            <input
              type="text"
              value={seoSettings.googleAnalyticsId || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Yandex Metrika ID</label>
            <input
              type="text"
              value={seoSettings.yandexMetrikaId || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, yandexMetrikaId: e.target.value })}
              placeholder="XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Асосий сайт номи (Site Name)</label>
            <input
              type="text"
              value={seoSettings.siteName || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, siteName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Standart Meta Title</label>
            <input
              type="text"
              value={seoSettings.defaultTitle || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Standart Meta Description</label>
            <input
              type="text"
              value={seoSettings.defaultDescription || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Дефолт Meta Keywords</label>
            <input
              type="text"
              value={seoSettings.defaultKeywords || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, defaultKeywords: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Sitemap & Robots Generators */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Sitemap.xml va Robots.txt Generator</span>
        </h3>
        <p className="text-xs text-gray-400">
          Sitemap mahsulot, kategoriya va e’lon qilingan sahifalar o‘zgarganida avtomatik yangilanadi. Google va Yandex uchun manzil: <span className="font-mono text-cyan-300">/sitemap.xml</span>.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={downloadSitemap}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition flex items-center gap-2 border border-gray-700"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>sitemap.xml юклаб олиш</span>
          </button>

          <button
            type="button"
            onClick={downloadRobotsTxt}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition flex items-center gap-2 border border-gray-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>robots.txt юклаб олиш</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>SEO созламаларини сақлаш</span>
        </button>
      </div>

    </form>
  );
};
