'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Props = {
  lang: 'ru' | 'uz';
  category: any;
  categories: any[];
  products: any[];
  siteSettings: any;
  translations: any;
};

export default function CategoryDetailView({
  lang,
  category,
  categories,
  products,
  translations: t,
}: Props) {
  const router = useRouter();
  const catName = category.name?.[lang] || category.name?.ru || category.name?.uz || '';
  const catDesc = category.description?.[lang] || category.description?.ru || '';
  const isUz = lang === 'uz';

  return (
    <div className="min-h-screen bg-[#070b14] text-white pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-6 flex items-center space-x-2">
        <Link href={isUz ? '/uz' : '/'} className="hover:text-white transition">
          {t.breadcrumbHome?.[lang] || (isUz ? 'Bosh sahifa' : 'Главная')}
        </Link>
        <span>/</span>
        <Link href={isUz ? '/uz/catalog' : '/catalog'} className="hover:text-white transition">
          {t.breadcrumbCatalog?.[lang] || (isUz ? 'Katalog' : 'Каталог')}
        </Link>
        <span>/</span>
        <span className="text-blue-400 font-medium">{catName}</span>
      </div>

      {/* Sarlavha va Tavsif */}
      <div className="mb-10">
        <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          MAXTRON STORE
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-3 text-white">
          {catName}
        </h1>
        {catDesc && (
          <p className="text-gray-400 mt-2 max-w-3xl text-sm md:text-base leading-relaxed">
            {catDesc}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chap tomon: Kategoriyalar menyusi */}
        <div className="lg:col-span-1 space-y-2 bg-[#0e1526] p-4 rounded-2xl border border-gray-800/60 self-start">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
            {isUz ? 'Kategoriyalar' : 'Категории'}
          </h3>
          <Link
            href={isUz ? '/uz/catalog' : '/catalog'}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 transition"
          >
            <span>{isUz ? 'Barcha toifalar' : 'Все категории'}</span>
          </Link>

          {categories.map((c) => {
            const isActive = c.id === category.id;
            const cSlug = c.slugParsed?.[lang] || c.slugParsed?.ru || c.slug || c.id;
            const cName = c.name?.[lang] || c.name?.ru || c.name?.uz || '';
            const href = isUz ? `/uz/catalog/${cSlug}` : `/catalog/${cSlug}`;

            return (
              <Link
                key={c.id}
                href={href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                <span className="truncate">{cName}</span>
              </Link>
            );
          })}
        </div>

        {/* O'ng tomon: Faqat shu toifaga tegishli mahsulotlar */}
        <div className="lg:col-span-3">
          <div className="text-sm text-gray-400 mb-4">
            {isUz ? 'Mavjud uskunalar soni:' : 'Найдено товаров:'}{' '}
            <span className="text-white font-semibold">{products.length}</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-[#0e1526]/50 rounded-2xl border border-gray-800/60">
              <p className="text-gray-400">
                {isUz
                  ? 'Ushbu kategoriyada hozircha mahsulotlar mavjud emas.'
                  : 'В этой категории пока нет товаров.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => {
                const pName = p.name?.[lang] || p.name?.ru || p.name?.uz || p.name || '';
                const pSlug = p.slugParsed?.[lang] || p.slugParsed?.ru || p.slug || p.id;
                const pImage = p.image || p.imageUrl || '/placeholder.png';
                const pUrl = isUz ? `/uz/product/${pSlug}` : `/product/${pSlug}`;

                return (
                  <div
                    key={p.id}
                    onClick={() => router.push(pUrl)}
                    className="group bg-[#0e1526] border border-gray-800/60 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition cursor-pointer"
                  >
                    <div>
                      <div className="relative w-full h-48 bg-[#070b14] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                        <img
                          src={pImage}
                          alt={pName}
                          className="object-contain max-h-40 max-w-full group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <h4 className="text-white font-medium text-base line-clamp-2 mb-2 group-hover:text-blue-400 transition">
                        {pName}
                      </h4>
                    </div>

                    <div className="pt-4 border-t border-gray-800/40 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {isUz ? 'Narxi so‘rov bo‘yicha' : 'Цена по запросу'}
                      </span>
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                        {isUz ? 'Batafsil' : 'Подробнее'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}