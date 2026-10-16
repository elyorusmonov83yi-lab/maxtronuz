'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CertificatesView } from '@/components/views/CertificatesView';
import { Certificate, Language } from '@/types';
import { X, Download } from 'lucide-react';
import { getLocalizedText } from '@/utils/formatters';

export interface CertificatesClientProps {
  lang?: Language;
  initialCertificates?: Certificate[];
}

export const CertificatesClient: React.FC<CertificatesClientProps> = ({ 
  lang,
  initialCertificates = []
}) => {
  const pathname = usePathname();
  const currentLang: Language = lang || (pathname?.startsWith('/uz') ? 'uz' : 'ru');

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const handleDownload = (cert: Certificate) => {
    const target = cert.pdfUrl || cert.previewUrl || cert.image;
    if (target && typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = target;
      link.target = '_blank';
      link.download = `${cert.number || 'certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <CertificatesView
        currentLang={currentLang}
        initialCertificates={initialCertificates}
        onSelectCertificate={(cert) => setSelectedCert(cert)}
        onShowToast={(msg) => console.log(msg)}
      />

      {/* Sertifikatni kattalashtirib ko'rish modali */}
      {selectedCert && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800">
                  {selectedCert.number}
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  {getLocalizedText(selectedCert.title, currentLang)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-950/80 rounded-2xl p-2">
              <img
                src={selectedCert.previewUrl || selectedCert.image || ''}
                alt={getLocalizedText(selectedCert.title, currentLang)}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownload(selectedCert)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{currentLang === 'ru' ? 'Скачать файл' : 'Faylni yuklab olish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};