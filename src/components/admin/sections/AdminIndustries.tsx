import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Building2,
  ListTodo
} from 'lucide-react';
import { IndustryInfo, IndustryTask, Language } from '../../../types';
import { getLocalizedText } from '../../../utils/formatters';
import { DynamicIcon } from '../../DynamicIcon';

interface AdminIndustriesProps {
  industries: IndustryInfo[];
  currentLang: Language;
  onSaveIndustries: (industries: IndustryInfo[]) => void | Promise<void>;
}

// Slug avtomatik generatsiyasi
function generateSlug(text: string): string {
  if (!text) return '';
  const cyrillicToLatinMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ў': 'o', 'ғ': 'g', 'қ': 'q', 'ҳ': 'h'
  };

  let str = text.toLowerCase().trim();
  str = str.split('').map(char => cyrillicToLatinMap[char] || char).join('');

  return str
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const AdminIndustries: React.FC<AdminIndustriesProps> = ({
  industries = [],
  currentLang,
  onSaveIndustries,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<IndustryInfo | null>(null);

  // Yangi vazifa (Task) kiritish maydonlari
  const [taskNameUz, setTaskNameUz] = useState('');
  const [taskNameRu, setTaskNameRu] = useState('');
  const [taskDescUz, setTaskDescUz] = useState('');
  const [taskDescRu, setTaskDescRu] = useState('');

  const handleOpenAdd = () => {
    setEditingIndustry({
      id: `ind_${Date.now().toString().slice(-6)}`,
      slug: '',
      name: { uz: '', ru: '' },
      desc: { uz: '', ru: '' },
      icon: 'Building2',
      tasks: []
    });
    setTaskNameUz('');
    setTaskNameRu('');
    setTaskDescUz('');
    setTaskDescRu('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: IndustryInfo) => {
    setEditingIndustry(JSON.parse(JSON.stringify(ind)));
    setTaskNameUz('');
    setTaskNameRu('');
    setTaskDescUz('');
    setTaskDescRu('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(currentLang === 'ru' ? 'Удалить эту отрасль?' : 'Ushbu sohani o‘chirishni xohlaysizmi?')) {
      const updated = industries.filter(i => i.id !== id);
      onSaveIndustries(updated);
    }
  };

  // Soha ichiga yangi vazifa (Task) qo'shish
  const handleAddTask = () => {
    if (!editingIndustry) return;
    if (!taskNameUz.trim() && !taskNameRu.trim()) {
      alert(currentLang === 'ru' ? 'Введите название задачи' : 'Vazifa nomini kiriting');
      return;
    }

    const newTask: IndustryTask = {
      id: `task_${Date.now().toString().slice(-6)}`,
      name: {
        uz: taskNameUz.trim() || taskNameRu.trim(),
        ru: taskNameRu.trim() || taskNameUz.trim()
      },
      desc: {
        uz: taskDescUz.trim(),
        ru: taskDescRu.trim()
      }
    };

    setEditingIndustry({
      ...editingIndustry,
      tasks: [...(editingIndustry.tasks || []), newTask]
    });

    setTaskNameUz('');
    setTaskNameRu('');
    setTaskDescUz('');
    setTaskDescRu('');
  };

  const handleRemoveTask = (taskId: string) => {
    if (!editingIndustry) return;
    setEditingIndustry({
      ...editingIndustry,
      tasks: (editingIndustry.tasks || []).filter(t => t.id !== taskId)
    });
  };

  const handleSaveModal = () => {
    if (!editingIndustry) return;
    const nameObj = typeof editingIndustry.name === 'object' ? editingIndustry.name : { uz: editingIndustry.name, ru: editingIndustry.name };
    if (!nameObj.uz?.trim() && !nameObj.ru?.trim()) {
      alert(currentLang === 'ru' ? 'Введите название отрасли' : 'Soha nomini kiriting');
      return;
    }

    const finalSlug = editingIndustry.slug?.trim() || generateSlug(nameObj.uz || nameObj.ru || editingIndustry.id);

    const finalIndustry: IndustryInfo = {
      ...editingIndustry,
      slug: finalSlug,
      name: {
        uz: nameObj.uz?.trim() || nameObj.ru?.trim() || '',
        ru: nameObj.ru?.trim() || nameObj.uz?.trim() || ''
      },
      desc: typeof editingIndustry.desc === 'object' ? {
        uz: (editingIndustry.desc as any).uz?.trim() || '',
        ru: (editingIndustry.desc as any).ru?.trim() || ''
      } : { uz: editingIndustry.desc || '', ru: editingIndustry.desc || '' }
    };

    const exists = industries.some(i => i.id === finalIndustry.id);
    const updated = exists
      ? industries.map(i => i.id === finalIndustry.id ? finalIndustry : i)
      : [...industries, finalIndustry];

    onSaveIndustries(updated);
    setIsModalOpen(false);
    setEditingIndustry(null);
  };

  return (
    <div className="space-y-6">
      {/* Yuqori Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>{currentLang === 'ru' ? 'Отрасли и Инженерные Задачи' : 'Sanoat sohalari va vazifalar'}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentLang === 'ru'
              ? 'Управление отраслями и задачами для интеллектуального подбора (Finder)'
              : 'Uskuna tanlash ustasi (Finder) uchun soha va texnik vazifalarni boshqarish'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{currentLang === 'ru' ? 'Добавить отрасль' : 'Yangi soha qo‘shish'}</span>
        </button>
      </div>

      {/* Sohalar Ro'yxati */}
      {industries.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          {currentLang === 'ru' ? 'Отрасли еще не созданы.' : 'Sohalar hali yaratilmagan.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industries.map((ind) => {
            const indName = getLocalizedText(ind.name, currentLang, ind.id);
            const indDesc = getLocalizedText(ind.desc, currentLang, '');
            const tasks = ind.tasks || [];

            return (
              <div 
                key={ind.id}
                className="p-5 rounded-3xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <DynamicIcon name={ind.icon || 'Building2'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{indName}</h3>
                        <p className="text-[11px] font-mono text-gray-500">ID: {ind.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(ind)}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ind.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {indDesc && (
                    <p className="text-xs text-gray-400 leading-relaxed">{indDesc}</p>
                  )}
                </div>

                {/* Ichki vazifalar */}
                <div className="pt-3 border-t border-gray-800/80">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{currentLang === 'ru' ? 'Задачи отрасли:' : 'Sohadagi vazifalar:'}</span>
                    </span>
                    <span className="font-mono text-gray-500">({tasks.length})</span>
                  </div>

                  {tasks.length === 0 ? (
                    <p className="text-[11px] text-gray-600 italic">
                      {currentLang === 'ru' ? 'Задачи не добавлены' : 'Vazifalar kiritilmagan'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {tasks.map((task) => (
                        <span 
                          key={task.id}
                          className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-cyan-300 text-[11px] font-medium"
                        >
                          {getLocalizedText(task.name, currentLang, task.id)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOHANI QO'SHISH / TAHRIRLASH MODALI */}
      {isModalOpen && editingIndustry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>{currentLang === 'ru' ? 'Редактирование отрасли' : 'Sohani tahrirlash'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Soha Nomlari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Soha nomi (UZ) *
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Neft, gaz va energetika"
                  value={typeof editingIndustry.name === 'object' ? (editingIndustry.name.uz || '') : editingIndustry.name}
                  onChange={(e) => setEditingIndustry({
                    ...editingIndustry,
                    name: {
                      uz: e.target.value,
                      ru: typeof editingIndustry.name === 'object' ? (editingIndustry.name.ru || '') : ''
                    }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Название отрасли (RU) *
                </label>
                <input
                  type="text"
                  placeholder="Например: Нефть, газ и энергетика"
                  value={typeof editingIndustry.name === 'object' ? (editingIndustry.name.ru || '') : ''}
                  onChange={(e) => setEditingIndustry({
                    ...editingIndustry,
                    name: {
                      uz: typeof editingIndustry.name === 'object' ? (editingIndustry.name.uz || '') : '',
                      ru: e.target.value
                    }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ikonka nomi va Qisqa tavsiflar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Ikonka (Lucide)
                </label>
                <input
                  type="text"
                  placeholder="Flame, Building2, Zap, Wrench"
                  value={editingIndustry.icon || 'Building2'}
                  onChange={(e) => setEditingIndustry({ ...editingIndustry, icon: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="oil-and-gas"
                  value={editingIndustry.slug || ''}
                  onChange={(e) => setEditingIndustry({ ...editingIndustry, slug: generateSlug(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-cyan-400 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Qisqa tavsif (UZ)
                </label>
                <input
                  type="text"
                  placeholder="Quvurlar, bosim, harorat nazorati..."
                  value={typeof editingIndustry.desc === 'object' ? (editingIndustry.desc.uz || '') : (editingIndustry.desc || '')}
                  onChange={(e) => setEditingIndustry({
                    ...editingIndustry,
                    desc: {
                      uz: e.target.value,
                      ru: typeof editingIndustry.desc === 'object' ? (editingIndustry.desc.ru || '') : ''
                    }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Краткое описание (RU)
                </label>
                <input
                  type="text"
                  placeholder="Трубопроводы, давление, контроль..."
                  value={typeof editingIndustry.desc === 'object' ? (editingIndustry.desc.ru || '') : ''}
                  onChange={(e) => setEditingIndustry({
                    ...editingIndustry,
                    desc: {
                      uz: typeof editingIndustry.desc === 'object' ? (editingIndustry.desc.uz || '') : '',
                      ru: e.target.value
                    }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* SOHAGA TEGISHLI VAZIFALAR (TASKS) */}
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <span>Sohaga tegishli texnik vazifalar (Tasks)</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Ushbu sohada qilinadigan aniq o‘lchash/sinov topshiriqlarini qo‘shing
                </p>
              </div>

              {/* Yangi vazifa qo'shish inputlari */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vazifa nomi (UZ) — mas: Quvurlardagi bosimni nazorat qilish"
                  value={taskNameUz}
                  onChange={(e) => setTaskNameUz(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Задача (RU) — напр: Контроль давления в трубопроводах"
                  value={taskNameRu}
                  onChange={(e) => setTaskNameRu(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                + Vazifani ushbu sohaga qo‘shish
              </button>

              {/* Qo'shilgan vazifalar ro'yxati */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {(editingIndustry.tasks || []).map((t) => {
                  const tUz = typeof t.name === 'object' ? t.name.uz : t.name;
                  const tRu = typeof t.name === 'object' ? t.name.ru : '';

                  return (
                    <div 
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-200"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-white">{tUz || tRu}</span>
                        {tRu && tRu !== tUz && (
                          <span className="text-gray-500 text-[10px] block font-mono">RU: {tRu}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(t.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                Saqlash
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};