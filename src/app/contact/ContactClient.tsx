'use client';

import React from 'react';
import { ContactView } from '@/components/views/ContactView';

export const ContactClient = () => {
  return (
    <ContactView 
      currentLang="ru" 
      onShowToast={(msg: string) => console.log(msg)} 
    />
  );
};