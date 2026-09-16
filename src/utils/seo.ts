import { Language, Product, SeoSettings } from '../types.ts';
import { StorageService } from '../services/storage.ts';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  product?: Product;
}

export function updateSEO(config: SeoConfig = {}, lang: Language = 'uz') {
  const seoSettings: Partial<SeoSettings> = StorageService.getSeoSettings() || {};
  const siteName = seoSettings.siteName || 'MAXTRON';

  // 1. Title: Faqat haqiqiy config yoki bazadagisi olinadi
  const finalTitle = config.title || seoSettings.defaultTitle || (lang === 'ru' ? 'MAXTRON — Промышленное и Измерительное Оборудование' : 'MAXTRON — Sanoat va O‘lchov Uskunalari');
  document.title = finalTitle;

  const setMeta = (attrName: 'name' | 'property', attrValue: string, content?: string) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 2. Description & Keywords
  const finalDesc = config.description || seoSettings.defaultDescription || '';
  setMeta('name', 'description', finalDesc);

  if (config.keywords && config.keywords.length > 0) {
    setMeta('name', 'keywords', config.keywords.join(', '));
  }

  // 3. Open Graph
  const currentUrl = config.canonicalUrl || window.location.href;
  const ogImg = config.ogImage || (config.product ? config.product.image : (seoSettings.ogImageUrl || ''));

  setMeta('property', 'og:site_name', siteName);
  setMeta('property', 'og:title', config.ogTitle || finalTitle);
  setMeta('property', 'og:description', config.ogDescription || finalDesc);
  setMeta('property', 'og:type', config.ogType || 'website');
  setMeta('property', 'og:url', currentUrl);
  if (ogImg) setMeta('property', 'og:image', ogImg);

  // 4. Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', config.ogTitle || finalTitle);
  setMeta('name', 'twitter:description', config.ogDescription || finalDesc);
  if (ogImg) setMeta('name', 'twitter:image', ogImg);

  // 5. Canonical
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', currentUrl);
}
