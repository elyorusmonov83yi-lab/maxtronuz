import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  currentLang: Language;
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentLang, items }) => {
  const t = translations[currentLang];

  return (
    <nav className="flex items-center space-x-2 text-xs text-gray-400 py-3 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>{t.breadcrumb_home || 'Asosiy'}</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            {item.to && !isLast ? (
              <Link 
                to={item.to} 
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-200 font-medium truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
