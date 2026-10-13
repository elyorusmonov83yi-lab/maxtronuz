'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FinderView } from '@/components/views/FinderView';
import { Product, Language } from '@/types';
import { StorageService } from '@/services/storage';

interface FinderClientProps {
  lang?: Language;
  translations?: Record<string, any>;
  content?: Record<string, any>;
  siteSettings?: Record<string, any>;
  onOpenQuoteModal?: (product: Product) => void;
}

export const FinderClient: React.FC<FinderClientProps> = ({
  lang,
  translations,
  content,
  siteSettings,
  onOpenQuoteModal,
}) => {
  const pathname = usePathname();

  // Prop berilmagan bo'lsa, URL prefiksidan aniqlaydi (/uz/... -> 'uz')
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  useEffect(() => {
    const stored = StorageService.getComparedProductIds?.() || [];
    setComparedProducts(stored);

    const handleStorageUpdate = () => {
      const updated = StorageService.getComparedProductIds?.() || [];
      setComparedProducts(updated);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('maxtron_compare_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('maxtron_compare_updated', handleStorageUpdate);
    };
  }, []);

  const handleToggleCompare = (product: Product) => {
    const pId = String(product.id);
    const updated = comparedProducts.includes(pId)
      ? comparedProducts.filter((id) => id !== pId)
      : [...comparedProducts, pId];

    setComparedProducts(updated);
    StorageService.setComparedProductIds?.(updated);
    window.dispatchEvent(new Event('maxtron_compare_updated'));
  };

  return (
    <FinderView
      currentLang={currentLang}
      onOpenQuote={(product: Product) => {
        if (onOpenQuoteModal) {
          onOpenQuoteModal(product);
        }
      }}
      comparedProducts={comparedProducts}
      onToggleCompare={handleToggleCompare}
    />
  );
};