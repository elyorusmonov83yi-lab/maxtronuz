import React from 'react';
import { Menu, X, LogOut, ExternalLink } from 'lucide-react';

interface AdminTopBarProps {
  activeTab: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: '📊 Тизим ҳолати ва Статистика',
  products: '📦 Маҳсулотларни бошқариш',
  categories: '🗂️ Категориялар базаси',
  certificates: '📜 Давлат сертификатлари',
  pages: '📄 Саҳифалар ва Бўлимлар',
  quotes: '💬 Келиб тушган буюртмалар',
  clients: '🤝 Мижозлар ва Ҳамкорлар',
  users: '👥 Фойдаланувчилар ва Админлар',
  home: '🏠 Асосий саҳифа (Баннер ва матнлар)',
  header: '🖼️ Header ва Логотип созламалари',
  about: '🏢 «Биз ҳақимизда» саҳифаси',
  contacts: '📍 Алоқа ва Манзил созламалари',
  seo: '🔍 SEO Мета теглар ва Қидирув тизимлари',
  telegram: '✈️ Telegram Бот Интеграцияси'
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-gray-800 text-white"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-white text-sm">MAXTRON CMS</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Чиқиш</span>
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
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Сайтни кўриш</span>
          </a>
        </div>
      </header>
    </>
  );
};
