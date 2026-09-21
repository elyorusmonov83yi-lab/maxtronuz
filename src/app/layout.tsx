import type { Metadata } from 'next';
import '../index.css';
import { MainLayoutClient } from '@/components/MainLayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL('https://maxtron.uz'),
  title: {
    default: 'MAXTRON — Sanoat va O‘lchov Uskunalari',
    template: '%s | MAXTRON',
  },
  description: 'Toshkent omboridan sanoat o‘lchov asboblari, KIPiA va datchiklar',
  keywords: ['maxtron', 'kipia', 'datchik', 'manometr', 'toshkent', 'o‘lchov uskunalari'],
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://maxtron.uz',
    siteName: 'MAXTRON',
    title: 'MAXTRON — Sanoat va O‘lchov Uskunalari',
    description: 'Toshkent omboridan sanoat o‘lchov asboblari, KIPiA va datchiklar',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-gray-950 text-white antialiased selection:bg-blue-500 selection:text-white">
        <ErrorBoundary>
          <MainLayoutClient>
            {children}
          </MainLayoutClient>
        </ErrorBoundary>
      </body>
    </html>
  );
}