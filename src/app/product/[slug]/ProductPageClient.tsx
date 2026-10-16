'use client';

import React, { useState, useEffect } from 'react';
import { ProductDetailView } from '@/components/views/ProductDetailView';
import { Product, Language } from '@/types';
import { StorageService } from '@/services/storage';

interface ProductPageClientProps {
  product: Product;
  category?: any;
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

  useEffect(() => {
    setComparedProducts(StorageService.getComparedProductIds());

    const handleCompareUpdate = (e: any) => {
      if (e.detail) setComparedProducts(e.detail);
      else setComparedProducts(StorageService.getComparedProductIds());
    };

    window.addEventListener('maxtron_compare_updated', handleCompareUpdate);
    return () => window.removeEventListener('maxtron_compare_updated', handleCompareUpdate);
  }, []);

  const handleToggleCompare = (p: Product) => {
    const pId = String(p.id);
    let next: string[];
    if (comparedProducts.includes(pId)) {
      next = comparedProducts.filter((id) => id !== pId);
    } else {
      next = [...comparedProducts, pId];
    }
    setComparedProducts(next);
    StorageService.setComparedProductIds(next);
  };

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
      onToggleCompare={handleToggleCompare}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};