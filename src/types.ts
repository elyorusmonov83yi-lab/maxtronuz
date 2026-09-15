// ============================================================================
// --- ASOSIY TIPLAR VA TILLAR (UZ / RU) ---
// ============================================================================
export type Language = 'uz' | 'ru' | 'uz_cyrl' | 'en';

export type LocalizedString = {
  uz: string;
  ru: string;
  [key: string]: string | undefined;
};

export interface LocalizedStringArray {
  uz: string[];
  ru: string[];
  [key: string]: string[] | undefined;
}

// ============================================================================
// --- MAHSULOTLAR (PRODUCTS & SPECS) ---
// ============================================================================
export interface ProductSpec {
  name: LocalizedString | string;   // { uz: 'Bosim diapazoni', ru: 'Диапазон давления' }
  value: LocalizedString | string;  // { uz: '0...600 bar', ru: '0...600 бар' }
}

// 🌟 Yangi Soha va Vazifalar interfeysi
export interface IndustryTask {
  id: string;
  name: string | { uz: string; ru: string };
  desc?: string | { uz: string; ru: string };
}

export interface IndustryInfo {
  id: string;
  slug?: string;
  name: string | { uz: string; ru: string };
  desc?: string | { uz: string; ru: string };
  icon?: string; // masalan: Flame, Building2, Zap, Wrench
  tasks?: IndustryTask[];
}
export interface Product {
  id: string;
  slug?: LocalizedString;
  name: LocalizedString | string;
  model: string;
  category: string;
  tagline: LocalizedString;
  description: LocalizedString;
  price?: number;
  oldPrice?: number;
  priceFormatted: LocalizedString;
  inStock: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  image: string;
  imageUrl?: string;
  brand?: string;
  additionalImages?: string[];
  specs: ProductSpec[];
  features: LocalizedStringArray;
  applications: LocalizedStringArray;
  standardCert?: LocalizedString | string;
  warrantyMonths?: number;
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  seoKeywords?: LocalizedString;
  ogImage?: string;
  industries?: string[]; // Masalan: ['oil_gas', 'construction']
  tasks?: string[];      // Masalan: ['pipe_pressure', 'tank_level']
}

// ============================================================================
// --- TOIFALAR / KATEGORIYALAR (CATEGORIES) ---
// ============================================================================
export interface CategoryInfo {
  id: string;
  parentId?: string | null; // Ota toifa IDsi (agar bo'sh yoki null bo'lsa - Asosiy ota toifa)
  slug?: {
    uz: string;
    ru: string;
  };
  name: LocalizedString;
  description: LocalizedString;
  icon?: string;
  image?: string;
  count?: number;
  seoTitle?: {
    uz: string;
    ru: string;
  };
  seoDescription?: {
    uz: string;
    ru: string;
  };
  seoKeywords?: {
    uz: string;
    ru: string;
  };
  ogImage?: string;
}

// ============================================================================
// --- SERTIFIKATLAR (CERTIFICATES) ---
// ============================================================================
export interface Certificate {
  id: string;
  number?: string;
  certNumber?: string;
  title: LocalizedString;
  issuer: LocalizedString;
  validUntil?: string;
  issueDate?: string;
  standard?: string;
  type?: 'iso' | 'metrology' | 'gost' | 'conformity' | string;
  docNumber?: string;
  image?: string;
  previewUrl?: string;
  pdfUrl?: string;
  description?: LocalizedString;
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  seoKeywords?: LocalizedString;
  ogImage?: string;
}

// ============================================================================
// --- SEO VA SAHIFALAR UCHUN SOZLAMALAR ---
// ============================================================================
export interface SeoPageItem {
  title: { uz: string; ru: string };
  description: { uz: string; ru: string };
  keywords?: { uz: string; ru: string };
  ogTitle?: { uz: string; ru: string };
  ogImage?: string;
  ogDescription?: { uz: string; ru: string };
}

export interface PageSeoFields {
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString;
  ogImage?: string;
  ogTitle?: LocalizedString;
  ogDescription?: LocalizedString;
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
}

export interface PageSeoSettings {
  home: PageSeoFields | SeoPageItem;
  catalog: PageSeoFields | SeoPageItem;
  certificates: PageSeoFields | SeoPageItem;
  about: PageSeoFields | SeoPageItem;
  contact: PageSeoFields | SeoPageItem;
  [key: string]: PageSeoFields | SeoPageItem;
}

export interface SeoSettings {
  googleVerification: string;
  yandexVerification: string;
  bingVerification?: string;
  googleAnalyticsId: string;
  yandexMetrikaId: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  ogImageUrl: string;
  robotsTxt?: string;
  pageSeo?: PageSeoSettings;
}

// ============================================================================
// --- BIZ HAQIMIZDA (ABOUT CONTENT) ---
// ============================================================================

export interface AboutContent {
  heroBadge?: LocalizedString;
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  storyTitle?: LocalizedString;
  storyText: LocalizedString;
  storyImage?: string;
  
  // Statistik raqamlar
  yearsExp: string;
  equipmentDelivered: string;
  warehouseItems: string;
  partnerClients: string;
  
  // Rahbariyat / Ofis
  directorName: string;
  directorTitle: LocalizedString;
  mainOfficeAddress: LocalizedString;

  // SEO
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  seoKeywords?: LocalizedString;
  ogImage?: string;
}

