"use client";

import React from 'react';
import { Plus, Handshake, Building, Edit3, Trash2 } from 'lucide-react';
import { ClientPartner } from '@/types';

interface AdminClientsProps {
  clients: ClientPartner[];
  setClients: (c: ClientPartner[]) => void;
  setClientToEdit: (c: ClientPartner | null) => void;
  setClientLogoPreview: (url: string) => void;
  setIsClientModalOpen: (open: boolean) => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  triggerDeleteClient?: (client: ClientPartner) => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({
  clients = [],
  setClients,
  setClientToEdit,
  setClientLogoPreview,
  setIsClientModalOpen,
  showNotification,
  triggerDeleteClient
}) => {
  const handleDelete = async (client: ClientPartner) => {
    if (triggerDeleteClient) {
      triggerDeleteClient(client);
      return;
    }

    if (confirm(`«${client.name}» hamkorini o'chirishni tasdiqlaysizmi?`)) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
        const res = await fetch(`/api/clients/${client.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const result = await res.json();

        if (result.success) {
          const updated = clients.filter(c => c.id !== client.id);
          setClients(updated);
          showNotification('Hamkor o\'chirildi!', 'success');
        } else {
          showNotification(result.message || 'O‘chirishda xatolik yuz berdi', 'error');
        }
      } catch (err) {
        showNotification('Server bilan aloqada xatolik', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 p-6 rounded-3xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Handshake className="w-6 h-6 text-cyan-400" />
            <span>Mijozlar va Hamkorlar Boshqaruvi</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Bosh sahifada aks etuvchi hamkor korxonalar va ularning logotiplarini boshqarish
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setClientToEdit(null);
            setClientLogoPreview('');
            setIsClientModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-cyan-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi hamkor qo'shish</span>
        </button>
      </div>

      {/* Ro'yxat */}
      {clients.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 text-sm">
          Hamkorlar ro‘yxati bo‘sh. Yangi hamkor qo‘shing.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div 
              key={client.id} 
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center p-2 shrink-0">
                    {client.logo ? (
                      <img 
                        src={client.logo} 
                        alt={client.name} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Building className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-900/60 inline-block truncate max-w-full">
                      {client.shortName || 'Hamkor'}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1 truncate" title={client.name}>
                      {client.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 truncate">
                      {client.category || 'Sanoat'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setClientToEdit(client);
                      setClientLogoPreview(client.logo || '');
                      setIsClientModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(client)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};