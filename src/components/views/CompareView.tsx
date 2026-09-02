import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  PhoneCall, 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { Language, Product } from '../../types';
import { translations } from '../../data/translations';
import { StorageService } from '../../services/storage';
import { Breadcrumbs } from '../Breadcrumbs';
import { formatPrice, getLocalizedText, getProductName, getSpecName } from '../../utils/formatters';

interface CompareViewProps {
  currentLang: Language;
  comparedProductIds: string[];
  onRemoveProduct: (id: string) => void;
  onClearAll: () => void;
  onOpenQuote: (product: Product) => void;
  onShowToast: (msg: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  currentLang,
  comparedProductIds,
  onRemoveProduct,
  onClearAll,
  onOpenQuote,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const t = translations[currentLang];
  const [allProducts, setAllProducts] = useState<Product[]>(() => StorageService.getProducts());

  useEffect(() => {
    const handleProducts = (e: any) => {
      if (e.detail) setAllProducts(e.detail);
    };
    window.addEventListener('maxtron_products_updated', handleProducts);
    return () => window.removeEventListener('maxtron_products_updated', handleProducts);
  }, []);

  const products = allProducts.filter((p) => comparedProductIds.includes(p.id));

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => (p.specs || []).map((s) => getSpecName(s, currentLang))))
  ).filter(Boolean);

  const breadcrumbs = [
    { label: t.breadcrumb_compare || 'Taqqoslash' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" /> Техник параметрлар таққоси
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            {t.compare_modal_title || 'Ускуналарни таққослаш'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {products.length > 0
              ? `${products.length} та ускуна танланган. Параметрларни тўлиқ солиштиринг.`
              : 'Таққослаш учун ускуналар рўйхати бўш.'}
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Чоп этиш</span>
            </button>
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.compare_clear || 'Тозалаш'}</span>
            </button>
          </div>
        )}
      </div>

      {/* If empty */}
      {products.length === 0 ? (
        <div className="py-20 text-center bg-gray-900/40 rounded-3xl border border-gray-800/60 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Таққослаш рўйхати бўш
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Каталог саҳифасидан қизиқтирган ускуналарни танлаб «Таққослашга қўшиш» тугмасини босинг (максимум 4 та).
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            {t.btn_view_catalog}
          </Link>
        </div>
      ) : (
        /* Comparison Table Matrix */
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-gray-900/60 shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/90">
                  <th className="p-4 sm:p-6 w-1/4 min-w-[200px] text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ускуна / Параметр
                  </th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 sm:p-6 w-1/4 min-w-[220px] align-top relative">
                      <div className="space-y-3">
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-300 transition"
                          title="O'chirish"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div 
                          className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-950 border border-gray-800 cursor-pointer"
                          onClick={() => navigate(`/product/${p.id}`)}
                        >
                          <img
                            src={p.image || ''}
                            alt={getProductName(p, currentLang)}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-blue-400 font-mono font-semibold">{p.model}</div>
                          <Link 
                            to={`/product/${p.id}`}
                            className="text-sm font-bold text-white hover:text-blue-400 transition line-clamp-2 mt-0.5"
                          >
                            {getProductName(p, currentLang)}
                          </Link>
                          <div className="text-sm font-extrabold text-white mt-1">
                            {typeof p.priceFormatted === 'object' ? getLocalizedText(p.priceFormatted, currentLang) : formatPrice(p.price, currentLang)}
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenQuote(p)}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          {t.btn_request_quote}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                
                {/* General Info Row */}
                <tr className="bg-gray-900/40 font-semibold text-gray-300">
                  <td className="p-4 text-xs uppercase tracking-wider text-blue-400 font-bold" colSpan={products.length + 1}>
                    Асосий кўрсаткичлар
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">Омборда мавжудлиги</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.inStock ? (
                        <span className="inline-flex items-center text-emerald-400 text-xs font-semibold">
                          <Check className="w-4 h-4 mr-1" /> {t.product_in_stock}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs font-semibold">
                          {t.product_on_order}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">Кафолат муддати</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-gray-200">
                      {p.warrantyMonths} ой
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">Давлат реестри / Сертификат</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-xs font-mono text-blue-300">
                      {p.standardCert}
                    </td>
                  ))}
                </tr>

                {/* Specs rows */}
                <tr className="bg-gray-900/40 font-semibold text-gray-300">
                  <td className="p-4 text-xs uppercase tracking-wider text-blue-400 font-bold" colSpan={products.length + 1}>
                    Техник характеристикалар
                  </td>
                </tr>
                {allSpecKeys.map((key, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'}>
                    <td className="p-4 font-medium text-gray-400 text-xs sm:text-sm">
                      {key}
                    </td>
                    {products.map((p) => {
                      const spec = (p.specs || []).find((s) => getSpecName(s, currentLang) === key);
                      return (
                        <td key={p.id} className="p-4 text-xs sm:text-sm text-gray-200 font-semibold">
                          {spec ? (typeof spec.value === 'object' ? getLocalizedText(spec.value, currentLang) : spec.value) : <span className="text-gray-600">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Add more button */}
          {products.length < 4 && (
            <div className="flex justify-center">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 text-xs font-semibold text-gray-300 hover:text-white transition"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Каталогга қайтиб яна ускуна қўшиш ({4 - products.length} та бўш жой қолди)</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