// ============================================================================
// --- BOSH SAHIFA (HOME CONTENT) ---
// ============================================================================
export interface HomeContent {
  // 1. Banner va Matnlar (RU / UZ)
  heroBadge?: { uz: string; ru: string };
  heroTitle?: { uz: string; ru: string };
  heroSubtitle?: { uz: string; ru: string };
  bannerNotice?: { uz: string; ru: string };
  ctaPhone?: string;
  telegramUser?: string;

  // 2. SEO Qidiruv Tizimlari uchun (RU / UZ)
  seoTitle?: { uz: string; ru: string };
  seoDescription?: { uz: string; ru: string };
  seoKeywords?: { uz: string; ru: string };

  // 3. OpenGraph (Telegram / Facebook / WhatsApp Preview)
  ogTitle?: { uz: string; ru: string };
  ogDescription?: { uz: string; ru: string };
  ogImage?: LocalizedString | string;

  // 4. Texnik sozlamalar
  canonicalUrl?: string;
  robotsIndex?: string;

  // 5. Statistik raqamlar va matnlar
  statClientsNum?: string;
  statClientsText?: { uz: string; ru: string };
  statDevicesNum?: string;
  statDevicesText?: { uz: string; ru: string };
  statWarrantyNum?: string;
  statWarrantyText?: { uz: string; ru: string };
  statSupportNum?: string;
  statSupportText?: { uz: string; ru: string };

  // 6. Nega bizni tanlashadi (Afzalliklar sarlavhasi va punktlari)
  whyUsTitle?: { uz: string; ru: string };
  whyUsSubtitle?: { uz: string; ru: string };
  
  adv1Title?: { uz: string; ru: string };
  adv1Desc?: { uz: string; ru: string };
  adv2Title?: { uz: string; ru: string };
  adv2Desc?: { uz: string; ru: string };
  adv3Title?: { uz: string; ru: string };
  adv3Desc?: { uz: string; ru: string };
  adv4Title?: { uz: string; ru: string };
  adv4Desc?: { uz: string; ru: string };

  // 7. Bo'lim sarlavhalari va Industrial Service bloki
  catSectionTitle?: { uz: string; ru: string };
  catSectionSubtitle?: { uz: string; ru: string };
  featuredTitle?: { uz: string; ru: string };
  featuredSubtitle?: { uz: string; ru: string };
  quizTitle?: { uz: string; ru: string };
  quizSubtitle?: { uz: string; ru: string };
  partnersTitle?: { uz: string; ru: string };
  partnersSubtitle?: { uz: string; ru: string };
  serviceTitle?: { uz: string; ru: string };
  serviceSubtitle?: { uz: string; ru: string };
  serviceButtonText?: { uz: string; ru: string };
}

// ============================================================================
// --- HEADER VA LOGO SOZLAMALARI ---
// ============================================================================
export interface HeaderSettings {
  logoText: string;
  logoAccentText: string;
  logoSubtitle: LocalizedString;
  logoImageUrl?: string;
  logoUrl?: string;
  faviconUrl?: string; // 🌟 Shu qatorni qo'shing
  topbarWarehouse: LocalizedString;
  topbarDelivery: LocalizedString;
  topbarSchedule: LocalizedString;
  phone: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email: string;
  telegramUser: string;
  telegramUrl: string;
  instagramUrl?: string;
  instagram?: string;
  youtubeUrl?: string;
}

// ============================================================================
// --- ALOQA VA MANZIL SOZLAMALARI (CONTACT) ---
// ============================================================================
export interface ContactSettings {
  badge?: LocalizedString;
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  address: LocalizedString;
  warehouseAddress?: LocalizedString;
  workingHours: LocalizedString;
  phone: string;
  phoneSecondary?: string;
  fastPhone?: string;
  email: string;
  mapIframe: string;
  
  // 🌟 Barcha Ijtimoiy tarmoqlar:
  telegram?: string;
  telegramUrl?: string;
  instagram?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;

  // Korxona va Bank rekvizitlari:
  companyLegalName?: string;
  inn?: string;
  mfo?: string;
  bankAccount?: string;
  vatNumber?: string;
}

// ============================================================================
// --- BUYURTMALAR / TIJORAT TAKLIFLARI (QUOTES) ---
// ============================================================================
export interface QuoteRequestData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  inn: string;
  selectedProductId?: string;
  notes: string;
  quantity: number;
}

// ============================================================================
// --- MAXSUS SAHIFALAR (CUSTOM PAGES) ---
// ============================================================================
export interface CustomPageSection {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  imageUrl?: string;
  badge?: LocalizedString;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  content: LocalizedString;
  sections?: CustomPageSection[];
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  metaKeywords?: LocalizedString;
  ogImage?: string;
  showInHeader?: boolean;
  showInFooter?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  icon?: string;
}

// ============================================================================
// --- HAMKORLAR VA MIJOZLAR (CLIENTS) ---
// ============================================================================
export interface ClientPartner {
  id: string;
  name: string;
  shortName: string;
  category: string;
  logo?: string;
  order?: number;
}

// ============================================================================
// --- ADMIN FOYDALANUVCHILARI (ADMIN USERS) ---
// ============================================================================
export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'super_admin' | 'manager' | 'editor';
  createdAt?: number;
}

export interface BrandInfo {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: LocalizedString | string;
  country?: string;
  website?: string;
  orderIndex?: number;
  isActive?: boolean;
}
