'use client';

import React from 'react';
import { QuoteView } from '@/components/views/QuoteView';

export const QuoteClient = () => {
  return <QuoteView currentLang="ru" onShowToast={(msg: string) => console.log(msg)} />;
};