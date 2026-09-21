"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import { 
  Product, 
  Language, 
  CustomPage, 
  AboutContent, 
  HomeContent, 
  SeoSettings, 
  CategoryInfo, 
  Certificate,
  HeaderSettings,
  ContactSettings,
  PageSeoSettings,
  ClientPartner,
  AdminUser,
  IndustryInfo,
  BrandInfo
} from '../../types';
import { StorageService, AdminQuoteRequest } from '../../services/storage';
import { TelegramService, TelegramBotSettings } from '../../services/telegramService';
import { formatPrice, getLocalizedText } from '../../utils/formatters';
import { ApiService } from '../../services/api';

// Modallar
import { ProductFormModal } from './ProductFormModal';
import { PageFormModal } from './PageFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { CertificateFormModal } from './CertificateFormModal';
import { ClientFormModal } from './ClientFormModal';
import { ConfirmModal } from './ConfirmModal';
import { BrandManagerModal } from './BrandManagerModal';

// Layout & Auth
import { AdminLogin } from './AdminLogin';
import { AdminTopBar } from './AdminTopBar';
import { AdminSidebar } from './AdminSidebar';

// Bo'limlar
import { AdminDashboard } from './sections/AdminDashboard';
import { AdminProducts } from './sections/AdminProducts';
import { AdminCategories } from './sections/AdminCategories';
import { AdminCertificates } from './sections/AdminCertificates';
import { AdminPages } from './sections/AdminPages';
import { AdminOrders } from './sections/AdminOrders';
import { AdminClients } from './sections/AdminClients';
import { AdminUsers } from './sections/AdminUsers';
import { AdminIndustries } from './sections/AdminIndustries';
import { AdminHomeSettings } from './sections/AdminHomeSettings';
import { AdminHeaderSettings } from './sections/AdminHeaderSettings';
import { AdminAboutSettings } from './sections/AdminAboutSettings';
import { AdminContactSettings } from './sections/AdminContactSettings';
import { AdminSeoSettings } from './sections/AdminSeoSettings';
import { AdminTelegramSettings } from './sections/AdminTelegramSettings';
interface AdminViewProps {
  currentLang: Language;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentLang }) => {
  // Autentifikatsiya holati
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  
  // Login maydonlari
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dastlabki autentifikatsiyani tekshirish (SSR xavfsiz)
  useEffect(() => {
    let isMounted = true;
    const initialUser = StorageService.getAdminUser();
    if (initialUser && isMounted) {
      setCurrentUser(initialUser);
    }

    ApiService.getCurrentAdmin().then((user) => {
      if (!isMounted) return;
      if (user) {
        const adminData = { email: user.username, name: (user as any).name || user.username};
        StorageService.setAdminAuthenticated(true, adminData);
        setCurrentUser(adminData);
        setIsAuthenticated(true);
      } else {
        StorageService.setAdminAuthenticated(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
        }
        setIsAuthenticated(false);
      }
      setIsAuthChecked(true);
    }).catch(() => {
      if (isMounted) {
        setIsAuthChecked(true);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Layout va Navigatsiya
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tizim ob'ektlari
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryInfo | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certificate | null>(null);

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [pageToEdit, setPageToEdit] = useState<CustomPage | null>(null);

  const [quotes, setQuotes] = useState<AdminQuoteRequest[]>([]);
  const [industries, setIndustries] = useState<IndustryInfo[]>([]);
  const [brands, setBrands] = useState<BrandInfo[]>([]);

  const [clients, setClients] = useState<ClientPartner[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientPartner | null>(null);
  const [clientLogoPreview, setClientLogoPreview] = useState<string>('');

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Sayt sozlamalari holatlari
  const [homeContent, setHomeContent] = useState<HomeContent>(() => StorageService.getHomeContent());
  const [aboutContent, setAboutContent] = useState<AboutContent>(() => StorageService.getAboutContent());
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() => StorageService.getHeaderSettings());
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => StorageService.getContactSettings());
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(() => StorageService.getSeoSettings());
  const [pageSeoSettings, setPageSeoSettings] = useState<PageSeoSettings>(() => StorageService.getPageSeoSettings());

  // Telegram sozlamalari
  const [telegramSettings, setTelegramSettings] = useState<TelegramBotSettings>(() => TelegramService.getSettings());
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  // O'chirishni tasdiqlash modali
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Xabarnoma (Toast)
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Ma'lumotlarni bazadan to'liq yuklab olish
  const loadData = useCallback(() => {
    ApiService.getHeaderSettings().then((data) => {
      if (data && Object.keys(data).length > 0) setHeaderSettings(data);
    });

    ApiService.getCategories().then((data) => {
      if (data && Array.isArray(data)) setCategories(data);
    });

    ApiService.getProducts().then((data) => {
      if (data && Array.isArray(data)) setProducts(data);
    });

    ApiService.getQuotes().then((data) => {
      if (data && Array.isArray(data)) setQuotes(data);
    });

    ApiService.getCertificates().then((data) => {
      if (data && Array.isArray(data)) setCertificates(data);
    });

    ApiService.getClients().then((data) => {
      if (data && Array.isArray(data)) setClients(data);
    });

    ApiService.getPages().then((data) => {
      if (data && Array.isArray(data)) setPages(data);
    });

    ApiService.getAdminUsers().then((data) => {
      if (data && Array.isArray(data)) setAdminUsers(data);
    });

    ApiService.getIndustries?.().then((data) => {
      if (data && Array.isArray(data)) {
        setIndustries(data);
      } else {
        setIndustries(StorageService.getIndustries?.() || []);
      }
    }).catch(() => {
      setIndustries(StorageService.getIndustries?.() || []);
    });

    ApiService.getBrands?.().then((data) => {
      if (data && Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands(StorageService.getBrands?.() || []);
      }
    }).catch(() => {
      setBrands(StorageService.getBrands?.() || []);
    });

    ApiService.getSetting('home').then((data) => data && setHomeContent(data));
    ApiService.getSetting('about').then((data) => data && setAboutContent(data));
    ApiService.getSetting('contact').then((data) => data && setContactSettings(data));
    ApiService.getSetting('seo').then((data) => data && setSeoSettings(data));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }

    const handleProductsChange = (e: any) => e.detail && setProducts(e.detail);
    const handleCategoriesChange = (e: any) => e.detail && setCategories(e.detail);
    const handleCertificatesChange = (e: any) => e.detail && setCertificates(e.detail);
    const handlePagesChange = (e: any) => e.detail && setPages(e.detail);
    const handleQuotesChange = (e: any) => e.detail && setQuotes(e.detail);
    const handleClientsChange = (e: any) => e.detail && setClients(e.detail);
    const handleUsersChange = (e: any) => e.detail && setAdminUsers(e.detail);
    const handleIndustriesChange = (e: any) => e.detail && setIndustries(e.detail);
    const handleBrandsChange = (e: any) => e.detail && setBrands(e.detail);
    const handleHomeChange = (e: any) => e.detail && setHomeContent(e.detail);
    const handleAboutChange = (e: any) => e.detail && setAboutContent(e.detail);
    const handleHeaderChange = (e: any) => e.detail && setHeaderSettings(e.detail);
    const handleContactChange = (e: any) => e.detail && setContactSettings(e.detail);
    const handleSeoChange = (e: any) => e.detail && setSeoSettings(e.detail);
    const handlePageSeoChange = (e: any) => e.detail && setPageSeoSettings(e.detail);

    window.addEventListener('maxtron_products_updated', handleProductsChange);
    window.addEventListener('maxtron_categories_updated', handleCategoriesChange);
    window.addEventListener('maxtron_certificates_updated', handleCertificatesChange);
    window.addEventListener('maxtron_pages_updated', handlePagesChange);
    window.addEventListener('maxtron_quotes_updated', handleQuotesChange);
    window.addEventListener('maxtron_clients_updated', handleClientsChange);
    window.addEventListener('maxtron_users_updated', handleUsersChange);
    window.addEventListener('maxtron_industries_updated', handleIndustriesChange);
    window.addEventListener('maxtron_brands_updated', handleBrandsChange);
    window.addEventListener('maxtron_home_updated', handleHomeChange);
    window.addEventListener('maxtron_about_updated', handleAboutChange);
    window.addEventListener('maxtron_header_updated', handleHeaderChange);
    window.addEventListener('maxtron_contact_updated', handleContactChange);
    window.addEventListener('maxtron_seo_updated', handleSeoChange);
    window.addEventListener('maxtron_pages_seo_updated', handlePageSeoChange);

    return () => {
      window.removeEventListener('maxtron_products_updated', handleProductsChange);
      window.removeEventListener('maxtron_categories_updated', handleCategoriesChange);
      window.removeEventListener('maxtron_certificates_updated', handleCertificatesChange);
      window.removeEventListener('maxtron_pages_updated', handlePagesChange);
      window.removeEventListener('maxtron_quotes_updated', handleQuotesChange);
      window.removeEventListener('maxtron_clients_updated', handleClientsChange);
      window.removeEventListener('maxtron_users_updated', handleUsersChange);
      window.removeEventListener('maxtron_industries_updated', handleIndustriesChange);
      window.removeEventListener('maxtron_brands_updated', handleBrandsChange);
      window.removeEventListener('maxtron_home_updated', handleHomeChange);
      window.removeEventListener('maxtron_about_updated', handleAboutChange);
      window.removeEventListener('maxtron_header_updated', handleHeaderChange);
      window.removeEventListener('maxtron_contact_updated', handleContactChange);
      window.removeEventListener('maxtron_seo_updated', handleSeoChange);
      window.removeEventListener('maxtron_pages_seo_updated', handlePageSeoChange);
    };
  }, [isAuthenticated, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    try {
      const result = await ApiService.loginAdmin(email, password);
      setIsLoggingIn(false);

      if (result && result.success && result.user) {
        const adminData = {
          email: result.user.username,
          name: result.user.name || result.user.username
        };
        StorageService.setAdminAuthenticated(true, adminData, rememberMe);
        setIsAuthenticated(true);
        setCurrentUser(adminData);
        setAuthError('');
        showNotification(`Xush kelibsiz, ${adminData.name}!`);
      } else {
        setAuthError(result?.message || 'Elektron pochta yoki parol noto‘g‘ri!');
      }
    } catch {
      setIsLoggingIn(false);
      setAuthError('Server bilan bog‘lanishda xatolik yuz berdi!');
    }
  };

  const handleLogout = () => {
    StorageService.setAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  const handleSaveIndustries = async (updatedIndustries: IndustryInfo[]) => {
    try {
      const res = await ApiService.saveIndustries(updatedIndustries);
      if (res && (res.success || res === true as any)) {
        setIndustries(updatedIndustries);
        showNotification('Sanoat sohalari va vazifalar bazaga saqlandi!', 'success');
      } else {
        setIndustries(updatedIndustries);
        showNotification('Sohalar saqlandi', 'success');
      }
    } catch (error: any) {
      showNotification(`Xatolik: ${error?.message || 'Sohalar saqlanmadi'}`, 'error');
    }
  };

  const triggerDeleteProduct = (prod: Product) => {
    const prodName = typeof prod.name === 'string' ? prod.name : getLocalizedText(prod.name, currentLang, prod.model);
    setConfirmModal({
      isOpen: true,
      title: 'Mahsulotni o‘chirish',
      message: `Haqiqatan ham «${prodName} (${prod.model})» mahsulotini saytdan o‘chirib tashlamoqchimisiz?`,
      onConfirm: async () => {
        try {
          await ApiService.deleteProduct(prod.id);
          showNotification(`«${prod.model}» mahsuloti o‘chirildi!`, 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setProducts(await ApiService.getProducts());
        } catch {
          showNotification('Xatolik: mahsulot o‘chirilmadi', 'error');
        }
      }
    });
  };

  const triggerDeleteCategory = (cat: CategoryInfo) => {
    setConfirmModal({
      isOpen: true,
      title: 'Kategoriyani o‘chirish',
      message: `Haqiqatan ham «${getLocalizedText(cat.name, currentLang, cat.id)}» toifasini o‘chirmoqchimisiz?`,
      onConfirm: async () => {
        try {
          await ApiService.deleteCategory(cat.id);
          showNotification('Kategoriya bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setCategories(await ApiService.getCategories());
        } catch {
          showNotification('Xatolik: kategoriya o‘chirilmadi', 'error');
        }
      }
    });
  };

  const triggerDeleteCertificate = (cert: Certificate) => {
    const certNum = cert.certNumber || (cert as any).number || '';
    setConfirmModal({
      isOpen: true,
      title: 'Sertifikatni o‘chirish',
      message: `«${certNum}» raqamli sertifikatni bazadan o‘chirib tashlashni tasdiqlaysizmi?`,
      onConfirm: async () => {
        try {
          await ApiService.deleteCertificate(cert.id);
          showNotification('Sertifikat bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setCertificates(await ApiService.getCertificates());
        } catch {
          showNotification('Xatolik: sertifikat o‘chirilmadi', 'error');
        }
      }
    });
  };

  const triggerDeletePage = (page: CustomPage) => {
    const pgTitle = typeof page.title === 'object' ? (page.title.uz || page.title.ru) : page.title;
    setConfirmModal({
      isOpen: true,
      title: 'Sahifani o‘chirish',
      message: `«${pgTitle}» sahifasini bazadan o‘chirib tashlashni tasdiqlaysizmi?`,
      onConfirm: async () => {
        try {
          await ApiService.deletePage(page.id);
          showNotification('Sahifa bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setPages(await ApiService.getPages());
        } catch {
          showNotification('Xatolik: sahifa o‘chirilmadi', 'error');
        }
      }
    });
  };

  const triggerDeleteQuote = (quoteId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Buyurtmani o‘chirish',
      message: 'Ushbu buyurtma ma‘lumotlarini bazadan o‘chirib tashlashni tasdiqlaysizmi?',
      onConfirm: async () => {
        try {
          await ApiService.deleteQuote(quoteId);
          showNotification('Buyurtma bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setQuotes(await ApiService.getQuotes());
        } catch {
          showNotification('Xatolik: buyurtma o‘chirilmadi', 'error');
        }
      }
    });
  };

  const triggerDeleteClient = (client: ClientPartner) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hamkorni o‘chirish',
      message: `«${client.name}» hamkorini bazadan o‘chirib tashlashni tasdiqlaysizmi?`,
      onConfirm: async () => {
        try {
          await ApiService.deleteClient(client.id);
          showNotification('Hamkor bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setClients(await ApiService.getClients());
        } catch {
          showNotification('Xatolik: hamkor o‘chirilmadi', 'error');
        }
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setHeaderSettings((prev) => ({ ...prev, logoImageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await ApiService.saveSetting('home', homeContent);
      showNotification('Asosiy sahifa sozlamalari bazaga saqlandi!', 'success');
    } catch {
      showNotification('Xatolik: saqlanmadi', 'error');
    }
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await ApiService.saveHeaderSettings(headerSettings);
      showNotification('Header va Logotip bazaga saqlandi!', 'success');
    } catch {
      showNotification('Xatolik: ma‘lumot saqlanmadi', 'error');
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await ApiService.saveSetting('contact', contactSettings);
      showNotification('Aloqa ma‘lumotlari bazaga saqlandi!', 'success');
    } catch {
      showNotification('Xatolik: saqlanmadi', 'error');
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await ApiService.saveSetting('about', aboutContent);
      showNotification('«Biz haqimizda» ma‘lumotlari bazaga saqlandi!', 'success');
    } catch {
      showNotification('Xatolik: saqlanmadi', 'error');
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await ApiService.saveSetting('seo', seoSettings);
      showNotification('SEO sozlamalari bazaga saqlandi!', 'success');
    } catch {
      showNotification('Xatolik: saqlanmadi', 'error');
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      await ApiService.saveAdminUser(userData);
      showNotification('Foydalanuvchi bazaga saqlandi!', 'success');
      setAdminUsers(await ApiService.getAdminUsers());
    } catch {
      showNotification('Xatolik: foydalanuvchi saqlanmadi', 'error');
    }
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Foydalanuvchini o‘chirish',
      message: 'Ushbu administratorni bazadan o‘chirib tashlashni tasdiqlaysizmi?',
      onConfirm: async () => {
        try {
          await ApiService.deleteAdminUser(userId);
          showNotification('Foydalanuvchi bazadan o‘chirildi!', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setAdminUsers(await ApiService.getAdminUsers());
        } catch {
          showNotification('Xatolik: foydalanuvchi o‘chirilmadi', 'error');
        }
      }
    });
  };

  const downloadSitemap = () => {
    const a = document.createElement('a');
    a.href = '/sitemap.xml';
    a.download = 'sitemap.xml';
    a.click();
    showNotification('Sitemap.xml yuklab olindi!');
  };

  const downloadRobotsTxt = () => {
    const content = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://maxtron.uz/sitemap.xml\nHost: https://maxtron.uz\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('robots.txt yuklab olindi!');
  };

  const handleSaveTelegramSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const success = TelegramService.saveSettings(telegramSettings);
    if (success) {
      showNotification('Telegram bot sozlamalari muvaffaqiyatli saqlandi!');
    } else {
      showNotification('Sozlamalarni saqlashda xatolik yuz berdi', 'error');
    }
  };

  const handleTestTelegramNotification = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      setTelegramTestStatus({
        type: 'error',
        message: 'Iltimos, Bot Token va Chat ID maydonlarini to‘ldiring.'
      });
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestStatus({ type: '', message: '' });

    const result = await TelegramService.sendTestNotification(telegramSettings.botToken, telegramSettings.chatId);
    setIsTestingTelegram(false);

    if (result.success) {
      setTelegramTestStatus({
        type: 'success',
        message: '✅ Test xabari Telegram botingizga muvaffaqiyatli yuborildi! Chatni tekshiring.'
      });
    } else {
      setTelegramTestStatus({
        type: 'error',
        message: `❌ Xatolik: ${result.error || 'Xabar yuborib bo‘lmadi'}. Token va Chat ID to‘g‘riligini tekshiring.`
      });
    }
  };

  if (!isAuthChecked) {
    return <div className="min-h-screen bg-gray-950" aria-label="Yuklanmoqda..." />;
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        authError={authError}
        isLoggingIn={isLoggingIn}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200 ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
            : 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
        }`}>
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        handleLogout={handleLogout}
        products={products}
        categories={categories}
        certificates={certificates}
        pages={pages}
        quotes={quotes}
        clients={clients}
        adminUsers={adminUsers}
        industries={industries}
        brands={brands}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminTopBar
          activeTab={activeTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          handleLogout={handleLogout}
        />

        <div className="p-4 sm:p-8 space-y-6">

          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              categories={categories}
              certificates={certificates}
              pages={pages}
              quotes={quotes}
              clients={clients}
              adminUsers={adminUsers}
              setActiveTab={setActiveTab}
              setProductToEdit={setProductToEdit}
              setIsProductModalOpen={setIsProductModalOpen}
              setCategoryToEdit={setCategoryToEdit}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
              setCertToEdit={setCertToEdit}
              setIsCertModalOpen={setIsCertModalOpen}
              setPageToEdit={setPageToEdit}
              setIsPageModalOpen={setIsPageModalOpen}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              setProductToEdit={setProductToEdit}
              setIsProductModalOpen={setIsProductModalOpen}
              triggerDeleteProduct={triggerDeleteProduct}
              formatPrice={(price) => formatPrice(price, currentLang)}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              products={products}
              setCategoryToEdit={setCategoryToEdit}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
              triggerDeleteCategory={triggerDeleteCategory}
            />
          )}

          {activeTab === 'brands' && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
              <BrandManagerModal
                isOpen={true}
                onClose={() => setActiveTab('dashboard')}
                brands={brands}
                onRefresh={async () => {
                  const updatedBrands = await ApiService.getBrands();
                  setBrands(updatedBrands);
                  showNotification('Brendlar ro‘yxati yangilandi');
                }}
                currentLang={currentLang}
              />
            </div>
          )}

          {activeTab === 'industries' && (
            <AdminIndustries
              industries={industries}
              currentLang={currentLang}
              onSaveIndustries={handleSaveIndustries}
            />
          )}

          {activeTab === 'certificates' && (
            <AdminCertificates
              currentLang={currentLang}
              certificates={certificates}
              setCertToEdit={setCertToEdit}
              setIsCertModalOpen={setIsCertModalOpen}
              triggerDeleteCertificate={triggerDeleteCertificate}
              seoSettings={seoSettings}
              setSeoSettings={setSeoSettings}
              handleSaveSeo={handleSaveSeo}
            />
          )}

          {activeTab === 'pages' && (
            <AdminPages
              pages={pages}
              setPageToEdit={setPageToEdit}
              setIsPageModalOpen={setIsPageModalOpen}
              triggerDeletePage={triggerDeletePage}
            />
          )}

          {activeTab === 'quotes' && (
            <AdminOrders
              quotes={quotes}
              loadData={loadData}
              showNotification={showNotification}
              triggerDeleteQuote={triggerDeleteQuote}
            />
          )}

          {activeTab === 'clients' && (
            <AdminClients
              clients={clients}
              setClients={setClients}
              setClientToEdit={setClientToEdit}
              setClientLogoPreview={setClientLogoPreview}
              setIsClientModalOpen={setIsClientModalOpen}
              showNotification={showNotification}
              triggerDeleteClient={triggerDeleteClient}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              adminUsers={adminUsers}
              setAdminUsers={setAdminUsers}
              showNotification={showNotification}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'home' && (
            <AdminHomeSettings
              homeContent={homeContent}
              setHomeContent={setHomeContent}
              handleSaveHome={handleSaveHome}
            />
          )}

          {activeTab === 'header' && (
            <AdminHeaderSettings
              headerSettings={headerSettings}
              setHeaderSettings={setHeaderSettings}
              handleLogoUpload={handleLogoUpload}
              handleSaveHeader={handleSaveHeader}
            />
          )}

          {activeTab === 'about' && (
            <AdminAboutSettings
              aboutContent={aboutContent}
              setAboutContent={setAboutContent}
              pageSeoSettings={pageSeoSettings}
              setPageSeoSettings={setPageSeoSettings}
              handleSaveAbout={handleSaveAbout}
            />
          )}

          {activeTab === 'contacts' && (
            <AdminContactSettings
              contactSettings={contactSettings}
              setContactSettings={setContactSettings}
              handleSaveContact={handleSaveContact}
            />
          )}

          {activeTab === 'seo' && (
            <AdminSeoSettings
              seoSettings={seoSettings}
              setSeoSettings={setSeoSettings}
              handleSaveSeo={handleSaveSeo}
              downloadSitemap={downloadSitemap}
              downloadRobotsTxt={downloadRobotsTxt}
            />
          )}

          {activeTab === 'telegram' && (
            <AdminTelegramSettings
              telegramSettings={telegramSettings}
              setTelegramSettings={setTelegramSettings}
              handleSaveTelegramSettings={handleSaveTelegramSettings}
              handleTestTelegramNotification={handleTestTelegramNotification}
              isTestingTelegram={isTestingTelegram}
              telegramTestStatus={telegramTestStatus}
            />
          )}

        </div>

      </main>

      {/* MODALLAR */}
      {isProductModalOpen && (
        <ProductFormModal
          key={productToEdit ? `edit-${productToEdit.id}` : `new-${Date.now()}`}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          productToEdit={productToEdit}
          categories={categories || []}
          onSave={async (prod) => {
            try {
              const res = await ApiService.saveProduct(prod);
              if (res && res.success === false) {
                throw new Error(res.message || 'Server saqlay olmadi');
              }
              showNotification(`«${prod.model || 'Mahsulot'}» bazaga saqlandi!`, 'success');
              setProducts(await ApiService.getProducts() || []);
              setIsProductModalOpen(false);
              setProductToEdit(null);
            } catch (err: any) {
              showNotification(`Xatolik: ${err.message || 'Mahsulot saqlanmadi'}`, 'error');
            }
          }}
        />
      )}

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        categories={categories || []}
        onSave={async (cat) => {
          await ApiService.saveCategory(cat);
          setCategories(await ApiService.getCategories());
          setIsCategoryModalOpen(false);
          showNotification('Kategoriya saqlandi');
        }}
      />

      <CertificateFormModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certToEdit={certToEdit}
        onSave={async (cert) => {
          await ApiService.saveCertificate(cert);
          setCertificates(await ApiService.getCertificates());
          setIsCertModalOpen(false);
          showNotification('Sertifikat saqlandi');
        }}
      />

      <PageFormModal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        pageToEdit={pageToEdit}
        onSave={async (pg) => {
          await ApiService.savePage(pg);
          setPages(await ApiService.getPages());
          setIsPageModalOpen(false);
          showNotification('Sahifa saqlandi');
        }}
      />

      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
        clientLogoPreview={clientLogoPreview}
        setClientLogoPreview={setClientLogoPreview}
        onSave={async (clientData) => {
          await ApiService.saveClient(clientData);
          setClients(await ApiService.getClients());
          setIsClientModalOpen(false);
          showNotification('Hamkor saqlandi');
        }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};