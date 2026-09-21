"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Download, 
  Eye, 
  QrCode, 
  Search, 
  FileText, 
  ImageIcon 
} from 'lucide-react';
import { Certificate, Language } from '../../types';
import { translations } from '../../data/translations';
import { Breadcrumbs } from '../Breadcrumbs';
import { StorageService } from '../../services/storage';
import { getLocalizedText } from '../../utils/formatters';

interface CertificatesViewProps {
  currentLang: Language;
  onSelectCertificate: (cert: Certificate) => void;
  onShowToast: (msg: string) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  currentLang,
  onSelectCertificate,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [certsList, setCertsList] = useState<Certificate[]>(() => StorageService.getCertificates());
  const t = translations[currentLang] || translations.ru;

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setCertsList(e.detail);
    };
    window.addEventListener('maxtron_certificates_updated', handleUpdate);
    return () => window.removeEventListener('maxtron_certificates_updated', handleUpdate);
  }, []);

  const filteredCerts = certsList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const num = (c.number || '').toLowerCase();
    const docNum = (c.docNumber || '').toLowerCase();
    const title = getLocalizedText(c.title, currentLang).toLowerCase();
    const issuer = getLocalizedText(c.issuer, currentLang).toLowerCase();
    const standard = (c.standard || '').toLowerCase();

    return num.includes(query) || docNum.includes(query) || title.includes(query) || issuer.includes(query) || standard.includes(query);
  });

  const handleDownloadPdf = (cert: Certificate) => {
    const pdfTarget = cert.pdfUrl || cert.previewUrl || cert.image;
    const certTitle = getLocalizedText(cert.title, currentLang);

    if (pdfTarget && typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = pdfTarget;
      link.target = '_blank';
      link.download = `${cert.number || 'certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast(
        currentLang === 'ru'
          ? `Сертификат «${certTitle}» успешно скачан!`
          : `«${certTitle}» muvaffaqiyatli yuklab olindi!`
      );
    } else {
      onShowToast(
        currentLang === 'ru'
          ? 'PDF файл не найден'
          : 'PDF fayl topilmadi'
      );
    }
  };

  const breadcrumbs = [
    { label: t.breadcrumb_certificates || (currentLang === 'ru' ? 'Сертификаты' : 'Sertifikatlar') }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Sarlavha */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" /> {currentLang === 'ru' ? 'Госреестр и гарантия качества' : 'Davlat reestri va sifat kafolati'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          {currentLang === 'ru' ? 'Сертификаты и разрешительная документация' : 'Sertifikatlar va ruxsat etuvchi hujjatlar'}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {currentLang === 'ru' 
            ? 'Свидетельства Госреестра Узстандарт, сертификаты ISO 9001 и дистрибьюторские документы' 
            : "O'zstandart Davlat reestri guvohliklari, ISO 9001 sertifikatlari va distribyutorlik hujjatlari"}
        </p>
      </div>

      {/* Kafolat bloki */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-gray-900 to-cyan-950/60 border border-blue-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {currentLang === 'ru' ? 'Проверка подлинности' : 'Haqiqiyligini tekshirish'}
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              {currentLang === 'ru' 
                ? 'Все поставляемые нами приборы имеют свидетельства поверки и сертификаты соответствия.' 
                : "Biz yetkazib beradigan barcha uskunalar qiyoslash guvohliklari va muvofiqlik sertifikatlariga ega."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-lg border border-cyan-800">
            O'z DSt ISO/IEC 17025
          </span>
        </div>
      </div>

      {/* Qidiruv qatori */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div className="text-sm font-semibold text-gray-400">
          {currentLang === 'ru' ? 'Всего документов:' : 'Jami hujjatlar:'} <span className="text-white font-bold">{certsList.length}</span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={currentLang === 'ru' ? 'Поиск сертификата...' : 'Sertifikat qidirish...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sertifikatlar Grid */}
      {filteredCerts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-gray-900/50 border border-gray-800 space-y-3">
          <Award className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {currentLang === 'ru' ? 'Сертификаты не найдены' : 'Sertifikatlar topilmadi'}
          </h3>
          <p className="text-xs text-gray-400">
            {currentLang === 'ru' ? 'Попробуйте изменить поисковый запрос' : 'Qidiruv so‘zini o‘zgartirib ko‘ring'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCerts.map((cert) => {
            const hasPdf = Boolean(cert.pdfUrl);
            const certImg = cert.previewUrl || cert.image;

            return (
              <div
                key={cert.id}
                className="p-6 rounded-3xl bg-gray-900/90 border border-gray-800 hover:border-blue-500/40 transition duration-300 flex flex-col justify-between space-y-5 hover:shadow-2xl hover:shadow-blue-500/5 group"
              >
                <div className="space-y-4">
                  <div 
                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 relative cursor-pointer flex items-center justify-center group-hover:border-blue-500/30 transition-colors"
                    onClick={() => onSelectCertificate(cert)}
                    title={currentLang === 'ru' ? 'Нажмите для увеличения' : 'Kattalashtirish uchun bosing'}
                  >
                    {certImg ? (
                      <img
                        src={certImg}
                        alt={getLocalizedText(cert.title, currentLang)}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-600">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-xs font-mono">{cert.number}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gray-950/10 group-hover:bg-transparent transition-colors" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gray-900/90 backdrop-blur-md text-[10px] font-mono text-blue-300 border border-gray-700 shadow-sm">
                      {cert.number}
                    </div>

                    {hasPdf && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-rose-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {cert.issuer && (
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                        {getLocalizedText(cert.issuer, currentLang)}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {getLocalizedText(cert.title, currentLang)}
                    </h3>
                    {cert.standard && (
                      <div className="text-xs text-gray-400 mt-2 font-mono flex items-center gap-1.5">
                        <span className="text-gray-500">{currentLang === 'ru' ? 'Стандарт:' : 'Standart:'}</span>
                        <span className="text-gray-300">{cert.standard}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-400 font-medium space-y-1 pt-2 border-t border-gray-800 font-mono">
                    {cert.docNumber && (
                      <div>{currentLang === 'ru' ? '№ Бланка:' : 'Hujjat raqami:'} <span className="text-gray-200 font-semibold">{cert.docNumber}</span></div>
                    )}
                    {cert.validUntil && (
                      <div>{currentLang === 'ru' ? 'Действует до:' : 'Amal qilish muddati:'} <span className="text-emerald-400 font-semibold">{cert.validUntil}</span></div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectCertificate(cert)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-blue-600 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>{currentLang === 'ru' ? 'Просмотр' : 'Ko‘rish'}</span>
                  </button>

                  {hasPdf ? (
                    <button
                      onClick={() => handleDownloadPdf(cert)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
                      title={currentLang === 'ru' ? 'Скачать официальный PDF' : 'Rasmiy PDF yuklab olish'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  ) : certImg ? (
                    <button
                      onClick={() => handleDownloadPdf(cert)}
                      className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer"
                      title={currentLang === 'ru' ? 'Скачать изображение' : 'Rasmni yuklab olish'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};