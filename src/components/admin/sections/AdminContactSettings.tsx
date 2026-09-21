"use client";

import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Phone, 
  Send, 
  Globe, 
  Clock, 
  Landmark, 
  Instagram, 
  Headphones,
  Sparkles,
  Share2,
  ImageIcon,
  Upload,
  Loader2,
  Trash,
  MessageSquare,
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react';
import { ContactSettings, PageSeoSettings, LocalizedString } from '@/types';
import { ApiService } from '@/services/api';

interface AdminContactSettingsProps {
  contactSettings: ContactSettings;
  setContactSettings: React.Dispatch<React.SetStateAction<ContactSettings>>;
  pageSeoSettings?: PageSeoSettings;
  setPageSeoSettings?: React.Dispatch<React.SetStateAction<PageSeoSettings>>;
  handleSaveContact: (e: React.FormEvent) => void;
}

export const AdminContactSettings: React.FC<AdminContactSettingsProps> = ({
  contactSettings,
  setContactSettings,
  pageSeoSettings,
  setPageSeoSettings,
  handleSaveContact
}) => {
  const [contactLang, setContactLang] = useState<'uz' | 'ru'>('ru');
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const ogInputRef = useRef<HTMLInputElement>(null);

  // OG Rasm yuklash
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Rasm hajmi 20 MB dan oshmasligi kerak!');
      return;
    }

    try {
      setIsUploadingOg(true);
      const url = await ApiService.uploadFile(file);
      setPageSeoSettings?.((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          ogImage: url
        }
      }));
    } catch (err: any) {
      alert('OG rasm yuklashda xatolik: ' + (err?.message || 'Server xatosi'));
    } finally {
      setIsUploadingOg(false);
    }
  };

  // Matnli (LocalizedString) maydonlarni yangilash
  const handleTextChange = (field: keyof ContactSettings, value: string) => {
    setContactSettings((prev) => ({
      ...prev,
      [field]: {
        ...((prev[field] as LocalizedString) || { uz: '', ru: '' }),
        [contactLang]: value
      }
    }));
  };

  // Oddiy maydonlarni yangilash
  const handleSimpleChange = (field: keyof ContactSettings, value: string) => {
    setContactSettings((prev) => ({ ...prev, [field]: value }));
  };

  // SEO maydonlarini yangilash
  const contactSeo = (pageSeoSettings?.contact || {}) as any;

  const handleSeoChange = (field: string, value: string) => {
    setPageSeoSettings?.((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: {
          ...(prev.contact as any)?.[field],
          [contactLang]: value
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSaveContact} className="space-y-6">
      
      {/* Til Switcheri & Saqlash */}
      <div className="flex items-center justify-between bg-gray-900/80 p-4 rounded-3xl border border-gray-800">
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
          {[
            { code: 'ru' as const, label: '🇷🇺 Русский' },
            { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setContactLang(lang.code)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                contactLang === lang.code
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
          <span>Saqlash</span>
        </button>
      </div>

      {/* 1. HERO MATNLARI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Headphones className="w-4 h-4 text-blue-400" />
          <span>1. Sarlavha va Kirish matni ({contactLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">nishon / Badge ({contactLang.toUpperCase()})</label>
            <input
              type="text"
              placeholder={contactLang === 'ru' ? "24/7 Поддержка" : "24/7 Muloqot"}
              value={contactSettings.badge?.[contactLang] || ''}
              onChange={(e) => handleTextChange('badge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Bosh sarlavha ({contactLang.toUpperCase()})</label>
            <input
              type="text"
              placeholder={contactLang === 'ru' ? "Свяжитесь с нами и сервисные центры" : "Biz bilan bog‘laning va servis markazlari"}
              value={contactSettings.heroTitle?.[contactLang] || ''}
              onChange={(e) => handleTextChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Qisqacha izoh / Subtitle ({contactLang.toUpperCase()})</label>
            <textarea
              rows={2}
              placeholder={contactLang === 'ru' ? "Наши сертифицированные инженеры помогут подобрать оборудование..." : "Sertifikatlangan muhandislarimiz uskuna tanlashda yordam beradi."}
              value={contactSettings.heroSubtitle?.[contactLang] || ''}
              onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. BOSH OFIS MANZILI VA ISH TARTIBI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>2. Ofis manzili va Ish tartibi ({contactLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Ofis manzili ({contactLang.toUpperCase()})</label>
            <input
              type="text"
              placeholder={contactLang === 'ru' ? "г. Ташкент..." : "Toshkent sh., Yunusobod tumani..."}
              value={contactSettings.address?.[contactLang] || ''}
              onChange={(e) => handleTextChange('address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ish tartibi ({contactLang.toUpperCase()})</span>
            </label>
            <input
              type="text"
              placeholder={contactLang === 'ru' ? "Понедельник — Суббота..." : "Dushanba — Shanba..."}
              value={contactSettings.workingHours?.[contactLang] || ''}
              onChange={(e) => handleTextChange('workingHours', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 3. TELEFONLAR VA EMAIL */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>3. Aloqa telefonlari va Pochta</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Asosiy telefon</label>
            <input
              type="text"
              placeholder="+998 71 200-88-44"
              value={contactSettings.phone || ''}
              onChange={(e) => handleSimpleChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tezkor bo‘lim telefoni</label>
            <input
              type="text"
              placeholder="+998 90 999-88-44"
              value={contactSettings.fastPhone || contactSettings.phoneSecondary || ''}
              onChange={(e) => {
                handleSimpleChange('fastPhone', e.target.value);
                handleSimpleChange('phoneSecondary', e.target.value);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Elektron pochta (Email)</label>
            <input
              type="email"
              placeholder="sales@maxtron.uz"
              value={contactSettings.email || ''}
              onChange={(e) => handleSimpleChange('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-mono focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 4. IJTIMOIY TARMOQLAR */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span>4. Ijtimoiy tarmoqlar va Messenjerlar</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Telegram havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://t.me/maxtron_uz"
              value={contactSettings.telegramUrl || ''}
              onChange={(e) => handleSimpleChange('telegramUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-rose-400" />
              <span>Instagram havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://instagram.com/maxtron.uz"
              value={contactSettings.instagramUrl || ''}
              onChange={(e) => handleSimpleChange('instagramUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://wa.me/998909998844"
              value={contactSettings.whatsappUrl || ''}
              onChange={(e) => handleSimpleChange('whatsappUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5 text-blue-500" />
              <span>Facebook havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://facebook.com/maxtron.uz"
              value={contactSettings.facebookUrl || ''}
              onChange={(e) => handleSimpleChange('facebookUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-sky-400" />
              <span>LinkedIn havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://linkedin.com/company/maxtron"
              value={contactSettings.linkedinUrl || ''}
              onChange={(e) => handleSimpleChange('linkedinUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube havolasi</span>
            </label>
            <input
              type="text"
              placeholder="https://youtube.com/@maxtron"
              value={contactSettings.youtubeUrl || ''}
              onChange={(e) => handleSimpleChange('youtubeUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* 5. BANK VA KORXONA REKVIZITLARI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          <span>5. Bank va korxona rekvizitlari</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-300 mb-1">MChJ (Korxona nomi)</label>
            <input
              type="text"
              placeholder="«MAXTRON INDUSTRIAL GROUP»"
              value={contactSettings.companyLegalName || ''}
              onChange={(e) => handleSimpleChange('companyLegalName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:border-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">STIR (INN)</label>
            <input
              type="text"
              placeholder="308991204"
              value={contactSettings.inn || ''}
              onChange={(e) => handleSimpleChange('inn', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">MFO</label>
            <input
              type="text"
              placeholder="00417"
              value={contactSettings.mfo || ''}
              onChange={(e) => handleSimpleChange('mfo', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Hisob-raqami (H/R)</label>
            <input
              type="text"
              placeholder="20208000700001234567"
              value={contactSettings.bankAccount || ''}
              onChange={(e) => handleSimpleChange('bankAccount', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">QQS to‘lovchisi kodi</label>
            <input
              type="text"
              placeholder="308991204/12"
              value={contactSettings.vatNumber || ''}
              onChange={(e) => handleSimpleChange('vatNumber', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 6. SEO & OPENGRAPH META SOZLAMALARI */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>6. SEO & OpenGraph sozlamalari ({contactLang.toUpperCase()})</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Meta Title ({contactLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder={contactLang === 'ru' ? "Контакты — MAXTRON" : "Aloqa — MAXTRON"}
              value={contactSeo.title?.[contactLang] || contactSeo.metaTitle?.[contactLang] || ''}
              onChange={(e) => handleSeoChange('title', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Meta Description ({contactLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              placeholder={contactLang === 'ru' ? "Свяжитесь с MAXTRON..." : "MAXTRON bilan bog‘laning..."}
              value={contactSeo.description?.[contactLang] || contactSeo.metaDescription?.[contactLang] || ''}
              onChange={(e) => handleSeoChange('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Keywords ({contactLang.toUpperCase()})
            </label>
            <input
              type="text"
              placeholder="maxtron aloqa, telefon, ofis"
              value={contactSeo.keywords?.[contactLang] || ''}
              onChange={(e) => handleSeoChange('keywords', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* OpenGraph Image */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>OpenGraph Preview rasmi (Telegram / Facebook)</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">1200x630 px</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 flex justify-center">
                <div className="w-32 h-20 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden flex items-center justify-center relative">
                  {contactSeo.ogImage ? (
                    <img src={contactSeo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
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

                  {contactSeo.ogImage && (
                    <button
                      type="button"
                      onClick={() => setPageSeoSettings?.((prev) => ({ ...prev, contact: { ...prev.contact, ogImage: '' } }))}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                      title="Tozalash"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm havolasi..."
                  value={contactSeo.ogImage || ''}
                  onChange={(e) => setPageSeoSettings?.((prev) => ({ ...prev, contact: { ...prev.contact, ogImage: e.target.value } }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. XARITA (IFRAME) */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>7. Google / Yandex Maps Iframe HTML kodi</span>
        </h3>

        <textarea
          rows={3}
          placeholder='<iframe src="https://www.google.com/maps/embed?..." width="100%" height="450" ...></iframe>'
          value={contactSettings.mapIframe || ''}
          onChange={(e) => handleSimpleChange('mapIframe', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Pastki Saqlash Tugmasi */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>«Aloqa» sozlamalarini saqlash</span>
        </button>
      </div>

    </form>
  );
};