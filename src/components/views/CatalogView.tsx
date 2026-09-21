"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/utils/navigation';
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  RotateCcw,
  Activity,
  Compass,
  Zap,
  Radar,
  Flame,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Warehouse,
  Package,
  Layers,
  Award,
  X,
  ArrowUpDown,
  FolderTree,
  CornerDownRight
} from 'lucide-react';
import { Language, Product, CategoryInfo } from '../../types';
import { ProductCard } from '../ProductCard';
import { Breadcrumbs } from '../Breadcrumbs';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { 
  getLocalizedText, 
  getSpecName, 
  getSafeProductSlug, 
  getSafeCategorySlug 
} from '../../utils/formatters';

interface CatalogViewProps {
  currentLang: Language;
  onOpenQuote: (product: Product) => void;
  comparedProducts: string[];
  onToggleCompare: (product: Product) => void;
}

const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  if (typeof document === 'undefined' || !content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanCategoryTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/\s+(uz|ru)$/i, '').trim();
};

export const CatalogView: React.FC<CatalogViewProps> = ({
  currentLang,
  onOpenQuote,
  comparedProducts,
  onToggleCompare,
}) => {
  const params = useParams() as { categorySlug?: string; categoryId?: string };
  const navigate = useNavigate();

  const rawParam = params?.categorySlug || params?.categoryId || 'all';
  const currentSlugParam = typeof rawParam === 'string' ? rawParam : 'all';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Ochiq turgan ota kategoriyalar ID-lari
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      ApiService.getProducts().catch(() => StorageService.getProducts()),
      ApiService.getCategories().catch(() => StorageService.getCategories())
    ]).then(([prods, cats]) => {
      if (isMounted) {
        if (Array.isArray(prods)) setProductsList(prods);
        if (Array.isArray(cats)) setCategoriesList(cats);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Slug bo'yicha joriy kategoriya
  const currentCategoryObj = useMemo(() => {
    if (currentSlugParam === 'all' || currentSlugParam === '[object Object]') return null;
    return categoriesList.find((c) => {
      const catSlug = getSafeCategorySlug(c, currentLang);
      const catId = typeof c.id === 'string' ? c.id : String(c.id);
      return catSlug === currentSlugParam || catId === currentSlugParam;
    }) || null;
  }, [categoriesList, currentSlugParam, currentLang]);

  const activeCategoryId = currentCategoryObj ? currentCategoryObj.id : (currentSlugParam === 'all' ? 'all' : currentSlugParam);

  // Tanlangan kategoriya bola bo'lsa, o'sha ota toifani avtomatik ochish
  useEffect(() => {
    if (currentCategoryObj) {
      if (currentCategoryObj.parentId) {
        setExpandedCategories((prev) => ({ ...prev, [String(currentCategoryObj.parentId)]: true }));
      } else {
        setExpandedCategories((prev) => ({ ...prev, [String(currentCategoryObj.id)]: true }));
      }
    }
  }, [currentCategoryObj]);

  // Kategoriyalarni Ota-Bola (Tree) daraxt ko'rinishiga keltirish
  const categoryTree = useMemo(() => {
    const rootCategories: (CategoryInfo & { children: CategoryInfo[] })[] = [];
    const childrenMap: Record<string, CategoryInfo[]> = {};

    categoriesList.forEach((cat) => {
      const pId = cat.parentId && cat.parentId !== 'none' && cat.parentId !== '' ? String(cat.parentId) : null;
      if (pId) {
        if (!childrenMap[pId]) childrenMap[pId] = [];
        childrenMap[pId].push(cat);
      }
    });

    categoriesList.forEach((cat) => {
      const pId = cat.parentId && cat.parentId !== 'none' && cat.parentId !== '' ? String(cat.parentId) : null;
      if (!pId) {
        rootCategories.push({
          ...cat,
          children: childrenMap[String(cat.id)] || []
        });
      }
    });

    return rootCategories;
  }, [categoriesList]);

  // Ota kategoriya va uning barcha ichki bolalaridagi tovarlar sonini aniqlash
  const getCategoryTotalCount = (catId: string, children: CategoryInfo[] = []) => {
    const targetIds = [String(catId), ...children.map(c => String(c.id))];
    return productsList.filter(p => targetIds.includes(String(p.category || (p as any).categoryId))).length;
  };

  const toggleCategoryExpand = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // SEO
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const seoSettings = StorageService.getSeoSettings();
    const catalogSeo = seoSettings?.pageSeo?.catalog;

    let pageTitle = '';
    let pageDesc = '';
    let pageKeywords = '';

    if (currentSlugParam === 'all' || !currentCategoryObj) {
      pageTitle = getLocalizedText(catalogSeo?.title, currentLang) || (currentLang === 'ru' 
        ? 'Каталог контрольно-измерительных приборов — MAXTRON Узбекистан' 
        : 'Nazorat va o‘lchov uskunalari katalogi — MAXTRON O‘zbekiston');

      pageDesc = getLocalizedText(catalogSeo?.description, currentLang) || (currentLang === 'ru'
        ? 'Широкий ассортимент промышленных и измерительных приборов со склада в Ташкенте. Официальная гарантия и поверка.'
        : 'Toshkent omborida mavjud sanoat va o‘lchash uskunalarining keng assortimenti. Rasmiy kafolat va metrologik qiyoslash.');

      pageKeywords = getLocalizedText(catalogSeo?.keywords, currentLang) || (currentLang === 'ru'
        ? 'каталог приборов, купить измерительное оборудование, ташкент склад'
        : 'uskunalar katalogi, o‘lchov asboblari narxi, toshkent ombor');
    } else {
      const catName = cleanCategoryTitle(getLocalizedText(currentCategoryObj.name, currentLang, currentCategoryObj.id));
      pageTitle = `${catName} — MAXTRON Industrial Supply`;
      pageDesc = stripHtml(getLocalizedText(currentCategoryObj.description, currentLang)) || `${catName} ${currentLang === 'ru' ? 'по дистрибьюторским ценам со склада в Ташкенте.' : 'Toshkent omboridan rasmiy kafolat bilan.'}`;
      pageKeywords = `${catName.toLowerCase()}, купить ${catName.toLowerCase()}, maxtron`;
    }

    document.title = pageTitle;
    setMetaTag('name', 'description', pageDesc);
    setMetaTag('name', 'keywords', pageKeywords);

    const ogTitle = pageTitle;
    const ogDesc = pageDesc;
    let ogImage = seoSettings?.ogImageUrl || '/logo.png';
    if (ogImage && !ogImage.startsWith('http') && typeof window !== 'undefined') {
      ogImage = window.location.origin + (ogImage.startsWith('/') ? '' : '/') + ogImage;
    }

    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', 'website');
    if (typeof window !== 'undefined') {
      setMetaTag('property', 'og:url', window.location.href);
    }
  }, [currentSlugParam, currentCategoryObj, currentLang]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentSlugParam, searchQuery, inStockOnly, selectedBrand, sortBy, itemsPerPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSlugParam, currentPage]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    productsList.forEach((p) => {
      if (!p) return;
      if (p.brand && typeof p.brand === 'string' && p.brand.trim()) {
        brands.add(p.brand.trim());
        return;
      }
      const nameStr = typeof p.name === 'string' ? p.name : getLocalizedText(p.name, currentLang, '');
      const nameParts = (nameStr || '').trim().split(' ');
      if (nameParts.length > 0 && nameParts[0] && nameParts[0].length > 1) {
        brands.add(nameParts[0].toUpperCase());
      }
    });
    return Array.from(brands).sort();
  }, [productsList, currentLang]);

  // Mahsulotlar filtri
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      if (!product) return false;
      
      if (activeCategoryId !== 'all') {
        const prodCat = String(product.category || (product as any).categoryId || '');

        let isMatch = prodCat === String(activeCategoryId);

        if (!isMatch && currentCategoryObj) {
          const childCategories = categoriesList.filter(c => String(c.parentId) === String(currentCategoryObj.id));
          const childIds = childCategories.map(c => String(c.id));
          if (childIds.includes(prodCat)) {
            isMatch = true;
          }
        }

        if (!isMatch) return false;
      }

      if (inStockOnly && !product.inStock) return false;

      if (selectedBrand !== 'all') {
        const brandLower = selectedBrand.toLowerCase();
        const pBrand = (product.brand || '').toLowerCase();
        const pName = (typeof product.name === 'string' ? product.name : getLocalizedText(product.name, currentLang, '')).toLowerCase();
        const pModel = (product.model || '').toLowerCase();
        const brandMatch = pBrand === brandLower || pName.includes(brandLower) || pModel.includes(brandLower);
        if (!brandMatch) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const pName = typeof product.name === 'string' ? product.name : getLocalizedText(product.name, currentLang, '');
        const pModel = product.model || '';
        const pBrand = product.brand || '';
        const matchName = pName.toLowerCase().includes(q);
        const matchModel = pModel.toLowerCase().includes(q);
        const matchBrand = pBrand.toLowerCase().includes(q);
        const matchDesc = stripHtml(getLocalizedText(product.description, currentLang)).toLowerCase().includes(q);
        const matchSpec = Array.isArray(product.specs) && product.specs.some((s) => {
          const specName = getSpecName(s, currentLang);
          const specVal = typeof s?.value === 'object' ? getLocalizedText(s.value, currentLang) : String(s?.value || '');
          return specVal.toLowerCase().includes(q) || specName.toLowerCase().includes(q);
        });
        if (!matchName && !matchModel && !matchBrand && !matchDesc && !matchSpec) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name-asc') {
        const nameA = typeof a.name === 'string' ? a.name : getLocalizedText(a.name, currentLang, '');
        const nameB = typeof b.name === 'string' ? b.name : getLocalizedText(b.name, currentLang, '');
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name-desc') {
        const nameA = typeof a.name === 'string' ? a.name : getLocalizedText(a.name, currentLang, '');
        const nameB = typeof b.name === 'string' ? b.name : getLocalizedText(b.name, currentLang, '');
        return nameB.localeCompare(nameA);
      }
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });
  }, [productsList, activeCategoryId, currentCategoryObj, categoriesList, inStockOnly, selectedBrand, searchQuery, sortBy, currentLang]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPaginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Radar': return <Radar className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const breadcrumbs = (currentSlugParam === 'all' || !currentCategoryObj)
    ? [{ label: currentLang === 'ru' ? 'Каталог' : 'Katalog' }]
    : [
        { label: currentLang === 'ru' ? 'Каталог' : 'Katalog', to: '/catalog' },
        { label: cleanCategoryTitle(getLocalizedText(currentCategoryObj.name, currentLang, currentCategoryObj.id)) }
      ];

  const handleCategoryChange = (target: any) => {
    if (target === 'all' || !target) {
      navigate('/catalog');
    } else {
      const safeSlug = getSafeCategorySlug(target, currentLang);
      if (safeSlug) {
        navigate(`/catalog/${safeSlug}`);
      } else {
        navigate('/catalog');
      }
    }
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategorySearch('');
    setInStockOnly(false);
    setSelectedBrand('all');
    setSortBy('default');
    navigate('/catalog');
  };

  const hasActiveFilters = searchQuery !== '' || inStockOnly || selectedBrand !== 'all' || (currentSlugParam !== 'all' && currentSlugParam !== '');

  const filteredCategoriesTree = useMemo(() => {
    if (!categorySearch.trim()) return categoryTree;
    const q = categorySearch.toLowerCase();
    return categoryTree.filter((cat) => {
      const rootMatch = cleanCategoryTitle(getLocalizedText(cat.name, currentLang, cat.id)).toLowerCase().includes(q);
      const childMatch = cat.children.some(c => cleanCategoryTitle(getLocalizedText(c.name, currentLang, c.id)).toLowerCase().includes(q));
      return rootMatch || childMatch;
    });
  }, [categoryTree, categorySearch, currentLang]);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* 1. HERO BANNER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
              MAXTRON STORE
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-xs text-gray-400 font-medium">
              {currentLang === 'ru' ? 'Прямые поставки со склада в Ташкенте' : "Toshkent omboridan to'g'ridan-to'g'ri sotuv"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {currentCategoryObj 
              ? cleanCategoryTitle(getLocalizedText(currentCategoryObj.name, currentLang, currentCategoryObj.id))
              : (currentLang === 'ru' ? 'Каталог промышленного оборудования' : 'Sanoat uskunalari katalogi')}
          </h1>

          <p className="text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
            {currentCategoryObj 
              ? stripHtml(getLocalizedText(currentCategoryObj.description, currentLang))
              : (currentLang === 'ru' 
                  ? 'Высокоточное сертифицированное контрольно-измерительное оборудование для предприятий Узбекистана.' 
                  : "O‘zbekiston korxonalari uchun yuqori aniqlikdagi rasmiy sertifikatlangan o‘lchov va nazorat uskunalari.")}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm font-semibold text-white hover:bg-gray-800 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>{currentLang === 'ru' ? 'Категории и Фильтры' : 'Kategoriyalar va Filtrlar'}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
          </button>
        </div>
      </div>

      {/* 2. MAHSULOTLAR VA SIDEBAR FILTRI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Chap Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24">
          
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span>{currentLang === 'ru' ? 'Категории' : 'Kategoriyalar'}</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                {categoriesList.length}
              </span>
            </div>

            {categoriesList.length > 8 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={currentLang === 'ru' ? 'Поиск категории...' : 'Toifani topish...'}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-7 pr-6 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3 h-3 text-gray-500 absolute left-2 top-2.5" />
                {categorySearch && (
                  <button onClick={() => setCategorySearch('')} className="absolute right-2 top-2 text-gray-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Akkordeon Kategoriyalar Daraxti */}
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentSlugParam === 'all' || !currentCategoryObj
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{currentLang === 'ru' ? 'Все категории' : 'Barcha kategoriyalar'}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  currentSlugParam === 'all' || !currentCategoryObj ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  {productsList.length}
                </span>
              </button>

              {filteredCategoriesTree.map((cat) => {
                const catIdStr = String(cat.id);
                const hasChildren = cat.children && cat.children.length > 0;
                const isExpanded = Boolean(expandedCategories[catIdStr]) || categorySearch.trim().length > 0;

                const isRootActive = (currentCategoryObj && String(currentCategoryObj.id) === catIdStr);
                const isAnyChildActive = cat.children.some(c => currentCategoryObj && String(currentCategoryObj.id) === String(c.id));
                const totalCatCount = getCategoryTotalCount(cat.id, cat.children);

                return (
                  <div key={cat.id} className="space-y-1">
                    
                    <div 
                      className={`flex items-center justify-between rounded-xl transition-all ${
                        isRootActive 
                          ? 'bg-blue-600 text-white shadow-md font-bold' 
                          : isAnyChildActive
                          ? 'bg-blue-950/40 text-blue-300 border border-blue-800/50'
                          : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => handleCategoryChange(cat)}
                        className="flex-1 flex items-center gap-2 px-3 py-2 text-xs text-left truncate cursor-pointer"
                      >
                        <span className={isRootActive ? 'text-white' : 'text-blue-400 shrink-0'}>
                          {getCategoryIcon(cat.icon || '')}
                        </span>
                        <span className="truncate">{cleanCategoryTitle(getLocalizedText(cat.name, currentLang, cat.id))}</span>
                      </button>

                      <div className="flex items-center gap-1 pr-2 shrink-0">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                          isRootActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {totalCatCount}
                        </span>

                        {hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => toggleCategoryExpand(e, catIdStr)}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-blue-500/30 ml-3.5 animate-in fade-in duration-200">
                        {cat.children.map((child) => {
                          const isChildActive = currentCategoryObj && String(currentCategoryObj.id) === String(child.id);
                          const childCount = productsList.filter(p => String(p.category || (p as any).categoryId) === String(child.id)).length;

                          return (
                            <button
                              key={child.id}
                              onClick={() => handleCategoryChange(child)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                isChildActive
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow'
                                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <CornerDownRight className={`w-3 h-3 ${isChildActive ? 'text-white' : 'text-gray-500'}`} />
                                <span className="truncate">{cleanCategoryTitle(getLocalizedText(child.name, currentLang, child.id))}</span>
                              </div>
                              <span className={`text-[9px] font-mono px-1 rounded ${
                                isChildActive ? 'bg-white/20 text-white' : 'bg-gray-800/80 text-gray-500'
                              }`}>
                                {childCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>{currentLang === 'ru' ? 'Фильтры' : 'Filtrlar'}</span>
              </h3>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                  <RotateCcw className="w-3 h-3" /> {currentLang === 'ru' ? 'Сброс' : 'Tozalash'}
                </button>
              )}
            </div>

            <div>
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 cursor-pointer transition select-none">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-gray-200">
                    {currentLang === 'ru' ? 'В наличии в Ташкенте' : 'Toshkentda mavjud'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-gray-900 border-gray-700 cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                {currentLang === 'ru' ? 'Бренд / Производитель' : 'Brend / Ishlab chiqaruvchi'}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">{currentLang === 'ru' ? 'Все бренды' : 'Barcha brendlar'}</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/50 text-[11px] text-gray-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-400">
                <Award className="w-3.5 h-3.5" />
                <span>{currentLang === 'ru' ? '100% Официальная гарантия' : '100% Rasmiy kafolat'}</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                {currentLang === 'ru' 
                  ? 'Все приборы с паспортом и поверкой.'
                  : "Barcha uskunalar metrologik tekshirilgan."}
              </p>
            </div>
          </div>
        </aside>

        {/* O'ng tomon: Mahsulotlar */}
        <main className="lg:col-span-3 space-y-6">
          
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={currentLang === 'ru' ? 'Поиск по названию, модели или параметру...' : "Uskuna nomi, modeli yoki parametri bo'yicha qidirish..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-950 border border-gray-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-xs text-gray-400 hover:text-white p-0.5 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2.5 rounded-2xl bg-gray-950 border border-gray-800 text-xs font-semibold text-gray-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="default">{currentLang === 'ru' ? 'По умолчанию' : 'Odatiy saralash'}</option>
                    <option value="popular">{currentLang === 'ru' ? 'По популярности' : "Ommaboplik bo'yicha"}</option>
                    <option value="price-asc">{currentLang === 'ru' ? 'Сначала дешевле' : 'Narxi: Arzondan qimmatga'}</option>
                    <option value="price-desc">{currentLang === 'ru' ? 'Сначала дороже' : 'Narxi: Qimmatdan arzonga'}</option>
                    <option value="name-asc">{currentLang === 'ru' ? 'По названию (А - Я)' : 'Nomi (A - Z)'}</option>
                    <option value="name-desc">{currentLang === 'ru' ? 'По названию (Я - А)' : 'Nomi (Z - A)'}</option>
                    <option value="newest">{currentLang === 'ru' ? 'Новые модели' : 'Yangi modellar'}</option>
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-2xl bg-gray-950 border border-gray-800 text-xs font-semibold text-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                </select>

                <div className="hidden sm:flex items-center bg-gray-950 p-1 rounded-2xl border border-gray-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800/80 gap-2">
              <div className="flex items-center gap-1.5">
                <span>{currentLang === 'ru' ? 'Показано:' : "Ko'rsatilmoqda:"}</span>
                <span className="font-bold text-white font-mono">{totalItems > 0 ? `${startIndex + 1}–${endIndex}` : '0'}</span>
                <span>{currentLang === 'ru' ? 'из' : 'dan'}</span>
                <span className="font-bold text-white font-mono">{totalItems}</span>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mahsulotlar ro'yxati */}
          {loading ? (
            <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 text-gray-400 text-sm">
              {currentLang === 'ru' ? 'Загрузка оборудования из базы...' : "Uskunalar bazadan yuklanmoqda..."}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 shadow-xl px-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-500 mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {currentLang === 'ru' ? 'По вашему запросу ничего не найдено' : "So'rovingiz bo'yicha uskuna topilmadi"}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                {currentLang === 'ru' ? 'Попробуйте изменить параметры поиска.' : "Qidiruv parametrlarini o'zgartirib ko'ring."}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                {currentLang === 'ru' ? 'Показать все товары' : "Barcha uskunalarni ko'rsatish"}
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-4'}>
              {currentPaginatedProducts.map((product) => {
                const safeSlug = getSafeProductSlug(product, currentLang);
                return (
                  <ProductCard
                    key={safeSlug || Math.random()}
                    product={product}
                    currentLang={currentLang}
                    onSelect={() => {
                      if (safeSlug) {
                        navigate(`/product/${safeSlug}`);
                      }
                    }}
                    onOpenQuote={onOpenQuote}
                    isCompared={comparedProducts.includes(safeSlug) || comparedProducts.includes(String(product.id))}
                    onToggleCompare={onToggleCompare}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="text-xs text-gray-400">
                <span>{currentLang === 'ru' ? 'Страница: ' : 'Sahifa: '}</span>
                <span className="font-bold text-white font-mono">{currentPage}</span>
                <span> / </span>
                <span className="font-bold text-white font-mono">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    currentPage === 1 ? 'bg-gray-950 text-gray-600 border border-gray-800/50 cursor-not-allowed' : 'bg-gray-950 text-gray-200 hover:bg-gray-800 border border-gray-800 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'bg-gray-950 text-gray-300 hover:bg-gray-800 border border-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    currentPage === totalPages ? 'bg-gray-950 text-gray-600 border border-gray-800/50 cursor-not-allowed' : 'bg-gray-950 text-gray-200 hover:bg-gray-800 border border-gray-800 cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-gray-950 border-l border-gray-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                  <span>{currentLang === 'ru' ? 'Категории & Фильтры' : 'Kategoriyalar & Filtrlar'}</span>
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {currentLang === 'ru' ? 'Категории' : 'Kategoriyalar'}
                </label>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      currentSlugParam === 'all' || !currentCategoryObj ? 'bg-blue-600 text-white font-bold' : 'bg-gray-900 text-gray-300'
                    }`}
                  >
                    <span>{currentLang === 'ru' ? 'Все категории' : 'Barcha kategoriyalar'}</span>
                    <span className="font-mono text-[10px]">({productsList.length})</span>
                  </button>

                  {filteredCategoriesTree.map((cat) => {
                    const catIdStr = String(cat.id);
                    const isExpanded = Boolean(expandedCategories[catIdStr]);
                    const hasChildren = cat.children && cat.children.length > 0;
                    const isRootActive = currentCategoryObj && String(currentCategoryObj.id) === catIdStr;

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                          isRootActive ? 'bg-blue-600 text-white font-bold' : 'bg-gray-900 text-gray-300'
                        }`}>
                          <button
                            onClick={() => handleCategoryChange(cat)}
                            className="flex-1 text-left truncate cursor-pointer"
                          >
                            <span className="truncate">{cleanCategoryTitle(getLocalizedText(cat.name, currentLang, cat.id))}</span>
                          </button>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => toggleCategoryExpand(e, catIdStr)}
                              className="p-1 text-gray-400 hover:text-white cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {hasChildren && isExpanded && (
                          <div className="pl-4 space-y-1 border-l border-blue-500/30 ml-3">
                            {cat.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleCategoryChange(child)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] truncate ${
                                  currentCategoryObj && String(currentCategoryObj.id) === String(child.id)
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-gray-400 hover:text-white bg-gray-900/50'
                                }`}
                              >
                                {cleanCategoryTitle(getLocalizedText(child.name, currentLang, child.id))}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-white">
                  <span>{currentLang === 'ru' ? 'В наличии в Ташкенте' : 'Toshkentda mavjud'}</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 w-4 h-4 bg-gray-950 border-gray-700 cursor-pointer"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {currentLang === 'ru' ? 'Бренды' : 'Brendlar'}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white cursor-pointer"
                >
                  <option value="all">{currentLang === 'ru' ? 'Все бренды' : 'Barcha brendlar'}</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                {currentLang === 'ru' ? `Показать результаты (${totalItems})` : `Natijalarni ko'rish (${totalItems})`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};