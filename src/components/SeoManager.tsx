"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Language, Product, HomeContent } from '../types';
import { StorageService } from '../services/storage';
import { getProductName } from '../utils/formatters';

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
  const pathname = usePathname() || '/';
  const [seoSettings, setSeoSettings] = useState(() => StorageService.getSeoSettings());
  const [, setContentVersion] = useState(0);

  useEffect(() => {
    const refreshSeo = (event: Event) => setSeoSettings((event as CustomEvent).detail || StorageService.getSeoSettings());
    const refreshContent = () => setContentVersion((version) => version + 1);
    
    window.addEventListener('maxtron_seo_updated', refreshSeo);
    window.addEventListener('maxtron_products_updated', refreshContent);
    window.addEventListener('maxtron_categories_updated', refreshContent);
    window.addEventListener('maxtron_pages_updated', refreshContent);
    
    return () => {
      window.removeEventListener('maxtron_seo_updated', refreshSeo);
      window.removeEventListener('maxtron_products_updated', refreshContent);
      window.removeEventListener('maxtron_categories_updated', refreshContent);
      window.removeEventListener('maxtron_pages_updated', refreshContent);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. JSON satr bo'lsa ham pars qilib joriy tilni oluvchi xavfsiz funksiya
    const getLocalized = (obj: any, fallback: string = ''): string => {
      if (!obj) return fallback;
      let target = obj;

      if (typeof target === 'string') {
        const trimmed = target.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            target = JSON.parse(trimmed);
          } catch {
            return trimmed;
          }
        } else {
          return trimmed;
        }
      }

      if (typeof target === 'object' && target !== null) {
        const val = target[currentLang] || target.ru || target.uz || fallback;
        if (typeof val === 'string') return val;
        return typeof val === 'object' ? (val[currentLang] || val.ru || val.uz || '') : String(val || '');
      }

      return String(target || fallback);
    };

    // 2. HTML va keraksiz belgilarni tozalash
    const stripHtml = (html: string): string => {
      if (!html) return '';
      return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // 3. Rasmlardan faqat to'g'ri URLlarni qabul qilish (Base64 chiqarib tashlanadi)
    const sanitizeUrl = (url: any): string => {
      if (!url || typeof url !== 'string' || url.startsWith('data:')) return '';
      if (url.startsWith('http')) return url;
      return `https://maxtron.uz${url.startsWith('/') ? '' : '/'}${url}`;
    };

    let title = '';
    let description = '';
    let keywords = '';
    let ogImage = '';
    let robots = 'index, follow';
    
    // Kanonik manzilni doim rasmiy domen asosida shakllantirish (Vercel domenini chetlab o'tish)
    let canonical = `https://maxtron.uz${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

    const normalizedPath = pathname.replace(/^\/(?:uz|ru|uz_cyrl|en)(?=\/|$)/, '') || '/';
    const pathParts = normalizedPath.split('/').filter(Boolean);
    const seoPageKey = pathParts[0] || 'home';
    const pageSeo = seoSettings?.pageSeo?.[seoPageKey];

    // 1. Mahsulot sahifasi SEO
    const productSlug = pathParts[0] === 'product' ? decodeURIComponent(pathParts[1] || '') : '';
    const resolvedProduct = product || StorageService.getProducts().find((item) => {
      if (!productSlug) return false;
      const slugs = typeof item.slug === 'object' ? Object.values(item.slug) : [item.slug];
      return String(item.id) === productSlug || slugs.some((slug) => slug === productSlug);
    });

    if (resolvedProduct) {
      const prodName = stripHtml(getProductName(resolvedProduct, currentLang));
      const rawTitle = getLocalized(resolvedProduct.seoTitle, `${prodName} ${resolvedProduct.model ? `(${resolvedProduct.model})` : ''} | MAXTRON`);
      title = stripHtml(rawTitle);

      const rawDesc = getLocalized(resolvedProduct.seoDescription, getLocalized(resolvedProduct.description, ''));
      description = stripHtml(rawDesc).slice(0, 160);

      keywords = stripHtml(getLocalized(resolvedProduct.seoKeywords, `${resolvedProduct.model || ''}, ${prodName}, sanoat uskunalari`));
      ogImage = sanitizeUrl(resolvedProduct.ogImage || resolvedProduct.image);
    } 
    // 2. Bosh sahifa SEO
    else if (normalizedPath === '/') {
      const homeData = homeContent || StorageService.getHomeContent();

      const defaultTitle = currentLang === 'ru'
        ? 'MAXTRON — Промышленное и Измерительное Оборудование в Ташкенте'
        : "MAXTRON — Sanoat va O'lchov Uskunalari O'zbekistonda";
      
      const defaultDesc = currentLang === 'ru'
        ? 'Прямые поставки контрольно-измерительных приборов со склада в Ташкенте с гарантией.'
        : "Toshkent omboridan sanoat o'lchov asboblarini to'g'ridan-to'g'ri yetkazib berish va kafolat.";

      title = stripHtml(getLocalized(homeData?.seoTitle, defaultTitle));
      description = stripHtml(getLocalized(homeData?.seoDescription, defaultDesc)).slice(0, 160);
      keywords = stripHtml(getLocalized(homeData?.seoKeywords, 'maxtron, kipia, datchik, manometr, toshkent'));
      
      const homeOg = homeData?.ogImage;
      const rawOg = typeof homeOg === 'object' 
        ? (homeOg?.[currentLang] || homeOg?.ru || homeOg?.uz || '') 
        : (homeOg || '');

      ogImage = sanitizeUrl(rawOg);

      robots = homeData?.robotsIndex || 'index, follow';
      if (homeData?.canonicalUrl) canonical = homeData.canonicalUrl;
    } 
    // 3. Qolgan ichki sahifalar
    else {
      title = stripHtml(getLocalized(pageSeo?.title, seoSettings?.defaultTitle || 'MAXTRON — Sanoat va O‘lchov Uskunalari'));
      description = stripHtml(getLocalized(pageSeo?.description, seoSettings?.defaultDescription || 'Professional sanoat datchiklari va o‘lchov uskunalari')).slice(0, 160);
      keywords = stripHtml(getLocalized(pageSeo?.keywords, seoSettings?.defaultKeywords || 'maxtron, sanoat uskunalari'));
      ogImage = sanitizeUrl(pageSeo?.ogImage || seoSettings?.ogImageUrl);
    }

    // --- DOM teglarni toza yangilash ---
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

    const googleVerification = (seoSettings?.googleVerification || '').replace(/^google-site-verification\s*=\s*/i, '').trim();
    const yandexVerification = (seoSettings?.yandexVerification || '').replace(/^yandex-verification\s*=\s*/i, '').trim();
    if (googleVerification) setMeta('name', 'google-site-verification', googleVerification);
    if (yandexVerification) setMeta('name', 'yandex-verification', yandexVerification);

    // Tashqi skriptlar (Analytics & Metrika)
    const addExternalScript = (id: string, src: string) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.src = src;
        document.head.appendChild(script);
      }
      return script;
    };

    const googleAnalyticsId = (seoSettings?.googleAnalyticsId || '').trim();
    if (/^G-[A-Z0-9]+$/i.test(googleAnalyticsId)) {
      const analyticsWindow = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
      analyticsWindow.dataLayer ||= [];
      analyticsWindow.gtag ||= (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
      addExternalScript('google-analytics', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`);
      analyticsWindow.gtag('js', new Date());
      analyticsWindow.gtag('config', googleAnalyticsId, { anonymize_ip: true });
    }

    const yandexMetrikaId = (seoSettings?.yandexMetrikaId || '').trim();
    if (/^\d+$/.test(yandexMetrikaId)) {
      const metrikaWindow = window as Window & { ym?: (...args: unknown[]) => void };
      const initMetrika = () => metrikaWindow.ym?.(Number(yandexMetrikaId), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
      const script = addExternalScript('yandex-metrika', 'https://mc.yandex.ru/metrika/tag.js');
      if (metrikaWindow.ym) initMetrika();
      else script.addEventListener('load', initMetrika, { once: true });
    }

    // OpenGraph & Twitter
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', resolvedProduct ? 'product' : 'website');
    setMeta('property', 'og:url', canonical);
    if (ogImage && !ogImage.startsWith('data:')) {
      setMeta('property', 'og:image', ogImage);
    }

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (ogImage && !ogImage.startsWith('data:')) {
      setMeta('name', 'twitter:image', ogImage);
    }

    // Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

  }, [pathname, currentLang, product, homeContent, seoSettings]);

  return null;
};