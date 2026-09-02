import React from 'react';
import { Upload, X } from 'lucide-react';
import { ClientPartner } from '../../types';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {clientToEdit ? 'Ҳамкорни таҳрирлаш' : 'Янги ҳамкор қўшиш'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const shortName = formData.get('shortName') as string;
            const category = formData.get('category') as string;
            const logo = clientLogoPreview || (formData.get('logo') as string) || '';

            const clientData: ClientPartner = {
              id: clientToEdit ? clientToEdit.id : Date.now().toString(),
              name: name || 'Ҳамкор',
              shortName: shortName || name || 'Logo',
              category: category || 'Ҳамкор',
              logo
            };

            onSave(clientData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Логотип расми (Файлни танланг)
            </label>
            <div className="flex items-center space-x-3 bg-gray-800 border border-gray-700 rounded-xl p-3">
              {clientLogoPreview ? (
                <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 p-1 flex items-center justify-center shrink-0">
                  <img src={clientLogoPreview} alt="Preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setClientLogoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400">PNG, JPG, SVG форматлари</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Компания / Ҳамкор номи
            </label>
            <input
              name="name"
              defaultValue={clientToEdit?.name || ''}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="Масалан: Uzbekneftegaz"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Қисқа номи (Абревиатура - ихтиёрий)
            </label>
            <input
              name="shortName"
              defaultValue={clientToEdit?.shortName || ''}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="Масалан: UNG"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Саноат соҳаси / Категория (ихтиёрий)
            </label>
            <input
              name="category"
              defaultValue={clientToEdit?.category || ''}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="Масалан: Нефть ва Газ"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Ёки Расм URL ҳаволаси
            </label>
            <input
              name="logo"
              value={clientLogoPreview}
              onChange={(e) => setClientLogoPreview(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition"
            >
              Бекор қилиш
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20"
            >
              Сақлаш
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
