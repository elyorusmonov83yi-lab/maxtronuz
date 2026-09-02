import React from 'react';
import { Package, Layers, Award, PhoneCall, Handshake, Users, Sparkles, FileText } from 'lucide-react';
import { Product, CategoryInfo, Certificate, CustomPage, ClientPartner, AdminUser } from '../../../types';
import { AdminQuoteRequest } from '../../../services/storage';

interface AdminDashboardProps {
  products: Product[];
  categories: CategoryInfo[];
  certificates: Certificate[];
  pages: CustomPage[];
  quotes: AdminQuoteRequest[];
  clients: ClientPartner[];
  adminUsers: AdminUser[];
  setActiveTab: (tab: string) => void;
  setProductToEdit: (p: Product | null) => void;
  setIsProductModalOpen: (open: boolean) => void;
  setCategoryToEdit: (c: CategoryInfo | null) => void;
  setIsCategoryModalOpen: (open: boolean) => void;
  setCertToEdit: (c: Certificate | null) => void;
  setIsCertModalOpen: (open: boolean) => void;
  setPageToEdit: (p: CustomPage | null) => void;
  setIsPageModalOpen: (open: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  certificates,
  pages,
  quotes,
  clients,
  adminUsers,
  setActiveTab,
  setProductToEdit,
  setIsProductModalOpen,
  setCategoryToEdit,
  setIsCategoryModalOpen,
  setCertToEdit,
  setIsCertModalOpen,
  setPageToEdit,
  setIsPageModalOpen
}) => {
  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-blue-500/50 transition" onClick={() => setActiveTab('products')}>
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold text-gray-400">Маҳсулотлар</span>
            <Package className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">{products.length} та</div>
          <p className="text-[11px] text-gray-500">Каталогдаги фаол ускуналар</p>
        </div>

        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-cyan-500/50 transition" onClick={() => setActiveTab('categories')}>
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold text-gray-400">Категориялар</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">{categories.length} та</div>
          <p className="text-[11px] text-gray-500">Асосий саноат йўналишлари</p>
        </div>

        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab('certificates')}>
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-gray-400">Сертификатлар</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">{certificates.length} та</div>
          <p className="text-[11px] text-gray-500">Ўзстандарт ва ISO ҳужжатлари</p>
        </div>

        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-amber-500/50 transition" onClick={() => setActiveTab('quotes')}>
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-gray-400">Янги буюртмалар</span>
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">
            {quotes.filter(q => q.status === 'new').length} та
          </div>
          <p className="text-[11px] text-gray-500">Жами: {quotes.length} та сўров</p>
        </div>

        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-blue-500/50 transition" onClick={() => setActiveTab('clients')}>
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold text-gray-400">Ҳамкорлар</span>
            <Handshake className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{clients.length} та</div>
          <p className="text-[11px] text-gray-500">Мижозлар & Logotiplar</p>
        </div>

        <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-2 cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab('users')}>
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-gray-400">Админлар</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{adminUsers.length} та</div>
          <p className="text-[11px] text-gray-500">Тизим фойдаланувчилари</p>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Тезкор бошқарув амаллари</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => { setProductToEdit(null); setIsProductModalOpen(true); }}
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-blue-500 text-left transition space-y-1"
          >
            <Package className="w-5 h-5 text-blue-400" />
            <p className="text-xs font-bold text-white">+ Маҳсулот қўшиш</p>
            <p className="text-[10px] text-gray-500">Янги ускунани базага киритиш</p>
          </button>

          <button
            onClick={() => { setCategoryToEdit(null); setIsCategoryModalOpen(true); }}
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-blue-500 text-left transition space-y-1"
          >
            <Layers className="w-5 h-5 text-cyan-400" />
            <p className="text-xs font-bold text-white">+ Категория қўшиш</p>
            <p className="text-[10px] text-gray-500">Саноат тоифасини яратиш</p>
          </button>

          <button
            onClick={() => { setCertToEdit(null); setIsCertModalOpen(true); }}
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-blue-500 text-left transition space-y-1"
          >
            <Award className="w-5 h-5 text-emerald-400" />
            <p className="text-xs font-bold text-white">+ Сертификат қўшиш</p>
            <p className="text-[10px] text-gray-500">Давлат реестри бланкаси</p>
          </button>

          <button
            onClick={() => { setPageToEdit(null); setIsPageModalOpen(true); }}
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-blue-500 text-left transition space-y-1"
          >
            <FileText className="w-5 h-5 text-purple-400" />
            <p className="text-xs font-bold text-white">+ Янги саҳифа</p>
            <p className="text-[10px] text-gray-500">Маълумот бўлими яратиш</p>
          </button>
        </div>
      </div>

    </div>
  );
};
