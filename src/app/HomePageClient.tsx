'use client';

import { HomeView } from '@/components/views/HomeView';
import { Product } from '@/types';

export default function HomePageClient() {
  const handleOpenQuote = (product?: Product) => {
    console.log('Open quote:', product);
  };

  const handleToggleCompare = (product: Product) => {
    console.log('Toggle compare:', product);
  };

  return (
    <HomeView
      currentLang="ru"
      onOpenQuote={handleOpenQuote}
      comparedProducts={[]}
      onToggleCompare={handleToggleCompare}
    />
  );
}