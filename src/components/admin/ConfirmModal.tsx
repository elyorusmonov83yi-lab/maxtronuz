"use client";

import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "O'chirish",
  cancelLabel = 'Bekor qilish',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Orqa fon nur effekti */}
        <div className={`absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
          isDestructive ? 'bg-rose-600/15' : 'bg-blue-600/15'
        }`} />

        <div className="flex items-start justify-between gap-4 mb-4 relative">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDestructive 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isDestructive ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {title}
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">
                Tasdiqlash amali
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 text-white cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};