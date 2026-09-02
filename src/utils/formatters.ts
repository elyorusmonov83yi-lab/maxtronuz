import { Language } from '../types';

/**
 * Format numeric price into national currency (UZS sum) with language-appropriate formatting
 */
export function formatPrice(price: number | undefined, lang: Language): string {
  if (price === undefined || price === null || price <= 0) {
    switch (lang) {
      case 'uz': return 'Tijorat taklifi asosida';
      case 'ru': return 'По запросу (КП)';
      default: return 'Tijorat taklifi asosida';
    }
  }

  const formatted = price.toLocaleString('ru-RU');
  
  switch (lang) {
    case 'uz':
      return `${formatted} so'm`;
    case 'ru':
      return `${formatted} сум`;
    default:
      return `${formatted} so'm`;
  }
}

/**
 * Safely resolve localized text from string, number, or object.
 * GUARANTEES returning a string so React never crashes with "Objects are not valid as a React child"
 * and NEVER returns "[object Object]".
 */
export function getLocalizedText(
  obj: any,
  lang: Language = 'uz',
  fallback: string = ''
): string {
  if (obj === null || obj === undefined) return typeof fallback === 'string' ? fallback : '';
  
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed === '[object Object]') return fallback;
    
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          return getLocalizedText(parsed, lang, fallback);
        }
      } catch {
        // Not JSON
      }
    }
    return trimmed;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (typeof obj === 'object') {
    const candidate = obj[lang] ?? obj.uz ?? obj.ru;
    if (candidate !== undefined && candidate !== null) {
      if (typeof candidate === 'string') {
        const tr = candidate.trim();
        return tr === '[object Object]' ? fallback : tr;
      }
      if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
      if (typeof candidate === 'object') {
        return getLocalizedText(candidate, lang, fallback);
      }
    }

    const values = Object.values(obj);
    for (const val of values) {
      if (typeof val === 'string' && val.trim() !== '[object Object]') {
        return val.trim();
      }
    }
  }

  return typeof fallback === 'string' ? fallback : '';
}

/**
 * Safely get product name regardless of whether product.name is string or object
 */
export function getProductName(product: any, lang: Language = 'uz', fallback: string = 'Mahsulot'): string {
  if (!product) return fallback;
  if (typeof product.name === 'string') {
    const text = getLocalizedText(product.name, lang, '');
    if (text) return text;
  }
  return getLocalizedText(product.name, lang, product.model || fallback);
}

/**
 * Safely extract URL-safe string slug for products (PREVENTS [object Object] in URL)
 */
export function getSafeProductSlug(product: any, lang: Language = 'uz'): string {
  if (!product) return '';
  
  if (typeof product === 'string' || typeof product === 'number') {
    const str = String(product).trim();
    return str === '[object Object]' ? '' : str;
  }

  // 1. Agar slug mavjud bo'lsa
  if (product.slug) {
    const extractedSlug = getLocalizedText(product.slug, lang, '');
    if (extractedSlug && extractedSlug !== '[object Object]') {
      return encodeURIComponent(extractedSlug.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  }

  // 2. Agar id mavjud bo'lsa
  if (product.id !== undefined && product.id !== null) {
    const extractedId = getLocalizedText(product.id, lang, '');
    if (extractedId && extractedId !== '[object Object]') {
      return extractedId.trim();
    }
    if (typeof product.id === 'string' || typeof product.id === 'number') {
      const idStr = String(product.id).trim();
      if (idStr !== '[object Object]') return idStr;
    }
  }

  // 3. Fallback: Model
  if (product.model && typeof product.model === 'string') {
    const m = product.model.trim();
    if (m && m !== '[object Object]') {
      return encodeURIComponent(m.toLowerCase().replace(/\s+/g, '-'));
    }
  }

  // 4. Fallback: Nomi
  const fallbackName = getLocalizedText(product.name, lang, '');
  if (fallbackName && fallbackName !== '[object Object]') {
    return encodeURIComponent(fallbackName.toLowerCase().replace(/\s+/g, '-').slice(0, 50));
  }

  return '';
}

/**
 * Safely extract URL-safe string slug for categories (PREVENTS [object Object] in URL)
 */
export function getSafeCategorySlug(category: any, lang: Language = 'uz'): string {
  if (!category) return '';
  
  if (typeof category === 'string' || typeof category === 'number') {
    const str = String(category).trim();
    return str === '[object Object]' ? '' : str;
  }

  if (category.slug) {
    const extractedSlug = getLocalizedText(category.slug, lang, '');
    if (extractedSlug && extractedSlug !== '[object Object]') {
      return encodeURIComponent(extractedSlug.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  }

  if (category.id !== undefined && category.id !== null) {
    const extractedId = getLocalizedText(category.id, lang, '');
    if (extractedId && extractedId !== '[object Object]') {
      return extractedId.trim();
    }
    if (typeof category.id === 'string' || typeof category.id === 'number') {
      const idStr = String(category.id).trim();
      if (idStr !== '[object Object]') return idStr;
    }
  }

  return '';
}

/**
 * Safely get spec name/label regardless of spec structure
 */
export function getSpecName(spec: any, lang: Language = 'uz', fallback: string = ''): string {
  if (!spec) return fallback;
  const raw = spec.name ?? spec.label;
  return getLocalizedText(raw, lang, fallback);
}

/**
 * Safely resolve localized array of strings (e.g. features, applications)
 */
export function getLocalizedArray(
  obj: any,
  lang: Language = 'uz',
  fallback: string[] = []
): string[] {
  if (!obj) return fallback;
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      return fallback;
    }
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item) => (typeof item === 'object' ? getLocalizedText(item, lang) : String(item)))
      .filter((s) => s && s !== '[object Object]');
  }
  if (typeof obj === 'object') {
    const list = obj[lang] ?? obj.uz ?? obj.ru;
    if (Array.isArray(list)) {
      return list
        .map((item) => (typeof item === 'object' ? getLocalizedText(item, lang) : String(item)))
        .filter((s) => s && s !== '[object Object]');
    }
  }
  return fallback;
}