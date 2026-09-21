"use client";

import React from 'react';
import { ShieldCheck, Scale, Check, ArrowUpRight, Eye } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../data/translations';
import { 
  formatPrice, 
  getLocalizedText, 
  getSpecName, 
  getSafeProductSlug 
} from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  currentLang: Language;
  onSelect: (product: Product) => void;
  onOpenQuote: (product: Product) => void;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentLang,
  onSelect,
  onOpenQuote,
  isCompared,
  onToggleCompare,
}) => {
  const t = translations[currentLang] || translations.ru;

  const safeId = getSafeProductSlug(product, currentLang) || 'item';
  const productName = getLocalizedText(product.name || (product as any).title, currentLang, 'Ускуна');

  const priceText = product.price 
    ? formatPrice(product.price, currentLang) 
    : getLocalizedText(product.priceFormatted, currentLang, formatPrice(undefined, currentLang));

  const oldPriceText = product.oldPrice 
    ? formatPrice(product.oldPrice, currentLang) 
    : null;

  const standardCertText = getLocalizedText(
    product.standardCert, 
    currentLang, 
    currentLang === 'ru' ? 'ГОСТ' : 'GOST'
  );

  return (
    <div 
      className="group relative bg-gray-900/90 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden"
      id={`product-card-${safeId}`}
    >
      {/* Top Media & Badges */}
      <div 
        className="relative aspect-[4/3] w-full bg-gray-950/80 overflow-hidden cursor-pointer" 
        onClick={() => onSelect(product)}
      >
        <img
          src={product.image || ''}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.inStock ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                {t.product_in_stock || (currentLang === 'ru' ? 'В наличии' : 'Mavjud')}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                {t.product_on_order || (currentLang === 'ru' ? 'Под заказ' : 'Buyurtmaga')}
              </span>
            )}

            {product.isPopular && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                HOT
              </span>
            )}
            
            {product.isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                NEW
              </span>
            )}
          </div>

          {/* Compare toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            title={isCompared ? t.btn_in_compare : t.btn_add_compare}
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
              isCompared
                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Model Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-950/90 text-blue-400 border border-gray-800 backdrop-blur-md">
            {typeof product.model === 'object' ? getLocalizedText(product.model, currentLang, '—') : (product.model || '—')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect(product)}
            className="text-base font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1 mb-1"
          >
            {productName}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {getLocalizedText(product.tagline, currentLang)}
          </p>

          {/* Price Block */}
          <div className="mb-3.5 p-2.5 rounded-xl bg-gray-950/60 border border-gray-800/60 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-medium">
                {currentLang === 'uz_cyrl' ? 'Нархи' : currentLang === 'uz' ? 'Narxi' : currentLang === 'ru' ? 'Цена' : 'Price'}
              </span>
              <span className="text-sm sm:text-base font-bold text-blue-400 font-mono tracking-tight">
                {priceText}
              </span>
            </div>
            {oldPriceText && (
              <span className="text-xs text-gray-500 line-through font-mono">
                {oldPriceText}
              </span>
            )}
          </div>

          {/* Quick Specs */}
          <div className="space-y-1.5 py-2.5 border-y border-gray-800/80 text-xs">
            {(product.specs || []).slice(0, 2).map((spec, i) => (
              <div key={i} className="flex items-center justify-between text-gray-400 gap-2">
                <span className="truncate text-gray-500">{(getSpecName(spec, currentLang) || '').split('/')[0]}</span>
                <span className="font-semibold text-gray-200 text-right truncate font-mono text-[11px]">
                  {typeof spec?.value === 'object' ? getLocalizedText(spec.value, currentLang) : (spec?.value || '—')}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 
              {product.warrantyMonths || 12} {currentLang === 'uz_cyrl' ? 'ой кафолат' : currentLang === 'uz' ? 'oy kafolat' : currentLang === 'ru' ? 'мес. гарантия' : 'mo. warranty'}
            </span>
            <span className="text-gray-500 font-mono text-[10px] truncate max-w-[130px]" title={standardCertText}>
              {standardCertText.split(',')[0]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/50">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-800/80 hover:bg-gray-800 text-gray-200 border border-gray-700/60 hover:border-gray-600 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span>{t.btn_details || (currentLang === 'ru' ? 'Подробнее' : 'Batafsil')}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuote(product)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/15 transition-all cursor-pointer"
          >
            <span>{t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif')}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};