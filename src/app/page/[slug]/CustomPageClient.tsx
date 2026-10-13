'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CustomPageView } from '@/components/views/CustomPageView';
import { Language, Product } from '@/types';

interface CustomPageClientProps {
  page?: any;
  lang?: Language;
  translations?: Record<string, any>;
  siteSettings?: Record<string, any>;
  onOpenQuoteModal?: (product?: Product) => void;
}

export const CustomPageClient: React.FC<CustomPageClientProps> = ({
  page,
  lang,
  translations,
  siteSettings,
  onOpenQuoteModal,
}) => {
  const pathname = usePathname();

  // Agar serverdan lang kelmasa, URL prefiksidan aniqlaydi (/uz/... -> 'uz')
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  return (
    <CustomPageView
      page={page}
      currentLang={currentLang}
      translations={translations}
      siteSettings={siteSettings}
      onOpenQuoteModal={(product?: Product) => {
        if (onOpenQuoteModal) {
          onOpenQuoteModal(product);
        }
      }}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};