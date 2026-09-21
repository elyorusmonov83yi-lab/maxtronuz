import { 
  Product, 
  QuoteRequestData, 
  CategoryInfo, 
  Certificate, 
  AboutContent, 
  HomeContent, 
  SeoSettings, 
  CustomPage,
  HeaderSettings,
  ContactSettings,
  PageSeoSettings,
  IndustryInfo,
  BrandInfo
} from '../types';
import { TelegramService } from './telegramService';
import { getLocalizedText } from '../utils/formatters';

function safeJsonParse(val: any, fallback: any): any {
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val ?? fallback;
  }
}

export interface AdminQuoteRequest extends QuoteRequestData {
  id: string;
  createdAt: string;
  status: 'new' | 'in_review' | 'contacted' | 'completed' | 'cancelled';
  productName?: string;
  totalEstimate?: number;
}

// 1. Standart Header sozlamalari
export const defaultHeaderSettings: HeaderSettings = {
  logoText: 'MAXTRON',
  logoAccentText: '.UZ',
  logoSubtitle: {
    uz: "Sanoat & O'lchov Ta'minoti",
    ru: 'Промышленно-измерительное оборудование'
  },
  logoImageUrl: '',
  topbarWarehouse: {
    uz: 'Toshkent ombori: 200+ model mavjud',
    ru: 'Склад в Ташкенте: 200+ моделей в наличии'
  },
  topbarDelivery: {
    uz: "O'zbekiston bo'ylab tezkor yetkazish",
    ru: 'Экспресс-доставка по всему Узбекистану'
  },
  topbarSchedule: {
    uz: 'Dush-Shan: 09:00 - 18:00',
    ru: 'Пн-Сб: 09:00 - 18:00'
  },
  phone: '+998 71 200-88-44',
  phoneSecondary: '+998 90 999-88-44',
  email: 'info@maxtron.uz',
  telegramUser: '@maxtron_uz',
  telegramUrl: 'https://t.me/maxtron_uz',
  instagramUrl: 'https://instagram.com/maxtron.uz',
  youtubeUrl: 'https://youtube.com/@maxtron'
};

// 2. Standart Contact sozlamalari
export const defaultContactSettings: ContactSettings = {
  heroTitle: {
    uz: "Biz bilan bog'lanish va Servis markazlari",
    ru: 'Свяжитесь с нами и сервисные центры'
  },
  heroSubtitle: {
    uz: "Mutaxassislarimiz uskunalarni tanlash, metrologik qiyoslash va texnik topshiriqlarni tuzishda yordam beradi.",
    ru: 'Наши сертифицированные инженеры помогут подобрать оборудование, пройти поверку и составить ТЗ.'
  },
  address: {
    uz: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 107B",
    ru: 'г. Ташкент, Юнусабадский р-н, проспект Амира Темура, 107Б'
  },
  warehouseAddress: {
    uz: "Toshkent sh., Sergeli tumani, Yangi Sergeli ko'chasi, Sanoat parki №4",
    ru: 'г. Ташкент, Сергелийский р-н, ул. Янги Сергели, Промзона №4'
  },
  workingHours: {
    uz: "Dushanba — Shanba: 09:00 dan 18:00 gacha (Yakshanba dam olish kuni)",
    ru: 'Понедельник — Суббота: с 09:00 до 18:00 (Воскресенье выходной)'
  },
  phone: '+998 71 200-88-44',
  phoneSecondary: '+998 90 999-88-44',
  email: 'sales@maxtron.uz',
  telegram: '@maxtron_uz',
  telegramUrl: 'https://t.me/maxtron_uz',
  instagram: 'maxtron.uz',
  instagramUrl: 'https://instagram.com/maxtron.uz',
  youtubeUrl: 'https://youtube.com/@maxtron',
  mapIframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.3475871239854!2d69.2818991765416!3d41.323048999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b49e89f81a7%3A0xbcf013f9f4a13e2f!2sAmir%20Temur%20Avenue%2C%20Tashkent!5e0!3m2!1sen!2suz!4v1700000000000!5m2!1sen!2suz'
};

