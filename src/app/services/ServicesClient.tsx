'use client';

import React from 'react';
import { ServicesView } from '@/components/views/ServicesView';

export const ServicesClient = () => {
  return <ServicesView currentLang="ru" onOpenQuote={() => {}} onShowToast={(msg: string) => console.log(msg)} />;
};