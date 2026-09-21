"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ClientPartner } from '../../types';
import { ApiService } from '../../services/api';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit: ClientPartner | null;
  clientLogoPreview: string;
  setClientLogoPreview: (url: string) => void;
  onSave: (clientData: ClientPartner) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  clientLogoPreview,
  setClientLogoPreview,
  onSave
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5 MB dan oshmasligi kerak!");
      return;
    }

    try {
      setIsUploading(true);
      const url = await ApiService.uploadFile(file);
      setClientLogoPreview(url);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const shortName = (formData.get('shortName') as string)?.trim();
    const category = (formData.get('category') as string)?.trim();
    const logo = clientLogoPreview || (formData.get('logo') as string)?.trim() || '';

    const clientData: ClientPartner = {
      id: clientToEdit ? clientToEdit.id : `client_${Date.now()}`,
      name: name || 'Hamkor',
      shortName: shortName || name || 'Logo',
      category: category || 'Sanoat',
      logo
    };

    onSave(clientData);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {clientToEdit ? 'Hamkorni tahrirlash' : 'Yangi hamkor qo‘shish'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Logotip rasmi
            </label>
            <div className="flex items-center space-x-3 bg-gray-950 border border-gray-800 rounded-2xl p-3">
              <div className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                {clientLogoPreview ? (
                  <img src={clientLogoPreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploading ? 'Yuklanmoqda...' : 'Fayl tanlash'}</span>
                </button>
                <p className="text-[10px] text-gray-500 font-mono">PNG, JPG, SVG, WebP</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Kompaniya / Hamkor nomi *
            </label>
            <input
              name="name"
              defaultValue={clientToEdit?.name || ''}
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              placeholder="Masalan: Uzbekneftegaz"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Qisqa nomi (Abbreviatura)
            </label>
            <input
              name="shortName"
              defaultValue={clientToEdit?.shortName || ''}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              placeholder="Masalan: UNG"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Sanoat sohasi / Kategoriya
            </label>
            <input
              name="category"
              defaultValue={clientToEdit?.category || ''}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              placeholder="Masalan: Neft va Gaz"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Yoki rasm URL havolasi
            </label>
            <input
              name="logo"
              value={clientLogoPreview}
              onChange={(e) => setClientLogoPreview(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono transition"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/25 cursor-pointer disabled:opacity-50"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};