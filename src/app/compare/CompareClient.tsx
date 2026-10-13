'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CompareView } from '@/components/views/CompareView';
import { Language, Product } from '@/types';
import { StorageService } from '@/services/storage';

interface CompareClientProps {
  lang?: Language;
  siteSettings?: Record<string, any>;
  compareSeo?: Record<string, any>;
  translations?: Record<string, any>;
  onOpenQuoteModal?: (product: Product) => void;
}

export const CompareClient: React.FC<CompareClientProps> = ({ 
  lang,
  onOpenQuoteModal 
}) => {
  const pathname = usePathname();
  
  // Prop kelmasa, URL orqali aniqlanadi (/uz/compare -> 'uz')
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // localStorage bilan sinxronlash
  useEffect(() => {
    setMounted(true);
    const storedIds = StorageService.getComparedProductIds?.() || [];
    setComparedProductIds(storedIds);

    const handleStorageUpdate = () => {
      const updated = StorageService.getComparedProductIds?.() || [];
      setComparedProductIds(updated);
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('maxtron_compare_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('maxtron_compare_updated', handleStorageUpdate);
    };
  }, []);

  const handleRemoveProduct = (productId: string) => {
    const updated = comparedProductIds.filter((id) => id !== productId);
    setComparedProductIds(updated);
    StorageService.setComparedProductIds?.(updated);
    window.dispatchEvent(new Event('maxtron_compare_updated'));
  };

  const handleClearAll = () => {
    setComparedProductIds([]);
    StorageService.setComparedProductIds?.([]);
    window.dispatchEvent(new Event('maxtron_compare_updated'));
  };

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CompareView
      currentLang={currentLang}
      comparedProductIds={comparedProductIds}
      onRemoveProduct={handleRemoveProduct}
      onClearAll={handleClearAll}
      onOpenQuote={(prod) => {
        if (onOpenQuoteModal) onOpenQuoteModal(prod);
      }}
      onShowToast={(msg) => console.log(msg)}
    />
  );
};