export const initialClients: any[] = [
  { id: '1', name: "O'zbekiston Temir Yo'llari", shortName: 'UTY', category: 'Sanoat va Transport' },
  { id: '2', name: 'Navoiy Kon-Metallurgiya Kombinati', shortName: 'NKMK', category: "Tog'-kon sanoati" },
  { id: '3', name: "O'zbekneftgaz AJ", shortName: 'UNG', category: 'Neft va Gaz' },
  { id: '4', name: 'Olimpik Energiya MCHJ', shortName: 'Olimpik', category: 'Energetika' },
  { id: '5', name: 'Toshkent Issiqlik Elektr Markazi', shortName: 'ToshIEM', category: 'Energetika injiniringi' },
  { id: '6', name: "O'zsuvta'minot AJ", shortName: "SuvTa'minot", category: 'Kommunal soha' },
  { id: '7', name: "O'zbekiston Milliy Elektr Tarmoqlari", shortName: 'NESUz', category: 'Elektr tarmoqlari' },
  { id: '8', name: 'Maxam-Chirchiq AJ', shortName: 'Maxam', category: 'Kimyo sanoati' }
];

export const defaultPageSeoSettings: PageSeoSettings = {
  home: {
    title: { uz: "MAXTRON — Sanoat va O'lchov Uskunalari O'zbekistonda", ru: 'MAXTRON — Промышленные измерительные приборы и датчики в Ташкенте' },
    description: { uz: 'Sanoat korxonalari uchun professional o\'lchov uskunalari.', ru: 'Профессиональное оборудование для предприятий.' },
    keywords: { uz: 'maxtron, o\'lchov', ru: 'maxtron' }
  },
  catalog: {
    title: { uz: 'Katalog — MAXTRON', ru: 'Каталог — MAXTRON' },
    description: { uz: 'Uskunalar katalogi.', ru: 'Каталог оборудования.' },
    keywords: { uz: 'katalog', ru: 'katalog' }
  },
  certificates: {
    title: { uz: 'Sertifikatlar — MAXTRON', ru: 'Сертификаты — MAXTRON' },
    description: { uz: 'Sertifikatlar.', ru: 'Сертификаты.' },
    keywords: { uz: 'sertifikat', ru: 'sertifikat' }
  },
  about: {
    title: { uz: 'Biz haqimizda — MAXTRON', ru: 'О компании — MAXTRON' },
    description: { uz: 'Biz haqimizda.', ru: 'О компании.' },
    keywords: { uz: 'about', ru: 'about' }
  },
  contact: {
    title: { uz: 'Aloqa — MAXTRON', ru: 'Контакты — MAXTRON' },
    description: { uz: 'Aloqa.', ru: 'Контакты.' },
    keywords: { uz: 'contact', ru: 'contact' }
  }
};

export const defaultSeoSettings: SeoSettings = {
  googleVerification: '',
  yandexVerification: '',
  bingVerification: '',
  googleAnalyticsId: '',
  yandexMetrikaId: '',
  siteName: 'MAXTRON',
  defaultTitle: 'MAXTRON — Sanoat va O‘lchov Uskunalari',
  defaultDescription: 'Professional o‘lchov uskunalari.',
  defaultKeywords: 'maxtron, kipia, datchik, manometr, toshkent',
  ogImageUrl: '',
  robotsTxt: 'User-agent: *\nAllow: /',
  pageSeo: defaultPageSeoSettings
};

