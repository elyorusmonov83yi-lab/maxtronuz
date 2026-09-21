'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductDetailView } from '@/components/views/ProductDetailView';
import { Product } from '@/types';
import { StorageService } from '@/services/storage';

export const ProductPageClient = () => {
  const params = useParams() as { slug?: string };
  const targetSlug = decodeURIComponent(params?.slug || '');

  const [product, setProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  useEffect(() => {
    const products = StorageService.getProducts();
    const found = products.find((item) => {
      if (item.id === targetSlug) return true;
      if (typeof item.slug === 'object') {
        return Object.values(item.slug).includes(targetSlug);
      }
      return item.slug === targetSlug;
    });

    setProduct(found || null);
  }, [targetSlug]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Mahsulot yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <ProductDetailView
      currentLang="ru"
      onOpenQuote={() => {}}
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