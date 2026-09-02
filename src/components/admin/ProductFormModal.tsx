import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Globe, 
  Layers, 
  FileText, 
  Sliders, 
  RefreshCw, 
  Building2, 
  Loader2,
  Tag
} from 'lucide-react';
import { Product, CategoryInfo, LocalizedString, ProductSpec, IndustryInfo, BrandInfo } from '../../types';
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
          uz: parsed.uz || parsed.ru || fallbackStr,
          ru: parsed.ru || parsed.uz || fallbackStr
        };
      }
    } catch {}
    return { uz: val, ru: val };
  }
  if (typeof val === 'object') {
    return {
      uz: val.uz || val.ru || fallbackStr,
      ru: val.ru || val.uz || fallbackStr
    };
  }
  return { uz: fallbackStr, ru: fallbackStr };
}

function normalizeLocArray(val: any) {
  if (!val) return { uz: [], ru: [] };
  let obj = val;
  if (typeof val === 'string') {
    try { obj = JSON.parse(val); } catch { obj = { uz: [], ru: [] }; }
  }
  return {
    uz: Array.isArray(obj?.uz) ? obj.uz : [],
    ru: Array.isArray(obj?.ru) ? obj.ru : []
  };
}

function normalizeSpecs(specsRaw: any): ProductSpec[] {
  if (!specsRaw) return [];
  let arr = specsRaw;
  if (typeof specsRaw === 'string') {
    try { arr = JSON.parse(specsRaw); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];

  return arr.map((s: any) => ({
    name: normalizeLocString(s.name),
    value: normalizeLocString(s.value)
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
  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'industries' | 'media' | 'seo'>('general');
  const [activeLang, setActiveLang] = useState<'ru' | 'uz'>('ru');
  const [manualSlugs, setManualSlugs] = useState<{ uz: boolean; ru: boolean }>({ uz: false, ru: false });

  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

  const [industriesList, setIndustriesList] = useState<IndustryInfo[]>([]);
  const [brandsList, setBrandsList] = useState<BrandInfo[]>([]); // 🌟 Brendlar ro'yxati

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Product & { brandId?: string }>({
    id: '',
    slug: { uz: '', ru: '' },
    name: { uz: '', ru: '' },
    brandId: 'b-maxtron',
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

  useEffect(() => {
    if (isOpen) {
      // Sohalarni yuklash
      ApiService.getIndustries?.()
        .then((data) => setIndustriesList(Array.isArray(data) && data.length > 0 ? data : StorageService.getIndustries()))
        .catch(() => setIndustriesList(StorageService.getIndustries()));

      // 🌟 Brendlarni yuklash
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

      const existingBrandId = (productToEdit as any).brandId || (productToEdit as any).brand || 'b-maxtron';

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
        brandId: 'b-maxtron',
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
      const token = localStorage.getItem('admin_token') || '';
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
    const token = localStorage.getItem('admin_token') || '';
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

  // Specs
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

  // Features
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

  // Applications
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
      brandId: formData.brandId || 'b-maxtron', // 🌟 Brand ID
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
      seoTitle: {
        ru: (formData.seoTitle as LocalizedString).ru?.trim() || nameObj.ru || '',
        uz: (formData.seoTitle as LocalizedString).uz?.trim() || nameObj.uz || ''
      },
      seoDescription: {
        ru: (formData.seoDescription as LocalizedString).seoDescription?.ru?.trim() || '',
        uz: (formData.seoDescription as LocalizedString).seoDescription?.uz?.trim() || ''
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
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
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Категория оборудования *' : 'Uskuna toifasi *'}
                  </label>
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
                </div>

                {/* 🌟 2. Brand (Bazadagi Brand ID bo'yicha tanlash) */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeLang === 'ru' ? 'Бренд / Производитель *' : 'Brend / Ishlab chiqaruvchi *'}</span>
                  </label>
                  <select
                    required
                    value={formData.brandId || 'b-maxtron'}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.country ? `(${b.country})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Model */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {activeLang === 'ru' ? 'Модель / Артикул *' : 'Model / Artikul *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: DMP 330L / MX-400"
                    value={formData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500"
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
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
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
                    className="w-full px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-blue-400 focus:outline-none focus:border-cyan-500 font-mono"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="sm:col-span-12 flex flex-wrap gap-6 p-4 rounded-2xl bg-gray-950 border border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{activeLang === 'ru' ? 'В наличии на складе в Ташкенте' : 'Toshkent omborida mavjud'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{activeLang === 'ru' ? 'Хит продаж' : 'Ommabop mahsulot'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
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
                        {activeLang.toUpperCase()}
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
                      const specName = typeof spec.name === 'object' ? (spec.name[activeLang] || '') : spec.name;
                      const specVal = typeof spec.value === 'object' ? (spec.value[activeLang] || '') : spec.value;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={activeLang === 'ru' ? "Параметр" : "Parametr"}
                            value={specName}
                            onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            placeholder={activeLang === 'ru' ? "Значение" : "Qiymat"}
                            value={specVal}
                            onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                    className="flex-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                      <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-rose-400">
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
                    className="flex-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500"
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
                      <button type="button" onClick={() => removeApplication(i)} className="text-gray-400 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: INDUSTRIES & TASKS */}
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

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>{activeLang === 'ru' ? 'Главное изображение товара (Cover Photo) *' : 'Mahsulotning asosiy rasmi (Cover Photo) *'}</span>
                  </label>
                  <span className="text-[11px] text-gray-500">WebP, AVIF, PNG, JPG (макс. 20 MB)</span>
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
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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

          {/* TAB 5: SEO */}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    OpenGraph Image
                  </label>
                  <input
                    type="text"
                    placeholder="/uploads/products/... yoki https://..."
                    value={formData.ogImage || ''}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
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