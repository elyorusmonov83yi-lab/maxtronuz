import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { AdminQuoteRequest, StorageService } from '../../../services/storage';

interface AdminOrdersProps {
  quotes: AdminQuoteRequest[];
  loadData: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  triggerDeleteQuote: (id: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  quotes,
  loadData,
  showNotification,
  triggerDeleteQuote
}) => {
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Мижоз исми ёки телефон рақами..."
            value={quoteSearch}
            onChange={(e) => setQuoteSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={quoteStatusFilter}
          onChange={(e) => setQuoteStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Барча ҳолатлар</option>
          <option value="new">Янги сўровлар</option>
          <option value="contacted">Боғланилди</option>
          <option value="completed">Битим тузилди</option>
        </select>
      </div>

      <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Мижоз / Ташкилот</th>
                <th className="px-6 py-4">Телефон</th>
                <th className="px-6 py-4">Маҳсулот</th>
                <th className="px-6 py-4">Сана</th>
                <th className="px-6 py-4">Ҳолати</th>
                <th className="px-6 py-4 text-right">Амаллар</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {quotes
                .filter((q) => {
                  const name = q.contactPerson || (q as any).name || '';
                  const matchSearch = 
                    name.toLowerCase().includes(quoteSearch.toLowerCase()) ||
                    (q.phone || '').toLowerCase().includes(quoteSearch.toLowerCase());
                  const matchStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
                  return matchSearch && matchStatus;
                })
                .map((q) => {
                  const contactName = q.contactPerson || (q as any).name || 'Мижоз';
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
                      {q.productName || 'Умумий консультация'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-[11px]">
                      {new Date(q.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={q.status}
                        onChange={(e) => {
                          StorageService.updateQuoteStatus(q.id, e.target.value as any);
                          loadData();
                          showNotification('Буюртма ҳолати янгиланди!');
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none bg-gray-950 ${
                          q.status === 'new'
                            ? 'text-amber-400 border-amber-500/30'
                            : q.status === 'contacted'
                            ? 'text-blue-400 border-blue-500/30'
                            : 'text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <option value="new">Янги</option>
                        <option value="contacted">Боғланилди</option>
                        <option value="completed">Битим тузилди</option>
                        <option value="cancelled">Бекор қилинди</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => triggerDeleteQuote(q.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
