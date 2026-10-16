'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CatalogView } from '@/components/views/CatalogView';
import { Product, CategoryInfo } from '@/types';
import { StorageService } from '@/services/storage';

export type Props = {
  lang?: 'ru' | 'uz';
  currentLang?: 'ru' | 'uz';
  initialCategories?: CategoryInfo[] | any[];
  selectedCategoryId?: string;
  categorySeo?: any;
  siteSettings?: any;
  catalogSeo?: any;
  translations?: any;
  [key: string]: any;
};

const CatalogInteractive = ({
  lang,
  currentLang: propCurrentLang,
  initialCategories = [],
  selectedCategoryId,
  categorySeo,
  siteSettings,
  catalogSeo,
  translations,
}: Props) => {
  const currentLang = lang || propCurrentLang || 'ru';
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const activeCategoryParam =
    selectedCategoryId ||
    (searchParams ? searchParams.get('category') || 'all' : 'all');

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

  return (
    <CatalogView
      currentLang={currentLang}
      initialCategory={activeCategoryParam}
      initialCategories={initialCategories}
      catalogSeo={categorySeo || catalogSeo}
      siteSettings={siteSettings}
      translations={translations}
      onSelectProduct={(p: Product) => {
        const productSlug =
          typeof p.slug === 'object'
            ? (p.slug[currentLang] || p.slug.ru || p.slug.uz || p.id)
            : (p.slug || p.id);

        const productUrl =
          currentLang === 'uz'
            ? `/uz/product/${encodeURIComponent(String(productSlug))}`
            : `/product/${encodeURIComponent(String(productSlug))}`;

        router.push(productUrl);
      }}
      onOpenQuote={(_p: Product) => {}}
      comparedProducts={comparedProducts}
      onToggleCompare={handleToggleCompare}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};

export default function CatalogPageClient(props: Props) {
  const activeLang = props.lang || props.currentLang || 'ru';

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-gray-500">
          {activeLang === 'uz' ? 'Katalog yuklanmoqda...' : 'Загрузка каталога...'}
        </div>
      }
    >
      <CatalogInteractive {...props} />
    </Suspense>
  );
}