"use client";

import React from 'react';
import { 
  TrendingUp, Package, Layers, Award, FileText, PhoneCall, 
  Handshake, Users, Globe, Layout, Building, MapPin, Sparkles, 
  Send, LogOut, X, Building2, Tag 
} from 'lucide-react';
import { AdminUser, Product, CategoryInfo, Certificate, CustomPage, ClientPartner, IndustryInfo, BrandInfo } from '@/types';
import { AdminQuoteRequest } from '@/services/storage';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentUser: { email: string; name: string } | null;
  handleLogout: () => void;
  products?: Product[];
  categories?: CategoryInfo[];
  certificates?: Certificate[];
  pages?: CustomPage[];
  quotes?: AdminQuoteRequest[];
  clients?: ClientPartner[];
  adminUsers?: AdminUser[];
  industries?: IndustryInfo[];
  brands?: BrandInfo[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  currentUser,
  handleLogout,
  products = [],
  categories = [],
  certificates = [],
  pages = [],
  quotes = [],
  clients = [],
  adminUsers = [],
  industries = [],
  brands = []
}) => {
  const newQuotesCount = quotes.filter(q => q.status === 'new').length;

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      
      {/* Sidebar Header Brand */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-base">
            M
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm tracking-tight">
              MAXTRON CMS
            </h2>
            <span className="text-[10px] text-blue-400 font-mono block">
              ADMIN PANEL v3.5
            </span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Profile Chip */}
      <div className="px-4 py-3 mx-4 my-4 rounded-2xl bg-gray-950/80 border border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name[0]?.toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-gray-400 truncate font-mono">
              {currentUser?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4">
        
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 pt-2 pb-1">
          Asosiy bo‘limlar
        </div>

        <button
          type="button"
          onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4" />
            <span>Dashbord & Statistika</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4" />
            <span>Mahsulotlar katalogi</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Kategoriyalar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('brands'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'brands'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-blue-400" />
            <span>Brendlar & Zavodlar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {brands.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('industries'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'industries'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Sanoat sohalari (Finder)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {industries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('certificates'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4" />
            <span>Sertifikatlar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {certificates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('pages'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4" />
            <span>Qo‘shimcha sahifalar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {pages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('quotes'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'quotes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4" />
            <span>Buyurtmalar & So‘rovlar</span>
          </div>
          {newQuotesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-gray-950 font-bold text-[10px]">
              {newQuotesCount} yangi
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'clients'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Handshake className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Mijozlar & Hamkorlar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {clients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Adminlar & Xodimlar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
            {adminUsers.length}
          </span>
        </button>

        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 pt-4 pb-1">
          Sayt tuzilishi va SEO
        </div>

        <button
          type="button"
          onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'home'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Bosh sahifa (Hero & Banner)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('header'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'header'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Header & Logotip</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('about'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'about'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Biz haqimizda</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('contacts'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Aloqa & Filiallar</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('seo'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>SEO, Teglar & Sitemap</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('telegram'); setIsSidebarOpen(false); }}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
            activeTab === 'telegram'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Telegram Bot Xabarlari</span>
        </button>

      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/60">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-gray-800/80 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>

    </aside>
  );
};