export const defaultAboutContent: AboutContent = {
  heroTitle: { uz: 'Sanoat sohasida yetakchi hamkor', ru: 'Ведущий партнер в промышленности' },
  heroSubtitle: { uz: 'MAXTRON — sertifikatlangan uskunalar.', ru: 'MAXTRON — сертифицированное оборудование.' },
  storyText: { uz: '2018-yilda asos solingan.', ru: 'Основана в 2018 году.' },
  yearsExp: '8+ yil',
  equipmentDelivered: '1,500+',
  warehouseItems: '200+',
  partnerClients: '500+',
  directorName: 'Elyor Usmonov',
  directorTitle: { uz: 'Bosh direktor', ru: 'Генеральный директор' },
  mainOfficeAddress: { uz: 'Toshkent sh.', ru: 'г. Ташкент' }
};

export const defaultHomeContent: HomeContent = {
  heroBadge: { uz: 'Zavod taʼminoti', ru: 'Заводские поставки' },
  heroTitle: { uz: "Sanoat va O'lchov Uskunalari", ru: 'Промышленное оборудование' },
  heroSubtitle: { uz: 'Toshkent omborimizda 200+ model mavjud.', ru: 'Более 200 моделей в наличии.' },
  ctaPhone: '+998 71 200-88-44',
  telegramUser: '@maxtron_uz',
  bannerNotice: { uz: 'Tezkor yetkazish', ru: 'Быстрая доставка' },
  seoTitle: {
    uz: "MAXTRON — Sanoat va O'lchov Uskunalari O'zbekistonda",
    ru: "MAXTRON — Промышленное и Измерительное Оборудование в Ташкенте"
  },
  seoDescription: {
    uz: "Toshkent omboridan sanoat o'lchov asboblarini to'g'ridan-to'g'ri yetkazib berish va rasmiy kafolat.",
    ru: "Прямые поставки контрольно-измерительных приборов со склада в Ташкенте с гарантией."
  },
  seoKeywords: {
    uz: "maxtron, sanoat uskunalari, datchiklar, toshkent",
    ru: "кипиа ташкент, купить датчики давления, расходомеры"
  },
  ogTitle: {
    uz: "MAXTRON — Sanoat va O'lchov Uskunalari Katalogi",
    ru: "MAXTRON — Каталог Промышленных Приборов и КИПиА"
  },
  ogDescription: {
    uz: "200+ turdagi datchiklar, manometrlar va o'lchov asboblari Toshkent omborida.",
    ru: "Более 200 видов измерительных приборов на складе в Ташкенте с гарантией."
  },
  ogImage: '',
  canonicalUrl: 'https://maxtron.uz',
  robotsIndex: 'index, follow'
};

