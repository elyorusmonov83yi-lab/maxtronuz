"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Check,
  Trash2, 
  Globe, 
  Layers, 
  FileText, 
  Sliders, 
  RefreshCw, 
  Building2, 
  Loader2,
  Tag,
  Paperclip
} from 'lucide-react';
import { Product, CategoryInfo, LocalizedString, ProductSpec, ProductDocument, IndustryInfo, BrandInfo } from '../../types';
import { RichTextEditor } from './sections/RichTextEditor';

import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { getLocalizedText } from '../../utils/formatters';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: CategoryInfo[];
  onSave: (product: Product) => void | Promise<void>;
}

function generateSlug(text: string): string {
  if (!text) return '';
  const cyrillicToLatinMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ў': 'o', 'ғ': 'g', 'қ': 'q', 'ҳ': 'h',
    "o'": 'o', "g'": 'g', "sh": 'sh', "ch": 'ch'
  };

  let str = text.toLowerCase().trim();
  str = str.split('').map(char => cyrillicToLatinMap[char] || char).join('');

  return str
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeLocString(val: any, fallbackStr: string = ''): LocalizedString {
  if (!val) return { uz: fallbackStr, ru: fallbackStr };
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          uz: String(parsed.uz || parsed.ru || fallbackStr),
          ru: String(parsed.ru || parsed.uz || fallbackStr)
        };
      }
    } catch {}
    return { uz: val, ru: val };
  }
  if (typeof val === 'object') {
    const uzVal = val.uz !== undefined && val.uz !== null ? String(val.uz) : (val.ru !== undefined && val.ru !== null ? String(val.ru) : fallbackStr);
    const ruVal = val.ru !== undefined && val.ru !== null ? String(val.ru) : (val.uz !== undefined && val.uz !== null ? String(val.uz) : fallbackStr);
    return { uz: uzVal, ru: ruVal };
  }
  return { uz: String(val), ru: String(val) };
}

function normalizeLocArray(val: any) {
  if (!val) return { uz: [], ru: [] };
  let obj = val;
  if (typeof val === 'string') {
    try { obj = JSON.parse(val); } catch { obj = { uz: [], ru: [] }; }
  }
  return {
    uz: Array.isArray(obj?.uz) ? obj.uz : (Array.isArray(obj?.ru) ? obj.ru : []),
    ru: Array.isArray(obj?.ru) ? obj.ru : (Array.isArray(obj?.uz) ? obj.uz : [])
  };
}

