"use client";

import React, { useState, useRef } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Globe, 
  Save, 
  Share2, 
  FileText,
  ImageIcon,
  Upload,
  Loader2,
  Trash
} from 'lucide-react';
import { Certificate, Language, SeoSettings } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';
import { ApiService } from '../../../services/api';

interface AdminCertificatesProps {
  currentLang: Language;
  certificates: Certificate[];
  setCertToEdit: (cert: Certificate | null) => void;
  setIsCertModalOpen: (open: boolean) => void;
  triggerDeleteCertificate: (cert: Certificate) => void;
  seoSettings: SeoSettings;
  setSeoSettings: React.Dispatch<React.SetStateAction<SeoSettings>>;
  handleSaveSeo: (e: React.FormEvent) => void;
}

export const AdminCertificates: React.FC<AdminCertificatesProps> = ({
  currentLang,
  certificates = [],
  setCertToEdit,
  setIsCertModalOpen,
  triggerDeleteCertificate,
  seoSettings,
  setSeoSettings,
  handleSaveSeo
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'seo'>('list');
  const [seoLang, setSeoLang] = useState<'uz' | 'ru'>('uz');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const certSeo = seoSettings?.pageSeo?.certificates || {
    title: { uz: 'Sertifikatlar va Ruxsatnomalar — MAXTRON', ru: 'Сертификаты и Разрешительная документация — MAXTRON' },
    description: { uz: "O'zstandart Davlat reestri guvohliklari va ISO 9001 sertifikatlari.", ru: 'Свидетельства Госреестра Узстандарт, сертификаты ISO 9001 и документация.' },
    keywords: { uz: 'sertifikat, metrologiya, ISO 9001', ru: 'сертификаты, метрология, госреестр' },
    ogTitle: { uz: 'MAXTRON — Rasmiy sertifikatlar', ru: 'MAXTRON — Официальные сертификаты' },
    ogDescription: { uz: "O'zstandart va xalqaro sertifikatlar ro'yxati.", ru: 'Официальный реестр сертификатов и метрологических свидетельств.' },
    ogImage: ''
  };

  const handleSeoChange = (field: 'title' | 'description' | 'keywords' | 'ogTitle' | 'ogDescription', val: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      pageSeo: {
        ...prev?.pageSeo,
        certificates: {
          ...certSeo,
          [field]: {
            ...((certSeo as any)[field] || {}),
            [seoLang]: val
          }
        }
      }
    }));
  };

  const handleOgImageChange = (url: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      pageSeo: {
        ...prev?.pageSeo,
        certificates: {
          ...certSeo,
          ogImage: url
        }
      }
    }));
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingOg(true);
      const url = await ApiService.uploadFile(file);
      handleOgImageChange(url);
    } catch (err: any) {
      alert('OG rasmni yuklashda xatolik: ' + (err?.message || 'Server xatosi'));
    } finally {
      setIsUploadingOg(false);
    }
  };

  const filtered = certificates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const num = (c.number || '').toLowerCase();
    const title = getLocalizedText(c.title, currentLang).toLowerCase();
    const issuer = getLocalizedText(c.issuer, currentLang).toLowerCase();
    return num.includes(q) || title.includes(q) || issuer.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Yuqori Panel va Tablar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-3xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sertifikatlar ro‘yxati ({certificates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & OpenGraph sozlamalari</span>
          </button>
        </div>

        {activeTab === 'list' && (
          <button
            type="button"
            onClick={() => {
              setCertToEdit(null);
              setIsCertModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi sertifikat</span>
          </button>
        )}
      </div>

      {/* 1. SERTIFIKATLAR RO'YXATI TABI */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Qidirish (raqam, nom, tashkilot)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
              Sertifikatlar topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cert) => {
                const hasPdf = Boolean(cert.pdfUrl);

                return (
                  <div
                    key={cert.id}
                    className="p-5 rounded-3xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="aspect-[4/3] rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden relative flex items-center justify-center">
                        {cert.previewUrl || cert.image ? (
                          <img
                            src={cert.previewUrl || cert.image}
                            alt={getLocalizedText(cert.title, currentLang)}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-gray-700" />
                        )}

                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-gray-900/90 text-[10px] font-mono text-blue-400 border border-gray-700">
                          {cert.number}
                        </div>

                        {hasPdf && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-rose-600 text-[9px] font-bold text-white flex items-center gap-1 shadow">
                            <FileText className="w-3 h-3" />
                            <span>PDF</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-2">
                          {getLocalizedText(cert.title, currentLang)}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {getLocalizedText(cert.issuer, currentLang)}
                        </p>
                      </div>

                      <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-gray-800 flex justify-between">
                        <span>Amal qilish muddati: {cert.validUntil || '—'}</span>
                        <span>{cert.standard || ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setCertToEdit(cert);
                          setIsCertModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tahrirlash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerDeleteCertificate(cert)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. SEO & META SOZLAMALARI TABI */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveSeo} className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Sertifikatlar sahifasi SEO va OpenGraph sozlamalari</h3>
              <p className="text-xs text-gray-400">Google, Yandex qidiruv tizimlari hamda Telegram / WhatsApp ulashish havolalari uchun</p>
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-gray-950 border border-gray-800">
              {(['uz', 'ru'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSeoLang(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    seoLang === l ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Meta Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Sahifa Sarlavhasi (Meta Title) [{seoLang.toUpperCase()}]
              </label>
              <input
                type="text"
                value={(certSeo.title as any)?.[seoLang] || ''}
                onChange={(e) => handleSeoChange('title', e.target.value)}
                placeholder="Сертификаты и Разрешительная документация — MAXTRON"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Sahifa Tavsifi (Meta Description) [{seoLang.toUpperCase()}]
              </label>
              <textarea
                rows={3}
                value={(certSeo.description as any)?.[seoLang] || ''}
                onChange={(e) => handleSeoChange('description', e.target.value)}
                placeholder="Свидетельства Госреестра Узстандарт, сертификаты ISO 9001..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Kalit so‘zlar (Keywords) [{seoLang.toUpperCase()}]
              </label>
              <input
                type="text"
                value={(certSeo.keywords as any)?.[seoLang] || ''}
                onChange={(e) => handleSeoChange('keywords', e.target.value)}
                placeholder="sertifikatlar, metrologiya, gosreestr uzstandart"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* OG Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>OpenGraph Title (Telegram / Facebook) [{seoLang.toUpperCase()}]</span>
              </label>
              <input
                type="text"
                value={(certSeo.ogTitle as any)?.[seoLang] || ''}
                onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
                placeholder="MAXTRON — Rasmiy sertifikatlar"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* OG Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>OpenGraph Description [{seoLang.toUpperCase()}]</span>
              </label>
              <textarea
                rows={2}
                value={(certSeo.ogDescription as any)?.[seoLang] || ''}
                onChange={(e) => handleSeoChange('ogDescription', e.target.value)}
                placeholder="MAXTRON rasmiy distribyutorlik va O'zstandart sertifikatlari..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* OG Image */}
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>OpenGraph Preview rasmi (1200x630 px tavsiya etiladi)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4 flex justify-center">
                  <div className="w-32 h-20 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden flex items-center justify-center relative">
                    {certSeo.ogImage ? (
                      <img 
                        src={certSeo.ogImage} 
                        alt="OG Preview" 
                        className="w-full h-full object-cover"
                      />
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
                    ref={ogImageInputRef}
                    onChange={handleOgImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingOg}
                      onClick={() => ogImageInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isUploadingOg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{isUploadingOg ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                    </button>

                    {certSeo.ogImage && (
                      <button
                        type="button"
                        onClick={() => handleOgImageChange('')}
                        className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                        title="Rasmni tozalash"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm havolasi (URL)..."
                    value={certSeo.ogImage || ''}
                    onChange={(e) => handleOgImageChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SEO sozlamalarini saqlash</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};