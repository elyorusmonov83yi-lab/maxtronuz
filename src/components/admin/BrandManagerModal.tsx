"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Tag, Trash2, CheckCircle2, Edit2, Loader2, Globe } from 'lucide-react';
import { BrandInfo, Language } from '../../types';
import { ApiService } from '../../services/api';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandInfo[];
  onRefresh: () => void;
  currentLang: Language;
}

export const BrandManagerModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brands = [],
  onRefresh,
  currentLang
}) => {
  const [editingBrand, setEditingBrand] = useState<BrandInfo | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setCountry('');
    setWebsite('');
    setLogo('');
    setEditingBrand(null);
  }, []);

  // Escape orqali yopish
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const brandPayload: BrandInfo = {
      id: editingBrand ? editingBrand.id : `brand-${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      country: country.trim(),
      website: website.trim(),
      logo: logo.trim(),
      isActive: true
    };

    try {
      setIsSaving(true);
      const res = await ApiService.saveBrand(brandPayload);

      if (res && res.success !== false) {
        resetForm();
        onRefresh();
      } else {
        alert(res?.message || res?.error || 'Brendni saqlashda server xatosi yuz berdi');
      }
    } catch (err: any) {
      console.error('Brand save error:', err);
      alert(`Tarmoq xatosi: ${err?.message || 'Server bilan aloqa yo‘q'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && window.confirm(currentLang === 'ru' ? 'Удалить этот бренд?' : 'Ushbu brendni o‘chirishni xohlaysizmi?')) {
      try {
        await ApiService.deleteBrand(id);
        if (editingBrand?.id === id) {
          resetForm();
        }
        onRefresh();
      } catch (err: any) {
        alert(`O‘chirishda xatolik: ${err?.message || 'Server xatosi'}`);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {currentLang === 'ru' ? 'Управление брендами / Производителями' : 'Brendlar va Ishlab chiqaruvchilarni boshqarish'}
              </h2>
              <p className="text-xs text-gray-400">
                {currentLang === 'ru' ? 'Добавление и редактирование брендов оборудования' : 'Uskuna brendlarini qo‘shish va tahrirlash'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-800 hover:bg-gray-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Qo'shish / Tahrirlash Formasi */}
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              {currentLang === 'ru' ? 'Название бренда *' : 'Brend nomi *'}
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: BD|SENSORS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              {currentLang === 'ru' ? 'Страна происхождения' : 'Ishlab chiqarilgan davlat'}
            </label>
            <input
              type="text"
              placeholder="Masalan: Germaniya / Rossiya"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-300">
              {currentLang === 'ru' ? 'Официальный сайт' : 'Rasmiy veb-sayt'}
            </label>
            <input
              type="text"
              placeholder="https://www.bdsensors.ru"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-gray-800/80">
            {editingBrand && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer transition"
              >
                {currentLang === 'ru' ? 'Отмена' : 'Bekor qilish'}
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>
                {editingBrand 
                  ? (currentLang === 'ru' ? 'Сохранить изменения' : 'O‘zgarishlarni saqlash') 
                  : (currentLang === 'ru' ? 'Добавить бренд' : 'Brend qo‘shish')}
              </span>
            </button>
          </div>
        </form>

        {/* Mavjud brendlar ro'yxati */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {currentLang === 'ru' ? 'Список брендов в базе' : 'Bazadagi brendlar ro‘yxati'} ({brands.length})
          </h3>

          {brands.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 bg-gray-950/40 rounded-2xl border border-gray-800">
              {currentLang === 'ru' ? 'Бренды пока не добавлены' : 'Brendlar hali kiritilmagan'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {brands.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition">
                  <div className="truncate pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{b.name}</span>
                      {b.country && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/50">
                          {b.country}
                        </span>
                      )}
                    </div>
                    {b.website && (
                      <a 
                        href={b.website.startsWith('http') ? b.website : `https://${b.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] text-gray-400 hover:text-cyan-400 font-mono flex items-center gap-1 mt-1 truncate"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{b.website}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(b);
                        setName(b.name);
                        setCountry(b.country || '');
                        setWebsite(b.website || '');
                        setLogo(b.logo || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{currentLang === 'ru' ? 'Изм.' : 'Tahrir'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-900/60 transition cursor-pointer"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};