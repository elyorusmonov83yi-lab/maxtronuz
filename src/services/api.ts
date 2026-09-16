import { 
  HeaderSettings, 
  CategoryInfo, 
  Product, 
  ClientPartner, 
  CustomPage, 
  HomeContent,
  IndustryInfo,
  BrandInfo
} from '../types.ts';
import { StorageService } from './storage.ts';

// 🌟 Barcha so'rovlarga token qo'shish uchun yordamchi funksiya
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const ApiService = {
  // ==========================================
  // --- FILE UPLOAD (PDF & RASMLAR YUKLASH) ---
  // ==========================================
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message || `Server xatosi kodi: ${res.status}`);
    }

    if (json?.success && json?.url) {
      return json.url;
    } else {
      throw new Error(json?.message || 'Faylni saqlab bo‘lmadi');
    }
  },

  // ==========================================
  // --- HEADER & LOGO ---
  // ==========================================
  async getHeaderSettings(): Promise<HeaderSettings | null> {
    try {
      const res = await fetch('/api/admin/header', { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : (json || null);
    } catch {
      return null;
    }
  },

  async saveHeaderSettings(headerSettings: Partial<HeaderSettings>): Promise<any> {
    const res = await fetch('/api/admin/header', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(headerSettings),
    });
    if (!res.ok) throw new Error('Header sozlamalarini saqlashda xatolik');
    return await res.json();
  },

  // ==========================================
  // --- CATEGORIES (KATEGORIYALAR) ---
  // ==========================================
  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const res = await fetch('/api/admin/categories', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
    try {
      const categories = await this.getCategories();
      const match = categories.find((c) => 
        c.id === slug || 
        c.slug?.uz === slug || 
        c.slug?.ru === slug
      );
      return match || null;
    } catch {
      return null;
    }
  },

  async saveCategory(category: CategoryInfo): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error('Kategoriyani saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Kategoriyani o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- INDUSTRIES (SOHALAR VA VAZIFALAR - FINDER) ---
  // ==========================================
  async getIndustries(): Promise<IndustryInfo[]> {
    try {
      const res = await fetch('/api/admin/industries', { headers: getAuthHeaders() });
      if (!res.ok) return StorageService.getIndustries();
      const json = await res.json();
      const data = json.success ? json.data : (Array.isArray(json) ? json : []);
      if (Array.isArray(data) && data.length > 0) return data;
      return StorageService.getIndustries();
    } catch {
      return StorageService.getIndustries();
    }
  },

  async saveIndustries(industries: IndustryInfo[]): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/admin/industries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(industries)
      });
      
      const json = await res.json().catch(() => ({ success: true }));
      StorageService.saveIndustries(industries);

      if (!res.ok) {
        throw new Error(json?.message || json?.error || `Server xatosi: ${res.status}`);
      }

      return json;
    } catch (e: any) {
      StorageService.saveIndustries(industries);
      console.error('Save industries error:', e);
      throw e;
    }
  },

  async saveIndustry(industry: IndustryInfo): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/industries', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(industry)
    });
    if (!res.ok) throw new Error('Sohani saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteIndustry(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/industries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Sohani o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- PRODUCTS (MAHSULOTLAR) ---
  // ==========================================
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/admin/products', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find((p) => p.id === id) || null;
    } catch {
      return null;
    }
  },

  async saveProduct(product: Partial<Product>): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Mahsulotni saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Mahsulotni o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- BRANDS (BRENDLAR) ---
  // ==========================================
  async getBrands(): Promise<BrandInfo[]> {
    try {
      const res = await fetch('/api/admin/brands', { headers: getAuthHeaders() });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  },

  async saveBrand(brand: any) {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(brand)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Save brand error:', err);
      return { success: false, message: 'Tarmoq xatosi' };
    }
  },

  async deleteBrand(id: string) {
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Delete brand error:', err);
      return { success: false, message: 'Tarmoq xatosi' };
    }
  },

  // ==========================================
  // --- QUOTES (BUYURTMALAR VA TIJORAT TAKLIFLARI) ---
  // ==========================================
  async getQuotes(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/quotes', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async saveQuote(quote: any): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quote)
    });
    if (!res.ok) throw new Error('Buyurtmani saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteQuote(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Buyurtmani o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- CERTIFICATES (SERTIFIKATLAR) ---
  // ==========================================
  async getCertificates(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/certificates', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async saveCertificate(cert: any): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/certificates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cert)
    });
    if (!res.ok) throw new Error('Sertifikatni saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteCertificate(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/certificates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Sertifikatni o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- CLIENTS (HAMKORLAR / MIJOZLAR) ---
  // ==========================================
  async getClients(): Promise<ClientPartner[]> {
    try {
      const res = await fetch('/api/admin/clients', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async saveClient(client: Partial<ClientPartner>): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(client)
    });
    if (!res.ok) throw new Error('Hamkorni saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteClient(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Hamkorni o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- PAGES (STATIK SAHIFALAR) ---
  // ==========================================
  async getPages(): Promise<CustomPage[]> {
    try {
      const res = await fetch('/api/admin/pages', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async savePage(page: Partial<CustomPage>): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(page)
    });
    if (!res.ok) throw new Error('Sahifani saqlab bo‘lmadi');
    return await res.json();
  },

  async deletePage(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/pages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Sahifani o‘chirib bo‘lmadi');
    return await res.json();
  },

  // ==========================================
  // --- SITE SETTINGS (HOME, ABOUT, CONTACT, SEO) ---
  // ==========================================
  async getSetting(key: 'home' | 'about' | 'contact' | 'seo'): Promise<any> {
    try {
      const res = await fetch(`/api/admin/settings/${key}`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : (json || null);
    } catch {
      return null;
    }
  },

  async saveSetting(key: 'home' | 'about' | 'contact' | 'seo', data: any): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/settings/${key}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`${key} sozlamalarini saqlab bo‘lmadi`);
    return await res.json();
  },

  // ==========================================
  // --- ADMIN USERS (LOGIN VA FOYDALANUVCHILAR) ---
  // ==========================================
 async loginAdmin(username: string, password: string): Promise<any> {
    const res = await fetch('/api/admin/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    // Serverdan kelgan token turli nomda bo'lishi mumkinligini tekshiramiz
    const tokenVal = data.token || data.accessToken || data.data?.token;
    
    if (data.success && tokenVal) {
      localStorage.setItem('admin_token', tokenVal);
     // console.log('Token saqlandi:', tokenVal);
    } else {
     // console.error('Login javobida token topilmadi:', data);
    }
    
    return data;
  },
  async getAdminUsers(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  },

  async getCurrentAdmin(): Promise<{ id: string; username: string; role: string } | null> {
    try {
      const res = await fetch('/api/admin/users/me', { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.user : null;
    } catch {
      return null;
    }
  },

  async saveAdminUser(user: any): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Foydalanuvchini saqlab bo‘lmadi');
    return await res.json();
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Foydalanuvchini o‘chirib bo‘lmadi');
    return await res.json();
  }
};
