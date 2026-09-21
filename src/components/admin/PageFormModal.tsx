"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Globe, 
  Layout, 
  Link as LinkIcon, 
  Sparkles, 
  Layers,
  Upload,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { CustomPage, CustomPageSection, Language } from '../../types';
import { ApiService } from '../../services/api';

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageToEdit: CustomPage | null;
  onSave: (page: CustomPage) => void;
}

export const PageFormModal: React.FC<PageFormModalProps> = ({
  isOpen,
  onClose,
  pageToEdit,
  onSave
}) => {
  const [activeLangTab, setActiveLangTab] = useState<Language>('uz_cyrl');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form State
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [coverImage, setCoverImage] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  // Ko'p tilli asosiy maydonlar
  const [title, setTitle] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });
  const [subtitle, setSubtitle] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });
  const [content, setContent] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });

  // Dinamik bo'limlar
  const [sections, setSections] = useState<CustomPageSection[]>([]);

  // SEO maydonlari
  const [metaTitle, setMetaTitle] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });
  const [metaDescription, setMetaDescription] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });
  const [metaKeywords, setMetaKeywords] = useState({ uz_cyrl: '', uz: '', ru: '', en: '' });

  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (pageToEdit) {
      setSlug(pageToEdit.slug || '');
      setIcon(pageToEdit.icon || 'FileText');
      setCoverImage(pageToEdit.coverImage || '');
      setOgImage(pageToEdit.ogImage || pageToEdit.coverImage || '');
      setShowInHeader(pageToEdit.showInHeader ?? true);
      setShowInFooter(pageToEdit.showInFooter ?? true);
      setIsPublished(pageToEdit.isPublished ?? true);

      setTitle({
        uz_cyrl: pageToEdit.title?.uz_cyrl || '',
        uz: pageToEdit.title?.uz || '',
        ru: pageToEdit.title?.ru || '',
        en: pageToEdit.title?.en || ''
      });

      setSubtitle({
        uz_cyrl: pageToEdit.subtitle?.uz_cyrl || '',
        uz: pageToEdit.subtitle?.uz || '',
        ru: pageToEdit.subtitle?.ru || '',
        en: pageToEdit.subtitle?.en || ''
      });

      setContent({
        uz_cyrl: pageToEdit.content?.uz_cyrl || '',
        uz: pageToEdit.content?.uz || '',
        ru: pageToEdit.content?.ru || '',
        en: pageToEdit.content?.en || ''
      });

      setSections(pageToEdit.sections || []);

      setMetaTitle({
        uz_cyrl: pageToEdit.metaTitle?.uz_cyrl || '',
        uz: pageToEdit.metaTitle?.uz || '',
        ru: pageToEdit.metaTitle?.ru || '',
        en: pageToEdit.metaTitle?.en || ''
      });

      setMetaDescription({
        uz_cyrl: pageToEdit.metaDescription?.uz_cyrl || '',
        uz: pageToEdit.metaDescription?.uz || '',
        ru: pageToEdit.metaDescription?.ru || '',
        en: pageToEdit.metaDescription?.en || ''
      });

      setMetaKeywords({
        uz_cyrl: (pageToEdit as any).metaKeywords?.uz_cyrl || '',
        uz: (pageToEdit as any).metaKeywords?.uz || '',
        ru: (pageToEdit as any).metaKeywords?.ru || '',
        en: (pageToEdit as any).metaKeywords?.en || ''
      });
    } else {
      setSlug('');
      setIcon('FileText');
      setCoverImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=500&q=80');
      setOgImage('');
      setShowInHeader(true);
      setShowInFooter(true);
      setIsPublished(true);

      setTitle({ uz_cyrl: '', uz: '', ru: '', en: '' });
      setSubtitle({ uz_cyrl: '', uz: '', ru: '', en: '' });
      setContent({ uz_cyrl: '', uz: '', ru: '', en: '' });
      setSections([]);
      setMetaTitle({ uz_cyrl: '', uz: '', ru: '', en: '' });
      setMetaDescription({ uz_cyrl: '', uz: '', ru: '', en: '' });
      setMetaKeywords({ uz_cyrl: '', uz: '', ru: '', en: '' });
    }
    setErrorMsg('');
  }, [pageToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Rasm hajmi 5 MB dan oshmasligi kerak!');
      return;
    }

    try {
      setIsUploadingCover(true);
      const url = await ApiService.uploadFile(file);
      setCoverImage(url);
      if (!ogImage) setOgImage(url);
    } catch {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setCoverImage(base64);
        if (!ogImage) setOgImage(base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleTitleChange = (lang: Language, val: string) => {
    setTitle((prev) => ({ ...prev, [lang]: val }));
    if (!pageToEdit && slug === '' && val) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9а-яё\s-]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated.slice(0, 40));
    }
  };

  const handleAddSection = () => {
    const newSec: CustomPageSection = {
      id: `sec-${Date.now()}`,
      title: {
        uz_cyrl: `Янги бўлим ${sections.length + 1}`,
        uz: `Yangi bo'lim ${sections.length + 1}`,
        ru: `Новый раздел ${sections.length + 1}`,
        en: `New Section ${sections.length + 1}`
      },
      content: { uz_cyrl: '', uz: '', ru: '', en: '' },
      badge: { uz_cyrl: '', uz: '', ru: '', en: '' }
    };
    setSections([...sections, newSec]);
  };

  const handleUpdateSectionTitle = (secId: string, lang: Language, text: string) => {
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, title: { ...s.title, [lang]: text } } : s))
    );
  };

  const handleUpdateSectionContent = (secId: string, lang: Language, text: string) => {
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, content: { ...s.content, [lang]: text } } : s))
    );
  };

  const handleUpdateSectionBadge = (secId: string, lang: Language, text: string) => {
    setSections(
      sections.map((s) =>
        s.id === secId
          ? {
              ...s,
              badge: {
                uz_cyrl: s.badge?.uz_cyrl || '',
                uz: s.badge?.uz || '',
                ru: s.badge?.ru || '',
                en: s.badge?.en || '',
                [lang]: text
              }
            }
          : s
      )
    );
  };

  const handleRemoveSection = (secId: string) => {
    setSections(sections.filter((s) => s.id !== secId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.uz_cyrl.trim() && !title.uz.trim() && !title.ru.trim()) {
      setErrorMsg('Kamida bitta tilda sahifa sarlavhasini kiriting!');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Sahifa URL manzilini (Slug) kiriting (masalan: yetkazib-berish)!');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    const pageData: CustomPage = {
      id: pageToEdit?.id || `page-${Date.now()}`,
      slug: cleanSlug,
      title: {
        uz_cyrl: title.uz_cyrl || title.uz || title.ru || 'Yangi sahifa',
        uz: title.uz || title.uz_cyrl || title.ru || 'Yangi sahifa',
        ru: title.ru || title.uz_cyrl || title.uz || 'Новая страница',
        en: title.en || title.ru || title.uz || 'New Page'
      },
      subtitle: {
        uz_cyrl: subtitle.uz_cyrl || '',
        uz: subtitle.uz || '',
        ru: subtitle.ru || '',
        en: subtitle.en || ''
      },
      content: {
        uz_cyrl: content.uz_cyrl || '',
        uz: content.uz || '',
        ru: content.ru || '',
        en: content.en || ''
      },
      sections,
      metaTitle: {
        uz_cyrl: metaTitle.uz_cyrl || title.uz_cyrl,
        uz: metaTitle.uz || title.uz,
        ru: metaTitle.ru || title.ru,
        en: metaTitle.en || title.en
      },
      metaDescription: {
        uz_cyrl: metaDescription.uz_cyrl || subtitle.uz_cyrl,
        uz: metaDescription.uz || subtitle.uz,
        ru: metaDescription.ru || subtitle.ru,
        en: metaDescription.en || subtitle.en
      },
      metaKeywords: {
        uz_cyrl: metaKeywords.uz_cyrl || '',
        uz: metaKeywords.uz || '',
        ru: metaKeywords.ru || '',
        en: metaKeywords.en || ''
      },
      ogImage: ogImage || coverImage,
      coverImage: coverImage.trim() || undefined,
      icon,
      showInHeader,
      showInFooter,
      isPublished,
      createdAt: pageToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(pageData);
    onClose();
  };

  const langNames = [
    { code: 'uz_cyrl', label: 'Ўзбекча (Кирилл)', flag: '🇺🇿' },
    { code: 'uz', label: "O'zbekcha (Lotin)", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {pageToEdit ? `Sahifani tahrirlash: ${pageToEdit.title.uz || pageToEdit.slug}` : 'Yangi qo‘shimcha sahifa yaratish'}
              </h3>
              <p className="text-xs text-gray-400">
                Saytning ixtiyoriy yangi bo‘limi, shartlari yoki ma‘lumotlarini 4 ta tilda kiriting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: URL Slug & Display Settings */}
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>1. URL Manzil va Ko‘rinish Sozlamalari</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  URL manzili (Slug) *
                </label>
                <div className="flex items-center rounded-xl bg-gray-900 border border-gray-700/80 px-3 py-2 text-sm text-gray-300 focus-within:border-blue-500">
                  <span className="text-gray-500 select-none">/page/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="yetkazib-berish"
                    className="w-full bg-transparent pl-1 text-white placeholder-gray-600 focus:outline-none font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Ikonka belgisi
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="FileText">Hujjat (FileText)</option>
                  <option value="Truck">Yetkazib berish (Truck)</option>
                  <option value="ShieldCheck">Kafolat va Servis (ShieldCheck)</option>
                  <option value="HelpCircle">Savol-javob (FAQ / Help)</option>
                  <option value="Phone">Bog‘lanish (Phone)</option>
                  <option value="Share2">Hamkorlik (Partnership)</option>
                </select>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-300">
                Sahifa banner rasmi (Cover Image)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition disabled:opacity-50"
                >
                  {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingCover ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                </button>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 rounded-xl bg-gray-900 border border-gray-700/80 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-800/80">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showInHeader}
                  onChange={(e) => setShowInHeader(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Header (Yuqori menyu)da ko‘rsatish</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showInFooter}
                  onChange={(e) => setShowInFooter(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Footer (Pastki qism)da ko‘rsatish</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-emerald-400 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>E‘lon qilingan (Saytda faol)</span>
              </label>
            </div>
          </div>

          {/* Section 2: Multilingual Content & Translations */}
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Sahifa Matnlari (4 ta tilda)</span>
              </h4>

              <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
                {langNames.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setActiveLangTab(l.code as any)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      activeLangTab === l.code
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.code === 'uz_cyrl' ? 'Кирилл' : l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Sahifa asosiy sarlavhasi ({activeLangTab.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  value={title[activeLangTab]}
                  onChange={(e) => handleTitleChange(activeLangTab, e.target.value)}
                  placeholder="Masalan: Yetkazib berish va to‘lov shartlari"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Qisqa tavsif / Subtitle ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={subtitle[activeLangTab]}
                  onChange={(e) => setSubtitle((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
                  placeholder="Sahifaning kirish izohi yoki shiori"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Asosiy maqola matni ({activeLangTab.toUpperCase()})
                </label>
                <textarea
                  rows={4}
                  value={content[activeLangTab]}
                  onChange={(e) => setContent((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
                  placeholder="Butun O‘zbekiston bo‘ylab sanoat uskunalarini yetkazib berish..."
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Visual Sections */}
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Bo‘limlar & Bloklar ({sections.length} ta)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi blok qo‘shish</span>
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
                Hozircha alohida bloklar qo‘shilmagan. Siz «Yangi blok qo‘shish» tugmasi orqali shartlarni ajratib ko‘rsatishingiz mumkin.
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">
                        #{idx + 1} Blok: {sec.title[activeLangTab] || 'Nomsiz blok'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sec.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Blok nomi ({activeLangTab.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={sec.title[activeLangTab] || ''}
                          onChange={(e) => handleUpdateSectionTitle(sec.id, activeLangTab, e.target.value)}
                          className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Belgi / Badge ({activeLangTab.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={sec.badge?.[activeLangTab] || ''}
                          onChange={(e) => handleUpdateSectionBadge(sec.id, activeLangTab, e.target.value)}
                          placeholder="Masalan: 24 soat ichida"
                          className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Blok mazmuni ({activeLangTab.toUpperCase()})
                      </label>
                      <textarea
                        rows={3}
                        value={sec.content[activeLangTab] || ''}
                        onChange={(e) => handleUpdateSectionContent(sec.id, activeLangTab, e.target.value)}
                        className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: SEO Meta Tags */}
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>4. SEO va OpenGraph Meta Teglari ({activeLangTab.toUpperCase()})</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Meta Title ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={metaTitle[activeLangTab] || ''}
                  onChange={(e) => setMetaTitle((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
                  placeholder="Yetkazib berish shartlari — MAXTRON O‘zbekiston"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Meta Description ({activeLangTab.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={metaDescription[activeLangTab] || ''}
                  onChange={(e) => setMetaDescription((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
                  placeholder="O‘zbekiston bo‘ylab sanoat o‘lchov uskunalarini yetkazib berish muddatlari va to‘lov turlari..."
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Keywords ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={metaKeywords[activeLangTab] || ''}
                  onChange={(e) => setMetaKeywords((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
                  placeholder="yetkazib berish, toshkent, kafolat, to'lov"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700/80 px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 text-xs font-semibold transition cursor-pointer"
          >
            Bekor qilish
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{pageToEdit ? 'O‘zgarishlarni saqlash' : 'Sahifani yaratish'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};