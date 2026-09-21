"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
    
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.search = '';
    canonicalUrl.hash = '';
    let canonical = canonicalUrl.toString();

    const normalizedPath = pathname.replace(/^\/(?:uz|ru|uz_cyrl|en)(?=\/|$)/, '') || '/';
    const pathParts = normalizedPath.split('/').filter(Boolean);
    const seoPageKey = pathParts[0] || 'home';
    const pageSeo = seoSettings?.pageSeo?.[seoPageKey];

    // 1. Mahsulot sahifasi SEO
    const productSlug = pathParts[0] === 'product' ? decodeURIComponent(pathParts[1] || '') : '';
    const resolvedProduct = product || StorageService.getProducts().find((item) => {
      if (!productSlug) return false;
      const slugs = typeof item.slug === 'object' ? Object.values(item.slug) : [item.slug];
      return item.id === productSlug || slugs.some((slug) => slug === productSlug);
    });

    if (resolvedProduct) {
      const prodName = getProductName(resolvedProduct, currentLang);
      title = getLocalized(resolvedProduct.seoTitle, `${prodName} ${resolvedProduct.model ? `(${resolvedProduct.model})` : ''} | MAXTRON`);
      description = getLocalized(resolvedProduct.seoDescription, getLocalized(resolvedProduct.description, ''));
      keywords = getLocalized(resolvedProduct.seoKeywords, `${resolvedProduct.model || ''}, ${prodName}, sanoat uskunalari`);
      ogImage = resolvedProduct.ogImage || resolvedProduct.image || '';
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
    // 3. Qolgan ichki sahifalar
    else {
      title = getLocalized(pageSeo?.title, seoSettings?.defaultTitle || 'MAXTRON — Sanoat va O‘lchov Uskunalari');
      description = getLocalized(pageSeo?.description, seoSettings?.defaultDescription || 'Professional sanoat datchiklari va o‘lchov uskunalari');
      keywords = getLocalized(pageSeo?.keywords, seoSettings?.defaultKeywords || 'maxtron, sanoat uskunalari');
      ogImage = pageSeo?.ogImage || seoSettings?.ogImageUrl || '';
    }

    // --- DOM teglarni yangilash ---
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
    if (ogImage) setMeta('property', 'og:image', ogImage);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);

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