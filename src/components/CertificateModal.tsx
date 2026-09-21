"use client";

import React from 'react';
import { X, ShieldCheck, CheckCircle, Download, QrCode } from 'lucide-react';
import { Certificate, Language } from '../types';
import { getLocalizedText } from '../utils/formatters';

interface CertificateModalProps {
  certificate: Certificate | null;
  currentLang: Language;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  currentLang,
  onClose,
  onShowToast,
}) => {
  if (!certificate) return null;

  const handleDownload = () => {
    const fileUrl = certificate.pdfUrl || certificate.previewUrl || certificate.image;
    const certTitle = getLocalizedText(certificate.title, currentLang);

    if (fileUrl && typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = `${certificate.number || certificate.docNumber || 'certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onShowToast(
      currentLang === 'uz_cyrl'
        ? `«${certificate.docNumber || certTitle}» расмий сертификати юклаб олинди.`
        : currentLang === 'uz'
        ? `«${certificate.docNumber || certTitle}» rasmiy sertifikati yuklab olindi.`
        : `Сертификат «${certificate.docNumber || certTitle}» успешно скачан.`
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      id="certificate-modal"
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/70">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {certificate.docNumber || certificate.number}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 
              {currentLang === 'ru' 
                ? `Действителен до: ${certificate.validUntil}` 
                : `Amal qilish muddati: ${certificate.validUntil}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
            {/* Background Stamp Watermark */}
            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
              <ShieldCheck className="w-48 h-48 text-blue-400" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                    {certificate.standard}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {getLocalizedText(certificate.title, currentLang)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-700/40 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>

              <div className="border-t border-gray-800/80 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Орган сертификации:' : 'Beruvchi tashkilot:'}</span>
                  <span className="font-semibold text-gray-200 text-right max-w-xs">
                    {getLocalizedText(certificate.issuer, currentLang)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Регистрационный номер:' : 'Ro‘yxatga olish raqami:'}</span>
                  <span className="font-mono font-bold text-white">{certificate.number}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Срок действия:' : 'Amal qilish muddati:'}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{certificate.validUntil}</span>
                </div>
              </div>

              {/* State registry verification stamp */}
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <QrCode className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">
                      {currentLang === 'ru' ? 'Госреестр средств измерений' : 'Davlat Reestri QR Tekshiruvi'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {currentLang === 'ru' ? 'Агентство «Узстандарт» РУз' : 'O‘zbekiston Respublikasi Davlat metrologiya xizmati'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {currentLang === 'ru' 
                  ? 'Скачать сертификат (PDF)' 
                  : 'Sertifikatni yuklab olish (PDF)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};