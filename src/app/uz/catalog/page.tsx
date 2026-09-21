import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogView } from '@/components/views/CatalogView';

export const metadata: Metadata = {
  title: 'KIPiA uskunalari va datchiklar katalogi — MAXTRON',
  description: 'O‘zbekistonda sanoat nazorat-o‘lchov asboblari, manometrlar, bosim datchiklari va sarf o‘lchagichlar katalogi.',
  alternates: {
    canonical: 'https://maxtron.uz/uz/catalog',
    languages: {
      'ru': 'https://maxtron.uz/catalog',
      'uz': 'https://maxtron.uz/uz/catalog',
    },
  },
};

export default function UzCatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Katalog yuklanmoqda...</div>}>
      <CatalogView
        currentLang="uz"
        initialCategory="all"
        onSelectProduct={() => {}}
        onOpenQuote={() => {}}
        comparedProducts={[]}
        onToggleCompare={() => {}}
        onShowToast={() => {}}
      />
    </Suspense>
  );
}