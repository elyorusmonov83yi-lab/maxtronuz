"use client";

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Landmark,
  Headphones,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, ContactSettings } from '../../types';
import { translations } from '../../data/translations';
import { Breadcrumbs } from '../Breadcrumbs';
import { StorageService } from '../../services/storage';

interface ContactViewProps {
  currentLang: Language;
  onShowToast: (msg: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ currentLang, onShowToast }) => {
  const t = translations[currentLang] || translations.ru;
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => StorageService.getContactSettings());

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '+998 ',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleContactUpdated = (e: any) => {
      if (e.detail) setContactSettings(e.detail);
      else setContactSettings(StorageService.getContactSettings());
    };
    window.addEventListener('maxtron_contact_updated', handleContactUpdated);
    return () => window.removeEventListener('maxtron_contact_updated', handleContactUpdated);
  }, []);

  const getLocalized = (obj: any, fallback: string = '') => {
    if (!obj) return fallback;
    return obj[currentLang] || obj.ru || obj.uz || fallback;
  };

  const breadcrumbs = [
    { label: currentLang === 'ru' ? 'Контакты' : 'Aloqa' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {}

      onShowToast(currentLang === 'ru' ? 'Заявка успешно отправлена!' : 'So‘rovingiz muvaffaqiyatli yuborildi!');
    }, 700);
  };

  const badgeText = getLocalized(contactSettings?.badge, currentLang === 'ru' ? '24/7 Поддержка' : '24/7 Muloqot');
  const heroTitle = getLocalized(contactSettings?.heroTitle, currentLang === 'ru' ? 'Свяжитесь с нами и сервисные центры' : 'Biz bilan bog‘lanish va Servis markazlari');
  const heroSubtitle = getLocalized(contactSettings?.heroSubtitle, currentLang === 'ru' ? 'Наши сертифицированные инженеры помогут подобрать оборудование, пройти поверку и составить ТЗ.' : 'Mutaxassislarimiz uskunalarni tanlash va texnik masalalarda yordam beradi.');
  const mainAddress = getLocalized(contactSettings?.address, currentLang === 'ru' ? 'г. Ташкент, Юнусабадский р-н, проспект Амира Темура, 107Б' : 'Toshkent sh., Yunusobod tumani, Amir Temur shoh ko‘chasi, 107B');
  const workingHours = getLocalized(contactSettings?.workingHours, currentLang === 'ru' ? 'Понедельник — Суббота: с 09:00 до 18:00' : 'Dushanba — Shanba: 09:00 dan 18:00 gacha');

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Headphones className="w-3.5 h-3.5" /> {badgeText}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {heroTitle}
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {heroSubtitle}
        </p>
      </div>

      {/* Main Form & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Forma */}
        <div className="lg:col-span-7 bg-gray-900/90 rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">
              {currentLang === 'ru' ? 'Отправить запрос КП или вопрос' : 'Tijorat taklifi yoki savol yuborish'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {currentLang === 'ru' ? 'Наши специалисты свяжутся с вами в течение 15 минут.' : 'Mutaxassislarimiz 15 daqiqa ichida siz bilan bog‘lanadi.'}
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {currentLang === 'ru' ? 'Спасибо! Ваша заявка принята.' : 'Rahmat! So‘rovingiz qabul qilindi.'}
              </h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {currentLang === 'ru' ? 'Наш специалист свяжется с вами в течение 15 минут.' : 'Tez orada mutaxassisimiz siz bilan bog‘lanadi.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', company: '', phone: '+998 ', email: '', message: '' });
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition cursor-pointer"
              >
                {currentLang === 'ru' ? 'Отправить еще' : 'Yana xabar yuborish'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    {currentLang === 'ru' ? 'Контактное лицо (Ф.И.О.) *' : 'Aloqada bo‘luvchi shaxs (F.I.Sh.) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={currentLang === 'ru' ? 'Иван Иванов' : 'Anvar Karimov'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    {currentLang === 'ru' ? 'Наименование компании' : 'Kompaniya nomi'}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={currentLang === 'ru' ? 'ООО "Компания"' : 'MCHJ "Kompaniya"'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    {currentLang === 'ru' ? 'Телефон *' : 'Telefon raqam *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    {currentLang === 'ru' ? 'Email *' : 'Elektron pochta *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@company.uz"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  {currentLang === 'ru' ? 'Техническое задание или комментарий *' : 'Texnik topshiriq yoki izoh *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={currentLang === 'ru' ? 'Кратко опишите требуемое оборудование или прикрепите ТЗ...' : 'Qiziqtirayotgan uskuna yoki texnik topshiriq haqida qisqacha...'}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? (currentLang === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') : (currentLang === 'ru' ? 'Отправить заявку' : 'Arizani yuborish')}</span>
              </button>
            </form>
          )}
        </div>

        {/* O'ng tomondagi Bosh Ofis & Rekvizitlar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-5 shadow-xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>{currentLang === 'ru' ? 'MAXTRON Главный офис' : 'MAXTRON Bosh ofisi'}</span>
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 font-medium">{currentLang === 'ru' ? 'Адрес:' : 'Manzil:'}</div>
                  <div className="text-gray-200 font-semibold mt-0.5 leading-relaxed">{mainAddress}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 font-medium">{currentLang === 'ru' ? 'Телефоны:' : 'Telefonlar:'}</div>
                  <div className="text-gray-200 font-semibold mt-0.5 font-mono space-y-0.5">
                    <div>
                      <a href={`tel:${(contactSettings?.phone || '+998712008844').replace(/[^0-9+]/g, '')}`} className="hover:text-blue-400 text-sm">
                        {contactSettings?.phone || '+998 71 200-88-44'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 font-medium">{currentLang === 'ru' ? 'Электронная почта:' : 'Elektron pochta:'}</div>
                  <div className="text-gray-200 font-medium mt-0.5 font-mono">
                    <a href={`mailto:${contactSettings?.email || 'sales@maxtron.uz'}`} className="hover:text-blue-400">
                      {contactSettings?.email || 'sales@maxtron.uz'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-400 font-medium">{currentLang === 'ru' ? 'Режим работы:' : 'Ish tartibi:'}</div>
                  <div className="text-gray-200 font-medium mt-0.5 leading-relaxed">{workingHours}</div>
                </div>
              </div>
            </div>

            {/* Ijtimoiy Tarmoqlar */}
            <div className="pt-4 border-t border-gray-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {currentLang === 'ru' ? 'Мессенджеры и социальные сети' : 'Ijtimoiy tarmoqlar va messenjerlar'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <a
                  href={contactSettings?.telegramUrl || `https://t.me/${(contactSettings?.telegram || 'maxtron_uz').replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>

                <a
                  href={contactSettings?.instagramUrl || 'https://instagram.com/maxtron.uz'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>

                {contactSettings?.whatsappUrl && (
                  <a
                    href={contactSettings.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Xarita (Map Iframe) */}
          {contactSettings?.mapIframe && (
            <div className="rounded-3xl overflow-hidden border border-gray-800 h-64 bg-gray-950 shadow-lg">
              <iframe
                src={contactSettings.mapIframe}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location Map"
              />
            </div>
          )}

          {/* Bank Rekvizitlari */}
          <div className="p-6 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              <span>{currentLang === 'ru' ? 'Банковские и Корпоративные Реквизиты' : 'Bank va Korxona Rekvizitlari'}</span>
            </h4>
            <div className="text-xs text-gray-300 space-y-1.5 font-mono">
              <div>
                <span className="text-gray-500 font-sans">{currentLang === 'ru' ? 'Организация:' : 'Tashkilot:'}</span>{' '}
                <strong className="text-white">{contactSettings?.companyLegalName || '«MAXTRON INDUSTRIAL GROUP» МЧЖ'}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-sans">{currentLang === 'ru' ? 'ИНН (СТИР):' : 'STIR (INN):'}</span>{' '}
                <strong className="text-cyan-400">{contactSettings?.inn || '308991204'}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-sans">МФО:</span>{' '}
                <strong className="text-white">{contactSettings?.mfo || '00417'}</strong>,{' '}
                <span className="text-gray-500 font-sans">{currentLang === 'ru' ? 'Р/С:' : 'H/R:'}</span>{' '}
                <span className="text-gray-200">{contactSettings?.bankAccount || '20208000700001234567'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};