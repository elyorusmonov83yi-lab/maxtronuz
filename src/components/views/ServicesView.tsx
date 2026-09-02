import React, { useState } from 'react';
import { 
  ShieldCheck, 
  SlidersHorizontal, 
  Wrench, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Building2, 
  Award, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  Package
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';
import { servicesData, ServiceItem } from '../../data/servicesAndProjects';
import { Breadcrumbs } from '../Breadcrumbs';

interface ServicesViewProps {
  currentLang: Language;
  onOpenQuote: () => void;
  onShowToast: (msg: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  currentLang,
  onOpenQuote,
  onShowToast,
}) => {
  const t = translations[currentLang];
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const getServiceIcon = (icon: string) => {
    switch (icon) {
      case 'Package':
        return <Package className="w-7 h-7 text-amber-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 text-blue-400" />;
      case 'SlidersHorizontal':
        return <SlidersHorizontal className="w-7 h-7 text-cyan-400" />;
      case 'Wrench':
        return <Wrench className="w-7 h-7 text-emerald-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-7 h-7 text-purple-400" />;
      default:
        return <Award className="w-7 h-7 text-blue-400" />;
    }
  };

  const breadcrumbs = [
    { label: t.breadcrumb_services || 'Xizmatlar' }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" /> ISO/IEC 17025 Аккредитацияланган Сервис Маркази
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {currentLang === 'uz_cyrl' ? 'Метрология ва Муҳандислик Хизматлари' : currentLang === 'uz' ? 'Metrologiya va Muhandislik Xizmatlari' : 'Метрологические и Сервисные Услуги'}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {currentLang === 'uz_cyrl'
            ? 'Ўлчов ускуналарини давлат метрологик қиёслаш, лаборатория калибровкаси, кафолатли таъмирлаш ва жойнинг ўзида пусконаладка хизматлари.'
            : currentLang === 'uz'
            ? "O'lchov uskunalarini davlat metrologik qiyoslash, laboratoriya kalibrovkasi, kafolatli ta'mirlash va joyning o'zida puskonaladka xizmatlari."
            : 'Государственная поверка, лабораторная калибровка, гарантийный ремонт и шеф-монтаж контрольно-измерительного оборудования по всему Узбекистану.'}
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicesData.map((service) => (
          <div
            key={service.id}
            className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center">
                  {getServiceIcon(service.icon)}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-[11px] font-semibold text-gray-300 border border-gray-700">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{service.duration[currentLang] || service.duration.uz_cyrl}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                {service.title[currentLang] || service.title.uz_cyrl}
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                {service.fullDesc[currentLang] || service.fullDesc.uz_cyrl}
              </p>

              {/* Service Features checklist */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {currentLang === 'uz_cyrl' ? 'Хизмат таркиби:' : currentLang === 'uz' ? 'Xizmat tarkibi:' : 'Включает в себя:'}
                </div>
                {(service.features[currentLang] || service.features.uz_cyrl || []).map((feat, idx) => (
                  <div key={idx} className="flex items-start text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenQuote}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <span>{currentLang === 'uz_cyrl' ? 'Ушбу хизматга буюртма бериш' : 'Ushbu xizmatga buyurtma berish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Quality Process Steps */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gray-900/60 border border-gray-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentLang === 'uz_cyrl' ? 'Лабораторияда хизмат кўрсатиш тартиби' : 'Laboratoriyada xizmat ko\'rsatish tartibi'}
          </h2>
          <p className="text-xs text-gray-400">
            Барча жараёнлар O'z DSt ISO/IEC 17025 талабларига мувофиқ амалга оширилади
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 relative">
            <div className="text-2xl font-black text-blue-500/40">01</div>
            <h4 className="text-sm font-bold text-white">Қабул ва бирламчи кўрик</h4>
            <p className="text-xs text-gray-400">Ускуна қабул қилиниб, ташқи нуқсонлар ва функционал ҳолати қайд этилади.</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 relative">
            <div className="text-2xl font-black text-blue-500/40">02</div>
            <h4 className="text-sm font-bold text-white">Эталон стендда синов</h4>
            <p className="text-xs text-gray-400">Юқори аниқликдаги эталон ускуналар ёрдамида параметрлар ўлчанади.</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 relative">
            <div className="text-2xl font-black text-blue-500/40">03</div>
            <h4 className="text-sm font-bold text-white">Юстировка & Калибровка</h4>
            <p className="text-xs text-gray-400">Хатоликлар созланади, сенсорлар микропрограммаси янгиланади.</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 relative">
            <div className="text-2xl font-black text-blue-500/40">04</div>
            <h4 className="text-sm font-bold text-white">Сертификат бериш</h4>
            <p className="text-xs text-gray-400">Давлат реестрига киритилиб, QR-кодли расмий сертификат топширилади.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/70 via-gray-900 to-cyan-950/70 border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold text-white">
            Метрология бўйича техник маслаҳат керакми?
          </h3>
          <p className="text-sm text-gray-300 max-w-xl">
            Бизнинг бош метрологимиз корхонангиз ускуналарини қиёслаш муддатлари ва техник ҳолати бўйича бепул маслаҳат беради.
          </p>
        </div>
        <button
          onClick={onOpenQuote}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-blue-500/30 whitespace-nowrap transition transform hover:-translate-y-0.5"
        >
          {t.btn_consult_expert}
        </button>
      </div>

    </div>
  );
};
