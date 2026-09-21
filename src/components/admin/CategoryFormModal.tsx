"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  X, 
  Layers, 
  Activity, 
  Compass, 
  Zap, 
  Radar, 
  Flame, 
  ShieldCheck, 
  Gauge, 
  Cpu, 
  Radio, 
  Wrench, 
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Search,
  Thermometer,
  Scan,
  Waves,
  BatteryCharging,
  Sliders,
  Wind,
  Droplets,
  Microchip,
  Cable,
  Crosshair,
  Cog,
  Box,
  Globe,
  FolderTree
} from 'lucide-react';
import { CategoryInfo } from '../../types';
import { RichTextEditor } from './sections/RichTextEditor';
import { getLocalizedText } from '../../utils/formatters';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryInfo | null;
  categories?: CategoryInfo[];
  onSave: (category: CategoryInfo) => void | Promise<void>;
}

// Matnni avtomatik toza URL Slug ga aylantiruvchi yordamchi
function generateSlug(text: string): string {
  if (!text) return '';
  const cyrillicToLatinMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ў': 'o', 'ғ': 'g', 'қ': 'q', 'ҳ': 'h',
    "o'": 'o', "g'": 'g', "sh": 'sh', "ch": 'ch'
  };

  let str = text.toLowerCase().trim();
  str = str.split('').map(char => cyrillicToLatinMap[char] || char).join('');

  return str
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Universal Ikonka chiqaruvchi (Lucide yoki SVG base64/URL)
const RenderCategoryIcon: React.FC<{ iconName?: string; className?: string }> = ({ 
  iconName = 'Layers', 
  className = 'w-5 h-5' 
}) => {
  if (iconName?.startsWith('data:image') || iconName?.startsWith('http')) {
    return <img src={iconName} alt="icon" className={`${className} object-contain`} />;
  }
  const IconComp = (LucideIcons as Record<string, any>)[iconName] || Layers;
  return <IconComp className={className} />;
};

