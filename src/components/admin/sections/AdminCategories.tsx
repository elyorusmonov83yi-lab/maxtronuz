"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  CornerDownRight,
  FolderTree,
  Tag,
  ChevronLeft,
  ChevronRight
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
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  
  // --- ПАГИНАЦИЯ ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Сброс страницы при поиске
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySearch]);

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
      alert("Rasmni yuklashda xatolik: " + (err.message || 'Server xatosi'));
    } finally {
      setIsUploadingImage(false);
    }
  };

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

  const getCategoryPath = (cat: CategoryInfo): string[] => {
    const path: string[] = [];
    let currentParentId = (cat as any).parentId || (cat as any).parent_id;
    
    while (currentParentId) {
      const parent = categories.find(c => String(c.id) === String(currentParentId));
      if (!parent || path.includes(getLocalizedText(parent.name, 'uz', parent.id))) break;
      path.unshift(getLocalizedText(parent.name, 'uz', parent.id));
      currentParentId = (parent as any).parentId || (parent as any).parent_id;
    }
    return path;
  };

  const categoryTree = useMemo(() => {
    const buildTree = (parentId: string | null = null, level: number = 0): (CategoryInfo & { level: number; breadcrumbs: string[] })[] => {
      const children = categories.filter(c => {
        const pId = (c as any).parentId || (c as any).parent_id || null;
        return parentId === null 
          ? (!pId || pId === '' || pId === '0') 
          : String(pId) === String(parentId);
      });

      return children.flatMap(c => [
        { ...c, level, breadcrumbs: getCategoryPath(c) },
        ...buildTree(c.id, level + 1)
      ]);
    };

    return buildTree(null, 0);
  }, [categories]);

  const filteredTree = useMemo(() => {
    if (!categorySearch.trim()) return categoryTree;
    const q = categorySearch.toLowerCase().trim();

    return categoryTree.filter(c => {
      const nameRu = getLocalizedText(c.name, 'ru', '').toLowerCase();
      const nameUz = getLocalizedText(c.name, 'uz', '').toLowerCase();
      const slugRu = (typeof c.slug === 'object' ? c.slug?.ru : c.slug || '').toLowerCase();
      const slugUz = (typeof c.slug === 'object' ? c.slug?.uz : c.id || '').toLowerCase();

      return (
        nameRu.includes(q) ||
        nameUz.includes(q) ||
        slugRu.includes(q) ||
        slugUz.includes(q) ||
        String(c.id).toLowerCase().includes(q)
      );
    });
  }, [categoryTree, categorySearch]);

  // Расчет среза элементов для текущей страницы
  const totalPages = Math.ceil(filteredTree.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTree.slice(start, start + itemsPerPage);
  }, [filteredTree, currentPage, itemsPerPage]);

  const renderCategoryCard = (cat: CategoryInfo & { level: number; breadcrumbs: string[] }) => {
    const catNameRu = getLocalizedText(cat.name, 'ru', '');
    const catNameUz = getLocalizedText(cat.name, 'uz', cat.id);
    const productCount = products.filter(p => String(p.category) === String(cat.id)).length;

    const slugRu = typeof cat.slug === 'object' ? cat.slug?.ru || cat.id : cat.slug || cat.id;
    const slugUz = typeof cat.slug === 'object' ? cat.slug?.uz : undefined;

    const descText = (
      getLocalizedText(cat.description, 'ru', '') || 
      getLocalizedText(cat.description, 'uz', '')
    ).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

    const isRoot = cat.level === 0;
    const isLevel2 = cat.level === 1;

    return (
      <div 
        key={cat.id} 
        style={{ marginLeft: viewMode === 'tree' ? `${cat.level * 24}px` : '0px' }}
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-150 flex flex-col justify-between relative group ${
          isRoot
            ? 'bg-gray-900 border-gray-800 shadow-md hover:border-blue-500/50'
            : isLevel2
            ? 'bg-gray-900/80 border-gray-800/80 hover:border-cyan-500/50'
            : 'bg-gray-950/60 border-gray-800/60 hover:border-emerald-500/50'
        }`}
      >
        {viewMode === 'tree' && !isRoot && (
          <div className="absolute -left-5 top-7 text-gray-700 flex items-center">
            <CornerDownRight className="w-4 h-4 text-gray-600" />
          </div>
        )}

        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center p-2 border ${
                isRoot 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                  : isLevel2 
                  ? 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20' 
                  : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <DynamicIcon name={cat.icon} className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${
                    isRoot
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : isLevel2
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isRoot ? '📁 Asosiy toifa' : isLevel2 ? '📂 2-daraja' : '📄 3-daraja'}
                  </span>

                  {cat.breadcrumbs.length > 0 && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 truncate max-w-xs">
                      <span>({cat.breadcrumbs.join(' / ')})</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm sm:text-base mt-1 leading-tight">
                  {catNameRu || catNameUz}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCategoryToEdit({
                    id: '',
                    parentId: cat.id,
                    slug: { uz: '', ru: '' },
                    name: { uz: '', ru: '' },
                    description: { uz: '', ru: '' },
                    icon: 'Layers',
                    count: 0
                  } as any);
                  setIsCategoryModalOpen(true);
                }}
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
                title="Shu toifa ichiga yangi podkategoriya qo'shish"
              >
                <Plus className="w-4 h-4" />
              </button>

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

          <div className="mt-3 pl-1">
            {catNameRu && catNameUz && (
              <p className="text-xs text-blue-400/80 font-medium">
                UZ: {catNameUz}
              </p>
            )}
            
            {descText && (
              <p className="text-[11px] text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                {descText}
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-2 truncate">
            <span className="text-gray-400 truncate">/{slugRu}</span>
            {slugUz && <span className="text-gray-600 truncate">| /{slugUz}</span>}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 font-semibold shrink-0">
            {productCount} ta mahsulot
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Верхняя панель управления */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nomi, id yoki slug bo'yicha qidiruv..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-gray-900 border border-gray-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tree' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Ierarxik daraxt ko'rinishi"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ierarxiya</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Katak ko'rinishi"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Katak</span>
            </button>
          </div>

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

      {/* 2. Блок SEO каталога */}
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

      {/* 3. Список категорий */}
      {paginatedCategories.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          Kategoriyalar topilmadi.
        </div>
      ) : viewMode === 'tree' ? (
        <div className="space-y-3">
          {paginatedCategories.map(cat => renderCategoryCard(cat))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCategories.map(cat => renderCategoryCard(cat))}
        </div>
      )}

      {/* 4. Блок пагинации */}
      {filteredTree.length > 0 && (
        <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              Jami: <strong className="text-white">{filteredTree.length}</strong> ta toifa
            </span>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <span>Har bir sahifada:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Oldingi sahifa"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Показываем первую, последнюю и соседние страницы
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-xs text-gray-600">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Keyingi sahifa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};