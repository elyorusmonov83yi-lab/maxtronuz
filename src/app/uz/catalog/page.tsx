import type { Metadata } from 'next';
import CatalogPageClient from '../../catalog/CatalogPageClient';

export const metadata: Metadata = {
  title: 'KIPiA uskunalari va datchiklar katalogi — MAXTRON',
  description:
    'O‘zbekistonda sanoat nazorat-o‘lchov asboblari, manometrlar, bosim datchiklari va sarf o‘lchagichlar katalogi.',
  alternates: {
    canonical: 'https://maxtron.uz/uz/catalog',
    languages: {
      ru: 'https://maxtron.uz/catalog',
      uz: 'https://maxtron.uz/uz/catalog',
    },
  },
};

export default function UzCatalogPage() {
  return <CatalogPageClient />;
}