function normalizeSpecs(specsRaw: any): ProductSpec[] {
  if (!specsRaw) return [];
  let arr = specsRaw;
  if (typeof specsRaw === 'string') {
    try { arr = JSON.parse(specsRaw); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];

  return arr
    .map((s: any) => {
      let nameVal = s?.name;
      let valVal = s?.value;

      if (typeof nameVal === 'string' && (nameVal.trim().startsWith('{') || nameVal.trim().startsWith('['))) {
        try { nameVal = JSON.parse(nameVal); } catch {}
      }
      if (typeof valVal === 'string' && (valVal.trim().startsWith('{') || valVal.trim().startsWith('['))) {
        try { valVal = JSON.parse(valVal); } catch {}
      }

      const normalizedName = normalizeLocString(nameVal);
      const normalizedValue = normalizeLocString(valVal);

      return {
        name: normalizedName,
        value: normalizedValue
      };
    })
    .filter(s => s.name.ru.trim() || s.name.uz.trim() || s.value.ru.trim() || s.value.uz.trim());
}

function normalizeDocuments(docsRaw: any): ProductDocument[] {
  if (!docsRaw) return [];
  let arr = docsRaw;
  if (typeof docsRaw === 'string') {
    try { arr = JSON.parse(docsRaw); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];

  return arr.map((d: any, idx: number) => ({
    id: String(d.id || `doc-${Date.now()}-${idx}`),
    title: normalizeLocString(d.title, 'Hujjat'),
    fileUrl: String(d.fileUrl || d.url || ''),
    size: String(d.size || 'PDF'),
    type: String(d.type || 'PDF')
  }));
}

function normalizeIdArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'object' && item !== null ? String(item.id || item.value || '') : String(item)))
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'object' && item !== null ? String(item.id || item.value || '') : String(item)))
          .filter(Boolean);
      }
    } catch {
      if (val.includes(',')) {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [val.trim()].filter(Boolean);
    }
  }
  return [];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories = [],
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'docs' | 'industries' | 'media' | 'seo'>('general');
  const [activeLang, setActiveLang] = useState<'ru' | 'uz'>('ru');
  const [manualSlugs, setManualSlugs] = useState<{ uz: boolean; ru: boolean }>({ uz: false, ru: false });

  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [industriesList, setIndustriesList] = useState<IndustryInfo[]>([]);
  const [brandsList, setBrandsList] = useState<BrandInfo[]>([]);

  // --- TEZKOR KATEGORIYA QO'SHISH STATELARI ---
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatNameRu, setQuickCatNameRu] = useState('');
  const [quickCatNameUz, setQuickCatNameUz] = useState('');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);

  // --- TEZKOR BREND QO'SHISH STATELARI ---
  const [isQuickBrandOpen, setIsQuickBrandOpen] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState('');
  const [quickBrandCountry, setQuickBrandCountry] = useState('');
  const [isSavingQuickBrand, setIsSavingQuickBrand] = useState(false);

  const [quickCatParentId, setQuickCatParentId] = useState<string>('');

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Product & { brandId?: string; documents?: ProductDocument[] }>({
    id: '',
    slug: { uz: '', ru: '' },
    name: { uz: '', ru: '' },
    brandId: '',
    model: '',
    category: '',
    tagline: { uz: '', ru: '' },
    description: { uz: '', ru: '' },
    price: 0,
    oldPrice: 0,
    priceFormatted: { uz: "So'rov bo'yicha", ru: 'По запросу' },
    inStock: true,
    isPopular: false,
    isNew: false,
    image: '',
    additionalImages: [],
    specs: [],
    documents: [],
    pdfCatalogUrl: '',
    features: { uz: [], ru: [] },
    applications: { uz: [], ru: [] },
    standardCert: { uz: 'GOST / O‘zstandart', ru: 'ГОСТ / Узстандарт' },
    warrantyMonths: 12,
    seoTitle: { uz: '', ru: '' },
    seoDescription: { uz: '', ru: '' },
    seoKeywords: { uz: '', ru: '' },
    ogImage: '',
    industries: [],
    tasks: []
  });

  const [featureInput, setFeatureInput] = useState<{ uz: string; ru: string }>({ uz: '', ru: '' });
  const [applicationInput, setApplicationInput] = useState<{ uz: string; ru: string }>({ uz: '', ru: '' });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      ApiService.getIndustries?.()
        .then((data) => setIndustriesList(Array.isArray(data) && data.length > 0 ? data : StorageService.getIndustries()))
        .catch(() => setIndustriesList(StorageService.getIndustries()));

      ApiService.getBrands?.()
        .then((data) => setBrandsList(Array.isArray(data) && data.length > 0 ? data : StorageService.getBrands()))
        .catch(() => setBrandsList(StorageService.getBrands()));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      setManualSlugs({ uz: true, ru: true });

      const parsedName = normalizeLocString(productToEdit.name || (productToEdit as any).title);
      const parsedSlug = normalizeLocString(productToEdit.slug);
      const parsedTagline = normalizeLocString(productToEdit.tagline);
      const parsedDescription = normalizeLocString(productToEdit.description);
      const parsedPriceFmt = normalizeLocString(productToEdit.priceFormatted, 'По запросу');
      const parsedStandardCert = normalizeLocString(productToEdit.standardCert, 'ГОСТ / Узстандарт');

      let rawAddImages = productToEdit.additionalImages || (productToEdit as any).images;
      if (typeof rawAddImages === 'string') {
        try { rawAddImages = JSON.parse(rawAddImages); } catch { rawAddImages = []; }
      }

      const existingIndustries = normalizeIdArray(
        productToEdit.industries ?? (productToEdit as any).industryIds
      );
      const existingTasks = normalizeIdArray(
        productToEdit.tasks ?? (productToEdit as any).industryTaskIds
      );

      const finalRuSlug = parsedSlug.ru || generateSlug(parsedName.ru || productToEdit.model || productToEdit.id);
      const finalUzSlug = parsedSlug.uz || generateSlug(parsedName.uz || parsedName.ru || productToEdit.id);
      const existingBrandId = (productToEdit as any).brandId || (productToEdit as any).brand || (productToEdit as any).brand_id || '';

      setFormData({
        ...productToEdit,
        id: productToEdit.id,
        slug: { uz: finalUzSlug, ru: finalRuSlug },
        name: parsedName,
        brandId: existingBrandId,
        model: productToEdit.model || (productToEdit as any).code || '',
        category: productToEdit.category || (productToEdit as any).categoryId || (categories[0]?.id || ''),
        tagline: parsedTagline,
        description: parsedDescription,
        price: Number(productToEdit.price) || 0,
        oldPrice: Number(productToEdit.oldPrice) || 0,
        priceFormatted: parsedPriceFmt,
        inStock: Boolean(productToEdit.inStock ?? (productToEdit as any).isActive ?? true),
        isPopular: Boolean(productToEdit.isPopular),
        isNew: Boolean(productToEdit.isNew),
        image: productToEdit.image || (productToEdit as any).imageUrl || '',
        additionalImages: Array.isArray(rawAddImages) ? rawAddImages : [],
        specs: normalizeSpecs(productToEdit.specs),
        documents: normalizeDocuments(productToEdit.documents),
        pdfCatalogUrl: productToEdit.pdfCatalogUrl || '',
        features: normalizeLocArray(productToEdit.features),
        applications: normalizeLocArray(productToEdit.applications),
        standardCert: parsedStandardCert,
        warrantyMonths: Number(productToEdit.warrantyMonths) || 12,
        seoTitle: normalizeLocString(productToEdit.seoTitle),
        seoDescription: normalizeLocString(productToEdit.seoDescription),
        seoKeywords: normalizeLocString(productToEdit.seoKeywords),
        ogImage: productToEdit.ogImage || productToEdit.image || '',
        industries: existingIndustries,
        tasks: existingTasks
      });
    } else {
      setManualSlugs({ uz: false, ru: false });
      const newAutoId = `mx-${Date.now().toString().slice(-6)}`;

      setFormData({
        id: newAutoId,
        slug: { uz: '', ru: '' },
        name: { uz: '', ru: '' },
        brandId: '',
        model: '',
        category: categories[0]?.id || 'sensors',
        tagline: { uz: '', ru: '' },
        description: { uz: '', ru: '' },
        price: 0,
        oldPrice: 0,
        priceFormatted: { uz: "So'rov bo'yicha", ru: 'По запросу' },
        inStock: true,
        isPopular: false,
        isNew: true,
        image: '',
        additionalImages: [],
        specs: [],
        documents: [],
        pdfCatalogUrl: '',
        features: { uz: [], ru: [] },
        applications: { uz: [], ru: [] },
        standardCert: { uz: 'GOST / O‘zstandart', ru: 'ГОСТ / Узстандарт' },
        warrantyMonths: 12,
        seoTitle: { uz: '', ru: '' },
        seoDescription: { uz: '', ru: '' },
        seoKeywords: { uz: '', ru: '' },
        ogImage: '',
        industries: [],
        tasks: []
      });
    }

    setActiveTab('general');
    setActiveLang('ru');
    setFeatureInput({ uz: '', ru: '' });
    setApplicationInput({ uz: '', ru: '' });
  }, [isOpen, productToEdit, categories]);

  // AI BILAN TO'LDIRISH HANDLERI (YANGI VA MAVJUD TOVARLAR UCHUN 2 TILLI)
  const handleAiAutoFill = async () => {
    if (!formData.model?.trim()) {
      alert(activeLang === 'ru' ? 'Сначала введите артикул или модель оборудования!' : 'Avval uskuna modeli yoki artikulini kiriting!');
      return;
    }

    const targetId = formData.id || `mx-${Date.now().toString().slice(-6)}`;

    setIsAiLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
      
      const res = await fetch(`/api/admin/products/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          model: formData.model.trim(),
          brandId: formData.brandId || '',
          category: formData.category,
          name: formData.name,
          description: formData.description
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API xatosi:", res.status, errorText);
        throw new Error(`Server xatolik qaytardi (${res.status})`);
      }

      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || result.message || 'AI maʼlumot qaytarmadi');
      }

      const updated = result.data;

      // Xarakteristikalarni to'g'ri ajratib olish (specs yoki specifications bo'lishi mumkin)
      const incomingSpecs = updated.specs || updated.specifications || [];
      const parsedSpecs = normalizeSpecs(incomingSpecs);

      setFormData(prev => {
        const newNameRu = updated.name?.ru || (prev.name as LocalizedString)?.ru || formData.model;
        const newNameUz = updated.name?.uz || (prev.name as LocalizedString)?.uz || formData.model;

        return {
          ...prev,
          id: prev.id || targetId,
          name: {
            ru: newNameRu,
            uz: newNameUz
          },
          slug: {
            ru: prev.slug?.ru || `${generateSlug(newNameRu)}-${generateSlug(formData.model)}`,
            uz: prev.slug?.uz || `${generateSlug(newNameUz)}-${generateSlug(formData.model)}`
          },
          tagline: {
            ru: updated.tagline?.ru || (prev.tagline as LocalizedString)?.ru || '',
            uz: updated.tagline?.uz || (prev.tagline as LocalizedString)?.uz || ''
          },
          description: {
            ru: updated.description?.ru || (prev.description as LocalizedString)?.ru || '',
            uz: updated.description?.uz || (prev.description as LocalizedString)?.uz || ''
          },
          standardCert: {
            ru: updated.standardCert?.ru || 'ГОСТ',
            uz: updated.standardCert?.uz || 'GOST'
          },
          // Agar AI yangi xarakteristikalar qaytargan bo'lsa yangilanadi, aks holda oldingisi qoladi:
          specs: parsedSpecs.length > 0 ? parsedSpecs : prev.specs,
          features: {
            ru: Array.isArray(updated.features?.ru) ? updated.features.ru : (prev.features?.ru || []),
            uz: Array.isArray(updated.features?.uz) ? updated.features.uz : (prev.features?.uz || [])
          },
          applications: {
            ru: Array.isArray(updated.applications?.ru) ? updated.applications.ru : (prev.applications?.ru || []),
            uz: Array.isArray(updated.applications?.uz) ? updated.applications.uz : (prev.applications?.uz || [])
          },
          seoTitle: {
            ru: updated.seoTitle?.ru || '',
            uz: updated.seoTitle?.uz || ''
          },
          seoDescription: {
            ru: updated.seoDescription?.ru || '',
            uz: updated.seoDescription?.uz || ''
          },
          seoKeywords: {
            ru: updated.seoKeywords?.ru || '',
            uz: updated.seoKeywords?.uz || ''
          }
        };
      });

      // Agar xarakteristikalar muvaffaqiyatli kelgan bo'lsa, foydalanuvchini to'g'ridan-to'g'ri 'specs' tabiga o'tkazish
      if (parsedSpecs.length > 0) {
        setActiveTab('specs');
      }

      alert(activeLang === 'ru' 
        ? `✨ Сгенерировано: ${parsedSpecs.length} характеристик, описание и SEO на двух языках!` 
        : `✨ 2 tilda muvaffaqiyatli yaratildi: ${parsedSpecs.length} ta xarakteristika, tavsif va SEO!`
      );
    } catch (err: any) {
      alert(`AI xatolik: ${err.message || 'Server xatosi'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Tezkor Kategoriya saqlash
  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatNameRu.trim() && !quickCatNameUz.trim()) return;

    try {
      setIsSavingQuickCat(true);
      const catId = `cat-${Date.now()}`;
      const newCat: any = {
        id: catId,
        parentId: quickCatParentId || null,
        name: {
          ru: quickCatNameRu.trim() || quickCatNameUz.trim(),
          uz: quickCatNameUz.trim() || quickCatNameRu.trim()
        },
        slug: {
          ru: (quickCatNameRu.trim() || catId).toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-'),
          uz: (quickCatNameUz.trim() || catId).toLowerCase().replace(/[^a-z0-9]/gi, '-')
        },
        icon: 'Layers',
        description: { ru: '', uz: '' }
      };

      await ApiService.saveCategory(newCat);
      categories.push(newCat);
      setFormData(prev => ({ ...prev, category: catId }));
      setQuickCatNameRu('');
      setQuickCatNameUz('');
      setQuickCatParentId('');
      setIsQuickCatOpen(false);
    } catch (err: any) {
      alert(`Kategoriya qo'shishda xatolik: ${err.message || 'Server xatosi'}`);
    } finally {
      setIsSavingQuickCat(false);
    }
  };

  // Tezkor Brend saqlash
  const handleQuickAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBrandName.trim()) return;

    try {
      setIsSavingQuickBrand(true);
      const brandId = `brand-${Date.now()}`;
      const newBrand: BrandInfo = {
        id: brandId,
        name: quickBrandName.trim(),
        slug: quickBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        country: quickBrandCountry.trim(),
        website: '',
        logo: '',
        isActive: true
      };

      await ApiService.saveBrand(newBrand);
      setBrandsList(prev => [...prev, newBrand]);
      setFormData(prev => ({ ...prev, brandId }));
      setQuickBrandName('');
      setQuickBrandCountry('');
      setIsQuickBrandOpen(false);
    } catch (err: any) {
      alert(`Brend qo'shishda xatolik: ${err.message || 'Server xatosi'}`);
    } finally {
      setIsSavingQuickBrand(false);
    }
  };

  const handleNameChange = (lang: 'uz' | 'ru', value: string) => {
    const updatedName = { ...(formData.name as LocalizedString), [lang]: value };
    const updatedSlug = { ...(formData.slug || { uz: '', ru: '' }) };

    if (!productToEdit && !manualSlugs[lang]) {
      const modelPart = formData.model ? `-${generateSlug(formData.model)}` : '';
      updatedSlug[lang] = `${generateSlug(value)}${modelPart}`;
    }

    setFormData(prev => ({
      ...prev,
      name: updatedName,
      slug: updatedSlug
    }));
  };

  const handleModelChange = (modelVal: string) => {
    const updatedSlug = { ...(formData.slug || { uz: '', ru: '' }) };
    const nameObj = formData.name as LocalizedString;

    if (!productToEdit) {
      if (!manualSlugs.ru && nameObj.ru) {
        updatedSlug.ru = `${generateSlug(nameObj.ru)}-${generateSlug(modelVal)}`;
      }
      if (!manualSlugs.uz && nameObj.uz) {
        updatedSlug.uz = `${generateSlug(nameObj.uz)}-${generateSlug(modelVal)}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      model: modelVal,
      slug: updatedSlug
    }));
  };

  const regenerateSlug = (lang: 'uz' | 'ru') => {
    const nameObj = formData.name as LocalizedString;
    const baseText = nameObj[lang] || nameObj.ru || nameObj.uz || formData.model || formData.id;
    const modelPart = formData.model && !baseText.toLowerCase().includes(formData.model.toLowerCase()) 
      ? `-${generateSlug(formData.model)}` 
      : '';
    const newSlug = `${generateSlug(baseText)}${modelPart}`;

    setFormData(prev => ({
      ...prev,
      slug: {
        ...(prev.slug || { uz: '', ru: '' }),
        [lang]: newSlug
      }
    }));
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("Rasm hajmi 20 MB dan oshmasligi kerak!");
      return;
    }

    setIsUploadingMain(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: bodyData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ 
          ...prev, 
          image: data.url, 
          imageUrl: data.url, 
          ogImage: prev.ogImage || data.url 
        }));
      } else {
        alert(data.message || 'Rasm yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Serverga rasm yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingMain(false);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAdditional(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bodyData = new FormData();
        bodyData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: bodyData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...(prev.additionalImages || []), ...uploadedUrls]
        }));
      }
    } catch (err) {
      console.error('Additional images upload error:', err);
      alert('Qo‘shimcha rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingAdditional(false);
      if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
    }
  };

  // Specs boshqaruvi
  const addSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [
        ...(prev.specs || []),
        { name: { uz: '', ru: '' }, value: { uz: '', ru: '' } }
      ]
    }));
  };

  const updateSpec = (index: number, field: 'name' | 'value', val: string) => {
    setFormData(prev => {
      const newSpecs = [...(prev.specs || [])];
      const currentSpec = newSpecs[index] || { name: { uz: '', ru: '' }, value: { uz: '', ru: '' } };
      
      const currentFieldVal = typeof currentSpec[field] === 'object'
        ? currentSpec[field]
        : { uz: currentSpec[field] || '', ru: currentSpec[field] || '' };

      newSpecs[index] = {
        ...currentSpec,
        [field]: {
          ...currentFieldVal,
          [activeLang]: val
        }
      };
      return { ...prev, specs: newSpecs };
    });
  };

  const removeSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: (prev.specs || []).filter((_, i) => i !== index)
    }));
  };

  // Features boshqaruvi
  const addFeature = () => {
    const val = featureInput[activeLang]?.trim();
    if (!val) return;
    setFormData(prev => {
      const currentList = Array.isArray(prev.features?.[activeLang]) ? prev.features[activeLang] : [];
      return {
        ...prev,
        features: {
          ...prev.features,
          [activeLang]: [...currentList, val]
        }
      };
    });
    setFeatureInput(prev => ({ ...prev, [activeLang]: '' }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => {
      const currentList = Array.isArray(prev.features?.[activeLang]) ? prev.features[activeLang] : [];
      return {
        ...prev,
        features: {
          ...prev.features,
          [activeLang]: currentList.filter((_, i) => i !== index)
        }
      };
    });
  };

  // Applications boshqaruvi
  const addApplication = () => {
    const val = applicationInput[activeLang]?.trim();
    if (!val) return;
    setFormData(prev => {
      const currentList = Array.isArray(prev.applications?.[activeLang]) ? prev.applications[activeLang] : [];
      return {
        ...prev,
        applications: {
          ...prev.applications,
          [activeLang]: [...currentList, val]
        }
      };
    });
    setApplicationInput(prev => ({ ...prev, [activeLang]: '' }));
  };

  const removeApplication = (index: number) => {
    setFormData(prev => {
      const currentList = Array.isArray(prev.applications?.[activeLang]) ? prev.applications[activeLang] : [];
      return {
        ...prev,
        applications: {
          ...prev.applications,
          [activeLang]: currentList.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameObj = formData.name as LocalizedString;
    if (!nameObj.ru?.trim() && !nameObj.uz?.trim()) {
      alert("Iltimos, mahsulot nomini kamida rus yoki o'zbek tilida kiriting!");
      return;
    }

    const finalRuSlug = formData.slug?.ru?.trim() 
      ? generateSlug(formData.slug.ru) 
      : generateSlug(nameObj.ru || formData.model || formData.id);
      
    const finalUzSlug = formData.slug?.uz?.trim() 
      ? generateSlug(formData.slug.uz) 
      : generateSlug(nameObj.uz || finalRuSlug);

    const standardCertObj = typeof formData.standardCert === 'object' 
      ? formData.standardCert 
      : { uz: formData.standardCert || '', ru: formData.standardCert || '' };

    const cleanIndustries = normalizeIdArray(formData.industries);
    const cleanTasks = normalizeIdArray(formData.tasks);

    const finalProduct: any = {
      ...formData,
      id: productToEdit?.id || formData.id || `mx-${Date.now().toString().slice(-6)}`,
      slug: {
        ru: finalRuSlug,
        uz: finalUzSlug
      },
      name: {
        ru: nameObj.ru?.trim() || nameObj.uz?.trim() || '',
        uz: nameObj.uz?.trim() || nameObj.ru?.trim() || ''
      },
      brandId: formData.brandId ? formData.brandId : null,
      brand_id: formData.brandId ? formData.brandId : null,
      model: (formData.model || '').trim(),
      tagline: {
        ru: (formData.tagline as LocalizedString).ru?.trim() || '',
        uz: (formData.tagline as LocalizedString).uz?.trim() || ''
      },
      description: {
        ru: (formData.description as LocalizedString).ru?.trim() || '',
        uz: (formData.description as LocalizedString).uz?.trim() || ''
      },
      priceFormatted: {
        ru: (formData.priceFormatted as LocalizedString).ru?.trim() || 'По запросу',
        uz: (formData.priceFormatted as LocalizedString).uz?.trim() || "So'rov bo'yicha"
      },
      standardCert: {
        ru: standardCertObj.ru?.trim() || '',
        uz: standardCertObj.uz?.trim() || ''
      },
      specs: (formData.specs || []).map(s => ({
        name: {
          ru: typeof s.name === 'object' ? (s.name.ru || s.name.uz || '') : (s.name || ''),
          uz: typeof s.name === 'object' ? (s.name.uz || s.name.ru || '') : (s.name || '')
        },
        value: {
          ru: typeof s.value === 'object' ? (s.value.ru || s.value.uz || '') : (s.value || ''),
          uz: typeof s.value === 'object' ? (s.value.uz || s.value.ru || '') : (s.value || '')
        }
      })),
      documents: (formData.documents || []).map(d => ({
        id: d.id,
        title: {
          ru: typeof d.title === 'object' ? (d.title.ru || d.title.uz || '') : (d.title || ''),
          uz: typeof d.title === 'object' ? (d.title.uz || d.title.ru || '') : (d.title || '')
        },
        fileUrl: (d.fileUrl || '').trim(),
        size: (d.size || 'PDF').trim(),
        type: (d.type || 'PDF').trim()
      })),
      pdfCatalogUrl: formData.pdfCatalogUrl || '',
      seoTitle: {
        ru: (formData.seoTitle as LocalizedString).ru?.trim() || nameObj.ru || '',
        uz: (formData.seoTitle as LocalizedString).uz?.trim() || nameObj.uz || ''
      },
      seoDescription: {
        ru: (formData.seoDescription as LocalizedString).ru?.trim() || '',
        uz: (formData.seoDescription as LocalizedString).uz?.trim() || ''
      },
      seoKeywords: {
        ru: (formData.seoKeywords as LocalizedString).ru?.trim() || '',
        uz: (formData.seoKeywords as LocalizedString).uz?.trim() || ''
      },
      ogImage: formData.ogImage || formData.image,
      image: formData.image || '',
      imageUrl: formData.image || '',
      additionalImages: formData.additionalImages || [],
      images: formData.additionalImages || [],
      industries: cleanIndustries,
      tasks: cleanTasks,
      industryIds: cleanIndustries,
      industryTaskIds: cleanTasks
    };

    if (typeof onSave === 'function') {
      onSave(finalProduct);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {productToEdit ? (activeLang === 'ru' ? 'Редактировать товар' : 'Mahsulotni tahrirlash') : (activeLang === 'ru' ? 'Добавить новый товар' : 'Yangi mahsulot qo‘shish')}
              </h2>
              <p className="text-xs text-gray-400">
                {productToEdit ? `ID: ${productToEdit.id}` : (activeLang === 'ru' ? 'Двуязычный каталог КИПиА и приборов' : 'Ikki tilli o‘lchov uskunalari katalogi')}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="px-6 border-b border-gray-800 bg-gray-900/90 flex gap-2 py-2 shrink-0 overflow-x-auto">
          {[
            { id: 'general', label: activeLang === 'ru' ? 'Основная информация' : 'Asosiy ma’lumotlar', icon: FileText },
            { id: 'specs', label: activeLang === 'ru' ? 'Характеристики и Функции' : 'Xarakteristika va Funksiyalar', icon: Sliders },
            { id: 'docs', label: activeLang === 'ru' ? 'Документы и Файлы' : 'Hujjatlar va Fayllar', icon: Paperclip },
            { id: 'industries', label: activeLang === 'ru' ? 'Отрасли и Задачи' : 'Sohalar va Vazifalar', icon: Building2 },
            { id: 'media', label: activeLang === 'ru' ? 'Фото и Медиа' : 'Rasm va Media', icon: ImageIcon },
            { id: 'seo', label: activeLang === 'ru' ? 'SEO & Метатеги' : 'SEO & Metateglar', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'specs' && (formData.specs || []).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] text-white">
                    {(formData.specs || []).length}
                  </span>
                )}
                {tab.id === 'docs' && (formData.documents || []).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] text-white">
                    {(formData.documents || []).length}
                  </span>
                )}
                {tab.id === 'industries' && (formData.industries || []).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-[10px] text-white">
                    {(formData.industries || []).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Language Switcher */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
                {[
                  { code: 'ru' as const, label: '🇷🇺 Русский' },
                  { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeLang === lang.code
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* 1. Category */}
                <div className="sm:col-span-4 space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">
                      {activeLang === 'ru' ? 'Категория оборудования *' : 'Uskuna toifasi *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickCatOpen(!isQuickCatOpen);
                        setIsQuickBrandOpen(false);
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{activeLang === 'ru' ? 'Новая' : 'Yangi'}</span>
                    </button>
                  </div>

                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {typeof c.name === 'object' ? (c.name[activeLang] || c.name.ru || c.name.uz) : c.name}
                      </option>
                    ))}
                  </select>

                  {/* Kategoriya tezkor qo'shish popover */}
                  {isQuickCatOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 p-3.5 rounded-2xl bg-gray-900 border border-emerald-500/50 shadow-2xl z-30 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                        <span className="text-[11px] font-bold text-emerald-400">
                          {activeLang === 'ru' ? 'Быстрое добавление категории' : 'Tezkor kategoriya qo‘shish'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsQuickCatOpen(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          {activeLang === 'ru' ? 'Родительская категория (необязательно)' : 'Ota kategoriya (ixtiyoriy)'}
                        </label>
                        <select
                          value={quickCatParentId}
                          onChange={(e) => setQuickCatParentId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">
                            {activeLang === 'ru' ? '— Без родителя (Главная категория) —' : '— Ota kategoriyasiz (Asosiy toifa) —'}
                          </option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {typeof c.name === 'object' ? (c.name[activeLang] || c.name.ru || c.name.uz) : c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Nomi (RU) — masalan: Датчики давления"
                        value={quickCatNameRu}
                        onChange={(e) => setQuickCatNameRu(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500"
                      />

                      <input
                        type="text"
                        placeholder="Nomi (UZ) — masalan: Bosim datchiklari"
                        value={quickCatNameUz}
                        onChange={(e) => setQuickCatNameUz(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-emerald-500"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleQuickAddCategory}
                          disabled={isSavingQuickCat || (!quickCatNameRu.trim() && !quickCatNameUz.trim())}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingQuickCat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>{activeLang === 'ru' ? 'Создать' : 'Qo‘shish'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Brand */}
                <div className="sm:col-span-4 space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span>{activeLang === 'ru' ? 'Бренд / Производитель' : 'Brend / Ishlab chiqaruvchi'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickBrandOpen(!isQuickBrandOpen);
                        setIsQuickCatOpen(false);
                      }}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{activeLang === 'ru' ? 'Новый' : 'Yangi'}</span>
                    </button>
                  </div>

                  <select
                    value={formData.brandId || ''}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="" className="text-gray-400">
                      {activeLang === 'ru' ? '— Без бренда (Универсальный) —' : '— Brend ko‘rsatilmagan (Universal) —'}
                    </option>
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.country ? `(${b.country})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Brend tezkor qo'shish popover */}
                  {isQuickBrandOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 p-3.5 rounded-2xl bg-gray-900 border border-blue-500/50 shadow-2xl z-30 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
                        <span className="text-[11px] font-bold text-blue-400">
                          {activeLang === 'ru' ? 'Быстрое добавление бренда' : 'Tezkor brend qo‘shish'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsQuickBrandOpen(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Brend nomi (masalan: WIKA)"
                        value={quickBrandName}
                        onChange={(e) => setQuickBrandName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-blue-500 font-bold"
                      />

                      <input
                        type="text"
                        placeholder="Davlat (masalan: Germaniya)"
                        value={quickBrandCountry}
                        onChange={(e) => setQuickBrandCountry(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleQuickAddBrand}
                          disabled={isSavingQuickBrand || !quickBrandName.trim()}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingQuickBrand ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>{activeLang === 'ru' ? 'Создать' : 'Qo‘shish'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Model va AI bilan to'ldirish tugmasi */}
                <div className="sm:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">
                      {activeLang === 'ru' ? 'Модель / Артикул *' : 'Model / Artikul *'}
                    </label>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isAiLoading || !formData.model?.trim()}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
                    >
                      {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{isAiLoading ? 'AI ishlamoqda...' : '✨ AI bilan to‘ldirish'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Masalan: DMP 330L / MX-400"
                      value={formData.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition pr-8"
                    />
                  </div>
                </div>

                {/* Localized Name */}
                <div className="sm:col-span-12 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Название товара (RU) *' : 'Mahsulot nomi (UZ) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeLang === 'ru' ? 'Прецизионный датчик давления' : 'Yuqori aniqlikdagi bosim datchigi'}
                    value={(formData.name as LocalizedString)[activeLang] || ''}
                    onChange={(e) => handleNameChange(activeLang, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Dual Slugs */}
                <div className="sm:col-span-12 p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>URL Slug ({activeLang.toUpperCase()})</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => regenerateSlug(activeLang)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{activeLang === 'ru' ? 'Авто-генерация' : 'Avto-generatsiya'}</span>
                      </button>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        /product/{formData.slug?.[activeLang] || 'slug'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={activeLang === 'ru' ? 'datchik-davleniya-dmp-330' : 'bosim-datchigi-dmp-330'}
                    value={formData.slug?.[activeLang] || ''}
                    onChange={(e) => {
                      setManualSlugs({ ...manualSlugs, [activeLang]: true });
                      setFormData({
                        ...formData,
                        slug: {
                          ...(formData.slug || { uz: '', ru: '' }),
                          [activeLang]: generateSlug(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-blue-400 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-12 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Краткий слоган / Подзаголовок (RU)' : 'Qisqa shior / Taglavha (UZ)'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? 'Промышленный стандарт для тяжелых условий' : 'Og‘ir sanoat sharoitlari uchun standart'}
                    value={(formData.tagline as LocalizedString)[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tagline: { ...(formData.tagline as LocalizedString), [activeLang]: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Price and Status Controls */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Цена в тексте (RU)' : 'Matndagi narx (UZ)'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? 'По запросу' : "So'rov bo'yicha"}
                    value={(formData.priceFormatted as LocalizedString)[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceFormatted: { ...(formData.priceFormatted as LocalizedString), [activeLang]: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Гарантия (в месяцах)' : 'Kafolat (oyda)'}
                  </label>
                  <input
                    type="number"
                    value={formData.warrantyMonths || 12}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Сертификация / Стандарт (RU)' : 'Standart / Sertifikat (UZ)'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? 'ГОСТ / Узстандарт' : 'GOST / O‘zstandart'}
                    value={typeof formData.standardCert === 'object' ? (formData.standardCert[activeLang] || '') : (formData.standardCert || '')}
                    onChange={(e) => {
                      const currentCert = typeof formData.standardCert === 'object' 
                        ? formData.standardCert 
                        : { uz: formData.standardCert || '', ru: formData.standardCert || '' };
                      setFormData({
                        ...formData,
                        standardCert: { ...currentCert, [activeLang]: e.target.value }
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Checkboxes */}
                <div className="sm:col-span-12 flex flex-wrap gap-6 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{activeLang === 'ru' ? 'В наличии на складе в Ташкенте' : 'Toshkent omborida mavjud'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{activeLang === 'ru' ? 'Хит продаж' : 'Ommabop mahsulot'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{activeLang === 'ru' ? 'Новинка' : 'Yangi uskuna'}</span>
                  </label>
                </div>

                {/* RichText Description */}
                <div className="sm:col-span-12 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Подробное описание (RU)' : 'Batafsil tavsif (UZ)'}
                  </label>
                  <RichTextEditor
                    value={(formData.description as LocalizedString)[activeLang] || ''}
                    onChange={(content) =>
                      setFormData({
                        ...formData,
                        description: { ...(formData.description as LocalizedString), [activeLang]: content }
                      })
                    }
                    placeholder={
                      activeLang === 'ru'
                        ? 'Техническое описание прибора, принцип работы, совместимость...'
                        : "Uskunaning texnik tavsifi, ishlash prinsipi va xususiyatlari..."
                    }
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SPECS & FEATURES */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-xs font-semibold text-gray-300">
                  {activeLang === 'ru' ? 'Язык редактирования:' : 'Tahrirlash tili:'}
                </span>
                <div className="flex gap-2">
                  {[
                    { code: 'ru' as const, label: '🇷🇺 Русский' },
                    { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        activeLang === lang.code
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white bg-gray-900'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>{activeLang === 'ru' ? 'Технические характеристики' : 'Texnik xarakteristikalar'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600/20 text-blue-400 font-mono">
                        {(formData.specs || []).length} ta
                      </span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{activeLang === 'ru' ? 'Добавить параметр' : "Parametr qo'shish"}</span>
                  </button>
                </div>

                {(formData.specs || []).length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    {activeLang === 'ru' 
                      ? 'Характеристики пока не добавлены.' 
                      : "Xarakteristikalar hali qo'shilmadi."}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(formData.specs || []).map((spec, idx) => {
                      const specName = typeof spec.name === 'object' 
                        ? (spec.name[activeLang] || spec.name.ru || spec.name.uz || '') 
                        : (spec.name || '');
                      const specVal = typeof spec.value === 'object' 
                        ? (spec.value[activeLang] || spec.value.ru || spec.value.uz || '') 
                        : (spec.value || '');

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={activeLang === 'ru' ? "Параметр" : "Parametr"}
                            value={specName}
                            onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                          />
                          <input
                            type="text"
                            placeholder={activeLang === 'ru' ? "Значение" : "Qiymat"}
                            value={specVal}
                            onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeLang === 'ru' ? 'Ключевые преимущества' : 'Asosiy afzalliklar / Xususiyatlar'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? "Например: Высокая виброустойчивость..." : "Masalan: Yuqori vibratsiyaga chidamlilik..."}
                    value={featureInput[activeLang] || ''}
                    onChange={(e) => setFeatureInput({ ...featureInput, [activeLang]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {activeLang === 'ru' ? 'Добавить' : "Qo'shish"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(formData.features?.[activeLang] || []).map((feat, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs flex items-center gap-2">
                      <span>{feat}</span>
                      <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-rose-400 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeLang === 'ru' ? 'Области применения' : 'Qo‘llanish sohalari'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={activeLang === 'ru' ? "Например: Нефтегазовая промышленность..." : "Masalan: Neft-gaz sanoati..."}
                    value={applicationInput[activeLang] || ''}
                    onChange={(e) => setApplicationInput({ ...applicationInput, [activeLang]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={addApplication}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {activeLang === 'ru' ? 'Добавить' : "Qo'shish"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(formData.applications?.[activeLang] || []).map((app, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs flex items-center gap-2">
                      <span>{app}</span>
                      <button type="button" onClick={() => removeApplication(i)} className="text-gray-400 hover:text-rose-400 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DOCUMENTS & PASSPORTS */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Til tanlovi */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-xs font-semibold text-gray-300">
                  {activeLang === 'ru' ? 'Язык названий документов:' : 'Hujjat nomlari tili:'}
                </span>
                <div className="flex gap-2">
                  {[
                    { code: 'ru' as const, label: '🇷🇺 Русский' },
                    { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        activeLang === lang.code
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white bg-gray-900'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hujjatlar ro'yxati */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                      <span>{activeLang === 'ru' ? 'Техническая документация (PDF)' : 'Texnik hujjatlar (PDF)'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600/20 text-blue-400 font-mono">
                        {(formData.documents || []).length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {activeLang === 'ru' 
                        ? 'Паспорта, руководства и сертификаты загружаются напрямую в Cloudflare R2' 
                        : 'Pasport, qo‘llanma va sertifikatlar to‘g‘ridan-to‘g‘ri Cloudflare R2 ga yuklanadi'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newDoc: ProductDocument = {
                        id: `doc-${Date.now()}`,
                        title: { 
                          uz: activeLang === 'uz' ? 'Texnik pasport' : '', 
                          ru: activeLang === 'ru' ? 'Технический паспорт' : '' 
                        },
                        fileUrl: '',
                        size: 'PDF',
                        type: 'PDF'
                      };
                      setFormData(prev => ({
                        ...prev,
                        documents: [...(prev.documents || []), newDoc]
                      }));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{activeLang === 'ru' ? 'Добавить документ' : 'Hujjat qo‘shish'}</span>
                  </button>
                </div>

                {(!formData.documents || formData.documents.length === 0) ? (
                  <div className="text-center py-8 text-gray-500 text-xs space-y-1">
                    <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                    <p>{activeLang === 'ru' ? 'Документы пока не прикреплены.' : 'Hujjatlar hali biriktirilmagan.'}</p>
                    <p className="text-[10px] text-gray-600">
                      {activeLang === 'ru' 
                        ? 'Нажмите «Добавить документ» и загрузите PDF-файл прямо с компьютера.' 
                        : '«Hujjat qo‘shish» tugmasini bosib, PDF faylni kompyuterdan to‘g‘ridan-to‘g‘ri yuklang.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(formData.documents || []).map((doc, idx) => {
                      const docTitle = typeof doc.title === 'object' ? (doc.title[activeLang] || '') : (doc.title || '');

                      return (
                        <div key={doc.id || idx} className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-blue-400 font-bold">
                              #{idx + 1} {doc.title ? (typeof doc.title === 'object' ? (doc.title.ru || doc.title.uz) : doc.title) : 'Hujjat'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  documents: (prev.documents || []).filter((_, i) => i !== idx)
                                }));
                              }}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] font-semibold text-gray-400">
                                {activeLang === 'ru' ? `Название (${activeLang.toUpperCase()}) *` : `Hujjat nomi (${activeLang.toUpperCase()}) *`}
                              </label>
                              <input
                                type="text"
                                placeholder={activeLang === 'ru' ? 'Технический паспорт' : 'Texnik pasport'}
                                value={docTitle}
                                onChange={(e) => {
                                  const updatedDocs = [...(formData.documents || [])];
                                  const curTitle = typeof updatedDocs[idx].title === 'object' 
                                    ? updatedDocs[idx].title 
                                    : { uz: updatedDocs[idx].title || '', ru: updatedDocs[idx].title || '' };
                                  
                                  updatedDocs[idx] = {
                                    ...updatedDocs[idx],
                                    title: { ...curTitle, [activeLang]: e.target.value }
                                  };
                                  setFormData({ ...formData, documents: updatedDocs });
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                              />
                            </div>

                            <div className="sm:col-span-5 space-y-1">
                              <label className="text-[10px] font-semibold text-gray-400 flex items-center justify-between">
                                <span>{activeLang === 'ru' ? 'Файл (Cloudflare R2)' : 'Fayl (Cloudflare R2)'}</span>
                                {doc.fileUrl && (
                                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-[10px] font-mono truncate max-w-[150px]">
                                    {doc.fileUrl.split('/').pop()}
                                  </a>
                                )}
                              </label>

                              <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer">
                                  <div className="px-3 py-2 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 flex items-center justify-center gap-1.5 transition">
                                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{doc.fileUrl ? (activeLang === 'ru' ? 'Заменить PDF' : 'Faylni almashtirish') : (activeLang === 'ru' ? 'Выбрать PDF' : 'PDF tanlash')}</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".pdf,.docx,.xlsx"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
                                      const bodyData = new FormData();
                                      bodyData.append('file', file);

                                      try {
                                        const res = await fetch('/api/admin/upload', {
                                          method: 'POST',
                                          headers: {
                                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                                          },
                                          body: bodyData,
                                        });

                                        const data = await res.json();
                                        if (data.success && data.url) {
                                          const updatedDocs = [...(formData.documents || [])];
                                          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
                                          updatedDocs[idx] = {
                                            ...updatedDocs[idx],
                                            fileUrl: data.url,
                                            size: `${fileSizeMB} MB`,
                                            type: file.name.split('.').pop()?.toUpperCase() || 'PDF'
                                          };
                                          setFormData({ ...formData, documents: updatedDocs });
                                        } else {
                                          alert(data.message || 'Fayl yuklashda xatolik yuz berdi');
                                        }
                                      } catch (err: any) {
                                        alert('R2 ga yuklashda xatolik: ' + err.message);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-[10px] font-semibold text-gray-400">
                                {activeLang === 'ru' ? 'Размер' : 'Hajmi'}
                              </label>
                              <input
                                type="text"
                                placeholder="3.8 MB"
                                value={doc.size || ''}
                                onChange={(e) => {
                                  const updatedDocs = [...(formData.documents || [])];
                                  updatedDocs[idx] = { ...updatedDocs[idx], size: e.target.value };
                                  setFormData({ ...formData, documents: updatedDocs });
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: INDUSTRIES & TASKS */}
          {activeTab === 'industries' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>{activeLang === 'ru' ? 'Отрасли применения и задачи (Интеллектуальный подбор)' : 'Qo‘llanish sohalari va vazifalar (Finder)'}</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {activeLang === 'ru' 
                    ? 'Отметьте отрасли и конкретные инженерные задачи, в которых применяется данное оборудование.' 
                    : 'Ushbu uskuna qaysi sohalarda va qanday texnik topshiriqlarda ishlatilishini belgilang.'}
                </p>
              </div>

              {industriesList.length === 0 ? (
                <div className="text-center py-12 bg-gray-950/50 rounded-2xl border border-gray-800 text-gray-400 text-xs space-y-2">
                  <Building2 className="w-8 h-8 text-gray-600 mx-auto" />
                  <p>{activeLang === 'ru' ? 'Отрасли еще не созданы в панели управления.' : 'Admin panelda hali sohalar yaratilmagan.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {industriesList.map((ind) => {
                    const indIdStr = String(ind.id);
                    const isIndustryChecked = (formData.industries || []).some(id => String(id) === indIdStr);
                    const indName = getLocalizedText(ind.name, activeLang, ind.id);
                    const indDesc = getLocalizedText(ind.desc || (ind as any).description, activeLang, '');
                    const tasks = ind.tasks || [];

                    return (
                      <div 
                        key={ind.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isIndustryChecked 
                            ? 'bg-blue-950/20 border-blue-500/40 shadow-lg' 
                            : 'bg-gray-950 border-gray-800/80 hover:border-gray-700'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isIndustryChecked}
                            onChange={(e) => {
                              const currentInds = formData.industries || [];
                              const nextInds = e.target.checked
                                ? [...currentInds.filter(x => String(x) !== indIdStr), indIdStr]
                                : currentInds.filter(x => String(x) !== indIdStr);

                              const currentTasks = formData.tasks || [];
                              const indTaskIds = tasks.map(t => String(t.id));
                              const nextTasks = e.target.checked
                                ? currentTasks
                                : currentTasks.filter(tid => !indTaskIds.includes(String(tid)));

                              setFormData(prev => ({
                                ...prev,
                                industries: nextInds,
                                tasks: nextTasks
                              }));
                            }}
                            className="w-4 h-4 mt-0.5 rounded text-blue-600 bg-gray-900 border-gray-700 focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${isIndustryChecked ? 'text-white' : 'text-gray-300'}`}>
                                {indName}
                              </span>
                              {tasks.length > 0 && (
                                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                                  {tasks.length} {activeLang === 'ru' ? 'задач' : 'ta vazifa'}
                                </span>
                              )}
                            </div>
                            {indDesc && <p className="text-[11px] text-gray-400 mt-0.5">{indDesc}</p>}
                          </div>
                        </label>

                        {isIndustryChecked && tasks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-800/80 pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {tasks.map((task) => {
                              const taskIdStr = String(task.id);
                              const isTaskChecked = (formData.tasks || []).some(id => String(id) === taskIdStr);
                              const taskName = getLocalizedText(task.name, activeLang, task.id);
                              const taskDesc = getLocalizedText(task.desc || (task as any).description, activeLang, '');

                              return (
                                <label 
                                  key={task.id} 
                                  className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                    isTaskChecked 
                                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' 
                                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isTaskChecked}
                                    onChange={(e) => {
                                      const currentTasks = formData.tasks || [];
                                      const nextTasks = e.target.checked
                                        ? [...currentTasks.filter(x => String(x) !== taskIdStr), taskIdStr]
                                        : currentTasks.filter(x => String(x) !== taskIdStr);

                                      setFormData(prev => ({
                                        ...prev,
                                        tasks: nextTasks
                                      }));
                                    }}
                                    className="w-3.5 h-3.5 mt-0.5 rounded text-cyan-500 bg-gray-900 border-gray-700 focus:ring-0 cursor-pointer"
                                  />
                                  <div>
                                    <span className="text-[11px] font-semibold block leading-tight">
                                      {taskName}
                                    </span>
                                    {taskDesc && <span className="text-[10px] text-gray-500 block mt-0.5">{taskDesc}</span>}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>{activeLang === 'ru' ? 'Главное изображение товара (Cover Photo) *' : 'Mahsulotning asosiy rasmi (Cover Photo) *'}</span>
                  </label>
                  <span className="text-[11px] text-gray-500">WebP, AVIF, PNG, JPG (maks. 20 MB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-3 flex justify-center">
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center p-2 relative">
                      {isUploadingMain ? (
                        <div className="flex flex-col items-center gap-1.5 text-blue-400">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-[10px]">Yuklanmoqda...</span>
                        </div>
                      ) : formData.image ? (
                        <img src={formData.image} alt="Product" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-9 space-y-2">
                    <input
                      type="file"
                      ref={mainImageInputRef}
                      onChange={handleMainImageUpload}
                      accept="image/webp, image/avif, image/png, image/jpeg, image/svg+xml"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingMain}
                      onClick={() => mainImageInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      {isUploadingMain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{isUploadingMain ? 'Yuklanmoqda...' : (activeLang === 'ru' ? 'Загрузить главное фото' : 'Asosiy rasmni yuklash')}</span>
                    </button>
                    <input
                      type="text"
                      placeholder={activeLang === 'ru' ? 'Путь к фото (/uploads/products/... или https://...)' : 'Rasm yo‘li (/uploads/products/... yoki https://...)'}
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">
                    {activeLang === 'ru' ? 'Дополнительные фотографии галереи' : 'Qo‘shimcha galereya rasmlari'} ({formData.additionalImages?.length || 0})
                  </label>
                  
                  <input
                    type="file"
                    multiple
                    ref={additionalImagesInputRef}
                    onChange={handleAdditionalImagesUpload}
                    accept="image/webp, image/avif, image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingAdditional}
                    onClick={() => additionalImagesInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isUploadingAdditional ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{isUploadingAdditional ? 'Yuklanmoqda...' : (activeLang === 'ru' ? 'Добавить фото' : 'Rasm qo‘shish')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {(formData.additionalImages || []).map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-2xl border border-gray-800 bg-gray-900 p-1 aspect-square overflow-hidden">
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            additionalImages: prev.additionalImages?.filter((_, i) => i !== idx)
                          }))
                        }
                        className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-950 border border-gray-800 w-fit">
                {[
                  { code: 'ru' as const, label: '🇷🇺 Русский' },
                  { code: 'uz' as const, label: "🇺🇿 O'zbekcha" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeLang === lang.code
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Meta Title ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={(formData.seoTitle as LocalizedString)[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoTitle: { ...(formData.seoTitle as LocalizedString), [activeLang]: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Meta Description ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={(formData.seoDescription as LocalizedString)[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: { ...(formData.seoDescription as LocalizedString), [activeLang]: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    SEO Keywords ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={(formData.seoKeywords as LocalizedString)[activeLang] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoKeywords: { ...(formData.seoKeywords as LocalizedString), [activeLang]: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

            </div>
          )}

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition cursor-pointer"
          >
            {activeLang === 'ru' ? 'Отмена' : 'Bekor qilish'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{productToEdit ? (activeLang === 'ru' ? 'Сохранить изменения' : 'O‘zgarishlarni saqlash') : (activeLang === 'ru' ? 'Сохранить товар' : 'Mahsulotni saqlash')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};