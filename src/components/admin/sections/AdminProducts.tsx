import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Filter,
  Image as ImageIcon,
  Tag,
  FileText
} from 'lucide-react';
import { Product, CategoryInfo } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';

interface AdminProductsProps {
  products: Product[];
  categories: CategoryInfo[];
  setProductToEdit: (product: Product | null) => void;
  setIsProductModalOpen: (isOpen: boolean) => void;
  triggerDeleteProduct: (product: Product) => void;
  formatPrice?: (price: number | undefined) => string;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products = [],
  categories = [],
  setProductToEdit,
  setIsProductModalOpen,
  triggerDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const getProductTitleRu = (p: Product) => {
    return getLocalizedText(p.name || (p as any).title, 'ru', '') || getLocalizedText(p.name || (p as any).title, 'uz', p.id);
  };

  const getProductTitleUz = (p: Product) => {
    return getLocalizedText(p.name || (p as any).title, 'uz', '');
  };

  const getCategoryTitleRu = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return catId;
    return getLocalizedText(cat.name, 'ru', '') || getLocalizedText(cat.name, 'uz', catId);
  };

  // Mavjud barcha brendlar
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand && typeof p.brand === 'string' && p.brand.trim()) {
        brands.add(p.brand.trim());
      }
    });
    return Array.from(brands).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const titleRu = getProductTitleRu(p).toLowerCase();
      const titleUz = getProductTitleUz(p).toLowerCase();
      const model = (p.model || (p as any).code || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const slugRu = (p.slug?.ru || '').toLowerCase();
      const slugUz = (p.slug?.uz || p.id || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || 
        titleRu.includes(q) || 
        titleUz.includes(q) || 
        model.includes(q) || 
        brand.includes(q) || 
        slugRu.includes(q) || 
        slugUz.includes(q);

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || (p.brand && p.brand === selectedBrand);

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, categories]);

  const handleCreateNew = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setProductToEdit(p);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          
          {/* Qidiruv */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск (RU/UZ, модель, бренд)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Kategoriya filteri */}
          <div className="relative w-full sm:w-52">
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Все категории ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getLocalizedText(c.name, 'ru', '') || getLocalizedText(c.name, 'uz', c.id)}
                </option>
              ))}
            </select>
          </div>

          {/* Brend filteri */}
          <div className="relative w-full sm:w-44">
            <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Все бренды</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить товар</span>
        </button>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          Товары не найдены.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950/80 text-gray-400 border-b border-gray-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-4 w-16 text-center">Фото</th>
                  <th className="py-4 px-4">Название товара (RU / UZ)</th>
                  <th className="py-4 px-4">Бренд</th>
                  <th className="py-4 px-4">Модель / Артикул</th>
                  <th className="py-4 px-4">Категория</th>
                  <th className="py-4 px-4">Описание (RU/UZ)</th>
                  <th className="py-4 px-4">Slug (URL)</th>
                  <th className="py-4 px-4 text-center">Статус</th>
                  <th className="py-4 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {filteredProducts.map((p) => {
                  const titleRu = getProductTitleRu(p);
                  const titleUz = getProductTitleUz(p);
                  const categoryRu = getCategoryTitleRu(p.category);
                  const imgSrc = p.image || (Array.isArray(p.additionalImages) ? p.additionalImages[0] : '');

                  const descRu = typeof p.description === 'object' ? p.description.ru : p.description;
                  const descUz = typeof p.description === 'object' ? p.description.uz : '';
                  const hasDescRu = Boolean(descRu && descRu.trim());
                  const hasDescUz = Boolean(descUz && descUz.trim());

                  return (
                    <tr key={p.id} className="hover:bg-gray-850/50 transition">
                      <td className="py-3 px-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-950 border border-gray-800 p-1 flex items-center justify-center mx-auto overflow-hidden">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-sm hover:text-blue-400 transition">
                            {titleRu}
                          </div>
                          {titleUz && titleUz !== titleRu && (
                            <div className="text-[11px] text-gray-400">
                              <span className="text-blue-400/80 font-mono">UZ:</span> {titleUz}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {p.brand ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold text-[11px]">
                            {p.brand}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-blue-400">
                        {p.model || (p as any).code || '—'}
                      </td>

                      <td className="py-3 px-4 text-gray-300">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[11px]">
                          {categoryRu}
                        </span>
                      </td>

                      {/* Opisaniya holati */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              hasDescRu 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-gray-800 text-gray-500 border-gray-700'
                            }`}
                            title={hasDescRu ? 'RU описание заполнено' : 'RU описание отсутствует'}
                          >
                            RU
                          </span>
                          <span 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              hasDescUz 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                : 'bg-gray-800 text-gray-500 border-gray-700'
                            }`}
                            title={hasDescUz ? 'UZ tavsif to‘ldirilgan' : 'UZ tavsif kiritilmagan'}
                          >
                            UZ
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-gray-400 space-y-0.5">
                        <div className="text-emerald-400 truncate max-w-[180px]">
                          RU: /{p.slug?.ru || p.id}
                        </div>
                        {p.slug?.uz && (
                          <div className="text-gray-500 truncate max-w-[180px]">
                            UZ: /{p.slug.uz}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.inStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>В наличии</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                              <span>Под заказ</span>
                            </span>
                          )}

                          {p.isPopular && (
                            <span className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Хит продаж">
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerDeleteProduct(p)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};