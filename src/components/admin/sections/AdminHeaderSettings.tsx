"use client";

import React, { useState } from 'react';
import { Layout, Save, Upload, Phone, Clock, MapPin, Truck, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { HeaderSettings } from '../../../types';

interface AdminHeaderSettingsProps {
  headerSettings: HeaderSettings;
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveHeader: (e: React.FormEvent) => void;
}

export const AdminHeaderSettings: React.FC<AdminHeaderSettingsProps> = ({
  headerSettings,
  setHeaderSettings,
  handleLogoUpload,
  handleSaveHeader
}) => {
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  // Faviconni serverga fayl sifatida yuklab, bazaga URL yozish funksiyasi
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFavicon(true);
      const formData = new FormData();
      formData.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('maxtron_token') : null;
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setHeaderSettings((prev) => ({ ...prev, faviconUrl: data.url }));
      }
    } catch {
      // Server yuklay olmasa o'tkazib yuboramiz
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  return (
    <form onSubmit={handleSaveHeader} className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-3xl border border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layout className="w-6 h-6 text-emerald-400" />
            <span>Header va Logotip sozlamalari</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Saytning yuqori qismi (Header, TopBar, Logotip va Favicon) ma'lumotlari (MariaDB)
          </p>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Saqlash</span>
        </button>
      </div>

      {/* LOGOTIP VA SARLAVHA */}
      <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Logotip va Sarlavha</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Logotip rasmi</label>
            <div className="flex items-center gap-4">
              {headerSettings.logoImageUrl ? (
                <div className="relative flex items-center gap-2">
                  <img
                    src={headerSettings.logoImageUrl}
                    alt="Logo Preview"
                    className="h-14 w-auto max-w-[180px] object-contain bg-gray-950 p-2 rounded-xl border border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setHeaderSettings({ ...headerSettings, logoImageUrl: '' })}
                    className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                    title="Logotipni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-14 w-32 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-center text-xs text-gray-500">
                  Rasm yo'q
                </div>
              )}
              <label className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium cursor-pointer transition flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Yuklash</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Logo matni (Brend nomi)</label>
            <input
              type="text"
              value={headerSettings.logoText || ''}
              onChange={(e) => setHeaderSettings({ ...headerSettings, logoText: e.target.value })}
              placeholder="MAXTRON"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Logotip rasm URL manzili</label>
          <input
            type="text"
            value={headerSettings.logoImageUrl || ''}
            onChange={(e) => setHeaderSettings({ ...headerSettings, logoImageUrl: e.target.value })}
            placeholder="/uploads/logo.png"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* 2 Tilda Logo Tagline */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-gray-400">Logotip ostidagi shior (Tagline)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-gray-400 mb-1 block">🇺🇿 O'zbekcha (Lotin)</span>
              <input
                type="text"
                value={headerSettings.logoSubtitle?.uz || ''}
                onChange={(e) =>
                  setHeaderSettings({
                    ...headerSettings,
                    logoSubtitle: { ...headerSettings.logoSubtitle, uz: e.target.value }
                  })
                }
                placeholder="O'lchov va nazorat uskunalari"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 mb-1 block">🇷🇺 Русский</span>
              <input
                type="text"
                value={headerSettings.logoSubtitle?.ru || ''}
                onChange={(e) =>
                  setHeaderSettings({
                    ...headerSettings,
                    logoSubtitle: { ...headerSettings.logoSubtitle, ru: e.target.value }
                  })
                }
                placeholder="Контрольно-измерительные приборы"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FAVICON SOZLAMASI */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>Sayt Ikonchasi (Favicon)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-gray-950 border border-gray-800 rounded-2xl min-h-[120px]">
            {headerSettings.faviconUrl ? (
              <div className="relative group w-full flex flex-col items-center">
                <img
                  src={headerSettings.faviconUrl}
                  alt="Favicon"
                  className="w-10 h-10 object-contain p-1 bg-gray-900 rounded-xl border border-gray-800"
                />
                <span className="text-[10px] text-emerald-400 mt-2 font-mono">Favicon faol</span>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-xs text-gray-500">Favicon yuklanmagan</span>
              </div>
            )}
          </div>

          <div className="md:col-span-8 space-y-3">
            <input
              type="file"
              id="faviconInput"
              accept="image/png, image/x-icon, image/vnd.microsoft.icon"
              onChange={handleFaviconUpload}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={isUploadingFavicon}
                onClick={() => document.getElementById('faviconInput')?.click()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isUploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploadingFavicon ? 'Yuklanmoqda...' : 'Favicon yuklash (ICO yoki PNG)'}</span>
              </button>

              {headerSettings.faviconUrl && (
                <button
                  type="button"
                  onClick={() => setHeaderSettings({ ...headerSettings, faviconUrl: '' })}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>O‘chirish</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Favicon URL manzili</label>
              <input
                type="text"
                value={headerSettings.faviconUrl || ''}
                onChange={(e) => setHeaderSettings({ ...headerSettings, faviconUrl: e.target.value })}
                placeholder="/uploads/favicon.png"
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR MA'LUMOTLARI */}
      <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>TopBar — Yuqori xabarlar paneli</span>
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Omborxona va Mavjudlik matni</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={headerSettings.topbarWarehouse?.uz || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarWarehouse: { ...headerSettings.topbarWarehouse, uz: e.target.value }
                })
              }
              placeholder="🇺🇿 Toshkent omborida mavjud"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={headerSettings.topbarWarehouse?.ru || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarWarehouse: { ...headerSettings.topbarWarehouse, ru: e.target.value }
                })
              }
              placeholder="🇷🇺 В наличии на складе в Ташкенте"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yetkazib berish matni</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={headerSettings.topbarDelivery?.uz || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarDelivery: { ...headerSettings.topbarDelivery, uz: e.target.value }
                })
              }
              placeholder="🇺🇿 Butun O'zbekiston bo'ylab yetkazish"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={headerSettings.topbarDelivery?.ru || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarDelivery: { ...headerSettings.topbarDelivery, ru: e.target.value }
                })
              }
              placeholder="🇷🇺 Доставка по всему Узбекистану"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ish vaqti</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={headerSettings.topbarSchedule?.uz || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarSchedule: { ...headerSettings.topbarSchedule, uz: e.target.value }
                })
              }
              placeholder="🇺🇿 Dush-Jum: 09:00 - 18:00"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={headerSettings.topbarSchedule?.ru || ''}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  topbarSchedule: { ...headerSettings.topbarSchedule, ru: e.target.value }
                })
              }
              placeholder="🇷🇺 Пн-Пт: 09:00 - 18:00"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ALOQA MA'LUMOTLARI */}
      <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Aloqa raqamlari va Elektron pochta</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Asosiy telefon</label>
            <input
              type="text"
              value={headerSettings.phonePrimary || ''}
              onChange={(e) => setHeaderSettings({ ...headerSettings, phonePrimary: e.target.value })}
              placeholder="+998 71 200 00 00"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Qo'shimcha telefon</label>
            <input
              type="text"
              value={headerSettings.phoneSecondary || ''}
              onChange={(e) => setHeaderSettings({ ...headerSettings, phoneSecondary: e.target.value })}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Elektron pochta (Email)</label>
            <input
              type="email"
              value={headerSettings.email || ''}
              onChange={(e) => setHeaderSettings({ ...headerSettings, email: e.target.value })}
              placeholder="info@maxtron.uz"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
};