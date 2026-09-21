"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/utils/navigation';
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
  const t = translations[currentLang] || translations.ru;
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
    { label: t.breadcrumb_compare || (currentLang === 'ru' ? 'Сравнение' : 'Taqqoslash') }
  ];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" /> {currentLang === 'ru' ? 'Сравнение параметров' : 'Texnik parametrlar taqqosi'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            {t.compare_modal_title || (currentLang === 'ru' ? 'Сравнение оборудования' : 'Uskunalarni taqqoslash')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {products.length > 0
              ? (currentLang === 'ru' ? `Выбрано ${products.length} приборов.` : `${products.length} ta uskuna tanlangan. Parametrlarni to‘liq solishtiring.`)
              : (currentLang === 'ru' ? 'Список сравнения пуст.' : 'Taqqoslash uchun uskunalar ro‘yxati bo‘sh.')}
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>{currentLang === 'ru' ? 'Печать' : 'Chop etish'}</span>
            </button>
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-semibold transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.compare_clear || (currentLang === 'ru' ? 'Очистить' : 'Tozalash')}</span>
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center bg-gray-900/40 rounded-3xl border border-gray-800/60 p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {currentLang === 'ru' ? 'Список сравнения пуст' : 'Taqqoslash ro‘yxati bo‘sh'}
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            {currentLang === 'ru'
              ? 'Выберите из каталога нужные товары и нажмите «Сравнить» (до 4 позиций).'
              : 'Katalog sahifasidan qiziqtirgan uskunalarni tanlab «Solishtirish» tugmasini bosing (maksimum 4 ta).'}
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.btn_view_catalog || (currentLang === 'ru' ? 'В каталог' : 'Katalogga o‘tish')}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-gray-900/60 shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/90">
                  <th className="p-4 sm:p-6 w-1/4 min-w-[200px] text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {currentLang === 'ru' ? 'Параметр' : 'Parametr'}
                  </th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 sm:p-6 w-1/4 min-w-[220px] align-top relative">
                      <div className="space-y-3">
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-300 transition cursor-pointer"
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
                            href={`/product/${p.id}`}
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
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          {t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                <tr className="bg-gray-900/40 font-semibold text-gray-300">
                  <td className="p-4 text-xs uppercase tracking-wider text-blue-400 font-bold" colSpan={products.length + 1}>
                    {currentLang === 'ru' ? 'Основные показатели' : 'Asosiy ko‘rsatkichlar'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">{currentLang === 'ru' ? 'Наличие на складе' : 'Omborda mavjudligi'}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.inStock ? (
                        <span className="inline-flex items-center text-emerald-400 text-xs font-semibold">
                          <Check className="w-4 h-4 mr-1" /> {t.product_in_stock || (currentLang === 'ru' ? 'В наличии' : 'Mavjud')}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs font-semibold">
                          {t.product_on_order || (currentLang === 'ru' ? 'Под заказ' : 'Buyurtmaga')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">{currentLang === 'ru' ? 'Гарантийный срок' : 'Kafolat muddati'}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-gray-200">
                      {p.warrantyMonths} {currentLang === 'ru' ? 'мес.' : 'oy'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-400">{currentLang === 'ru' ? 'Госреестр / Сертификат' : 'Davlat reestri / Sertifikat'}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-xs font-mono text-blue-300">
                      {getLocalizedText(p.standardCert, currentLang, '—')}
                    </td>
                  ))}
                </tr>

                <tr className="bg-gray-900/40 font-semibold text-gray-300">
                  <td className="p-4 text-xs uppercase tracking-wider text-blue-400 font-bold" colSpan={products.length + 1}>
                    {currentLang === 'ru' ? 'Технические характеристики' : 'Texnik xarakteristikalar'}
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

          {products.length < 4 && (
            <div className="flex justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>
                  {currentLang === 'ru'
                    ? `Добавить еще товар из каталога (осталось мест: ${4 - products.length})`
                    : `Katalogga qaytib yana uskuna qo‘shish (${4 - products.length} ta bo‘sh joy qoldi)`}
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};