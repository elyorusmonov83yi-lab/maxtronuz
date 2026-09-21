"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';
import { projectsData, ProjectCase } from '../../data/servicesAndProjects';
import { Breadcrumbs } from '../Breadcrumbs';

interface ProjectsViewProps {
  currentLang: Language;
  onOpenQuote: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentLang,
  onOpenQuote,
}) => {
  const t = translations[currentLang] || translations.ru;
  const [_activeCase, _setActiveCase] = useState<ProjectCase | null>(null);

  const breadcrumbs = [
    { label: t.breadcrumb_projects || (currentLang === 'ru' ? 'Проекты' : 'Loyihalar') }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Sarlavha */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Building2 className="w-4 h-4" /> 
          {currentLang === 'uz_cyrl' ? 'Йирик саноат корхоналари танлови' : currentLang === 'uz' ? 'Yirik sanoat korxonalari tanlovi' : 'Выбор ведущих промышленных предприятий'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {currentLang === 'uz_cyrl' ? 'Муваффақиятли Лойиҳалар ва Кейслар' : currentLang === 'uz' ? 'Muvaffaqiyatli Loyihalar va Keyslar' : 'Реализованные Проекты и Кейсы'}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {currentLang === 'uz_cyrl'
            ? 'Ўзбекистоннинг энг йирик кон-металлургия, нефт-газ ва энергетика корхоналарида жорий қилинган ўлчов ва назорат тизимлари.'
            : currentLang === 'uz'
            ? "O'zbekistonning eng yirik kon-metallurgiya, neft-gaz va energetika korxonalarida joriy qilingan o'lchov va nazorat tizimlari."
            : 'Практические результаты поставок и внедрения контрольно-измерительного оборудования на ведущих промышленных предприятиях Узбекистана.'}
        </p>
      </div>

      {/* Loyihalar ro'yxati */}
      <div className="space-y-12">
        {projectsData.map((project) => (
          <div
            key={project.id}
            className="p-8 sm:p-10 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Rasm */}
            <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-950 border border-gray-800">
              <img
                src={project.image}
                alt={project.client}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-blue-600/90 text-white text-xs font-bold shadow-md">
                {project.logoText}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-300 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {project.location[currentLang] || project.location.ru || project.location.uz}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {project.year}
                </span>
              </div>
            </div>

            {/* Ma'lumotlar */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {project.sector[currentLang] || project.sector.ru || project.sector.uz} • {project.client}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {project.title[currentLang] || project.title.ru || project.title.uz}
                </h3>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {project.description[currentLang] || project.description.ru || project.description.uz}
              </p>

              {/* Uskunalar */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {currentLang === 'ru' ? 'Поставленное оборудование:' : 'Yetkazilgan uskunalar:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.deliveredEquipment.map((eq, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs font-mono text-blue-300 border border-gray-700">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Natijalar */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> 
                  {currentLang === 'ru' ? 'Достигнутые практические результаты:' : 'Erishilgan amaliy natijalar:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(project.results[currentLang] || project.results.ru || project.results.uz || []).map((res, i) => (
                    <div key={i} className="flex items-start text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-2 mt-0.5 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Bloki */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/70 via-gray-900 to-cyan-950/70 border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold text-white">
            {currentLang === 'uz_cyrl' 
              ? 'Корхонангизда шундай лойиҳани жорий қилмоқчимисиз?' 
              : currentLang === 'uz'
              ? "Korxonangizda shunday loyihani joriy qilmoqchimisiz?"
              : 'Хотите реализовать подобный проект на вашем предприятии?'}
          </h3>
          <p className="text-sm text-gray-300 max-w-xl">
            {currentLang === 'uz_cyrl'
              ? 'Бизнинг лойиҳа муҳандисларимиз техник вазифангизни ўрганиб, ҳисоб-китоб ва синов намойишини ташкил қилиб беради.'
              : currentLang === 'uz'
              ? "Bizning loyiha muhandislarimiz texnik vazifangizni o'rganib, hisob-kitob va sinov namoyishini tashkil qilib beradi."
              : 'Наши инженеры детально изучат техническое задание, подготовят расчет и организуют демонстрацию оборудования.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenQuote}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-blue-500/30 whitespace-nowrap transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          {t.btn_request_quote || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
        </button>
      </div>

    </div>
  );
};