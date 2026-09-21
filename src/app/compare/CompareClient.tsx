'use client';

import React from 'react';
import { CompareView } from '@/components/views/CompareView';

export const CompareClient = () => {
  return (
    <CompareView
      currentLang="ru"
      comparedProductIds={[]}
      onRemoveProduct={() => {}}
      onClearAll={() => {}}
      onOpenQuote={() => {}}
      onShowToast={(msg) => console.log(msg)}
    />
  );
};