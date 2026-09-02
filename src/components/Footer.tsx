import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { 
  Language, 
  CustomPage, 
  ContactSettings, 
  HeaderSettings, 
  CategoryInfo 
} from '../types';
import { translations } from '../data/translations';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { getLocalizedText } from '../utils/formatters';

interface FooterProps {
  currentLang: Language;
  onOpenQuoteModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const t = translations[currentLang] || {};

  // Dinamik ma'lumotlar state'lari
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => StorageService.getPages());
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => StorageService.getContactSettings());
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() => StorageService.getHeaderSettings());
  const [categories, setCategories] = useState<CategoryInfo[]>(() => StorageService.getCategories());

  useEffect(() => {
    // Bazadan eng so'nggi ma'lumotlarni olish
    ApiService.getPages?.().then((data) => data && Array.isArray(data) && setCustomPages(data)).catch(() => {});
    ApiService.getSetting?.('contact').then((data) => data && setContactSettings(data)).catch(() => {});
    ApiService.getHeaderSettings?.().then((data) => data && setHeaderSettings(data)).catch(() => {});
    ApiService.getCategories?.().then((data) => data && Array.isArray(data) && setCategories(data)).catch(() => {});

    // Hodisalarni tinglash (Real-time yangilanishlar uchun)
    const handlePagesUpdated = (e: any) => setCustomPages(e.detail || StorageService.getPages());
    const handleContactUpdated = (e: any) => setContactSettings(e.detail || StorageService.getContactSettings());
    const handleHeaderUpdated = (e: any) => setHeaderSettings(e.detail || StorageService.getHeaderSettings());
    const handleCategoriesUpdated = (e: any) => setCategories(e.detail || StorageService.getCategories());

    window.addEventListener('maxtron_pages_updated', handlePagesUpdated);
    window.addEventListener('maxtron_contact_updated', handleContactUpdated);
    window.addEventListener('maxtron_header_updated', handleHeaderUpdated);
    window.addEventListener('maxtron_categories_updated', handleCategoriesUpdated);

    return () => {
      window.removeEventListener('maxtron_pages_updated', handlePagesUpdated);
      window.removeEventListener('maxtron_contact_updated', handleContactUpdated);
      window.removeEventListener('maxtron_header_updated', handleHeaderUpdated);
      window.removeEventListener('maxtron_categories_updated', handleCategoriesUpdated);
    };
  }, []);

  const getLocalizedUrl = (path: string) => {
    if (currentLang === 'ru') {
      return path;
    }
    return `/${currentLang}${path === '/' ? '' : path}`;
  };

  // Faqat footerda ko'rinishi belgilangan chop etilgan sahifalar
  const footerCustomPages = customPages.filter(
    (p) =>
      p.isPublished &&
      p.showInFooter &&
      p.id !== 'page-delivery' &&
      p.id !== 'page-warranty' &&
      p.slug !== 'yetkazib-berish-va-tolov' &&
      p.slug !== 'kafolat-va-servis'
  );

  const phoneDisplay = contactSettings.phone || headerSettings.phone || '+998 71 200-88-44';
  const cleanPhone = phoneDisplay.replace(/[^0-9+]/g, '');
  const emailDisplay = contactSettings.email || headerSettings.email || 'info@maxtron.uz';
  const addressDisplay = getLocalizedText(contactSettings.address, currentLang, 'Toshkent sh., Yunusobod tumani, Amir Temur shohi, 107B');
  const workingHoursDisplay = getLocalizedText(contactSettings.workingHours, currentLang, 'Dush - Shan: 09:00 - 18:00');

  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400">
      
      {/* Top Banner / CTA */}
      <div className="border-b border-gray-800/80 bg-gradient-to-r from-blue-950/40 via-gray-900 to-cyan-950/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2 block font-mono">
              MAXTRON Industrial Supply
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.cta_title || (currentLang === 'ru' ? 'Готовы оснастить ваше предприятие надежными приборами?' : 'Korxonangizni ishonchli uskunalar bilan jihozlashga tayyormisiz?')}
            </h3>
            <p className="text-sm text-gray-400 max-w-2xl mt-1">
              {t.cta_subtitle || (currentLang === 'ru' ? 'Получите индивидуальное коммерческое предложение с учетом скидок и условий доставки за 15 минут.' : '15 daqiqa ichida individual tijorat taklifi va yetkazib berish shartlarini oling.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to={getLocalizedUrl('/quote')}
              id="footer-quote-btn"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              {t.cta_btn || (currentLang === 'ru' ? 'Запросить КП' : 'Taklif olish')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center justify-center px-5 py-3 bg-gray-900 hover:bg-gray-800 text-gray-200 font-medium rounded-xl border border-gray-800 text-sm transition-all"
            >
              <Phone className="w-4 h-4 mr-2 text-blue-400" />
              {phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              to={getLocalizedUrl('/')}
              className="flex items-center space-x-3 group inline-flex"
            >
              {headerSettings.logoImageUrl ? (
                <img 
                  src={headerSettings.logoImageUrl} 
                  alt="Logo" 
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <Activity className="w-5 h-5" />
                </div>
              )}
             
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {getLocalizedText(headerSettings.logoSubtitle, currentLang, t.hero_subtitle || 'Sanoat korxonalari uchun professional o‘lchov uskunalari va KIPiA ta’minoti.')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> O'z DSt ISO 9001:2015
              </span>
              <span>•</span>
              <span className="text-gray-400">O‘zstandart Sertifikatlangan</span>
            </div>
          </div>

          {/* Dinamik Kategoriyalar */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.cat_section_title || (currentLang === 'ru' ? 'Каталог' : 'Katalog')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link 
                    to={getLocalizedUrl(`/catalog?category=${cat.id}`)} 
                    className="hover:text-blue-400 transition block truncate"
                  >
                    {getLocalizedText(cat.name, currentLang, cat.id)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Pages & Dynamic CMS Pages */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {currentLang === 'ru' ? 'Навигация' : 'Sahifalar'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={getLocalizedUrl('/')} className="hover:text-blue-400 transition">
                  {t.nav_home || 'Bosh sahifa'}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('/catalog')} className="hover:text-blue-400 transition">
                  {t.nav_catalog || 'Katalog'}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('/finder')} className="hover:text-blue-400 transition flex items-center gap-1.5 text-cyan-400">
                  <span>{currentLang === 'ru' ? 'Подбор КИПиА' : 'Uskuna tanlash'}</span>
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('/certificates')} className="hover:text-blue-400 transition">
                  {t.nav_certificates || 'Sertifikatlar'}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('/about')} className="hover:text-blue-400 transition">
                  {t.nav_about || 'Biz haqimizda'}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedUrl('/contact')} className="hover:text-blue-400 transition">
                  {t.nav_contact || 'Aloqa'}
                </Link>
              </li>

              {/* Dinamik CMS Sahifalar */}
              {footerCustomPages.map((page) => {
                const pageUrl = getLocalizedUrl(`/page/${page.slug}`);
                const pageTitle = getLocalizedText(page.title, currentLang, page.slug);
                return (
                  <li key={page.id}>
                    <Link to={pageUrl} className="hover:text-blue-400 transition flex items-center gap-1.5 text-gray-300">
                      <span>{pageTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Aloqa ma'lumotlari */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.nav_contact || (currentLang === 'ru' ? 'Контакты' : 'Aloqa')}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{addressDisplay}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="font-mono text-gray-200 hover:text-white transition">
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${emailDisplay}`} className="hover:text-white transition">
                  {emailDisplay}
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{workingHoursDisplay}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Pastki qator */}
        <div className="pt-10 mt-10 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            © {new Date().getFullYear()} MAXTRON Group LLC. {t.footer_rights || 'Barcha huquqlar himoyalangan.'}
          </div>
          <div className="flex items-center space-x-6">
            <Link to={getLocalizedUrl('/certificates')} className="hover:text-gray-400 transition">
              {t.footer_privacy || (currentLang === 'ru' ? 'Сертификация' : 'Sertifikatlar')}
            </Link>
            <span>•</span>
            <Link to={getLocalizedUrl('/contact')} className="hover:text-gray-400 transition">
              {t.footer_terms || (currentLang === 'ru' ? 'Гарантия и сервис' : 'Kafolat va servis')}
            </Link>
            <span>•</span>
            <Link to="/admin" className="text-gray-500 hover:text-blue-400 transition font-medium">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};