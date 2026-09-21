"use client";

import React from 'react';
import { X, Trash2, ShieldCheck, Check } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { formatPrice, getLocalizedText, getProductName, getSpecName } from '../utils/formatters';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentLang: Language;
  onRemoveProduct: (id: string) => void;
  onClearAll: () => void;
  onOpenQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  products,
  currentLang,
  onRemoveProduct,
  onClearAll,
  onOpenQuote,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang] || translations.ru;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      id="compare-modal"
    >
      <div 
        className="relative w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/70">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-white">
              {t.compare_modal_title || (currentLang === 'ru' ? 'Сравнение товаров' : 'Uskunalarni taqqoslash')} ({products.length})
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {products.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.compare_clear || (currentLang === 'ru' ? 'Очистить' : 'Tozalash')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                {t.compare_empty || (currentLang === 'ru' ? 'Список сравнения пуст' : 'Taqqoslash ro‘yxati bo‘sh')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase w-1/4">
                      {currentLang === 'ru' ? 'Параметр' : currentLang === 'uz_cyrl' ? 'Кўрсаткич' : 'Ko‘rsatkich'}
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className="p-4 w-1/3 min-w-[220px] align-top">
                        <div className="relative group bg-gray-950 p-4 rounded-2xl border border-gray-800">
                          <button
                            type="button"
                            onClick={() => onRemoveProduct(p.id)}
                            className="absolute top-2 right-2 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition cursor-pointer"
                            title="O'chirish"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <img
                            src={p.image || ''}
                            alt={getProductName(p, currentLang)}
                            className="w-full h-28 object-cover rounded-xl mb-3"
                          />
                          <span className="text-[10px] font-mono font-bold text-blue-400 block">
                            {p.model}
                          </span>
                          <h4 
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-1 mt-1 transition-colors"
                          >
                            {getProductName(p, currentLang)}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenQuote(p);
                              onClose();
                            }}
                            className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                          >
                            {t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-xs">
                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'uz_cyrl' ? 'Нархи' : currentLang === 'uz' ? 'Narxi' : 'Стоимость'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 font-mono font-bold text-blue-400 text-sm">
                        {p.price ? formatPrice(p.price, currentLang) : (p.priceFormatted?.[currentLang] || formatPrice(undefined, currentLang))}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'ru' ? 'Наличие на складе' : 'Omborda mavjudligi'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4">
                        {p.inStock ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {t.product_in_stock || (currentLang === 'ru' ? 'В наличии' : 'Mavjud')}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            {t.product_on_order || (currentLang === 'ru' ? 'Под заказ' : 'Buyurtmaga')}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'ru' ? 'Гарантийный срок' : 'Kafolat muddati'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 font-mono text-gray-200">
                        {p.warrantyMonths} {currentLang === 'ru' ? 'мес. заводской гарантии' : 'oy rasmiy kafolat'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'ru' ? 'Госреестр и Сертификаты' : 'Metrologiya va Sertifikat'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-blue-400 font-mono">
                        {getLocalizedText(p.standardCert, currentLang, '—')}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'ru' ? 'Особенность' : 'Asosiy xususiyat'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-gray-300">
                        {getLocalizedText(p.tagline, currentLang)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-gray-400">
                      {currentLang === 'ru' ? 'Технические характеристики' : 'Asosiy texnik parametrlar'}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 space-y-1.5">
                        {(p.specs || []).map((s, idx) => (
                          <div key={idx} className="text-gray-300">
                            <span className="text-gray-500">{(getSpecName(s, currentLang) || '').split('/')[0]}: </span>
                            <span className="font-semibold text-gray-100">{typeof s.value === 'object' ? getLocalizedText(s.value, currentLang) : s.value}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};