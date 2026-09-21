'use client';

import React, { Suspense } from 'react';
import { QuoteView } from '@/components/views/QuoteView';

export const QuoteClient = () => {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Yuklanmoqda...</div>}>
      <QuoteView currentLang="ru" onShowToast={(msg: string) => console.log(msg)} />
    </Suspense>
  );
};