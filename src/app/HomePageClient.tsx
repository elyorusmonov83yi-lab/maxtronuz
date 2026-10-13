'use client';
"use client";

import { HomeView } from '@/components/views/HomeView';
import { Product, Language } from '@/types';

interface HomePageClientProps {
  currentLang?: Language;
  initialProducts?: Product[];
  initialCategories?: any[];
  siteSettings?: any;
}

export default function HomePageClient({
  currentLang = 'ru',
  initialProducts,
  initialCategories,
  siteSettings,
}: HomePageClientProps) {
  const handleOpenQuote = (product?: Product) => {
    console.log('Open quote:', product);
  };

  const handleToggleCompare = (product: Product) => {
    console.log('Toggle compare:', product);
  };

  return (
    <HomeView
      currentLang={currentLang}
      onOpenQuote={handleOpenQuote}
      comparedProducts={[]}
      onToggleCompare={handleToggleCompare}
    />
  );
}