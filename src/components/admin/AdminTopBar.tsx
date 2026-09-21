"use client";

import React from 'react';
import { Menu, X, LogOut, ExternalLink } from 'lucide-react';

interface AdminTopBarProps {
  activeTab: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: '📊 Tizim holati va Statistika',
  products: '📦 Mahsulotlarni boshqarish',
  categories: '🗂️ Kategoriyalar bazasi',
  brands: '🏷️ Brendlar va Ishlab chiqaruvchilar',
  industries: '🏭 Sanoat sohalari (Finder)',
  certificates: '📜 Davlat sertifikatlari va ISO',
  pages: '📄 Qo‘shimcha sahifalar va CMS',
  quotes: '💬 Kelib tushgan buyurtmalar va So‘rovlar',
  clients: '🤝 Mijozlar va Hamkor korxonalar',
  users: '👥 Foydalanuvchilar va Adminlar',
  home: '🏠 Bosh sahifa (Banner va matnlar)',
  header: '🖼️ Header va Logotip sozlamalari',
  about: '🏢 «Biz haqimizda» sahifasi',
  contacts: '📍 Aloqa va Manzil sozlamalari',
  seo: '🔍 SEO Meta teglar va Qidiruv tizimlari',
  telegram: '✈️ Telegram Bot Integratsiyasi'
};

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  activeTab,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout
}) => {
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition"
            aria-label="Menyuni ochish/yopish"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-white text-sm tracking-tight">MAXTRON CMS</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>

      {/* Desktop Top Header Bar */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-gray-900/60 border-b border-gray-800 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-white uppercase tracking-wider">
            {TAB_TITLES[activeTab] || 'MAXTRON CMS'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-gray-700/60 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Saytni ko‘rish</span>
          </a>
        </div>
      </header>
    </>
  );
};