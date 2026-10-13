'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CatalogView } from '@/components/views/CatalogView';
import { Product } from '@/types';

type Props = {
  currentLang?: 'ru' | 'uz';
};

const CatalogInteractive = ({ currentLang = 'ru' }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  const activeCategoryParam = searchParams.get('category') || 'all';

  return (
    <CatalogView
      currentLang={currentLang}
      initialCategory={activeCategoryParam}
      onSelectProduct={(p: Product) => {
        const productSlug =
          typeof p.slug === 'object'
            ? (p.slug[currentLang] || p.id)
            : (p.slug || p.id);

        // Tilga qarab /uz prefiksi bilan yo'naltirish
        const productUrl =
          currentLang === 'uz'
            ? `/uz/product/${encodeURIComponent(productSlug)}`
            : `/product/${encodeURIComponent(productSlug)}`;

        router.push(productUrl);
      }}
      onOpenQuote={(_p: Product) => {}}
      comparedProducts={comparedProducts}
      onToggleCompare={(p: Product) => {
        setComparedProducts((prev) =>
          prev.includes(p.id)
            ? prev.filter((id) => id !== p.id)
            : [...prev, p.id]
        );
      }}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};

const CatalogPageClient = ({ currentLang = 'ru' }: Props) => {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-gray-500">
          {currentLang === 'uz' ? 'Katalog yuklanmoqda...' : 'Загрузка каталога...'}
        </div>
      }
    >
      <CatalogInteractive currentLang={currentLang} />
    </Suspense>
  );
};

export default CatalogPageClient;