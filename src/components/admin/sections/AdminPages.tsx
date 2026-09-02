import React, { useState } from 'react';
import { Search, Plus, FileText, Edit3, Trash2 } from 'lucide-react';
import { CustomPage } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';

interface AdminPagesProps {
  pages: CustomPage[];
  setPageToEdit: (p: CustomPage | null) => void;
  setIsPageModalOpen: (open: boolean) => void;
  triggerDeletePage: (p: CustomPage) => void;
}

export const AdminPages: React.FC<AdminPagesProps> = ({
  pages,
  setPageToEdit,
  setIsPageModalOpen,
  triggerDeletePage
}) => {
  const [pageSearch, setPageSearch] = useState('');

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Саҳифа номи ёки slug бўйича қидириш..."
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={() => { setPageToEdit(null); setIsPageModalOpen(true); }}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Янги саҳифа қўшиш</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages
          .filter((p) => {
            const pageTitle = getLocalizedText(p.title, 'uz_cyrl');
            const pageSlug = p.slug || '';
            return pageTitle.toLowerCase().includes(pageSearch.toLowerCase()) || pageSlug.toLowerCase().includes(pageSearch.toLowerCase());
          })
          .map((page) => (
            <div key={page.id} className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 hover:border-gray-700 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { setPageToEdit(page); setIsPageModalOpen(true); }}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
                      title="Таҳрирлаш"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerDeletePage(page)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Ўчириш"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    /{page.slug}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-2">
                    {getLocalizedText(page.title, 'uz_cyrl', page.slug)}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                    {getLocalizedText(page.subtitle, 'uz_cyrl', 'Қўшимча саҳифа тавсифи')}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-mono">Яратилган: {new Date(page.createdAt).toLocaleDateString('uz-UZ')}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${page.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'}`}>
                  {page.isPublished ? 'Фаол' : 'Қоралама'}
                </span>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
};
