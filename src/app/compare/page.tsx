import type { Metadata } from 'next';
import { CompareClient } from './CompareClient';

export const metadata: Metadata = {
  title: 'Сравнение оборудования — MAXTRON',
  description: 'Сравнение технических характеристик и параметров промышленных измерительных приборов.',
  openGraph: {
    title: 'Сравнение оборудования — MAXTRON',
    description: 'Сравнение технических характеристик контрольно-измерительных приборов со склада в Ташкенте.',
    url: 'https://maxtron.uz/compare',
    siteName: 'MAXTRON',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Сравнение оборудования — MAXTRON',
    description: 'Сравнение параметров контрольно-измерительных приборов.',
    images: ['/og-image.jpg'],
  },
};

export default function ComparePage() {
  return <CompareClient />;
}