export const defaultPages: CustomPage[] = [
  {
    id: 'page-delivery',
    slug: 'yetkazib-berish-va-tolov',
    title: {
      uz: 'Yetkazib berish va to‘lov shartlari',
      ru: 'Условия доставки и оплаты'
    },
    subtitle: {
      uz: 'O‘zbekiston bo‘ylab ekspress yetkazib berish va qulay to‘lov tizimlari',
      ru: 'Экспресс-доставка по всему Узбекистану и удобные формы оплаты'
    },
    content: {
      uz: 'MAXTRON kompaniyasi O‘zbekiston va Markaziy Osiyo bo‘ylab barcha turdagi sanoat va o‘lchov uskunalarini xavfsiz va tezkor yetkazib berishni ta’minlaydi.',
      ru: 'Компания MAXTRON обеспечивает надежную и быструю доставку всех типов промышленного и измерительного оборудования.'
    },
    isPublished: true,
    showInHeader: true,
    showInFooter: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Xotira do'koni (In-memory stores)
let memoryProducts: Product[] = [];
let memoryCategories: CategoryInfo[] = [];
let memoryCertificates: Certificate[] = [];
let memoryIndustries: IndustryInfo[] = [];
let memoryAbout: AboutContent = defaultAboutContent;
let memoryHome: HomeContent = defaultHomeContent;
let memorySeo: SeoSettings = defaultSeoSettings;
let memoryQuotes: AdminQuoteRequest[] = [];
let memoryPages: CustomPage[] = [...defaultPages];
let memoryHeader: HeaderSettings = defaultHeaderSettings;
let memoryContact: ContactSettings = defaultContactSettings;
let memoryClients: any[] = initialClients;
let memoryAdminUsers: any[] = [
  { id: 'usr-1', name: 'Admin', username: 'admin', password: '123', role: 'super_admin', createdAt: Date.now() }
];
let memoryAdminAuth = false;
let memoryAdminUser: any = null;

export const StorageService = {
  getIndustries(): IndustryInfo[] {
    try {
      const data = localStorage.getItem('maxtron_industries_data');
      return data ? JSON.parse(data) : memoryIndustries;
    } catch {
      return memoryIndustries;
    }
  },

  saveIndustries(industries: IndustryInfo[]): boolean {
    memoryIndustries = industries;
    try {
      localStorage.setItem('maxtron_industries_data', JSON.stringify(industries));
    } catch (e) {
      console.error('Storage saveIndustries error:', e);
    }
    window.dispatchEvent(new CustomEvent('maxtron_industries_updated', { detail: industries }));
    return true;
  },

  getHeaderSettings(): HeaderSettings {
    return memoryHeader;
  },

  saveHeaderSettings(settings: HeaderSettings): boolean {
    memoryHeader = settings;
    window.dispatchEvent(new CustomEvent('maxtron_header_updated', { detail: settings }));
    fetch('/api/admin/settings/header', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error('Failed to save header to DB:', err));
    return true;
  },

  getContactSettings(): ContactSettings {
    return memoryContact;
  },

  saveContactSettings(settings: ContactSettings): boolean {
    memoryContact = settings;
    window.dispatchEvent(new CustomEvent('maxtron_contact_updated', { detail: settings }));
    fetch('/api/admin/settings/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error('Failed to save contact to DB:', err));
    return true;
  },

  async syncWithDatabase(): Promise<void> {
    try {
      const [
        prodRes, 
        catRes, 
        certRes, 
        industriesRes, 
        quoteRes, 
        headerRes, 
        homeRes, 
        aboutRes, 
        contactRes, 
        seoRes,
        clientsRes
      ] = await Promise.all([
        fetch('/api/admin/products').then(r => r.json()).catch(() => null),
        fetch('/api/admin/categories').then(r => r.json()).catch(() => null),
        fetch('/api/admin/certificates').then(r => r.json()).catch(() => null),
        fetch('/api/admin/industries').then(r => r.json()).catch(() => null),
        fetch('/api/admin/quotes').then(r => r.json()).catch(() => null),
        fetch('/api/admin/settings/header').then(r => r.json()).catch(() => null),
        fetch('/api/admin/settings/home').then(r => r.json()).catch(() => null),
        fetch('/api/admin/settings/about').then(r => r.json()).catch(() => null),
        fetch('/api/admin/settings/contact').then(r => r.json()).catch(() => null),
        fetch('/api/admin/settings/seo').then(r => r.json()).catch(() => null),
        fetch('/api/admin/clients').then(r => r.json()).catch(() => null),
      ]);

      if (prodRes?.success && Array.isArray(prodRes.data)) {
        memoryProducts = prodRes.data.map((p: any) => {
          const inds = safeJsonParse(p.industryIds || p.industries, []);
          const tasks = safeJsonParse(p.industryTaskIds || p.tasks, []);
          return {
            ...p,
            specs: safeJsonParse(p.specs, []),
            features: safeJsonParse(p.features, { uz: [], ru: [] }),
            applications: safeJsonParse(p.applications, { uz: [], ru: [] }),
            slug: safeJsonParse(p.slug, undefined),
            name: safeJsonParse(p.name, {}),
            tagline: safeJsonParse(p.tagline, {}),
            description: safeJsonParse(p.description, {}),
            priceFormatted: safeJsonParse(p.priceFormatted, {}),
            industryIds: Array.isArray(inds) ? inds : [],
            industryTaskIds: Array.isArray(tasks) ? tasks : [],
            industries: Array.isArray(inds) ? inds : [],
            tasks: Array.isArray(tasks) ? tasks : []
          };
        });
        window.dispatchEvent(new CustomEvent('maxtron_products_updated', { detail: memoryProducts }));
      }

      if (catRes?.success && Array.isArray(catRes.data)) {
        memoryCategories = catRes.data.map((c: any) => ({
          ...c,
          name: safeJsonParse(c.name, {}),
          description: safeJsonParse(c.description, {}),
          slug: safeJsonParse(c.slug, undefined),
          seoTitle: safeJsonParse(c.seoTitle, undefined),
          seoDescription: safeJsonParse(c.seoDescription, undefined),
          seoKeywords: safeJsonParse(c.seoKeywords, undefined)
        }));
        window.dispatchEvent(new CustomEvent('maxtron_categories_updated', { detail: memoryCategories }));
      }

      if (certRes?.success && Array.isArray(certRes.data)) {
        memoryCertificates = certRes.data.map((cert: any) => ({
          ...cert,
          title: safeJsonParse(cert.title, {}),
          issuer: safeJsonParse(cert.issuer, {}),
          description: safeJsonParse(cert.description, {}),
          seoTitle: safeJsonParse(cert.seoTitle, undefined),
          seoDescription: safeJsonParse(cert.seoDescription, undefined),
          seoKeywords: safeJsonParse(cert.seoKeywords, undefined)
        }));
        window.dispatchEvent(new CustomEvent('maxtron_certificates_updated', { detail: memoryCertificates }));
      }

      if (industriesRes?.success && Array.isArray(industriesRes.data)) {
        memoryIndustries = industriesRes.data.map((ind: any) => ({
          ...ind,
          name: safeJsonParse(ind.name, { uz: '', ru: '' }),
          desc: safeJsonParse(ind.desc || ind.description, { uz: '', ru: '' }),
          tasks: safeJsonParse(ind.tasks, [])
        }));
        try {
          localStorage.setItem('maxtron_industries_data', JSON.stringify(memoryIndustries));
        } catch {}
        window.dispatchEvent(new CustomEvent('maxtron_industries_updated', { detail: memoryIndustries }));
      }

      if (headerRes?.success && headerRes.data) {
        memoryHeader = safeJsonParse(headerRes.data, memoryHeader);
        window.dispatchEvent(new CustomEvent('maxtron_header_updated', { detail: memoryHeader }));
      }

      if (homeRes?.success && homeRes.data) {
        memoryHome = safeJsonParse(homeRes.data, memoryHome);
        window.dispatchEvent(new CustomEvent('maxtron_home_updated', { detail: memoryHome }));
      }

      if (aboutRes?.success && aboutRes.data) {
        memoryAbout = safeJsonParse(aboutRes.data, memoryAbout);
        window.dispatchEvent(new CustomEvent('maxtron_about_updated', { detail: memoryAbout }));
      }

      if (contactRes?.success && contactRes.data) {
        memoryContact = safeJsonParse(contactRes.data, memoryContact);
        window.dispatchEvent(new CustomEvent('maxtron_contact_updated', { detail: memoryContact }));
      }

      if (seoRes?.success && seoRes.data) {
        memorySeo = safeJsonParse(seoRes.data, memorySeo);
        window.dispatchEvent(new CustomEvent('maxtron_seo_updated', { detail: memorySeo }));
      }

      if (clientsRes?.success && Array.isArray(clientsRes.data)) {
        memoryClients = clientsRes.data;
        window.dispatchEvent(new CustomEvent('maxtron_clients_updated', { detail: memoryClients }));
      }

      if (quoteRes?.success && Array.isArray(quoteRes.data)) {
        memoryQuotes = quoteRes.data;
        window.dispatchEvent(new CustomEvent('maxtron_quotes_updated', { detail: memoryQuotes }));
      }

    } catch (e) {
      console.error('Database sync error:', e);
    }
  },

  getProducts(): Product[] {
    return memoryProducts;
  },

  getProductById(id: string): Product | undefined {
    return memoryProducts.find((p) => p.id === id);
  },

  saveProducts(products: Product[]): boolean {
    memoryProducts = products;
    window.dispatchEvent(new CustomEvent('maxtron_products_updated', { detail: products }));
    return true;
  },

  addProduct(product: Product): boolean {
    const rawInds = product.industries || (product as any).industryIds || [];
    const rawTasks = product.tasks || (product as any).industryTaskIds || [];

    const formattedProduct: Product = {
      ...product,
      industries: Array.isArray(rawInds) ? rawInds : [],
      tasks: Array.isArray(rawTasks) ? rawTasks : [],
      ...( { industryIds: rawInds, industryTaskIds: rawTasks } as any )
    };

    memoryProducts = [formattedProduct, ...memoryProducts];
    window.dispatchEvent(new CustomEvent('maxtron_products_updated', { detail: memoryProducts }));

    fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedProduct)
    }).catch(err => console.error('Failed to save product to DB:', err));

    return true;
  },

  updateProduct(product: Product): boolean {
    const index = memoryProducts.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      const rawInds = product.industries || (product as any).industryIds || [];
      const rawTasks = product.tasks || (product as any).industryTaskIds || [];

      const formattedProduct: Product = {
        ...product,
        industries: Array.isArray(rawInds) ? rawInds : [],
        tasks: Array.isArray(rawTasks) ? rawTasks : [],
        ...( { industryIds: rawInds, industryTaskIds: rawTasks } as any )
      };

      memoryProducts[index] = formattedProduct;
      window.dispatchEvent(new CustomEvent('maxtron_products_updated', { detail: memoryProducts }));

      fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedProduct)
      }).catch(err => console.error('Failed to update product in DB:', err));

      return true;
    }
    return false;
  },

  deleteProduct(productId: string): boolean {
    memoryProducts = memoryProducts.filter((p) => p.id !== productId);
    window.dispatchEvent(new CustomEvent('maxtron_products_updated', { detail: memoryProducts }));
    fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    }).catch(err => console.error('Failed to delete product from DB:', err));
    return true;
  },

  getCategories(): CategoryInfo[] {
    return memoryCategories;
  },

  saveCategories(categories: CategoryInfo[]): boolean {
    memoryCategories = categories;
    window.dispatchEvent(new CustomEvent('maxtron_categories_updated', { detail: categories }));
    return true;
  },

  addCategory(category: CategoryInfo): boolean {
    memoryCategories = [...memoryCategories, category];
    window.dispatchEvent(new CustomEvent('maxtron_categories_updated', { detail: memoryCategories }));
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    }).catch(err => console.error('Failed to save category to DB:', err));
    return true;
  },

  updateCategory(category: CategoryInfo): boolean {
    const index = memoryCategories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      memoryCategories[index] = category;
      window.dispatchEvent(new CustomEvent('maxtron_categories_updated', { detail: memoryCategories }));
      fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      }).catch(err => console.error('Failed to update category in DB:', err));
      return true;
    }
    return false;
  },

  deleteCategory(categoryId: string): boolean {
    memoryCategories = memoryCategories.filter((c) => c.id !== categoryId);
    window.dispatchEvent(new CustomEvent('maxtron_categories_updated', { detail: memoryCategories }));
    fetch(`/api/admin/categories/${categoryId}`, {
      method: 'DELETE'
    }).catch(err => console.error('Failed to delete category from DB:', err));
    return true;
  },

  getCertificates(): Certificate[] {
    return memoryCertificates;
  },

  saveCertificates(certs: Certificate[]): boolean {
    memoryCertificates = certs;
    window.dispatchEvent(new CustomEvent('maxtron_certificates_updated', { detail: certs }));
    return true;
  },

  getAboutContent(): AboutContent {
    return memoryAbout;
  },

  saveAboutContent(content: AboutContent): boolean {
    memoryAbout = content;
    window.dispatchEvent(new CustomEvent('maxtron_about_updated', { detail: content }));
    fetch('/api/admin/settings/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    }).catch(err => console.error('Failed to save about to DB:', err));
    return true;
  },

  getHomeContent(): HomeContent {
    return memoryHome;
  },

  saveHomeContent(content: HomeContent): boolean {
    memoryHome = content;
    window.dispatchEvent(new CustomEvent('maxtron_home_updated', { detail: content }));
    fetch('/api/admin/settings/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    }).catch(err => console.error('Failed to save home to DB:', err));
    return true;
  },

  getPages(): CustomPage[] {
    return memoryPages;
  },

  getPageBySlug(slug: string): CustomPage | undefined {
    if (!slug) return undefined;
    const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return memoryPages.find((p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug);
  },

  getPageById(id: string): CustomPage | undefined {
    return memoryPages.find((p) => p.id === id);
  },

  savePages(pages: CustomPage[]): boolean {
    memoryPages = pages;
    window.dispatchEvent(new CustomEvent('maxtron_pages_updated', { detail: pages }));
    return true;
  },

  addPage(page: CustomPage): boolean {
    const cleanSlug = (page.slug || `page-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    const newPage: CustomPage = {
      ...page,
      id: page.id || `page-${Date.now()}`,
      slug: cleanSlug,
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryPages = [newPage, ...memoryPages];
    window.dispatchEvent(new CustomEvent('maxtron_pages_updated', { detail: memoryPages }));
    fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPage)
    }).catch(err => console.error('Failed to save page to DB:', err));
    return true;
  },

  updatePage(page: CustomPage): boolean {
    const index = memoryPages.findIndex((p) => p.id === page.id);
    if (index !== -1) {
      const cleanSlug = (page.slug || memoryPages[index].slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-');

      const updated = {
        ...page,
        slug: cleanSlug,
        updatedAt: new Date().toISOString()
      };
      memoryPages[index] = updated;
      window.dispatchEvent(new CustomEvent('maxtron_pages_updated', { detail: memoryPages }));
      fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => console.error('Failed to update page in DB:', err));
      return true;
    }
    return false;
  },

  deletePage(pageId: string): boolean {
    memoryPages = memoryPages.filter((p) => p.id !== pageId);
    window.dispatchEvent(new CustomEvent('maxtron_pages_updated', { detail: memoryPages }));
    fetch(`/api/pages/${pageId}`, { method: 'DELETE' }).catch(err => console.error('Failed to delete page in DB:', err));
    return true;
  },

  getAdminUsers(): any[] {
    return memoryAdminUsers;
  },

  saveAdminUsers(users: any[]): boolean {
    memoryAdminUsers = users;
    window.dispatchEvent(new CustomEvent('maxtron_admin_users_updated', { detail: users }));
    return true;
  },

  getClients(): any[] {
    return memoryClients;
  },

  saveClients(clients: any[]): boolean {
    memoryClients = clients;
    window.dispatchEvent(new CustomEvent('maxtron_clients_updated', { detail: clients }));
    return true;
  },

  getSeoSettings(): SeoSettings {
    return memorySeo;
  },

  saveSeoSettings(settings: SeoSettings): boolean {
    memorySeo = settings;
    window.dispatchEvent(new CustomEvent('maxtron_seo_updated', { detail: settings }));
    fetch('/api/admin/settings/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error('Failed to save SEO to DB:', err));
    return true;
  },

  getPageSeoSettings(): PageSeoSettings {
    return memorySeo.pageSeo || defaultPageSeoSettings;
  },

  savePageSeoSettings(pageSeo: PageSeoSettings): boolean {
    const current = this.getSeoSettings();
    return this.saveSeoSettings({
      ...current,
      pageSeo
    });
  },

  getQuotes(): AdminQuoteRequest[] {
    return memoryQuotes;
  },

  addQuote(quoteData: QuoteRequestData): AdminQuoteRequest {
    const product = quoteData.selectedProductId ? this.getProductById(quoteData.selectedProductId) : undefined;
    const prodName = product 
      ? `${getLocalizedText(product.name, 'uz', product.model)} (${product.model})`
      : 'Umumiy tijorat taklifi';

    const newQuote: AdminQuoteRequest = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      productName: prodName,
      totalEstimate: product && product.price ? product.price * (quoteData.quantity || 1) : undefined
    };

    memoryQuotes = [newQuote, ...memoryQuotes];
    window.dispatchEvent(new CustomEvent('maxtron_quotes_updated', { detail: memoryQuotes }));

    fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuote)
    }).catch(err => console.error('Failed to save quote to DB:', err));

    try {
      TelegramService.sendQuoteNotification(newQuote).catch(() => {});
    } catch {
      // ignore
    }

    return newQuote;
  },

  updateQuoteStatus(quoteId: string, status: AdminQuoteRequest['status']): boolean {
    const index = memoryQuotes.findIndex((q) => q.id === quoteId);
    if (index !== -1) {
      memoryQuotes[index].status = status;
      window.dispatchEvent(new CustomEvent('maxtron_quotes_updated', { detail: memoryQuotes }));

      fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryQuotes[index])
      }).catch(err => console.error('Failed to update quote status in DB:', err));

      return true;
    }
    return false;
  },

  deleteQuote(quoteId: string): boolean {
    memoryQuotes = memoryQuotes.filter((q) => q.id !== quoteId);
    window.dispatchEvent(new CustomEvent('maxtron_quotes_updated', { detail: memoryQuotes }));

    fetch(`/api/admin/quotes/${quoteId}`, {
      method: 'DELETE'
    }).catch(err => console.error('Failed to delete quote from DB:', err));

    return true;
  },

  isAdminAuthenticated(): boolean {
    try {
      return localStorage.getItem('maxtron_admin_auth') === 'true';
    } catch {
      return memoryAdminAuth;
    }
  },

  getAdminUser(): { email: string; name: string } | null {
    try {
      const user = localStorage.getItem('maxtron_admin_user');
      return user ? JSON.parse(user) : memoryAdminUser;
    } catch {
      return memoryAdminUser;
    }
  },

  setAdminAuthenticated(auth: boolean, user?: { email: string; name: string }, _rememberMe: boolean = false): void {
    memoryAdminAuth = auth;
    memoryAdminUser = user || null;
    try {
      if (auth) {
        localStorage.setItem('maxtron_admin_auth', 'true');
        if (user) {
          localStorage.setItem('maxtron_admin_user', JSON.stringify(user));
        }
      } else {
        localStorage.removeItem('maxtron_admin_auth');
        localStorage.removeItem('maxtron_admin_user');
      }
    } catch (e) {
      console.error('Local storage auth error:', e);
    }
  },

  getBrands(): BrandInfo[] {
    try {
      const data = localStorage.getItem('maxtron_brands');
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBrands(brands: BrandInfo[]): void {
    try {
      localStorage.setItem('maxtron_brands', JSON.stringify(brands));
    } catch (e) {
      console.error('Storage save brands error:', e);
    }
  },

  saveBrand(brand: BrandInfo): void {
    const brands = this.getBrands();
    const index = brands.findIndex(b => b.id === brand.id);
    if (index !== -1) {
      brands[index] = brand;
    } else {
      brands.push(brand);
    }
    this.saveBrands(brands);
  },

  deleteBrand(id: string): void {
    const brands = this.getBrands().filter(b => b.id !== id);
    this.saveBrands(brands);
  }
};