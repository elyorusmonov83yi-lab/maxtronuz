"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Loader2 
} from 'lucide-react';
import { CategoryInfo, Product } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';
import { DynamicIcon } from '../../DynamicIcon';
import { ApiService } from '../../../services/api';

interface AdminCategoriesProps {
  categories: CategoryInfo[];
  products: Product[];
  setCategoryToEdit: (category: CategoryInfo | null) => void;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  triggerDeleteCategory: (category: CategoryInfo) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ 
  categories = [],
  products = [],
  setCategoryToEdit,
  setIsCategoryModalOpen,
  triggerDeleteCategory
}) => {
  const [categorySearch, setCategorySearch] = useState('');
  
  // --- KATALOG DINAMIK SEO STATELARI ---
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [seoLang, setSeoLang] = useState<'uz' | 'ru'>('uz');
  const [catalogSeo, setCatalogSeo] = useState({
    title: { uz: '', ru: '' },
    description: { uz: '', ru: '' },
    keywords: { uz: '', ru: '' },
    ogImageUrl: ''
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [seoSaveStatus, setSeoSaveStatus] = useState<string | null>(null);

  // Bazadagi catalog_seo sozlamasini yuklab olish
  useEffect(() => {
    async function loadCatalogSeo() {
      try {
        const data = await ApiService.getSetting('catalog_seo');
        if (data && typeof data === 'object') {
          setCatalogSeo({
            title: { uz: data.title?.uz || '', ru: data.title?.ru || '' },
            description: { uz: data.description?.uz || '', ru: data.description?.ru || '' },
            keywords: {
              uz: Array.isArray(data.keywords?.uz) ? data.keywords.uz.join(', ') : (data.keywords?.uz || ''),
              ru: Array.isArray(data.keywords?.ru) ? data.keywords.ru.join(', ') : (data.keywords?.ru || '')
            },
            ogImageUrl: data.ogImageUrl || ''
          });
        }
      } catch (err) {
        console.error('Katalog SEO yuklashda xatolik:', err);
      }
    }
    loadCatalogSeo();
  }, []);

  // Kompyuterdan rasm yuklash funksiyasi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadedUrl = await ApiService.uploadFile(file);
      setCatalogSeo(prev => ({
        ...prev,
        ogImageUrl: uploadedUrl
      }));
    } catch (err: any) {
      alert("Rasmni yuklashda xatolik yuz berdi: " + (err.message || 'Server xatosi'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // SEO sozlamalarini bazaga saqlash
  const handleSaveCatalogSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSeo(true);
    setSeoSaveStatus(null);

    try {
      const payload = {
        title: {
          uz: catalogSeo.title?.uz?.trim() || '',
          ru: catalogSeo.title?.ru?.trim() || ''
        },
        description: {
          uz: catalogSeo.description?.uz?.trim() || '',
          ru: catalogSeo.description?.ru?.trim() || ''
        },
        keywords: {
          uz: catalogSeo.keywords?.uz ? catalogSeo.keywords.uz.split(',').map((s) => s.trim()).filter(Boolean) : [],
          ru: catalogSeo.keywords?.ru ? catalogSeo.keywords.ru.split(',').map((s) => s.trim()).filter(Boolean) : []
        },
        ogImageUrl: catalogSeo.ogImageUrl?.trim() || ''
      };

      const res = await ApiService.saveSetting('catalog_seo', payload);
      if (res.success) {
        setSeoSaveStatus("Muvaffaqiyatli saqlandi!");
        setTimeout(() => setSeoSaveStatus(null), 3000);
      } else {
        alert(res.message || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    } finally {
      setIsSavingSeo(false);
    }
  };

  const filtered = categories.filter((c) => {
    const nameRu = getLocalizedText(c.name, 'ru', '').toLowerCase();
    const nameUz = getLocalizedText(c.name, 'uz', '').toLowerCase();

    const slugRu = (typeof c.slug === 'object' ? c.slug?.ru : c.slug || '').toLowerCase();
    const slugUz = (typeof c.slug === 'object' ? c.slug?.uz : c.id || '').toLowerCase();
    const q = categorySearch.toLowerCase().trim();

    return (
      nameRu.includes(q) ||
      nameUz.includes(q) ||
      slugRu.includes(q) ||
      slugUz.includes(q) ||
      String(c.id).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Yuqori boshqaruv paneli */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nomi yoki slug bo'yicha qidiruv..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Katalog SEO ochish/yopish tugmasi */}
          <button
            type="button"
            onClick={() => setIsSeoOpen(!isSeoOpen)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              isSeoOpen 
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Katalog SEO</span>
            {isSeoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Yangi toifa qo'shish tugmasi */}
          <button
            type="button"
            onClick={() => { setCategoryToEdit(null); setIsCategoryModalOpen(true); }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kategoriya qo'shish</span>
          </button>
        </div>
      </div>

      {/* 2. Katalog Sahifasi Ikki Tilli Dinamik SEO Formasi */}
      {isSeoOpen && (
        <form onSubmit={handleSaveCatalogSeo} className="p-6 rounded-3xl bg-gray-900/90 border border-emerald-500/40 backdrop-blur-md space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Katalog Sahifasi (/catalog) Ikki Tilli Meta-Teglari</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Statik matnlarsiz — faqat kiritilgan qiymatlar bazadagi <span className="font-mono text-emerald-400">catalog_seo</span> ga saqlanadi.
              </p>
            </div>

            {/* Til almashtirgich (UZ / RU) */}
            <div className="flex items-center gap-1 p-1 bg-gray-950 rounded-xl border border-gray-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSeoLang('uz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  seoLang === 'uz'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>O‘zbekcha (UZ)</span>
              </button>
              <button
                type="button"
                onClick={() => setSeoLang('ru')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  seoLang === 'ru'
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
                Katalog Title ({seoLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={catalogSeo.title?.[seoLang] || ''}
                onChange={(e) => setCatalogSeo({
                  ...catalogSeo,
                  title: { ...catalogSeo.title, [seoLang]: e.target.value }
                })}
                placeholder={seoLang === 'uz' ? "Uskunalar va priborlar katalogi" : "Каталог промышленного оборудования и КИПиА"}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Katalog Description ({seoLang.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={catalogSeo.description?.[seoLang] || ''}
                onChange={(e) => setCatalogSeo({
                  ...catalogSeo,
                  description: { ...catalogSeo.description, [seoLang]: e.target.value }
                })}
                placeholder={
                  seoLang === 'uz'
                    ? "Sanoat datchiklari, klapanlar, manometrlar va avtomatlashtirish vositalari..."
                    : "Полный перечень контрольно-измерительных приборов, датчиков и арматуры..."
                }
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Katalog Keywords ({seoLang.toUpperCase()}) — vergul bilan
                </label>
                <input
                  type="text"
                  value={catalogSeo.keywords?.[seoLang] || ''}
                  onChange={(e) => setCatalogSeo({
                    ...catalogSeo,
                    keywords: { ...catalogSeo.keywords, [seoLang]: e.target.value }
                  })}
                  placeholder="klapan, datchik, manometr, nasos"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  OpenGraph Rasm (Ijtimoiy tarmoqlar uchun banner)
                </label>
                
                <div className="flex items-center gap-2">
                  {/* Kompyuterdan tanlash tugmasi */}
                  <label className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition border border-gray-700 flex items-center gap-2 cursor-pointer shrink-0">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span>Yuklanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Rasm yuklash</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={catalogSeo.ogImageUrl || ''}
                    onChange={(e) => setCatalogSeo({ ...catalogSeo, ogImageUrl: e.target.value })}
                    placeholder="Rasm yuklang yoki havolasini yozing..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Yuklangan rasmni ko'rsatish (Prevyu) */}
                {catalogSeo.ogImageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={catalogSeo.ogImageUrl}
                      alt="Catalog OG Preview"
                      className="w-16 h-10 object-cover rounded-lg border border-gray-800"
                    />
                    <span className="text-[11px] text-emerald-400 font-mono truncate max-w-xs">
                      {catalogSeo.ogImageUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {seoSaveStatus && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {seoSaveStatus}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSavingSeo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSavingSeo ? 'Saqlanmoqda...' : 'Katalog SEO-ni saqlash'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Kategoriyalar ro'yxati (Grid) */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          Kategoriyalar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const catNameRu = getLocalizedText(cat.name, 'ru', '');
            const catNameUz = getLocalizedText(cat.name, 'uz', cat.id);
            const productCount = products.filter(p => String(p.category) === String(cat.id)).length;

            const slugRu = typeof cat.slug === 'object' ? cat.slug?.ru || cat.id : cat.slug || cat.id;
            const slugUz = typeof cat.slug === 'object' ? cat.slug?.uz : undefined;

            const descText = (
              getLocalizedText(cat.description, 'ru', '') || 
              getLocalizedText(cat.description, 'uz', '')
            ).replace(/<[^>]*>/g, '');

            return (
              <div 
                key={cat.id} 
                className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 hover:border-gray-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center p-2">
                      <DynamicIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setCategoryToEdit(cat); setIsCategoryModalOpen(true); }}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDeleteCategory(cat)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-bold text-white text-sm">
                      {catNameRu || catNameUz}
                    </h4>
                    {catNameRu && catNameUz && (
                      <p className="text-xs text-blue-400/80 mt-0.5 font-medium">
                        UZ: {catNameUz}
                      </p>
                    )}
                    
                    {descText && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        {descText}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 space-y-1 text-[11px] font-mono text-gray-500">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">RU: /{slugRu}</span>
                    <span className="text-blue-400 font-semibold">{productCount} ta mahsulot</span>
                  </div>
                  {slugUz && <div>UZ: /{slugUz}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};