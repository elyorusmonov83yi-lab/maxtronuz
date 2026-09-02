import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';
import { AdminUser } from '../../../types';
import { ApiService } from '../../../services/api';

interface AdminUsersProps {
  adminUsers?: AdminUser[];
  setAdminUsers?: (users: AdminUser[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  onSaveUser?: (userData: any) => Promise<void> | void;
  onDeleteUser?: (id: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  showNotification
}) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager'>('admin');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Bazadan to'g'ridan-to'g'ri foydalanuvchilarni olish
  const loadUsersFromDB = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setUsersList(json.data);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', err);
      showNotification('Фойдаланувчиларни юклашда хатолик yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersFromDB();
  }, []);

  // Yangi admin qo'shish
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      showNotification('Логин ва пароль киритилиши шарт!', 'error');
      return;
    }

    const payload = {
      id: 'usr_' + Date.now(),
      name: newUserName.trim() || newUserEmail.trim(),
      fullName: newUserName.trim() || newUserEmail.trim(),
      username: newUserEmail.trim().toLowerCase(),
      password: newUserPassword.trim(),
      role: newUserRole
    };

    try {
      await ApiService.saveAdminUser(payload);
      showNotification('Янги админ MariaDB базасига қўшилди!', 'success');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAddingUser(false);
      await loadUsersFromDB();
    } catch {
      showNotification('Хатолик: фойдаланувчи сақланмади', 'error');
    }
  };

  // Adminni o'chirish
  const handleDeleteUser = async (user: any) => {
    const displayName = user.name || user.fullName || user.username || 'Администратор';
    if (window.confirm(`«${displayName}» фойдаланувчисини базадан ўчиришни тасдиқлайсизми?`)) {
      try {
        await ApiService.deleteAdminUser(user.id);
        showNotification('Фойдаланувчи базадан ўчирилди!', 'success');
        await loadUsersFromDB();
      } catch {
        showNotification('Хатолик: фойдаланувчи ўчирилмади', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Администраторлар ва Ходимлар
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            MariaDB базасидаги маълумотлар ({usersList.length} та фойдаланувчи)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadUsersFromDB}
            className="p-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            title="Қайта юклаш"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingUser ? 'Бекор қилиш' : 'Янги админ қўшиш'}</span>
          </button>
        </div>
      </div>

      {isAddingUser && (
        <form onSubmit={handleAddUser} className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Янги администратор киритиш</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ф.И.Ш.</label>
              <input
                type="text"
                placeholder="Элёр Усмонов"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Электрон почта / Логин</label>
              <input
                type="text"
                required
                placeholder="elyor@maxtron.uz"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Пароль</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Тизимдаги роли</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="admin">Бош Администратор (Admin)</option>
                <option value="manager">Менеджер (Manager)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition"
            >
              Сақлаш ва қўшиш
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Фойдаланувчилар базадан юкланмоқда...
        </div>
      ) : usersList.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          Базада ҳали фойдаланувчилар мавжуд эмас. «Янги админ қўшиш» тугмаси орқали биринчи администраторни қўшинг.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersList.map((user) => {
            const displayName = user.name || user.fullName || user.username || 'Admin';
            const firstLetter = displayName.charAt(0).toUpperCase();

            return (
              <div key={user.id} className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                      {firstLetter}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{displayName}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Ўчириш"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    {user.role === 'admin' ? '⭐ Admin' : '💼 Manager'}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : 'Базада'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};