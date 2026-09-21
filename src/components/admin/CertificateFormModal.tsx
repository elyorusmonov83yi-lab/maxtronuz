"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Award, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { Certificate, Language } from '../../types';
import { ApiService } from '../../services/api';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  certToEdit?: Certificate | null;
  onSave: (cert: Certificate) => void;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  certToEdit,
  onSave
}) => {
  const [activeLang, setActiveLang] = useState<Language>('uz');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const [formData, setFormData] = useState<Certificate>({
    id: '',
    number: '',
    title: { uz: '', ru: '' },
    issuer: { uz: '', ru: '' },
    validUntil: '2028-12-31',
    standard: '',
    docNumber: '',
    image: '',
    previewUrl: '',
    pdfUrl: ''
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      if (certToEdit) {
        setFormData({
          id: certToEdit.id || '',
          number: certToEdit.number || certToEdit.certNumber || '',
          title: typeof certToEdit.title === 'string' 
            ? { uz: certToEdit.title, ru: certToEdit.title } 
            : { uz: certToEdit.title?.uz || '', ru: certToEdit.title?.ru || '' },
          issuer: typeof certToEdit.issuer === 'string' 
            ? { uz: certToEdit.issuer, ru: certToEdit.issuer } 
            : { uz: certToEdit.issuer?.uz || '', ru: certToEdit.issuer?.ru || '' },
          validUntil: certToEdit.validUntil || '2028-12-31',
          standard: certToEdit.standard || '',
          docNumber: certToEdit.docNumber || '',
          image: certToEdit.image || certToEdit.previewUrl || '',
          previewUrl: certToEdit.previewUrl || certToEdit.image || '',
          pdfUrl: certToEdit.pdfUrl || ''
        });
      } else {
        setFormData({
          id: `cert-${Date.now().toString().slice(-6)}`,
          number: '№ ',
          title: { uz: '', ru: '' },
          issuer: { uz: '', ru: '' },
          validUntil: '2028-12-31',
          standard: '',
          docNumber: '',
          image: '',
          previewUrl: '',
          pdfUrl: ''
        });
      }
    }
  }, [certToEdit, isOpen]);

  if (!isOpen) return null;

  // 1. Muqova rasmini serverga yuklash
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const url = await ApiService.uploadFile(file);
      setFormData((prev) => ({ ...prev, previewUrl: url, image: url }));
    } catch (err: any) {
      alert('Rasmni yuklashda xatolik: ' + (err?.message || 'Server xatosi'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 2. PDF faylni to'g'ridan-to'g'ri serverga yuklash
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPdf(true);
      const url = await ApiService.uploadFile(file);
      setFormData((prev) => ({ ...prev, pdfUrl: url }));
    } catch (err: any) {
      alert('PDF yuklashda xatolik: ' + (err?.message || 'Server xatosi'));
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number?.trim()) {
      alert('Iltimos, sertifikat raqamini kiriting!');
      return;
    }

    const finalCert: Certificate = {
      ...formData,
      id: formData.id || `cert-${Date.now()}`,
      number: formData.number || '',
      certNumber: formData.number || '',
      title: {
        uz: formData.title?.uz || formData.number || '',
        ru: formData.title?.ru || formData.title?.uz || formData.number || ''
      },
      issuer: {
        uz: formData.issuer?.uz || '',
        ru: formData.issuer?.ru || formData.issuer?.uz || ''
      },
      image: formData.previewUrl || formData.image || '',
      previewUrl: formData.previewUrl || formData.image || '',
      pdfUrl: formData.pdfUrl?.trim() || ''
    };

    onSave(finalCert);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {certToEdit ? 'Sertifikatni tahrirlash' : 'Yangi sertifikat qo‘shish'}
              </h2>
              <p className="text-xs text-gray-400">
                Rasm va rasmiy PDF hujjat biriktirish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* Raqam va Standart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Sertifikat / Reestr raqami *
              </label>
              <input
                type="text"
                required
                placeholder="№ 003220172026"
                value={formData.number || ''}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Standart / Hujjat turi
              </label>
              <input
                type="text"
                placeholder="ISO 9001 / CE / Rasmiy diler"
                value={formData.standard || ''}
                onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
              />
            </div>
          </div>

          {/* Til tugmalari */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
            {[
              { code: 'uz', label: "🇺🇿 O'zbekcha" },
              { code: 'ru', label: '🇷🇺 Русский' }
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLang(lang.code as Language)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeLang === lang.code
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Nomi va Beruvchi tashkilot */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Sertifikat nomi ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder="Rasmiy distribyutorlik sertifikati"
                value={formData.title?.[activeLang] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...formData.title, [activeLang]: e.target.value }
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Beruvchi organ / Tashkilot ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                placeholder="O'zstandart agentligi"
                value={formData.issuer?.[activeLang] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issuer: { ...formData.issuer, [activeLang]: e.target.value }
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Sana va Hujjat raqami */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Amal qilish muddati
              </label>
              <input
                type="date"
                value={formData.validUntil || ''}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Blanka / Qo‘shimcha raqam
              </label>
              <input
                type="text"
                placeholder="UZ.SMT.01..."
                value={formData.docNumber || ''}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
              />
            </div>
          </div>

          {/* 1. Muqova rasmi (Preview) yuklash */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>1. Sertifikat rasmi / Muqovasi (Preview)</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">JPG, PNG, WEBP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 flex justify-center">
                <div className="w-24 h-28 rounded-xl border border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center relative">
                  {formData.previewUrl || formData.image ? (
                    <img 
                      src={formData.previewUrl || formData.image} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingImage ? 'Yuklanmoqda...' : 'Rasm tanlash va yuklash'}</span>
                </button>

                <input
                  type="url"
                  placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL havolasi..."
                  value={formData.previewUrl || formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value, image: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                />
              </div>
            </div>
          </div>

          {/* 2. PDF Faylni serverga yuklash */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>2. Sertifikat PDF fayli (Yuklab olish uchun)</span>
              </label>
              <span className="text-[11px] text-rose-400/80 font-mono">PDF, DOCX</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 flex justify-center">
                <div className="w-24 h-28 rounded-xl border border-gray-700 bg-gray-900 overflow-hidden flex flex-col items-center justify-center p-2 text-center relative">
                  {formData.pdfUrl ? (
                    <div className="flex flex-col items-center gap-1 text-rose-400">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 break-all line-clamp-1">
                        PDF biriktirilgan
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-600">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px]">Biriktirilmagan</span>
                    </div>
                  )}

                  {isUploadingPdf && (
                    <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-2">
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfUpload}
                  accept="application/pdf,.doc,.docx"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingPdf}
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingPdf ? 'PDF yuklanmoqda...' : 'PDF fayl tanlash'}</span>
                  </button>

                  {formData.pdfUrl && (
                    <>
                      <a
                        href={formData.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white transition"
                        title="Faylni yangi oynada ochish"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, pdfUrl: '' }))}
                        className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                        title="PDF faylni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Yoki to‘g‘ridan-to‘g‘ri PDF havolasi..."
                  value={formData.pdfUrl || ''}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono transition"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{certToEdit ? 'O‘zgarishlarni saqlash' : 'Sertifikatni saqlash'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};