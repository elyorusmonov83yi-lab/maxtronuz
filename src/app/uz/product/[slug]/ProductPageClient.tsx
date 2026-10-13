'use client';

import React, { useState } from 'react';
import { ProductDetailView } from '@/components/views/ProductDetailView';
import { Product, Language } from '@/types';

interface ProductPageClientProps {
  product: Product;
  lang?: Language;
  siteSettings?: Record<string, any>;
  translations?: Record<string, any>;
  onOpenQuoteModal?: (product: Product) => void;
}

export const ProductPageClient: React.FC<ProductPageClientProps> = ({
  product,
  lang = 'ru',
  siteSettings,
  translations,
  onOpenQuoteModal,
}) => {
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">
          {lang === 'uz' ? 'Mahsulot yuklanmoqda...' : 'Загрузка товара...'}
        </p>
      </div>
    );
  }

  return (
    <ProductDetailView
      product={product}
      currentLang={lang}
      onOpenQuote={(p: Product) => {
        if (onOpenQuoteModal) {
          onOpenQuoteModal(p);
        }
      }}
      comparedProducts={comparedProducts}
      onToggleCompare={(p: Product) => {
        setComparedProducts((prev) =>
          prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
        );
      }}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};