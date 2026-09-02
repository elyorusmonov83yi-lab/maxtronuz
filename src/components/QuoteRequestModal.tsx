import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Building2, Phone, Mail, FileText, Download, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Language, QuoteRequestData } from '../types';
import { translations } from '../data/translations';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { getProductName } from '../utils/formatters';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: Product | null;
  currentLang: Language;
  onShowToast: (msg: string) => void;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  currentLang,
  onShowToast,
}) => {
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());

  const [formData, setFormData] = useState<QuoteRequestData>({
    companyName: '',
    contactPerson: '',
    phone: '+998 ',
    email: '',
    inn: '',
    selectedProductId: selectedProduct?.id || products[0]?.id || '',
    notes: '',
    quantity: 1,
  });

  const [submitted, setSubmitted] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dinamik mahsulotlarni yuklash va yangilash
  useEffect(() => {
    if (isOpen) {
      ApiService.getProducts()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        })
        .catch(() => {
          setProducts(StorageService.getProducts());
        });

      if (selectedProduct) {
        setFormData((prev) => ({ ...prev, selectedProductId: selectedProduct.id }));
      }
    }
  }, [isOpen, selectedProduct]);

  if (!isOpen) return null;

  const t = translations[currentLang] || {};
  const activeProduct = products.find((p) => p.id === (formData.selectedProductId || selectedProduct?.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedRef = `MX-RFQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setQuoteNumber(generatedRef);
      setIsSubmitting(false);
      setSubmitted(true);

      // Bazaga saqlash va Telegramga jo'natish
      StorageService.addQuote(formData);

      // Confetti effekti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#06b6d4', '#10b981', '#ffffff']
        });
      } catch (err) {
        // Fallback
      }

      onShowToast(
        currentLang === 'ru'
          ? `Заявка принята! Номер документа: ${generatedRef}`
          : currentLang === 'uz_cyrl'
          ? `Сўровингиз қабул қилинди! Ҳужжат рақами: ${generatedRef}`
          : `So'rovingiz qabul qilindi! Hujjat raqami: ${generatedRef}`
      );
    }, 800);
  };

  const handleDownloadDraft = () => {
    onShowToast(
      currentLang === 'ru'
        ? `Проект коммерческого предложения № ${quoteNumber} сформирован.`
        : currentLang === 'uz_cyrl'
        ? `№ ${quoteNumber} тижорий таклиф лойиҳаси юклаб олинди.`
        : `№ ${quoteNumber} tijoriy taklif loyihasi yuklab olindi.`
    );
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={resetForm}
      id="quote-request-modal"
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.contact_form_title || (currentLang === 'ru' ? 'Запрос коммерческого предложения' : 'Tijorat taklifi so‘rash')}
              </h2>
              <p className="text-xs text-gray-400">
                {currentLang === 'ru'
                  ? 'Официальное КП будет подготовлено в течение 15 минут'
                  : currentLang === 'uz_cyrl'
                  ? '15 дақиқа ичида расмий тижорий таклиф тайёрланади'
                  : '15 daqiqa ichida rasmiy tijoriy taklif tayyorlanadi'}
              </p>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
                  {quoteNumber}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {t.form_success || (currentLang === 'ru' ? 'Ваша заявка успешно отправлена!' : 'So‘rovingiz muvaffaqiyatli yuborildi!')}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {currentLang === 'ru'
                    ? 'Наш специалист свяжется с вами по указанному телефону и направит расчет на электронную почту.'
                    : currentLang === 'uz_cyrl'
                    ? 'Мутахассисимиз кўрсатилган телефон рақами ва электрон почта манзилингизга тўлиқ техник паспорт ва расмий нархномани юборади.'
                    : 'Mutaxassisimiz ko‘rsatilgan telefon raqami va elektron pochta manzilingizga to‘liq texnik passport va rasmiy narxnomani yuboradi.'}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Компания:' : 'Korxona:'}</span>
                  <span className="font-semibold text-white">{formData.companyName || '—'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Прибор:' : 'Uskuna:'}</span>
                  <span className="font-semibold text-blue-400">
                    {activeProduct ? `${getProductName(activeProduct, currentLang)} (${activeProduct.model})` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Количество:' : 'Miqdori:'}</span>
                  <span className="font-semibold text-white">{formData.quantity} {currentLang === 'ru' ? 'шт.' : 'dona'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{currentLang === 'ru' ? 'Телефон:' : 'Telefon:'}</span>
                  <span className="font-semibold text-white font-mono">{formData.phone}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleDownloadDraft}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl text-xs border border-gray-700 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{currentLang === 'ru' ? 'Скачать проект КП' : 'KP qoralamasini yuklab olish'}</span>
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{currentLang === 'ru' ? 'Закрыть' : 'Yopish'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {t.form_product || (currentLang === 'ru' ? 'Интересующий прибор' : 'Qiziqtirgan uskuna')}
                </label>
                <select
                  value={formData.selectedProductId}
                  onChange={(e) => setFormData({ ...formData, selectedProductId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.model} — {getProductName(p, currentLang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.form_company || (currentLang === 'ru' ? 'Наименование компании' : 'Korxona nomi')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={currentLang === 'ru' ? 'ООО / АО / Название предприятия' : 'MCHJ / AJ / Korxona nomi'}
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                    />
                    <Building2 className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.form_person || (currentLang === 'ru' ? 'Контактное лицо (Ф.И.О.)' : 'Mas’ul shaxs (F.I.Sh)')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={currentLang === 'ru' ? 'Иван Иванов' : 'Ism Familiya'}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.form_phone || (currentLang === 'ru' ? 'Телефон' : 'Telefon')} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+998 90 123-45-67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition font-mono"
                    />
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.form_email || 'Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="info@company.uz"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.form_quantity || (currentLang === 'ru' ? 'Количество (шт)' : 'Miqdori (dona)')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {t.form_notes || (currentLang === 'ru' ? 'Техническое задание или комментарий' : 'Texnik talablar yoki izoh')}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    currentLang === 'ru'
                      ? 'Технические требования, адрес доставки или особые условия...'
                      : 'Texnik talablar, yetkazib berish manzili yoki shartlar...'
                  }
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? (currentLang === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') : (t.form_submit || (currentLang === 'ru' ? 'Отправить заявку' : 'So‘rovni yuborish'))}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};