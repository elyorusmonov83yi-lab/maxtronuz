"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Warehouse, 
  FileText, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { ClientsSlider } from '@/components/ClientsSlider';

interface AboutClientProps {
  lang: 'ru' | 'uz';
  content?: Record<string, any>;
  seo?: Record<string, any>;
  siteSettings?: Record<string, any>;
  translations?: Record<string, any>;
  onOpenQuote?: () => void;
}

export default function AboutClient({ 
  lang = 'ru', 
  content = {}, 
  seo = {},
  siteSettings = {}, 
  translations = {}, 
  onOpenQuote 
}: AboutClientProps) {

  // Har qanday obyekt { uz, ru } yoki oddiy satr kelsa ham faqat string qaytaradi
  const getLocalized = (val: any, fallback = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val.uz || val.ru || fallback;
    }
    return String(val);
  };

  const homeLabel = getLocalized(translations?.breadcrumbHome, lang === 'uz' ? 'Bosh sahifa' : 'Главная');
  const aboutLabel = getLocalized(translations?.breadcrumbAbout, lang === 'uz' ? 'Kompaniya haqida' : 'О компании');
  const homeLink = lang === 'uz' ? '/uz' : '/';

  // 1. STATISTIKA
  const statsList = [
    {
      num: getLocalized(content?.yearsExp, lang === 'uz' ? '8+ yil' : '8+ лет'),
      label: getLocalized(content?.statExpLabel, lang === 'uz' ? 'Bozordagi faoliyat' : 'Опыт на рынке Узбекистана')
    },
    {
      num: getLocalized(content?.equipmentDelivered, '1,500+'),
      label: getLocalized(content?.statDeliveredLabel, lang === 'uz' ? 'Yetkazilgan uskunalar' : 'Поставлено единиц оборудования')
    },
    {
      num: getLocalized(content?.warehouseItems, '200+'),
      label: getLocalized(content?.statWarehouseLabel, lang === 'uz' ? 'Toshkent omborida mavjud' : 'Моделей на складе в Ташкенте')
    },
    {
      num: getLocalized(content?.partnerClients, '500+'),
      label: getLocalized(content?.statPartnersLabel, lang === 'uz' ? 'Hamkor korxonalar' : 'Постоянных клиентов и заводов')
    }
  ];

  // 2. AFZALLIKLAR RO'YXATI
  const defaultBenefits = lang === 'uz' ? [
    'Jahon zavodlaridan vositachilarsiz va ortiqcha ustamalarsiz to‘g‘ridan-to‘g‘ri import',
    'Toshkentda tayyor ombor — uskunalarni murojaat qilingan kuniyoq olib ketish imkoniyati',
    '100% rasmiy shartnoma, QQS (NDS) bilan ishlash va rasmiy zavod kafolati'
  ] : [
    'Прямые поставки от мировых заводов без лишних наценок и посредников',
    'Готовый склад в Ташкенте — возможность забрать приборы в день обращения',
    '100% официальный контракт, работа с НДС и заводская гарантия'
  ];

  const benefitsRaw = content?.benefits?.[lang] || content?.benefits;
  const benefitsList: string[] = Array.isArray(benefitsRaw)
    ? benefitsRaw.map((b: any) => getLocalized(b)).filter(Boolean)
    : defaultBenefits;

  // 3. SUPPLY MODEL
  const defaultSupplySteps = [
    {
      icon: <Package className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 01',
      title: lang === 'uz' ? '1. To‘g‘ridan-to‘g‘ri import' : '1. Прямой импорт от заводов',
      desc: lang === 'uz' 
        ? 'O‘lchash uskunalarini jahonning yetakchi zavodlaridan vositachilarsiz, dilerlik narxlarida xarid qilamiz.' 
        : 'Закупаем измерительные приборы напрямую у ведущих мировых заводов без посредников по дистрибьюторским ценам.'
    },
    {
      icon: <Warehouse className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 02',
      title: lang === 'uz' ? '2. Toshkentdagi tayyor ombor' : '2. Склад в Ташкенте',
      desc: lang === 'uz' 
        ? 'Eng talabgir modellar tezkor jo‘natish uchun doimo Toshkentdagi omborimizda mavjud.' 
        : 'Самые востребованные модели приборов всегда в наличии на нашем складе для быстрой отгрузки.'
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 03',
      title: lang === 'uz' ? '3. Rasmiy shartnoma va QQS' : '3. Официальный договор и НДС',
      desc: lang === 'uz' 
        ? 'To‘liq bojxona rasmiylashtiruvi, QQS bilan hisob-fakturalar, O‘zstandart reyestriga kiritish.' 
        : 'Полная таможенная очистка, электронные счета-фактуры с НДС, внесение в госреестр Узстандарт.'
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 04',
      title: lang === 'uz' ? '4. Butun respublikaga yetkazish' : '4. Быстрая доставка по РУз',
      desc: lang === 'uz' 
        ? 'Respublikaning barcha hududlariga va yopiq sanoat obyektlariga belgilangan muddatda yetkazish.' 
        : 'Доставка во все регионы Узбекистана и на закрытые промышленные объекты точно в срок.'
    }
  ];

  const supplySteps = Array.isArray(content?.supplySteps) && content.supplySteps.length > 0
    ? content.supplySteps.map((s: any, idx: number) => ({
        icon: defaultSupplySteps[idx]?.icon || <Package className="w-6 h-6 text-blue-400" />,
        stage: s.stage || `MAXTRON SUPPLY STAGE 0${idx + 1}`,
        title: getLocalized(s.title, defaultSupplySteps[idx]?.title),
        desc: getLocalized(s.desc, defaultSupplySteps[idx]?.desc)
      }))
    : defaultSupplySteps;

  const catalogHref = lang === 'uz' ? '/uz/catalog' : '/catalog';
  const certsHref = lang === 'uz' ? '/uz/certificates' : '/certificates';
  const quoteHref = lang === 'uz' ? '/uz/quote' : '/quote';
  const phone = siteSettings?.phone || '+998 (71) 200-55-44';

  const heroBadge = getLocalized(content?.heroBadge, 'MAXTRON Industrial Supply & Trading');
  const heroTitle = getLocalized(content?.heroTitle, lang === 'uz' 
    ? 'O‘zbekistonda sanoat va nazorat-o‘lchov yechimlarining yetakchi ta’minotchisi' 
    : 'Ведущий поставщик промышленных и контрольно-измерительных решений в Узбекистане');
  const heroSubtitle = getLocalized(content?.heroSubtitle, lang === 'uz'
    ? 'MAXTRON — neft-gaz, energetika, tog‘-kon va qurilish sohalari uchun sertifikatlangan asboblarning ishonchli milliy yetkazib beruvchisi.'
    : 'MAXTRON — надежный национальный поставщик сертифицированных приборов для нефтегазовой, энергетической, горнодобывающей и строительной отраслей.');

  const storyTitle = getLocalized(content?.storyTitle, lang === 'uz'
    ? 'O‘zbekiston korxonalari uchun o‘lchash uskunalarining ishonchli ta’minotchisi'
    : 'Надежный поставщик измерительного оборудования для предприятий Узбекистана');
  const storyText = getLocalized(content?.storyText, lang === 'uz'
    ? '2018-yilda asos solingan MAXTRON korxonasi bugungi kunda 500 dan ortiq sanoat korxonalari, qurilish xoldinglari va kommunal xizmatlarni zamonaviy o‘lchov uskunalari bilan ta’minlab kelmoqda.'
    : 'Основанное в 2018 году предприятие MAXTRON на сегодняшний день обеспечивает более 500 промышленных предприятий, строительных холдингов и коммунальных служб Узбекистана современными приборами КИПиА и метрологическим оборудованием.');

  const ctaTitle = getLocalized(content?.ctaTitle, lang === 'uz' ? 'Loyihangiz uchun uskunalar kerakmi?' : 'Требуется оборудование под ваш проект?');
  const ctaSubtitle = getLocalized(content?.ctaSubtitle, lang === 'uz'
    ? 'Texnik topshiriqni yuboring — optimal modellarni tanlab, eng qulay narxlar bilan rasmiy tijorat taklifini taqdim etamiz.'
    : 'Отправьте нам техническое задание — подберем оптимальные модели и предоставим официальное коммерческое предложение с лучшими ценами.');

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Non uvoqlari */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500">
        <Link href={homeLink} className="hover:text-gray-300 transition">
          {homeLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-300 font-medium">{aboutLabel}</span>
      </nav>

      {/* 1. HERO BO'LIMI */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        {heroBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/40 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>{heroBadge}</span>
          </div>
        )}

        {heroTitle && (
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroTitle}
          </h1>
        )}

        {heroSubtitle && (
          <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        )}
      </div>

      {/* 2. TARIX VA STATISTIKA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-6">
          {storyTitle && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {storyTitle}
            </h2>
          )}

          {storyText && (
            <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-gray-800 text-sm text-gray-300 leading-relaxed">
              <p>{storyText}</p>
            </div>
          )}

          {/* Afzalliklar */}
          <div className="space-y-3 pt-1">
            {benefitsList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-300">{item}</p>
              </div>
            ))}
          </div>

          {/* Tugmalar */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={catalogHref}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <span>{getLocalized(content?.btnCatalogText, lang === 'uz' ? 'Katalogni ko‘rish' : 'Смотреть каталог')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={certsHref}
              className="px-6 py-3.5 rounded-xl bg-[#0f172a] hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-xs border border-gray-800 transition"
            >
              <span>{getLocalized(content?.btnCertsText, lang === 'uz' ? 'Sertifikatlar' : 'Сертификаты')}</span>
            </Link>
          </div>
        </div>

        {/* 4 ta Statistika kartochkalari */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsList.map((st, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-[#0f172a]/80 border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="text-4xl sm:text-5xl font-black text-blue-400 font-mono tracking-tight">
                {st.num}
              </div>
              <div className="text-xs font-medium text-gray-400 leading-snug">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SUPPLY MODEL */}
      <div className="space-y-10 pt-8 border-t border-gray-800/60">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">
            SUPPLY MODEL
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            {getLocalized(content?.supplySectionTitle, lang === 'uz' 
              ? 'MAXTRON yetkazib berish tizimi qanday ishlaydi?' 
              : 'Как устроена система поставок MAXTRON?')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {getLocalized(content?.supplySectionSubtitle, lang === 'uz' 
              ? 'Zavoddan to ishlab chiqarishingizgacha bo‘lgan shaffof va ishonchli ta’minot zanjiri' 
              : 'Прозрачная и надежная цепочка поставок от завода до вашего производства')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {supplySteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0f172a]/70 border border-gray-800 hover:border-blue-500/40 transition flex flex-col justify-between space-y-6 shadow-lg group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  {step.icon}
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="text-[10px] font-mono font-bold text-blue-400/70 tracking-wider">
                {step.stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. HAMKORLAR VA MIJOZLAR */}
      <div className="space-y-8 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            {getLocalized(content?.partnersTitle, lang === 'uz' ? 'Bizning mijozlar va hamkorlar' : 'Наши клиенты и партнеры')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {getLocalized(content?.partnersSubtitle, lang === 'uz' ? 'O‘zbekistonning yirik sanoat korxonalari MAXTRON ta’minotiga ishonadi' : 'Крупнейшие промышленные холдинги доверяют поставкам MAXTRON')}
          </p>
        </div>

        <ClientsSlider currentLang={lang} />
      </div>

      {/* 5. CTA BLOKI */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-gray-900 border border-blue-800/40 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {ctaTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            {ctaSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenQuote ? (
            <button
              type="button"
              onClick={onOpenQuote}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{getLocalized(content?.ctaBtnText, lang === 'uz' ? 'Hisob-kitobni so‘rash' : 'Запросить расчет стоимости')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={quoteHref}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <span>{getLocalized(content?.ctaBtnText, lang === 'uz' ? 'Hisob-kitobni so‘rash' : 'Запросить расчет стоимости')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="px-6 py-3.5 rounded-xl bg-[#0f172a] hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-xs border border-gray-800 transition flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}