const POPULAR_ICONS = [
  { name: 'Activity', label: 'Datchik / Sensor / Vibratsiya' },
  { name: 'Gauge', label: 'Manometr / Bosim / Vakuum' },
  { name: 'Flame', label: 'Teplovizor / Pirometr / Olov' },
  { name: 'Thermometer', label: 'Harorat / Termopara / Termometr' },
  { name: 'Radar', label: 'Trassoiskatel / Georadar / Qidiruv' },
  { name: 'Compass', label: 'Geodeziya / Teodolit / Nivelir' },
  { name: 'Scan', label: 'Skaner / Optika / Lazer' },
  { name: 'ShieldCheck', label: 'Defektoskopiya / NK / Xavfsizlik' },
  { name: 'Waves', label: 'Ultratovush / Akustika / Tebranish' },
  { name: 'Droplets', label: "Sarf o'lchagich / Suyuqlik / Sath" },
  { name: 'Wind', label: "Gazanalizator / Havo / Oqim" },
  { name: 'Zap', label: 'Elektrotexnika / Multimetr / Tok' },
  { name: 'BatteryCharging', label: 'Akkumulyator / Quvvat / Tester' },
  { name: 'Radio', label: "Radio to'lqin / Aloqa / Signallar" },
  { name: 'Cpu', label: 'Mikrokontroller / Avtomatika / PLC' },
  { name: 'Microchip', label: 'Plata / Integral sxema / Chip' },
  { name: 'Cable', label: 'Kabel tester / Optotola / Izolyatsiya' },
  { name: 'Sliders', label: 'Kalibrator / Rostlagich / Metrologiya' },
  { name: 'Crosshair', label: "Lazer masofa o'lchagich / Optik nishon" },
  { name: 'Wrench', label: 'Asbob-uskunalar / Montaj / Servis' },
  { name: 'Cog', label: 'Mexanika / Reduktor / Dvigatel' },
  { name: 'Box', label: 'Shkaf / Korpus / Jamlanma' },
  { name: 'Layers', label: 'Umumiy toifa / Kompleks' }
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  categories = [],
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  const [activeLang, setActiveLang] = useState<'ru' | 'uz'>('ru');
  const [iconSearch, setIconSearch] = useState('');
  const [manualSlugs, setManualSlugs] = useState<{ uz: boolean; ru: boolean }>({ uz: false, ru: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgIconInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CategoryInfo>({
    id: '',
    parentId: null,
    slug: { uz: '', ru: '' },
    icon: 'Layers',
    image: '',
    name: { uz: '', ru: '' },
    description: { uz: '', ru: '' },
    count: 0,
    seoTitle: { uz: '', ru: '' },
    seoDescription: { uz: '', ru: '' },
    seoKeywords: { uz: '', ru: '' },
    ogImage: ''
  });

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
    if (isOpen) {
      if (categoryToEdit) {
        setManualSlugs({ uz: true, ru: true });
        
        const slugRu = typeof categoryToEdit.slug === 'object' ? categoryToEdit.slug?.ru || categoryToEdit.id : categoryToEdit.slug || categoryToEdit.id;
        const slugUz = typeof categoryToEdit.slug === 'object' ? categoryToEdit.slug?.uz || categoryToEdit.id : categoryToEdit.id;

        setFormData({
          ...categoryToEdit,
          id: categoryToEdit.id,
          parentId: categoryToEdit.parentId || null,
          slug: { uz: slugUz, ru: slugRu },
          icon: categoryToEdit.icon || 'Layers',
          image: categoryToEdit.image || '',
          name: {
            uz: typeof categoryToEdit.name === 'object' ? (categoryToEdit.name.uz || '') : (categoryToEdit.name || ''),
            ru: typeof categoryToEdit.name === 'object' ? (categoryToEdit.name.ru || '') : (categoryToEdit.name || '')
          },
          description: {
            uz: typeof categoryToEdit.description === 'object' ? (categoryToEdit.description.uz || '') : (categoryToEdit.description || ''),
            ru: typeof categoryToEdit.description === 'object' ? (categoryToEdit.description.ru || '') : (categoryToEdit.description || '')
          },
          seoTitle: {
            uz: categoryToEdit.seoTitle?.uz || '',
            ru: categoryToEdit.seoTitle?.ru || ''
          },
          seoDescription: {
            uz: categoryToEdit.seoDescription?.uz || '',
            ru: categoryToEdit.seoDescription?.ru || ''
          },
          seoKeywords: {
            uz: categoryToEdit.seoKeywords?.uz || '',
            ru: categoryToEdit.seoKeywords?.ru || ''
          },
          ogImage: categoryToEdit.ogImage || ''
        });
      } else {
        setManualSlugs({ uz: false, ru: false });
        const autoId = `cat-${Date.now().toString().slice(-6)}`;
        setFormData({
          id: autoId,
          parentId: null,
          slug: { uz: '', ru: '' },
          icon: 'Layers',
          image: '',
          name: { uz: '', ru: '' },
          description: { uz: '', ru: '' },
          count: 0,
          seoTitle: { uz: '', ru: '' },
          seoDescription: { uz: '', ru: '' },
          seoKeywords: { uz: '', ru: '' },
          ogImage: ''
        });
      }
      setIconSearch('');
    }
  }, [categoryToEdit, isOpen]);

  const availableParentCategories = categories.filter(
    (c) => (!categoryToEdit || c.id !== categoryToEdit.id) && !c.parentId
  );

  const handleNameChange = (lang: 'uz' | 'ru', value: string) => {
    const updatedName = { ...formData.name, [lang]: value };
    const updatedSlug = { ...formData.slug };

    if (!manualSlugs[lang]) {
      updatedSlug[lang] = generateSlug(value);
    }

    let updatedId = formData.id;
    if (!categoryToEdit && (!formData.id || formData.id.startsWith('cat-'))) {
      updatedId = updatedSlug.ru || updatedSlug.uz || generateSlug(value);
    }

    setFormData({
      ...formData,
      id: updatedId,
      name: updatedName,
      slug: updatedSlug
    });
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return POPULAR_ICONS;
    const q = iconSearch.toLowerCase();
    return POPULAR_ICONS.filter(
      (ic) => ic.name.toLowerCase().includes(q) || ic.label.toLowerCase().includes(q)
    );
  }, [iconSearch]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Rasm hajmi 5 MB dan oshmasligi kerak!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setFormData((prev) => ({ 
          ...prev, 
          image: base64,
          ogImage: prev.ogImage || base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSvgIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setFormData((prev) => ({ ...prev, icon: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.ru?.trim() && !formData.name.uz?.trim()) {
      alert("Iltimos, toifa nomini kamida rus yoki o'zbek tilida kiriting!");
      return;
    }

    const ruSlug = formData.slug?.ru?.trim() ? generateSlug(formData.slug.ru) : generateSlug(formData.name.ru || 'cat');
    const uzSlug = formData.slug?.uz?.trim() ? generateSlug(formData.slug.uz) : generateSlug(formData.name.uz || ruSlug);
    const finalId = categoryToEdit?.id || (formData.id.trim() ? generateSlug(formData.id) : ruSlug || uzSlug);

    const finalCategory: CategoryInfo = {
      ...formData,
      id: finalId,
      parentId: formData.parentId || null,
      slug: {
        ru: ruSlug,
        uz: uzSlug
      },
      icon: formData.icon || 'Layers',
      name: {
        ru: formData.name.ru?.trim() || formData.name.uz?.trim() || '',
        uz: formData.name.uz?.trim() || formData.name.ru?.trim() || ''
      },
      description: {
        ru: formData.description.ru?.trim() || formData.description.uz?.trim() || '',
        uz: formData.description.uz?.trim() || formData.description.ru?.trim() || ''
      },
      seoTitle: {
        ru: formData.seoTitle?.ru?.trim() || formData.name.ru || '',
        uz: formData.seoTitle?.uz?.trim() || formData.name.uz || ''
      },
      seoDescription: {
        ru: formData.seoDescription?.ru?.trim() || '',
        uz: formData.seoDescription?.uz?.trim() || ''
      },
      seoKeywords: {
        ru: formData.seoKeywords?.ru?.trim() || '',
        uz: formData.seoKeywords?.uz?.trim() || ''
      },
      ogImage: formData.ogImage || formData.image
    };

    onSave(finalCategory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <RenderCategoryIcon iconName={formData.icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {categoryToEdit 
                  ? (activeLang === 'ru' ? 'Редактировать категорию' : 'Kategoriyani tahrirlash') 
                  : (activeLang === 'ru' ? 'Добавить новую категорию' : 'Yangi kategoriya qo‘shish')}
              </h2>
              <p className="text-xs text-gray-400">
                {activeLang === 'ru' ? 'Иерархия (Родительская / Подкатегория) и двуязычный SEO Slug' : 'Ierarxiya (Ota / Kichik toifa) va ikki tilli SEO Slug'}
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

        {/* Tab Switcher */}
        <div className="px-6 border-b border-gray-800 bg-gray-900/90 flex gap-2 py-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{activeLang === 'ru' ? 'Данные категории и Иконка' : "Kategoriya ma'lumotlari & Ikonka"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{activeLang === 'ru' ? 'SEO & OpenGraph Теги' : 'SEO & OpenGraph Teglari'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Ota toifa tanlash */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span>{activeLang === 'ru' ? 'Родительская категория (Иерархия):' : 'Ota toifa (Ierarxiya):'}</span>
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">
                    {activeLang === 'ru' 
                      ? '📁 — Главная категория (Без родителя / Верхний уровень) —' 
                      : '📁 — Asosiy toifa (Otasi yo‘q / Yuqori daraja) —'}
                  </option>
                  {availableParentCategories.map((pCat) => {
                    const nameRu = getLocalizedText(pCat.name, 'ru', '');
                    const nameUz = getLocalizedText(pCat.name, 'uz', pCat.id);
                    return (
                      <option key={pCat.id} value={pCat.id}>
                        ↳ 📄 {activeLang === 'ru' ? (nameRu || nameUz) : (nameUz || nameRu)}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-gray-500">
                  {activeLang === 'ru' 
                    ? 'Если оставить "Главная категория", то этот раздел будет отображаться как основной в меню' 
                    : 'Agar "Asosiy toifa" qoldirilsa, ushbu bo‘lim menyuda ota toifa sifatida chiqadi'}
                </p>
              </div>

              {/* Til Switcher (RU / UZ) */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
                {[
                  { code: 'ru' as const, label: '🇷🇺 Русский' },
                  { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeLang === lang.code
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Nomi va Slug */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {activeLang === 'ru' ? 'Название категории (RU) *' : 'Kategoriya nomi (UZ) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeLang === 'ru' ? 'Например: Датчики давления' : 'Masalan: Bosim datchiklari'}
                    value={formData.name[activeLang] || ''}
                    onChange={(e) => handleNameChange(activeLang, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>URL Slug ({activeLang.toUpperCase()})</span>
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      /catalog/{formData.slug?.[activeLang] || 'slug'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={activeLang === 'ru' ? 'datchiki-davleniya' : 'bosim-datchiklari'}
                    value={formData.slug?.[activeLang] || ''}
                    onChange={(e) => {
                      setManualSlugs({ ...manualSlugs, [activeLang]: true });
                      setFormData({
                        ...formData,
                        slug: {
                          ...formData.slug,
                          [activeLang]: generateSlug(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-blue-400 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Описание категории (RU)' : 'Kategoriya tavsifi (UZ)'}
                  </label>
                  <RichTextEditor
                    value={formData.description[activeLang] || ''}
                    onChange={(content) =>
                      setFormData({
                        ...formData,
                        description: { ...formData.description, [activeLang]: content }
                      })
                    }
                    placeholder={
                      activeLang === 'ru'
                        ? 'Подробная информация о приборах измерения давления...'
                        : "Sanoat bosim va sath o'lchov asboblari haqida to'liq ma'lumot..."
                    }
                  />
                </div>
              </div>

              {/* Ikonka tanlash */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600/20 text-blue-400">
                      <RenderCategoryIcon iconName={formData.icon} className="w-4 h-4" />
                    </span>
                    <span>
                      {activeLang === 'ru' ? 'Выбранная иконка:' : 'Tanlangan ikonka:'} <span className="text-blue-400 font-mono">{formData.icon?.startsWith('data:') ? 'SVG' : formData.icon}</span>
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Lucide Icon (Layers, Gauge)..."
                      value={formData.icon?.startsWith('data:') ? '' : formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value.trim() || 'Layers' })}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono w-48 transition"
                    />

                    <input
                      type="file"
                      ref={svgIconInputRef}
                      accept=".svg,image/png,image/webp"
                      onChange={handleSvgIconUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => svgIconInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
                      title="SVG yuklash"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>SVG</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={activeLang === 'ru' ? 'Поиск иконки...' : 'Ikonkalardan qidirish...'}
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {filteredIcons.map((ic) => {
                      const isSelected = formData.icon === ic.name;
                      return (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: ic.name })}
                          className={`p-2 rounded-xl border text-left text-xs transition flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                              : 'bg-gray-900 border-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-gray-700'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                            <RenderCategoryIcon iconName={ic.name} className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] leading-tight truncate">{ic.label.split('/')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rasm yuklash */}
              <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>{activeLang === 'ru' ? 'Изображение категории (Cover Photo)' : 'Kategoriya rasmi (Cover Photo)'}</span>
                  </label>
                  <span className="text-[11px] text-gray-500">JPG, PNG, WebP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center">
                      {formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Category" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{activeLang === 'ru' ? 'Загрузить фото' : 'Rasm yuklash'}</span>
                    </button>

                    <input
                      type="url"
                      placeholder={activeLang === 'ru' ? 'Или URL ссылка на фото...' : 'Yoki rasm URL havolasi...'}
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
                {[
                  { code: 'ru' as const, label: '🇷🇺 Русский' },
                  { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeLang === lang.code
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Meta Title ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? 'Купить датчики давления в Ташкенте | MAXTRON' : "Toshkentda bosim datchiklarini sotib olish | MAXTRON"}
                    value={formData.seoTitle?.[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoTitle: {
                          ...(formData.seoTitle || { uz: '', ru: '' }),
                          [activeLang]: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Meta Description ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    placeholder={activeLang === 'ru' ? 'Широкий каталог промышленных датчиков в Узбекистане. Прямые поставки со склада в Ташкенте.' : "O'zbekistondagi eng keng sanoat datchiklari katalogi. Toshkent omboridan to'g'ridan-to'g'ri yetkazib berish."}
                    value={formData.seoDescription?.[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: {
                          ...(formData.seoDescription || { uz: '', ru: '' }),
                          [activeLang]: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Keywords ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? 'датчик давления, манометры, датчики ташкент' : 'bosim datchigi, manometrlar, datchiklar toshkent'}
                    value={formData.seoKeywords?.[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoKeywords: {
                          ...(formData.seoKeywords || { uz: '', ru: '' }),
                          [activeLang]: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    OpenGraph Image (OG Rasmi)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.ogImage || ''}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

            </div>
          )}

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition cursor-pointer"
          >
            {activeLang === 'ru' ? 'Отмена' : 'Bekor qilish'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{categoryToEdit ? (activeLang === 'ru' ? 'Сохранить изменения' : "O'zgarishlarni saqlash") : (activeLang === 'ru' ? 'Сохранить категорию' : 'Kategoriyani saqlash')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};