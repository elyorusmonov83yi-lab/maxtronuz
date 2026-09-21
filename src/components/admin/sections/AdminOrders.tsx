"use client";

import React, { useState } from 'react';
import { Search, Trash2, Inbox } from 'lucide-react';
import { AdminQuoteRequest, StorageService } from '../../../services/storage';

interface AdminOrdersProps {
  quotes: AdminQuoteRequest[];
  loadData: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  triggerDeleteQuote: (id: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  quotes = [],
  loadData,
  showNotification,
  triggerDeleteQuote
}) => {
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');

  const filteredQuotes = quotes.filter((q) => {
    const name = q.contactPerson || (q as any).name || '';
    const matchSearch = 
      name.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      (q.phone || '').toLowerCase().includes(quoteSearch.toLowerCase()) ||
      (q.companyName || (q as any).company || '').toLowerCase().includes(quoteSearch.toLowerCase());
    const matchStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr: string | number | Date) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('uz-UZ');
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Qidiruv va Filtr */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Mijoz ismi, tashkilot yoki telefon raqami..."
            value={quoteSearch}
            onChange={(e) => setQuoteSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <select
          value={quoteStatusFilter}
          onChange={(e) => setQuoteStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Barcha holatlar</option>
          <option value="new">Yangi so‘rovlar</option>
          <option value="contacted">Bog‘lanildi</option>
          <option value="completed">Bitim tuzildi</option>
          <option value="cancelled">Bekor qilindi</option>
        </select>
      </div>

      {/* Jadval */}
      <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Mijoz / Tashkilot</th>
                <th className="px-6 py-4">Telefon</th>
                <th className="px-6 py-4">Mahsulot</th>
                <th className="px-6 py-4">Sana</th>
                <th className="px-6 py-4">Holati</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>So‘rovlar topilmadi.</span>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const contactName = q.contactPerson || (q as any).name || 'Mijoz';
                  const company = q.companyName || (q as any).company || '';
                  return (
                    <tr key={q.id} className="hover:bg-gray-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{contactName}</div>
                        {company && <div className="text-[11px] text-gray-500">{company}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-cyan-400">
                        {q.phone}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {q.productName || 'Umumiy konsultatsiya'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-[11px] font-mono">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={q.status}
                          onChange={(e) => {
                            StorageService.updateQuoteStatus(q.id, e.target.value as any);
                            loadData();
                            showNotification('Buyurtma holati yangilandi!', 'success');
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none bg-gray-950 cursor-pointer ${
                            q.status === 'new'
                              ? 'text-amber-400 border-amber-500/30'
                              : q.status === 'contacted'
                              ? 'text-blue-400 border-blue-500/30'
                              : q.status === 'completed'
                              ? 'text-emerald-400 border-emerald-500/30'
                              : 'text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="new">Yangi</option>
                          <option value="contacted">Bog‘lanildi</option>
                          <option value="completed">Bitim tuzildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => triggerDeleteQuote(q.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};