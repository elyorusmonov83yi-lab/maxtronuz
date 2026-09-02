import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Warehouse, 
  FileText, 
  Truck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Language, AboutContent } from '../../types';
import { Breadcrumbs } from '../Breadcrumbs';
import { StorageService } from '../../services/storage';
import { getLocalizedText } from '../../utils/formatters';
import { ClientsSlider } from '@/src/components/ClientsSlider';

interface AboutViewProps {
  currentLang: Language;
  onOpenQuote: () => void;
}

const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const AboutView: React.FC<AboutViewProps> = ({ currentLang, onOpenQuote }) => {
  const [aboutData, setAboutData] = useState<AboutContent>(() => StorageService.getAboutContent());

  // Dinamik SEO
  useEffect(() => {
    const seoSettings = StorageService.getSeoSettings();
    const aboutSeo = seoSettings?.pageSeo?.about;

    const titleText = getLocalizedText(
      aboutSeo?.title || {
        uz: "Biz haqimizda — MAXTRON Industrial Supply",
        ru: "О компании — MAXTRON Industrial Supply"
      },
      currentLang
    );
    document.title = titleText;

    const descText = getLocalizedText(
      aboutSeo?.description || {
        uz: "MAXTRON — O'zbekiston sanoat korxonalari uchun o'lchov va nazorat uskunalarining ishonchli yetkazib beruvchisi.",
        ru: "MAXTRON — Надежный поставщик измерительного оборудования для предприятий Узбекистана."
      },
      currentLang
    );
    setMetaTag('name', 'description', descText);
  }, [currentLang]);

  // Real-time update listener
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setAboutData(e.detail);
    };
    window.addEventListener('maxtron_about_updated', handleUpdate);
    return () => window.removeEventListener('maxtron_about_updated', handleUpdate);
  }, []);

  const breadcrumbs = [
    { label: currentLang === 'ru' ? 'О компании' : 'Biz haqimizda' }
  ];

  // 4 ta Statistika
  const statsList = [
    {
      num: aboutData?.yearsExp || '8+',
      label: currentLang === 'ru' ? 'Опыт на рынке Узбекистана' : 'Bozordagi faoliyat'
    },
    {
      num: aboutData?.equipmentDelivered || '1,500+',
      label: currentLang === 'ru' ? 'Поставлено единиц оборудования' : 'Yetkazilgan uskunalar'
    },
    {
      num: aboutData?.warehouseItems || '200+',
      label: currentLang === 'ru' ? 'Моделей на складе в Ташкенте' : 'Toshkent omborida mavjud'
    },
    {
      num: aboutData?.partnerClients || '500+',
      label: currentLang === 'ru' ? 'Постоянных клиентов и заводов' : 'Hamkor korxonalar'
    }
  ];

  // 4 Bosqichli Supply Model
  const supplySteps = [
    {
      icon: <Package className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 01',
      title: currentLang === 'ru' ? '1. Прямой импорт от заводов' : '1. To‘g‘ridan-to‘g‘ri import',
      desc: currentLang === 'ru' 
        ? 'Закупаем измерительные приборы напрямую у ведущих мировых заводов без посредников по дистрибьюторским ценам.' 
        : 'O‘lchash uskunalarini jahonning yetakchi zavodlaridan vositachilarsiz, dilerlik narxlarida xarid qilamiz.'
    },
    {
      icon: <Warehouse className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 02',
      title: currentLang === 'ru' ? '2. Склад в Ташкенте' : '2. Toshkentdagi tayyor ombor',
      desc: currentLang === 'ru' 
        ? 'Самые востребованные модели приборов всегда в наличии на нашем складе для быстрой отгрузки.' 
        : 'Eng ko‘p talab qilinadigan modellar tezkor yetkazib berish uchun har doim omborimizda mavjud.'
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 03',
      title: currentLang === 'ru' ? '3. Официальный договор и НДС' : '3. 100% Qonuniy shartnoma va QQS',
      desc: currentLang === 'ru' 
        ? 'Полная таможенная очистка, электронные счета-фактуры с НДС, внесение в госреестр Узстандарт.' 
        : 'To‘liq bojxona rasmiylashtiruvi, QQS bilan elektron hisob-fakturalar, O‘zstandart davlat reestriga kiritish.'
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-400" />,
      stage: 'MAXTRON SUPPLY STAGE 04',
      title: currentLang === 'ru' ? '4. Быстрая доставка по РУз' : '4. Butun respublikaga yetkazish',
      desc: currentLang === 'ru' 
        ? 'Доставка во все регионы Узбекистана и на закрытые промышленные объекты точно в срок.' 
        : 'Respublikaning barcha hududlariga va yopiq sanoat obyektlariga belgilangan muddatda yetkazish.'
    }
  ];

  // 6 ta Hamkor Korxona
  const partnersList = [
    {
      num: '1',
      title: 'NKMC (Navoiy KMK)',
      subtitle: currentLang === 'ru' ? 'Навоий кон-металлургия комбинати' : 'Navoiy kon-metallurgiya kombinati'
    },
    {
      num: '2',
      title: 'AMMC (Olmaliq KMK)',
      subtitle: currentLang === 'ru' ? 'Олмалиқ кон-металлургия комбинати' : 'Olmaliq kon-metallurgiya kombinati'
    },
    {
      num: '3',
      title: 'Uzbekneftegaz',
      subtitle: currentLang === 'ru' ? 'Ўзбекнефтгаз АЖ' : '«O‘zbekneftgaz» AJ'
    },
    {
      num: '4',
      title: 'O‘zbekiston Temir Yo‘llari',
      subtitle: currentLang === 'ru' ? 'Ўзбекистон темир йўллари АЖ' : '«O‘zbekiston temir yo‘llari» AJ'
    },
    {
      num: '5',
      title: 'Hududiy Elektr Tarmoqlari',
      subtitle: currentLang === 'ru' ? 'Ҳудудий электр тармоқлари АЖ' : '«Hududiy elektr tarmoqlari» AJ'
    },
    {
      num: '6',
      title: 'O‘zsuvta’minot',
      subtitle: currentLang === 'ru' ? 'Ўзсувтаъминот АЖ' : '«O‘zsuvta’minot» AJ'
    }
  ];

  return (
    <>
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* 1. HERO QISMI */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span>{getLocalizedText(aboutData?.heroBadge, currentLang, 'MAXTRON Industrial Supply & Trading')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          {getLocalizedText(
            aboutData?.heroTitle, 
            currentLang, 
            currentLang === 'ru' 
              ? 'Ведущий поставщик измерительного оборудования в промышленности' 
              : 'Sanoat o‘lchov uskunalari bo‘yicha yetakchi ta’minotchi'
          )}
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {getLocalizedText(
            aboutData?.heroSubtitle, 
            currentLang, 
            currentLang === 'ru' 
              ? 'MAXTRON — высокое качество, метрологическая гарантия и профессиональные инженерные решения.' 
              : 'MAXTRON — yuqori sifat, metrologik kafolat va professional muhandislik yechimlari.'
          )}
        </p>
      </div>

      {/* 2. KOMPANIYA AFZALLIKLARI VA 4 TA STATISTIKA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Chap qism: Matn va Afzalliklar */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            {getLocalizedText(
              aboutData?.storyTitle, 
              currentLang, 
              currentLang === 'ru' 
                ? 'Надежный поставщик измерительного оборудования для предприятий Узбекистана' 
                : 'O‘zbekiston korxonalari uchun o‘lchash uskunalarining ishonchli ta’minotchisi'
            )}
          </h2>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 text-sm text-gray-300 leading-relaxed">
            {getLocalizedText(
              aboutData?.storyText, 
              currentLang, 
              currentLang === 'ru' 
                ? 'Компания с 2018 года поставляет предприятиям необходимое измерительное оборудование.' 
                : 'Kompaniya 2018-yildan buyon sanoat korxonalariga zaruriy o‘lchov uskunalarini yetkazib kelmoqda.'
            )}
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                {currentLang === 'ru' 
                  ? 'Прямые поставки от мировых заводов без лишних наценок и посредников' 
                  : 'Jahon zavodlaridan to‘g‘ridan-to‘g‘ri import — ortiqcha ustama va vositachilarsiz'}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                {currentLang === 'ru' 
                  ? 'Готовый склад в Ташкенте — возможность забрать приборы в день обращения' 
                  : 'Toshkentda tayyor ombor — uskunalarni murojaat qilingan kuniyoq olib ketish imkoniyati'}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                {currentLang === 'ru' 
                  ? '100% официальный контракт, работа с НДС и заводская гарантия' 
                  : '100% rasmiy shartnoma, QQS (NDS) bilan ishlash va rasmiy zavod kafolati'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <span>{currentLang === 'ru' ? 'Смотреть каталог' : 'Katalogni ko‘rish'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/certificates"
              className="px-6 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-xs border border-gray-800 transition"
            >
              <span>{currentLang === 'ru' ? 'Сертификаты' : 'Sertifikatlar'}</span>
            </Link>
          </div>
        </div>

        {/* O'ng qism: 4 ta Katta Statistika Kartasi */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsList.map((st, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-4 shadow-xl"
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

      {/* 3. SUPPLY MODEL (4 TA BOSQICH) */}
      <div className="space-y-10 pt-8 border-t border-gray-900">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">
            SUPPLY MODEL
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            {currentLang === 'ru' ? 'Как устроена система поставок MAXTRON?' : 'MAXTRON yetkazib berish tizimi qanday ishlaydi?'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {currentLang === 'ru' 
              ? 'Прозрачная и надежная цепочка поставок от завода до вашего производства' 
              : 'Zavoddan to ishlab chiqarishingizgacha bo‘lgan shaffof va ishonchli ta’minot zanjiri'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {supplySteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/30 transition flex flex-col justify-between space-y-6 shadow-lg group"
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

      {/* 4. HAMKORLAR VA MIJOZLAR (6 TA GIGANT) */}
      
             

  
    </div>
     <ClientsSlider currentLang={currentLang} />
     </>

  );
};