'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { QuoteView } from '@/components/views/QuoteView';
import { Language } from '@/types';

interface QuoteClientProps {
  lang?: Language;
  content?: Record<string, any>;
  translations?: Record<string, any>;
  siteSettings?: Record<string, any>;
}

export const QuoteClient: React.FC<QuoteClientProps> = ({
  lang,
  content,
  translations,
  siteSettings,
}) => {
  const pathname = usePathname();

  // Agar serverdan prop kelmasa, URL prefiksidan aniqlaymiz (/uz/... -> 'uz')
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-gray-500">
          {currentLang === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}
        </div>
      }
    >
      <QuoteView
        currentLang={currentLang}
        content={content}
        translations={translations}
        siteSettings={siteSettings}
        onShowToast={(msg: string) => console.log(msg)}
      />
    </Suspense>
  );
};