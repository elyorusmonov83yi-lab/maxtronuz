import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Layers } from 'lucide-react';

interface DynamicIconProps {
  name?: string;
  className?: string;
  fallbackImage?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name = 'Layers', 
  className = 'w-5 h-5',
  fallbackImage
}) => {
  // 1. Agar foydalanuvchi o'zining SVG yoki Rasm ikonkasini yuklagan bo'lsa:
  if (name?.startsWith('data:image') || name?.startsWith('http') || fallbackImage) {
    const src = (name?.startsWith('data:image') || name?.startsWith('http')) ? name : fallbackImage;
    return (
      <img 
        src={src} 
        alt="icon" 
        className={`${className} object-contain inline-block`} 
        loading="lazy"
      />
    );
  }

  // 2. Lucide kutubxonasidan dinamik qidirish:
  const iconCandidate = (LucideIcons as Record<string, any>)[name];

  // Agar topilgan ob'ekt haqiqiy React komponent bo'lmasa, standart Layers qo'yiladi
  const IconComponent = (typeof iconCandidate === 'function' || typeof iconCandidate === 'object') && iconCandidate !== null
    ? iconCandidate
    : Layers;

  return <IconComponent className={className} />;
};