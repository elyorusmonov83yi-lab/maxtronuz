import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  FileCheck,
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
  const t = translations[currentLang];
  const [activeCase, setActiveCase] = useState<ProjectCase | null>(null);

  const breadcrumbs = [
    { label: t.breadcrumb_projects || 'Loyihalar' }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Breadcrumbs */}
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Building2 className="w-4 h-4" /> Йирик саноат корхоналари танлови
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

      {/* Projects List */}
      <div className="space-y-12">
        {projectsData.map((project, idx) => (
          <div
            key={project.id}
            className="p-8 sm:p-10 rounded-3xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Left Image Showcase */}
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
                  {project.location[currentLang] || project.location.uz_cyrl}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {project.year}
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {project.sector[currentLang] || project.sector.uz_cyrl} • {project.client}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {project.title[currentLang] || project.title.uz_cyrl}
                </h3>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {project.description[currentLang] || project.description.uz_cyrl}
              </p>

              {/* Delivered equipment tags */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Етказилган ускуналар:
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.deliveredEquipment.map((eq, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs font-mono text-blue-300 border border-gray-700">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Results & Achieved impact */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> Эришилган амалий натижалар:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(project.results[currentLang] || project.results.uz_cyrl || []).map((res, i) => (
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

      {/* Project Inquiry CTA */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/70 via-gray-900 to-cyan-950/70 border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold text-white">
            Корхонангизда шундай лойиҳани жорий қилмоқчимисиз?
          </h3>
          <p className="text-sm text-gray-300 max-w-xl">
            Бизнинг лойиҳа муҳандисларимиз техник вазифангизни ўрганиб, ҳисоб-китоб ва синов намойишини ташкил қилиб беради.
          </p>
        </div>
        <button
          onClick={onOpenQuote}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-blue-500/30 whitespace-nowrap transition transform hover:-translate-y-0.5"
        >
          {t.btn_request_quote}
        </button>
      </div>

    </div>
  );
};
