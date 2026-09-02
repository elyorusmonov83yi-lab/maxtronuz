import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Language, Product, HomeContent } from '../types';
import { StorageService } from '../services/storage';
import { getLocalizedText, getProductName } from '../utils/formatters';

interface SeoManagerProps {
  currentLang: Language;
  product?: Product;
  homeContent?: HomeContent;
}

export const SeoManager: React.FC<SeoManagerProps> = ({ 
  currentLang, 
  product,
  homeContent 
}) => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    const getLocalized = (obj: any, fallback: string = '') => {
      if (!obj) return fallback;
      if (typeof obj === 'string') return obj;
      return obj[currentLang] || obj.ru || obj.uz || fallback;
    };

    let title = '';
    let description = '';
    let keywords = '';
    let ogImage = '';
    let robots = 'index, follow';
    let canonical = window.location.href;

    // 1. Mahsulot sahifasi SEO
    if (product) {
      const prodName = getProductName(product, currentLang);
      title = getLocalized(product.seoTitle, `${prodName} ${product.model ? `(${product.model})` : ''} | MAXTRON`);
      description = getLocalized(product.seoDescription, getLocalized(product.description, ''));
      keywords = getLocalized(product.seoKeywords, `${product.model || ''}, ${prodName}, sanoat uskunalari`);
      ogImage = product.ogImage || product.image || '';
    } 
    // 2. BOSH SAHIFA SEO (Bazadagi `home` qatori ma'lumotlari)
    else if (pathname === '/' || pathname === `/${currentLang}`) {
      const homeData = homeContent || StorageService.getHomeContent();

      const defaultTitle = currentLang === 'ru'
        ? 'MAXTRON — Промышленное и Измерительное Оборудование в Ташкенте'
        : "MAXTRON — Sanoat va O'lchov Uskunalari O'zbekistonda";
      
      const defaultDesc = currentLang === 'ru'
        ? 'Прямые поставки контрольно-измерительных приборов со склада в Ташкенте с гарантией.'
        : "Toshkent omboridan sanoat o'lchov asboblarini to'g'ridan-to'g'ri yetkazib berish va kafolat.";

      title = getLocalized(homeData?.seoTitle, defaultTitle);
      description = getLocalized(homeData?.seoDescription, defaultDesc);
      keywords = getLocalized(homeData?.seoKeywords, 'maxtron, kipia, datchik, manometr, toshkent');
      
      const homeOg = homeData?.ogImage;
      ogImage = typeof homeOg === 'object' 
        ? (homeOg?.[currentLang] || homeOg?.ru || homeOg?.uz || '') 
        : (homeOg || '');

      robots = homeData?.robotsIndex || 'index, follow';
      if (homeData?.canonicalUrl) canonical = homeData.canonicalUrl;
    } 
    // 3. Boshqa sahifalar uchun standartlar
    else {
      title = 'MAXTRON — Sanoat va O‘lchov Uskunalari';
      description = 'Professional sanoat datchiklari va o‘lchov uskunalari';
      keywords = 'maxtron, sanoat uskunalari';
    }

    // --- DOM'ni to'g'ridan-to'g'ri yangilash ---
    if (title) document.title = title;

    const setMeta = (attr: string, val: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', robots);

    // OpenGraph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', product ? 'product' : 'website');
    setMeta('property', 'og:url', canonical);
    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
    }

    // Twitter Cards (Yangi qo'shildi)
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (ogImage) {
      setMeta('name', 'twitter:image', ogImage);
    }

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

  }, [location.pathname, currentLang, product, homeContent]);

  return null;
};