"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/utils/navigation';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Package, 
  Upload, 
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, Product, QuoteRequestData } from '../../types';
import { translations } from '../../data/translations';
import { Breadcrumbs } from '../Breadcrumbs';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { getProductName } from '../../utils/formatters';

interface QuoteViewProps {
  currentLang: Language;
  onShowToast: (msg: string) => void;
}

export const QuoteView: React.FC<QuoteViewProps> = ({ currentLang, onShowToast }) => {
  const searchParams = useSearchParams();
  const initialProductId = searchParams ? (searchParams.get('product') || '') : '';
  const t = translations[currentLang] || {};

  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());

  const [formData, setFormData] = useState<QuoteRequestData & { deliveryCity?: string; urgent?: boolean }>({
    companyName: '',
    contactPerson: '',
    phone: '+998 ',
    email: '',
    inn: '',
    selectedProductId: initialProductId,
    quantity: 1,
    deliveryCity: 'Toshkent',
    urgent: false,
    notes: '',
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ApiService.getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        setProducts(StorageService.getProducts());
      });
  }, []);

  useEffect(() => {
    if (initialProductId) {
      setFormData((prev) => ({ ...prev, selectedProductId: initialProductId }));
    }
  }, [initialProductId]);

  const breadcrumbs = [
    { label: t.breadcrumb_quote || (currentLang === 'ru' ? 'Запрос КП' : "Tijorat taklifi so'rovi") }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        alert(currentLang === 'ru' ? 'Размер файла не должен превышать 25 МБ!' : "Fayl hajmi 25 MB dan oshmasligi kerak!");
        return;
      }
      setFileName(file.name);
      onShowToast(
        currentLang === 'ru'
          ? `Файл «${file.name}» прикреплен.`
          : `«${file.name}» biriktirildi.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      StorageService.addQuote(formData);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
      onShowToast(
        t.form_success || (currentLang === 'ru' ? 'Заявка успешно отправлена!' : "So'rovingiz muvaffaqiyatli yuborildi!")
      );
    }, 800);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in">
      <Breadcrumbs currentLang={currentLang} items={breadcrumbs} />

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <FileText className="w-4 h-4" /> {currentLang === 'ru' ? 'Официальный запрос КП (RFQ)' : 'Rasmiy Hujjat va Tijorat Taklifi (RFQ)'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {currentLang === 'ru'
            ? 'Запрос Официального Коммерческого Предложения'
            : currentLang === 'uz_cyrl'
            ? 'Расмий Тижорат Таклифи Сўрови'
            : "Rasmiy Tijorat Taklifi So'rovi"}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {currentLang === 'ru'
            ? 'Подготовим официальное коммерческое предложение с печатью и подписью для отдела закупок или тендерной документации за 15 минут.'
            : currentLang === 'uz_cyrl'
            ? 'Корхонангиз харидлар бўлими ёки тендер комиссияси учун муҳр ва имзо қўйилган расмий нарх таклифи (КП)ни 15 дақиқа ичида шакллантириб юборамиз.'
            : "Korxonangiz xaridlar bo'limi yoki tender komissiyasi uchun muhr va imzo qo'yilgan rasmiy narx taklifi (KP)ni 15 daqiqa ichida shakllantirib yuboramiz."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-gray-900/80 rounded-3xl border border-gray-800 p-6 sm:p-10 shadow-2xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {currentLang === 'ru'
                  ? 'Заявка успешно принята!'
                  : currentLang === 'uz_cyrl'
                  ? 'Сўров муваффақиятли қабул қилинди!'
                  : "So'rov muvaffaqiyatli qabul qilindi!"}
              </h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                {currentLang === 'ru'
                  ? 'На указанную электронную почту и телефон будет направлен расчет стоимости и проект договора.'
                  : currentLang === 'uz_cyrl'
                  ? 'Сиз кўрсатган почта ва телефон рақамига расмий тижорат таклифи (.PDF) ва шартнома лойиҳаси юборилади.'
                  : "Siz ko'rsatgan pochta va telefon raqamiga rasmiy tijorat taklifi (.PDF) va shartnoma loyihasi yuboriladi."}
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      companyName: '',
                      contactPerson: '',
                      phone: '+998 ',
                      email: '',
                      inn: '',
                      selectedProductId: '',
                      quantity: 1,
                      deliveryCity: 'Toshkent',
                      urgent: false,
                      notes: '',
                    });
                    setFileName(null);
                  }}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {currentLang === 'ru' ? 'Отправить новый запрос' : "Yangi so'rov yuborish"}
                </button>
                <Link
                  href="/catalog"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {currentLang === 'ru' ? 'Вернуться в каталог' : 'Katalogga qaytish'}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_company || (currentLang === 'ru' ? 'Наименование компании' : 'Korxona nomi')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder={currentLang === 'ru' ? '«O\'zbekneftgaz» АО или ООО' : '«O\'zbekneftgaz» AJ yoki MChJ'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_inn || (currentLang === 'ru' ? 'ИНН организации' : 'Tashkilot STIR / INN')}
                  </label>
                  <input
                    type="text"
                    value={formData.inn || ''}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                    placeholder={currentLang === 'ru' ? '9 цифр (например: 301234567)' : '9 ta raqam (masalan: 301234567)'}
                    maxLength={9}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_person || (currentLang === 'ru' ? 'Контактное лицо (Ф.И.О.)' : 'Mas’ul shaxs (F.I.Sh)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder={currentLang === 'ru' ? 'Иван Иванов' : 'Ism Familiya'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_phone || (currentLang === 'ru' ? 'Телефон' : 'Telefon')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_email || 'Email'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="xaridlar@kompaniya.uz"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    {t.form_product || (currentLang === 'ru' ? 'Интересующий прибор' : 'Qiziqtirgan uskuna')}
                  </label>
                  <select
                    value={formData.selectedProductId}
                    onChange={(e) => setFormData({ ...formData, selectedProductId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="">
                      {currentLang === 'ru' ? '-- Выберите оборудование или укажите в комментарии --' : '-- Uskunani tanlang yoki izohda yozing --'}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.model} — {getProductName(p, currentLang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {t.form_quantity || (currentLang === 'ru' ? 'Количество (шт)' : 'Miqdori (dona)')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {t.form_notes || (currentLang === 'ru' ? 'Техническое задание или комментарий' : 'Texnik topshiriq yoki izoh')}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={
                    currentLang === 'ru'
                      ? 'Технические требования, требуемые сроки калибровки или дополнительные аксессуары...'
                      : 'Texnik talablar, talab qilinadigan kalibrovka muddati yoki qo‘shimcha aksessuarlar...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:border-blue-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-950 border border-dashed border-gray-800 hover:border-blue-500/50 transition">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-900 text-blue-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {fileName ? fileName : (currentLang === 'ru' ? 'Прикрепить ТЗ или спецификацию' : 'Texnik topshiriq (TZ) yoki spetsifikatsiya biriktirish')}
                      </div>
                      <div className="text-[11px] text-gray-400">PDF, DOCX, XLSX (макс. 25 MB)</div>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <span className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-lg transition">
                    {currentLang === 'ru' ? 'Выбрать' : 'Tanlash'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all text-sm transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? (currentLang === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') : (t.form_submit || (currentLang === 'ru' ? 'Отправить заявку' : 'So‘rovni yuborish'))}</span>
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              {currentLang === 'ru' ? 'Официальная гарантия MAXTRON' : 'MAXTRON Rasmiy Kafolati'}
            </h3>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentLang === 'ru' ? '100% приборов внесены в Госреестр средств измерений' : '100% Davlat metrologiya reestriga kiritilgan uskunalar'}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentLang === 'ru' ? 'Полный комплект документов с учетом НДС (12%)' : 'QQS (NDS 12%) bilan to‘liq shaffof elektron hisob-varaqalar'}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentLang === 'ru' ? 'Официальная гарантия от 12 до 36 месяцев' : '12 oydan 36 oygacha rasmiy servis kafolati'}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentLang === 'ru' ? 'Экспресс-доставка по всему Узбекистану' : 'O‘zbekiston bo‘ylab tezkor yetkazib berish va o‘rnatish'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-1">
              <div className="font-semibold text-gray-200">{currentLang === 'ru' ? 'Прямой контакт:' : 'Tezkor bog‘lanish:'}</div>
              <div>Telefon: +998 (71) 200-88-44</div>
              <div>Email: info@maxtron.uz</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-gray-900 to-cyan-950/40 border border-blue-800/40 space-y-3">
            <div className="text-xs uppercase tracking-wider text-blue-400 font-bold font-mono">
              B2B / Tender
            </div>
            <h4 className="text-base font-bold text-white">
              {currentLang === 'ru' ? 'Тендеры и госзакупки' : 'Tender va Davlat xaridlari'}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentLang === 'ru'
                ? '«MAXTRON Group» LLC является аккредитованным поставщиком на площадках tender.mf.uz, xt-xarid.uz и b2b.uzex.uz.'
                : '«MAXTRON Group» MCHJ tender.mf.uz, xt-xarid.uz va b2b.uzex.uz savdo maydonchalarida ro‘yxatdan o‘tgan rasmiy ta’minotchidir.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};