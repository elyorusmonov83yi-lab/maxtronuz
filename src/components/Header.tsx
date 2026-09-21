"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from '@/utils/navigation';
import { 
  Activity, 
  Search, 
  Menu, 
  X, 
  Scale, 
  PhoneCall, 
  FileText,
  ChevronDown,
  Warehouse,
  Truck,
  Clock,
  Layers,
  Lock,
  Send,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Language, CustomPage, HeaderSettings, CategoryInfo, Product } from '../types';
import { translations } from '../data/translations';
import { ApiService } from '../services/api';
import { 
  getLocalizedText, 
  getSafeProductSlug, 
  getSafeCategorySlug 
} from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  compareCount?: number;
  onOpenQuoteModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  compareCount = 0,
  onOpenQuoteModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  // Mega Menu Ierarxiya holati
  const [activeParentCategoryId, setActiveParentCategoryId] = useState<string>('');
  const [activeChildCategoryId, setActiveChildCategoryId] = useState<string>('');
  const [megaSearchQuery, setMegaSearchQuery] = useState('');
  
  // Qidiruv holati
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Ma'lumotlar
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    logoText: 'MAXTRON',
    logoAccentText: '.UZ',
    logoSubtitle: { uz: "O'lchov va nazorat uskunalari", ru: 'КИПиА & Метрология' },
    topbarWarehouse: { uz: 'Toshkent ombori: 200+ model', ru: 'Склад в Ташкенте: 200+ моделей' },
    topbarDelivery: { uz: 'O‘zbekiston bo‘ylab yetkazish', ru: 'Доставка по всему Узбекистану' },
    topbarSchedule: { uz: '09:00 - 18:00', ru: '09:00 - 18:00' },
    phone: '+998 71 200-88-44',
    email: 'info@maxtron.uz',
    telegramUser: '@maxtron_uz',
    telegramUrl: 'https://t.me/maxtron_uz'
  });

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[currentLang] || translations.ru;

  const languages: { code: Language; label: string; short: string; flag: string }[] = [
    { code: 'ru', label: 'Русский', short: 'RU', flag: '🇷🇺' },
    { code: 'uz', label: "O'zbekcha", short: 'UZ', flag: '🇺🇿' }
  ];

  const currentLangItem = languages.find(l => l.code === currentLang) || languages[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods, pages, settings] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getProducts(),
          ApiService.getPages(),
          ApiService.getHeaderSettings(),
        ]);
        if (cats && Array.isArray(cats)) {
          setCategories(cats);
          const firstParent = cats.find(c => !c.parentId) || cats[0];
          if (firstParent) {
            setActiveParentCategoryId(firstParent.id);
            const firstChild = cats.find(c => c.parentId === firstParent.id);
            setActiveChildCategoryId(firstChild ? firstChild.id : firstParent.id);
          }
        }
        if (prods && Array.isArray(prods)) setProducts(prods);
        if (pages && Array.isArray(pages)) setCustomPages(pages);
        if (settings && Object.keys(settings).length > 0) setHeaderSettings(settings);
      } catch (err) {
        console.error('Header ma’lumot yuklashda xatolik:', err);
      }
    };

    fetchData();

    const handleHeaderUpdated = (e: any) => {
      if (e.detail) setHeaderSettings(e.detail);
    };
    window.addEventListener('maxtron_header_updated', handleHeaderUpdated);
    return () => window.removeEventListener('maxtron_header_updated', handleHeaderUpdated);
  }, []);

  // Bazadan kelgan faviconni brauzer tabiga dinamik o'rnatish
  useEffect(() => {
    if (headerSettings?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = headerSettings.faviconUrl;
    }
  }, [headerSettings?.faviconUrl]);

  // Tashqariga bosganda yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (megaMenuContainerRef.current && !megaMenuContainerRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocalizedUrl = (path: string) => {
    if (currentLang === 'ru') return path;
    return `/${currentLang}${path === '/' ? '' : path}`;
  };

  const handleSwitchLanguage = (newLang: Language) => {
    if (newLang === currentLang) {
      setLangDropdownOpen(false);
      return;
    }

    const currentPath = location.pathname;
    const cleanPath = currentPath.replace(/^\/(uz|ru)/, '') || '/';
    const segments = cleanPath.split('/').filter(Boolean);

    let targetPath = cleanPath;

    if (segments[0] === 'catalog' && segments[1]) {
      const currentCatSlug = decodeURIComponent(segments[1]).toLowerCase();
      const foundCategory = categories.find((cat) => {
        const slugRu = getSafeCategorySlug(cat, 'ru').toLowerCase();
        const slugUz = getSafeCategorySlug(cat, 'uz').toLowerCase();
        const catId = String(cat.id).toLowerCase();
        return currentCatSlug === slugRu || currentCatSlug === slugUz || currentCatSlug === catId;
      });
      if (foundCategory) {
        targetPath = `/catalog/${getSafeCategorySlug(foundCategory, newLang)}`;
      }
    } else if (segments[0] === 'product' && segments[1]) {
      const currentProdSlug = decodeURIComponent(segments[1]).toLowerCase();
      const foundProduct = products.find((prod) => {
        const slugRu = getSafeProductSlug(prod, 'ru').toLowerCase();
        const slugUz = getSafeProductSlug(prod, 'uz').toLowerCase();
        const prodId = String(prod.id).toLowerCase();
        return currentProdSlug === slugRu || currentProdSlug === slugUz || currentProdSlug === prodId;
      });
      if (foundProduct) {
        targetPath = `/product/${getSafeProductSlug(foundProduct, newLang)}`;
      }
    }

    const finalUrl = newLang === 'ru' ? targetPath : `/uz${targetPath === '/' ? '' : targetPath}`;

    onLanguageChange(newLang);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(finalUrl);
  };

  const navLinks = [
    { to: getLocalizedUrl('/'), label: t.nav_home || (currentLang === 'ru' ? 'Главная' : 'Bosh sahifa') },
    { to: getLocalizedUrl('/catalog'), label: t.nav_catalog || (currentLang === 'ru' ? 'Каталог' : 'Katalog') },
    { to: getLocalizedUrl('/certificates'), label: t.nav_certificates || (currentLang === 'ru' ? 'Сертификаты' : 'Sertifikatlar') },
    { to: getLocalizedUrl('/about'), label: t.nav_about || (currentLang === 'ru' ? 'О компании' : 'Biz haqimizda') },
    { to: getLocalizedUrl('/contact'), label: t.nav_contact || (currentLang === 'ru' ? 'Контакты' : 'Bog‘lanish') },
  ];

  const headerCustomPages = customPages.filter(
    (p) => p.isPublished && p.showInHeader && !['page-delivery', 'page-warranty'].includes(p.id)
  );

  const searchResults = searchQuery.trim()
    ? products.filter((p) => {
        const titleRu = getLocalizedText(p.name || (p as any).title, 'ru', '').toLowerCase();
        const titleUz = getLocalizedText(p.name || (p as any).title, 'uz', '').toLowerCase();
        const model = (p.model || (p as any).code || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();
        return titleRu.includes(q) || titleUz.includes(q) || model.includes(q);
      }).slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${getLocalizedUrl('/catalog')}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const parentCategories = categories.filter(c => !c.parentId);
  const filteredParentCategories = parentCategories.filter(c => {
    const name = getLocalizedText(c.name, currentLang, '').toLowerCase();
    return !megaSearchQuery.trim() || name.includes(megaSearchQuery.toLowerCase().trim());
  });

  const currentChildCategories = categories.filter(c => c.parentId === activeParentCategoryId);
  const activeParentObj = categories.find(c => c.id === activeParentCategoryId);
  const targetCategoryForProducts = activeChildCategoryId || activeParentCategoryId;
  const activeCategoryObj = categories.find(c => c.id === targetCategoryForProducts) || activeParentObj;
  
  const displayProducts = products.filter(p => {
    if (p.category === targetCategoryForProducts) return true;
    const childIds = currentChildCategories.map(ch => ch.id);
    return childIds.includes(p.category);
  });

  const topbarWarehouseText = getLocalizedText(headerSettings.topbarWarehouse, currentLang, currentLang === 'ru' ? 'Склад в Ташкенте' : 'Toshkent ombori');
  const topbarDeliveryText = getLocalizedText(headerSettings.topbarDelivery, currentLang, currentLang === 'ru' ? 'Доставка по РУз' : 'Yetkazib berish');
  const phoneNumber = headerSettings.phonePrimary || headerSettings.phone || '+998 71 200-88-44';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl transition-all">
      
      {/* 1. KICHIK TOP BAR */}
      <div className="hidden lg:block bg-gray-900/60 border-b border-gray-800/60 py-1 text-[11px] text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Warehouse className="w-3.5 h-3.5 text-blue-400" />
              <span>{topbarWarehouseText}</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{topbarDeliveryText}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {headerSettings.telegramUser && (
              <a
                href={headerSettings.telegramUrl || `https://t.me/${headerSettings.telegramUser.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Send className="w-3 h-3" />
                <span>{headerSettings.telegramUser}</span>
              </a>
            )}
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{getLocalizedText(headerSettings.topbarSchedule, currentLang, '09:00 - 18:00')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. ASOSIY HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logotip */}
          <Link 
            href={getLocalizedUrl('/')}
            className="flex items-center gap-3 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            {headerSettings.logoImageUrl ? (
              <img 
                src={headerSettings.logoImageUrl} 
                alt={headerSettings.logoText || 'MAXTRON'} 
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-wider text-white flex items-center gap-0.5 leading-none">
                    {headerSettings.logoText || 'MAXTRON'}
                    <span className="text-blue-500 text-xs">{headerSettings.logoAccentText || '.UZ'}</span>
                  </span>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-tight mt-0.5">
                    {getLocalizedText(headerSettings.logoSubtitle, currentLang, currentLang === 'ru' ? 'КИПиА & Метрология' : 'O‘lchov uskunalari')}
                  </p>
                </div>
              </div>
            )}
          </Link>

          {/* Jonli Qidiruv */}
          <div className="relative flex-1 max-w-xl hidden md:block" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={currentLang === 'ru' ? 'Поиск модели, артикула, прибора...' : 'Model, artikul yoki uskuna qidirish...'}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/98 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl p-2 z-50">
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((p) => {
                      const title = getLocalizedText(p.name || (p as any).title, currentLang, p.id);
                      const safeSlug = getSafeProductSlug(p, currentLang);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery('');
                            if (safeSlug) {
                              navigate(getLocalizedUrl(`/product/${safeSlug}`));
                            }
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-gray-800 text-xs cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {p.image ? (
                              <img src={p.image} alt="" className="w-7 h-7 rounded-lg object-contain bg-gray-950 p-0.5 shrink-0" />
                            ) : (
                              <Layers className="w-4 h-4 text-gray-500 shrink-0" />
                            )}
                            <span className="text-gray-200 font-medium truncate">{title}</span>
                          </div>
                          {p.model && (
                            <span className="text-[10px] font-mono bg-gray-950 text-blue-400 px-2 py-0.5 rounded-md border border-gray-800 shrink-0">
                              {typeof p.model === 'object' ? getLocalizedText(p.model, currentLang) : p.model}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    {currentLang === 'ru' ? 'Ничего не найдено' : 'Hech narsa topilmadi'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* O'ng tomon */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} 
              className="hidden sm:flex items-center gap-2 text-right group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-gray-400 leading-none">{currentLang === 'ru' ? 'Отдел продаж' : 'Sotuv bo‘limi'}</span>
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition">{phoneNumber}</span>
              </div>
            </a>

            {/* Til Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 text-xs font-bold text-gray-200 transition cursor-pointer"
              >
                <span>{currentLangItem.flag}</span>
                <span>{currentLangItem.short}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {languages.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSwitchLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. PASTKI NAVIGATSIYA */}
      <div className="hidden lg:block bg-gray-950 border-t border-gray-800/80 px-4 sm:px-6 lg:px-8 relative" ref={megaMenuContainerRef}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="py-1.5">
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  isMegaMenuOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{currentLang === 'ru' ? 'Каталог оборудования' : 'Uskunalar katalogi'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <nav className="flex items-center gap-1 ml-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                      isActive ? 'text-blue-400 bg-blue-600/10 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {headerCustomPages.map((page) => {
                const pageUrl = getLocalizedUrl(`/page/${page.slug}`);
                const isActive = location.pathname === pageUrl;
                return (
                  <Link
                    key={page.id}
                    href={pageUrl}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                      isActive ? 'text-blue-400 bg-blue-600/10 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    {getLocalizedText(page.title, currentLang)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 py-1.5 text-xs">
            <Link
              href="/compare"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition px-2.5 py-1.5 rounded-xl hover:bg-gray-900"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.nav_compare || (currentLang === 'ru' ? 'Сравнение' : 'Solishtirish')}</span>
              {compareCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition px-2.5 py-1.5 rounded-xl hover:bg-gray-900"
            >
              <Lock className="w-3 h-3 text-blue-400/80" />
              <span>Admin</span>
            </Link>
          </div>

        </div>

        {/* MEGA MENU */}
        {isMegaMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-950/98 backdrop-blur-3xl border-b border-t border-gray-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-12 gap-5 min-h-[440px] max-h-[75vh]">
              
              <div className="col-span-12 lg:col-span-3 border-r border-gray-800/80 pr-3 flex flex-col h-full">
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={currentLang === 'ru' ? 'Фильтр направлений...' : 'Asosiy toifalar...'}
                    value={megaSearchQuery}
                    onChange={(e) => setMegaSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {filteredParentCategories.map((pCat) => {
                    const catName = getLocalizedText(pCat.name, currentLang, pCat.id);
                    const isSelected = activeParentCategoryId === pCat.id;
                    const childrenCount = categories.filter(c => c.parentId === pCat.id).length;
                    const safeCategorySlug = getSafeCategorySlug(pCat, currentLang);

                    return (
                      <div
                        key={pCat.id}
                        onMouseEnter={() => {
                          setActiveParentCategoryId(pCat.id);
                          const firstChild = categories.find(c => c.parentId === pCat.id);
                          setActiveChildCategoryId(firstChild ? firstChild.id : pCat.id);
                        }}
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          if (safeCategorySlug) navigate(getLocalizedUrl(`/catalog/${safeCategorySlug}`));
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer group ${
                          isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`p-1.5 rounded-lg border shrink-0 transition ${
                            isSelected ? 'bg-blue-700 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 group-hover:text-blue-400'
                          }`}>
                            <DynamicIcon name={pCat.icon} className="w-4 h-4" />
                          </div>
                          <span className="truncate">{catName}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {childrenCount > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                              isSelected ? 'bg-blue-800 text-blue-200' : 'bg-gray-900 text-gray-500'
                            }`}>
                              {childrenCount}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'text-gray-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-3 border-r border-gray-800/80 pr-3 flex flex-col h-full">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800/80 mb-2 flex items-center justify-between">
                  <span>{currentLang === 'ru' ? 'Подкатегории' : 'Kichik toifalar'}</span>
                  {activeParentObj && (
                    <span className="text-cyan-400 font-normal truncate max-w-[120px]">
                      {getLocalizedText(activeParentObj.name, currentLang, '')}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {activeParentObj && (
                    <div
                      onMouseEnter={() => setActiveChildCategoryId(activeParentObj.id)}
                      onClick={() => {
                        const safeCatSlug = getSafeCategorySlug(activeParentObj, currentLang);
                        setIsMegaMenuOpen(false);
                        if (safeCatSlug) navigate(getLocalizedUrl(`/catalog/${safeCatSlug}`));
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        activeChildCategoryId === activeParentObj.id
                          ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-bold'
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <span>{currentLang === 'ru' ? '— Все подкатегории раздела —' : '— Barcha kichik toifalar —'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {currentChildCategories.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      {currentLang === 'ru' ? 'Прямые подкатегории отсутствуют' : 'Kichik toifalar mavjud emas'}
                    </div>
                  ) : (
                    currentChildCategories.map((chCat) => {
                      const childName = getLocalizedText(chCat.name, currentLang, chCat.id);
                      const isChildSelected = activeChildCategoryId === chCat.id;
                      const childProdsCount = products.filter(p => p.category === chCat.id).length;
                      const safeChildSlug = getSafeCategorySlug(chCat, currentLang);

                      return (
                        <div
                          key={chCat.id}
                          onMouseEnter={() => setActiveChildCategoryId(chCat.id)}
                          onClick={() => {
                            setIsMegaMenuOpen(false);
                            if (safeChildSlug) navigate(getLocalizedUrl(`/catalog/${safeChildSlug}`));
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer group ${
                            isChildSelected
                              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span className="truncate">{childName}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-gray-900 text-gray-400">
                              {childProdsCount}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6 flex flex-col justify-between overflow-y-auto pl-1">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{activeCategoryObj ? getLocalizedText(activeCategoryObj.name, currentLang, '') : ''}</span>
                        <span className="text-xs font-normal text-gray-400">
                          ({displayProducts.length} {currentLang === 'ru' ? 'приборов' : 'ta uskuna'})
                        </span>
                      </h4>
                    </div>

                    {activeCategoryObj && (
                      <button
                        type="button"
                        onClick={() => {
                          const safeCatSlug = getSafeCategorySlug(activeCategoryObj, currentLang);
                          setIsMegaMenuOpen(false);
                          if (safeCatSlug) navigate(getLocalizedUrl(`/catalog/${safeCatSlug}`));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>{currentLang === 'ru' ? 'В раздел' : 'Toifaga o‘tish'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {displayProducts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-500">
                      {currentLang === 'ru' ? 'В данной категории пока нет товаров' : 'Ushbu toifada hali mahsulotlar mavjud emas'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {displayProducts.slice(0, 4).map((prod) => {
                        const prodTitle = getLocalizedText(prod.name || (prod as any).title, currentLang, prod.id);
                        const safeProdSlug = getSafeProductSlug(prod, currentLang);

                        return (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              if (safeProdSlug) navigate(getLocalizedUrl(`/product/${safeProdSlug}`));
                            }}
                            className="p-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-blue-500/40 hover:bg-gray-900 transition cursor-pointer flex flex-col justify-between group"
                          >
                            <div className="space-y-2">
                              <div className="w-full h-20 rounded-xl bg-gray-950 p-1.5 flex items-center justify-center overflow-hidden border border-gray-800/50">
                                {prod.image ? (
                                  <img src={prod.image} alt="" className="w-full h-full object-contain group-hover:scale-105 transition" />
                                ) : (
                                  <Layers className="w-5 h-5 text-gray-600" />
                                )}
                              </div>

                              <div>
                                {prod.model && (
                                  <span className="text-[10px] font-mono text-cyan-400 block font-semibold">
                                    {typeof prod.model === 'object' ? getLocalizedText(prod.model, currentLang) : prod.model}
                                  </span>
                                )}
                                <h5 className="text-[11px] font-bold text-gray-200 group-hover:text-blue-400 transition line-clamp-1">
                                  {prodTitle}
                                </h5>
                              </div>
                            </div>

                            <div className="pt-2 mt-1 border-t border-gray-800/60 flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">
                                {getLocalizedText(prod.priceFormatted, currentLang, currentLang === 'ru' ? 'По запросу' : "So'rov bo'yicha")}
                              </span>
                              <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                                <span>{currentLang === 'ru' ? 'Подробнее' : 'Batafsil'}</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800/80 mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>{currentLang === 'ru' ? 'Официальная гарантия и сертификат поверки' : 'Rasmiy kafolat va metrologik sertifikat'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMegaMenuOpen(false);
                      navigate(getLocalizedUrl('/catalog'));
                    }}
                    className="font-bold text-white hover:text-blue-400 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentLang === 'ru' ? 'Весь каталог' : 'Barcha katalog'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 4. MOBIL MENYU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-950 border-t border-gray-800 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={currentLang === 'ru' ? 'Поиск прибора или модели...' : 'Qidirish...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </form>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>{currentLang === 'ru' ? 'Язык сайта:' : 'Sayt tili:'}</span>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleSwitchLanguage(l.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${currentLang === l.code ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-300'}`}
                >
                  {l.flag} {l.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};