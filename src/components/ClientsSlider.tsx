import React, { useState, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import { Language, ClientPartner } from '../types';
import { StorageService } from '../services/storage';

interface ClientsSliderProps {
  currentLang: Language;
}

export const ClientsSlider: React.FC<ClientsSliderProps> = ({ currentLang }) => {
  const [clients, setClients] = useState<ClientPartner[]>(() => StorageService.getClients());

  useEffect(() => {
    const freshClients = StorageService.getClients();
    if (freshClients && freshClients.length > 0) {
      setClients(freshClients);
    }

    const handleUpdate = (e: CustomEvent) => {
      if (e.detail && Array.isArray(e.detail)) {
        setClients(e.detail);
      }
    };

    window.addEventListener('maxtron_clients_updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('maxtron_clients_updated', handleUpdate as EventListener);
    };
  }, []);

  const titles = {
    uz: { 
      title: 'Bizning mijozlarimiz va hamkorlar', 
      subtitle: "O'zbekistonning yetakchi sanoat va energetika korxonalari MAXTRON uskunalariga ishonadi" 
    },
    ru: { 
      title: 'Наши клиенты и партнеры', 
      subtitle: 'Ведущие промышленные и энергетические предприятия Узбекистана доверяют оборудованию MAXTRON' 
    },
  };

  const t = titles[currentLang as keyof typeof titles] || titles.ru;

  const validClients = (clients.length > 0 ? clients : StorageService.getClients()).filter(
    (c) => c.logo && c.logo.length > 5 && !c.logo.includes('undefined')
  );

  if (!validClients || validClients.length === 0) return null;

  // Cheksiz silliq oqim uchun ro'yxatni 2 marta takrorlaymiz
  const doubleList = [...validClients, ...validClients];

  return (
    <section className="py-12 bg-transparent relative overflow-hidden">
      {/* Silliq doimiy oqim uchun maxsus CSS animatsiya */}
      <style>{`
        @keyframes scrollSeamless {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          display: flex;
          width: max-content;
          animation: scrollSeamless 25s linear infinite;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1.5">
          <Handshake className="w-4 h-4" />
          <span>{currentLang === 'ru' ? 'Партнеры' : 'Hamkorlar'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {t.title}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
          {t.subtitle}
        </p>
      </div>

      {/* Cheksiz tekis oquvchi logotiplar lentasi */}
      <div className="w-full overflow-hidden relative">
        {/* Yon tomonlariga silliq qorong'ulashish effekti */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-smooth items-center">
          {doubleList.map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              title={client.name}
              className="flex-shrink-0 flex items-center justify-center h-20 sm:h-24 w-44 sm:w-56 px-6 cursor-pointer"
            >
              <img
                src={client.logo}
                alt={client.name}
                className="max-h-16 sm:max-h-20 max-w-full w-auto object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};