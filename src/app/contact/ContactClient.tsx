'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ContactView } from '@/components/views/ContactView';
import { Language } from '@/types';

interface ContactClientProps {
  lang?: Language;
  siteSettings?: Record<string, any>;
  contactSeo?: Record<string, any>;
  translations?: Record<string, any>;
}

export const ContactClient: React.FC<ContactClientProps> = ({ 
  lang,
  siteSettings,
  contactSeo,
  translations 
}) => {
  const pathname = usePathname();

  // Agar serverdan prop kelmasa, URL orqali avtomatik aniqlanadi
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  return (
    <ContactView 
      currentLang={currentLang} 
      siteSettings={siteSettings}
      translations={translations}
      onShowToast={(msg: string) => console.log(msg)} 
    />
  );
};