"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, ShieldCheck, Trash2, RefreshCw, Search, Loader2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager'>('admin');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Bazadan to'g'ridan-to'g'ri foydalanuvchilarni olish
  const loadUsersFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAdminUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', err);
      showNotification('Foydalanuvchilarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadUsersFromDB();
  }, [loadUsersFromDB]);

  // Yangi admin qo'shish
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      showNotification('Login va parol kiritilishi shart!', 'error');
      return;
    }

    if (newUserPassword.trim().length < 8) {
      showNotification('Parol kamida 8 ta belgidan iborat bo‘lishi kerak!', 'error');
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
      setIsSubmitting(true);
      await ApiService.saveAdminUser(payload);
      showNotification('Yangi foydalanuvchi muvaffaqiyatli saqlandi!', 'success');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAddingUser(false);
      await loadUsersFromDB();
    } catch {
      showNotification('Xatolik: foydalanuvchi saqlanmadi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adminni o'chirish
  const handleDeleteUser = async (user: any) => {
    const displayName = user.name || user.fullName || user.username || 'Foydalanuvchi';
    if (typeof window !== 'undefined' && window.confirm(`«${displayName}» foydalanuvchisini bazadan o‘chirishni tasdiqlaysizmi?`)) {
      try {
        await ApiService.deleteAdminUser(user.id);
        showNotification('Foydalanuvchi bazadan o‘chirildi!', 'success');
        await loadUsersFromDB();
      } catch {
        showNotification('Xatolik: foydalanuvchi o‘chirilmadi', 'error');
      }
    }
  };

  const formatDate = (dateStr?: string | number | Date) => {
    if (!dateStr) return 'Bazada';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Bazada' : d.toLocaleDateString('uz-UZ');
    } catch {
      return 'Bazada';
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (u.name || u.fullName || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return name.includes(q) || username.includes(q) || role.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Administratorlar va Xodimlar</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Tizim foydalanuvchilari va ularning kirish rollari ({usersList.length} ta)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadUsersFromDB}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Qayta yuklash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingUser ? 'Bekor qilish' : 'Yangi admin qo‘shish'}</span>
          </button>
        </div>
      </div>

      {/* Yangi admin qo'shish formasi */}
      {isAddingUser && (
        <form onSubmit={handleAddUser} className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Yangi administrator kiritish</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">F.I.Sh.</label>
              <input
                type="text"
                placeholder="Foydalanuvchi ismi"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Elektron pochta / Login *</label>
              <input
                type="text"
                required
                placeholder="admin@maxtron.uz"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Parol *</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Kamida 8 belgi"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tizimdagi roli</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="admin">Bosh Administrator (Admin)</option>
                <option value="manager">Menejer (Manager)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Saqlanmoqda...' : 'Saqlash va qo‘shish'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Qidiruv paneli */}
      {usersList.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, login yoki rol bo'yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      )}

      {/* Ro'yxat / Yuklanish holati */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Foydalanuvchilar bazadan yuklanmoqda...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          {searchQuery 
            ? 'Qidiruv bo‘yicha foydalanuvchilar topilmadi.' 
            : 'Bazada hali foydalanuvchilar mavjud emas. «Yangi admin qo‘shish» tugmasi orqali kiriting.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const displayName = user.name || user.fullName || user.username || 'Admin';
            const firstLetter = displayName.charAt(0).toUpperCase();

            return (
              <div 
                key={user.id} 
                className="p-5 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 flex flex-col justify-between hover:border-gray-700 transition"
              >
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
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[11px]">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    user.role === 'admin' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {user.role === 'admin' ? '⭐ Admin' : '💼 Manager'}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {formatDate(user.createdAt)}
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