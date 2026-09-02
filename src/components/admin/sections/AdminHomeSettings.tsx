import React, { useState, useRef } from 'react';
import { 
  Globe, 
  PhoneCall, 
  Search, 
  Share2, 
  Code, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon,
  BarChart3,
  ShieldAlert,
  LayoutTemplate
} from 'lucide-react';
import { HomeContent } from '../../../types';

interface AdminHomeSettingsProps {
  homeContent: HomeContent;
  setHomeContent: React.Dispatch<React.SetStateAction<HomeContent>>;
  handleSaveHome: (e: React.FormEvent) => void;
}

export const AdminHomeSettings: React.FC<AdminHomeSettingsProps> = ({
  homeContent,
  setHomeContent,
  handleSaveHome
}) => {
  const [homeLang, setHomeLang] = useState<'uz' | 'ru'>('uz');
  const [activeTab, setActiveTab] = useState<'content' | 'stats' | 'whyus' | 'sections' | 'seo' | 'og' | 'technical'>('content');
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Rasm hajmi 5 MB dan oshmasligi kerak!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        const currentOg = typeof homeContent.ogImage === 'object' ? homeContent.ogImage : {};
        setHomeContent({
          ...homeContent,
          ogImage: { ...currentOg, [homeLang]: base64 }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentOgImage = typeof homeContent.ogImage === 'object' 
    ? (homeContent.ogImage?.[homeLang] || homeContent.ogImage?.ru || homeContent.ogImage?.uz || '') 
    : (homeContent.ogImage || '');

  return (
    <form onSubmit={handleSaveHome} className="space-y-6">
      
      {/* 1. Tillar va Tablar Paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-2.5 rounded-3xl">
        
        {/* Til Tanlash */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-gray-950 border border-gray-800">
          {[
            { code: 'uz' as const, label: "🇺🇿 O'zbekcha" },
            { code: 'ru' as const, label: '🇷🇺 Русский' }
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setHomeLang(lang.code)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                homeLang === lang.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Tablar */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'content', label: 'Banner & Matn', icon: Globe },
            { id: 'stats', label: 'Statistika (4 ta)', icon: BarChart3 },
            { id: 'whyus', label: 'Nega Biz (4 ta)', icon: ShieldAlert },
            { id: 'sections', label: 'Sarlavhalar', icon: LayoutTemplate },
            { id: 'seo', label: 'SEO', icon: Search },
            { id: 'og', label: 'OpenGraph', icon: Share2 },
            { id: 'technical', label: 'Texnik', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gray-800 text-cyan-400 border border-cyan-500/30 shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ================= TAB 1: CONTENT ================= */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Bosh sahifa matnlari ({homeLang.toUpperCase()})</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hero Badge</label>
                <input
                  type="text"
                  value={homeContent.heroBadge?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    heroBadge: { ...(homeContent.heroBadge || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">H1 Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={homeContent.heroTitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    heroTitle: { ...(homeContent.heroTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white font-bold focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Qisqa tavsif / Subtitle</label>
                <textarea
                  rows={3}
                  value={homeContent.heroSubtitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    heroSubtitle: { ...(homeContent.heroSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Banner xabari / Notice</label>
                <input
                  type="text"
                  value={homeContent.bannerNotice?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    bannerNotice: { ...(homeContent.bannerNotice || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STATISTIKA (4 TA) ================= */}
      {activeTab === 'stats' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Statistika Bloklari (4 ta) ({homeLang.toUpperCase()})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1-Stat */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
              <span className="text-xs font-bold text-blue-400">1-Statistika (Mijozlar)</span>
              <input
                type="text"
                placeholder="Raqam (masalan: 500+)"
                value={homeContent.statClientsNum || ''}
                onChange={(e) => setHomeContent({ ...homeContent, statClientsNum: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Matn"
                value={homeContent.statClientsText?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  statClientsText: { ...(homeContent.statClientsText || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

            {/* 2-Stat */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
              <span className="text-xs font-bold text-blue-400">2-Statistika (Yetkazilgan)</span>
              <input
                type="text"
                placeholder="Raqam (masalan: 1,500+)"
                value={homeContent.statDevicesNum || ''}
                onChange={(e) => setHomeContent({ ...homeContent, statDevicesNum: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Matn"
                value={homeContent.statDevicesText?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  statDevicesText: { ...(homeContent.statDevicesText || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

            {/* 3-Stat */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
              <span className="text-xs font-bold text-blue-400">3-Statistika (Kafolat)</span>
              <input
                type="text"
                placeholder="Raqam (masalan: 200+)"
                value={homeContent.statWarrantyNum || ''}
                onChange={(e) => setHomeContent({ ...homeContent, statWarrantyNum: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Matn"
                value={homeContent.statWarrantyText?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  statWarrantyText: { ...(homeContent.statWarrantyText || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

            {/* 4-Stat */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
              <span className="text-xs font-bold text-blue-400">4-Statistika (Ombor/Vaqt)</span>
              <input
                type="text"
                placeholder="Raqam (masalan: 24/7)"
                value={homeContent.statSupportNum || ''}
                onChange={(e) => setHomeContent({ ...homeContent, statSupportNum: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Matn"
                value={homeContent.statSupportText?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  statSupportText: { ...(homeContent.statSupportText || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 3: NEGA BIZ (4 TA AFZALLIK) ================= */}
      {activeTab === 'whyus' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Nega Biz / Afzalliklar (4 ta) ({homeLang.toUpperCase()})</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Bo'lim Sarlavhasi</label>
              <input
                type="text"
                value={homeContent.whyUsTitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  whyUsTitle: { ...(homeContent.whyUsTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Bo'lim Tavsifi</label>
              <input
                type="text"
                value={homeContent.whyUsSubtitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  whyUsSubtitle: { ...(homeContent.whyUsSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-800">
              
              {/* Afzallik 1 */}
              <div className="space-y-2 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <span className="text-xs font-bold text-cyan-400">1-Afzallik</span>
                <input
                  type="text"
                  placeholder="Sarlavha"
                  value={homeContent.adv1Title?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv1Title: { ...(homeContent.adv1Title || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Tavsif"
                  value={homeContent.adv1Desc?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv1Desc: { ...(homeContent.adv1Desc || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
              </div>

              {/* Afzallik 2 */}
              <div className="space-y-2 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <span className="text-xs font-bold text-cyan-400">2-Afzallik</span>
                <input
                  type="text"
                  placeholder="Sarlavha"
                  value={homeContent.adv2Title?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv2Title: { ...(homeContent.adv2Title || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Tavsif"
                  value={homeContent.adv2Desc?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv2Desc: { ...(homeContent.adv2Desc || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
              </div>

              {/* Afzallik 3 */}
              <div className="space-y-2 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <span className="text-xs font-bold text-cyan-400">3-Afzallik</span>
                <input
                  type="text"
                  placeholder="Sarlavha"
                  value={homeContent.adv3Title?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv3Title: { ...(homeContent.adv3Title || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Tavsif"
                  value={homeContent.adv3Desc?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv3Desc: { ...(homeContent.adv3Desc || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
              </div>

              {/* Afzallik 4 */}
              <div className="space-y-2 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <span className="text-xs font-bold text-cyan-400">4-Afzallik</span>
                <input
                  type="text"
                  placeholder="Sarlavha"
                  value={homeContent.adv4Title?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv4Title: { ...(homeContent.adv4Title || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Tavsif"
                  value={homeContent.adv4Desc?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    adv4Desc: { ...(homeContent.adv4Desc || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SARLAVHALAR ================= */}
      {activeTab === 'sections' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-purple-400" />
            <span>Asosiy Bo'lim Sarlavhalari ({homeLang.toUpperCase()})</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Kategoriyalar Sarlavhasi</label>
              <input
                type="text"
                value={homeContent.catSectionTitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  catSectionTitle: { ...(homeContent.catSectionTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Kategoriyalar Tavsifi</label>
              <input
                type="text"
                value={homeContent.catSectionSubtitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  catSectionSubtitle: { ...(homeContent.catSectionSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Ommabop Uskunalar Sarlavhasi</label>
                <input
                  type="text"
                  value={homeContent.featuredTitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    featuredTitle: { ...(homeContent.featuredTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Ommabop Uskunalar Tavsifi</label>
                <input
                  type="text"
                  value={homeContent.featuredSubtitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    featuredSubtitle: { ...(homeContent.featuredSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">So'rovnoma / Quiz Sarlavhasi</label>
                <input
                  type="text"
                  value={homeContent.quizTitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    quizTitle: { ...(homeContent.quizTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">So'rovnoma Tavsifi</label>
                <input
                  type="text"
                  value={homeContent.quizSubtitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    quizSubtitle: { ...(homeContent.quizSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Partnerlar Sarlavhasi</label>
                <input
                  type="text"
                  value={homeContent.partnersTitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    partnersTitle: { ...(homeContent.partnersTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Partnerlar Tavsifi</label>
                <input
                  type="text"
                  value={homeContent.partnersSubtitle?.[homeLang] || ''}
                  onChange={(e) => setHomeContent({
                    ...homeContent,
                    partnersSubtitle: { ...(homeContent.partnersSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
                />
              </div>
            </div>
<div className="pt-3 border-t border-gray-800 space-y-4">
  <div className="text-xs font-bold text-emerald-400">Industrial Service (ТЗ bloki)</div>
  <div>
    <label className="block text-xs font-semibold text-gray-300 mb-1">Service Sarlavhasi</label>
    <input
      type="text"
      value={homeContent.serviceTitle?.[homeLang] || ''}
      onChange={(e) => setHomeContent({
        ...homeContent,
        serviceTitle: { ...(homeContent.serviceTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
      })}
      className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-gray-300 mb-1">Service Tavsifi</label>
    <textarea
      rows={2}
      value={homeContent.serviceSubtitle?.[homeLang] || ''}
      onChange={(e) => setHomeContent({
        ...homeContent,
        serviceSubtitle: { ...(homeContent.serviceSubtitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
      })}
      className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-gray-300 mb-1">Tugma matni (Button)</label>
    <input
      type="text"
      value={homeContent.serviceButtonText?.[homeLang] || ''}
      onChange={(e) => setHomeContent({
        ...homeContent,
        serviceButtonText: { ...(homeContent.serviceButtonText || { uz: '', ru: '' }), [homeLang]: e.target.value }
      })}
      className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
    />
  </div>
</div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: SEO ================= */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>SEO Meta Teglar ({homeLang.toUpperCase()})</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">SEO Title</label>
              <input
                type="text"
                value={homeContent.seoTitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  seoTitle: { ...(homeContent.seoTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">SEO Description</label>
              <textarea
                rows={3}
                value={homeContent.seoDescription?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  seoDescription: { ...(homeContent.seoDescription || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">SEO Keywords</label>
              <input
                type="text"
                value={homeContent.seoKeywords?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  seoKeywords: { ...(homeContent.seoKeywords || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: OPENGRAPH ================= */}
      {activeTab === 'og' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>OpenGraph Preview ({homeLang.toUpperCase()})</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">OG Title</label>
              <input
                type="text"
                value={homeContent.ogTitle?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  ogTitle: { ...(homeContent.ogTitle || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">OG Description</label>
              <textarea
                rows={2}
                value={homeContent.ogDescription?.[homeLang] || ''}
                onChange={(e) => setHomeContent({
                  ...homeContent,
                  ogDescription: { ...(homeContent.ogDescription || { uz: '', ru: '' }), [homeLang]: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>OG Rasm ({homeLang.toUpperCase()})</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4 flex justify-center">
                  <div className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center p-2">
                    {currentOgImage ? (
                      <img src={currentOgImage} alt="OG" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <input type="file" ref={ogFileInputRef} onChange={handleOgImageUpload} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => ogFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Rasm yuklash</span>
                  </button>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={currentOgImage}
                    onChange={(e) => {
                      const currentOg = typeof homeContent.ogImage === 'object' ? homeContent.ogImage : {};
                      setHomeContent({ ...homeContent, ogImage: { ...currentOg, [homeLang]: e.target.value } });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: TECHNICAL ================= */}
      {activeTab === 'technical' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            <span>Texnik Sozlamalar</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Canonical URL</label>
              <input
                type="url"
                value={homeContent.canonicalUrl || 'https://maxtron.uz'}
                onChange={(e) => setHomeContent({ ...homeContent, canonicalUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-blue-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Robots Meta Tag</label>
              <select
                value={homeContent.robotsIndex || 'index, follow'}
                onChange={(e) => setHomeContent({ ...homeContent, robotsIndex: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white outline-none cursor-pointer"
              >
                <option value="index, follow">index, follow (Standart)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Saqlash tugmasi */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Bosh sahifa sozlamalarini saqlash</span>
        </button>
      </div>

    </form>
  );
};