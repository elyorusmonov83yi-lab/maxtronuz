'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 mb-2">
        <span className="text-3xl font-black text-blue-500 font-mono">404</span>
      </div>
      <h2 className="text-2xl font-bold text-white">Sahifa topilmadi</h2>
      <p className="text-sm text-gray-400 max-w-md">
        Siz qidirayotgan sahifa mavjud emas, ko‘chirilgan yoki uning manzili o‘zgargan bo‘lishi mumkin.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
      >
        <span>Bosh sahifaga qaytish</span>
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400 text-sm">Yuklanmoqda...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}