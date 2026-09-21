'use client';

import React from 'react';
import { CustomPageView } from '@/components/views/CustomPageView';

export const CustomPageClient = () => {
  return (
    <CustomPageView
      currentLang="ru"
      onOpenQuoteModal={() => {}}
      onShowToast={(msg: string) => console.log(msg)}
    />
  );
};