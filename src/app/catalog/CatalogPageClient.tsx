'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CatalogView } from '@/components/views/CatalogView';
import { Product } from '@/types';

export const CatalogPageClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  // Agar url'da ?category= parametr kelsa, boshlang'ich filtr sifatida olamiz
  const activeCategoryParam = searchParams ? (searchParams.get('category') || 'all') : 'all';

  return (
    <CatalogView
      currentLang="ru"
      initialCategory={activeCategoryParam}
      onSelectProduct={(p: Product) => {
        const productSlug = typeof p.slug === 'object' ? (p.slug.ru || p.id) : (p.slug || p.id);
        router.push(`/product/${encodeURIComponent(productSlug)}`);
      }}
      onOpenQuote={(_p: Product) => {}}
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