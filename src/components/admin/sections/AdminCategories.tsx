"use client";

import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { CategoryInfo, Product } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';
import { DynamicIcon } from '../../DynamicIcon';

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

        <button
          type="button"
          onClick={() => { setCategoryToEdit(null); setIsCategoryModalOpen(true); }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Kategoriya qo'shish</span>
        </button>
      </div>

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