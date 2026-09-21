'use client';

import React, { Suspense } from 'react';
import CatalogPageClient from './CatalogPageClient';

export default function UzCatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Katalog yuklanmoqda...</div>}>
      <CatalogPageClient />
    </Suspense>
  );
}