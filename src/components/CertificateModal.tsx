import React from 'react';
import { X, ShieldCheck, CheckCircle, Download, ExternalLink, QrCode } from 'lucide-react';
import { Certificate, Language } from '../types';
import { translations } from '../data/translations';
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

  const t = translations[currentLang];

  const handleDownload = () => {
    onShowToast(
      currentLang === 'uz_cyrl'
        ? `«${certificate.docNumber}» расмий сертификат нусхаси юклаб олинди.`
        : `«${certificate.docNumber}» rasmiy sertifikat nusxasi yuklab olindi.`
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
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
              {certificate.docNumber}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Ҳақиқий / Амал қилиш муддати: {certificate.validUntil}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
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
                  <span>Берувчи ташкилот:</span>
                  <span className="font-semibold text-gray-200 text-right max-w-xs">{getLocalizedText(certificate.issuer, currentLang)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Рўйхатга олиш рақами:</span>
                  <span className="font-mono font-bold text-white">{certificate.number}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Амал қилиш муддати:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{certificate.validUntil} гача</span>
                </div>
              </div>

              {/* State registry verification stamp */}
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <QrCode className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">Давлат Реестри QR Текшируви</div>
                    <div className="text-[10px] text-gray-400">Ўзбекистон Республикаси Давлат метрология хизмати</div>
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
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Сертификатни юклаб олиш (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
