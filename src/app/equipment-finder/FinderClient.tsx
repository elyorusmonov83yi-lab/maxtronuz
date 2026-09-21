'use client';

import React from 'react';
import { FinderView } from '@/components/views/FinderView';
import { Product } from '@/types';

export const FinderClient = () => {
  return (
    <FinderView
      currentLang="ru"
      onOpenQuote={(_product: Product) => {}}
      comparedProducts={[]}
      onToggleCompare={(_product: Product) => {}}
    />
  );
};