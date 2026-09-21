import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

function parseIfJson(val: any, fallback: any = {}) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}

function parseArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string' && parsed.startsWith('[')) {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}

function cleanIdArray(val: any): string[] {
  const arr = parseArray(val);
  return arr
    .map((item: any) => (typeof item === 'object' && item !== null ? String(item.id || item.value || '') : String(item)))
    .filter((s: string) => s.trim().length > 0);
}

function parseSpecs(rawSpecs: any) {
  const parsed = parseArray(rawSpecs);

  return parsed.map((s: any) => {
    let name = s?.name;
    let value = s?.value;
    if (typeof name === 'string') {
      try { name = JSON.parse(name); } catch {}
    }
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch {}
    }
    return {
      name: typeof name === 'object' && name !== null 
        ? { uz: name.uz || '', ru: name.ru || '' } 
        : { uz: name || '', ru: name || '' },
      value: typeof value === 'object' && value !== null 
        ? { uz: value.uz || '', ru: value.ru || '' } 
        : { uz: value || '', ru: value || '' }
    };
  });
}

function transformProductRow(p: any) {
  const slug = parseIfJson(p.slug, { uz: p.id, ru: p.id });
  const name = parseIfJson(p.name || p.title, { uz: p.id, ru: p.id });
  const tagline = parseIfJson(p.tagline, { uz: '', ru: '' });
  const description = parseIfJson(p.description, { uz: '', ru: '' });
  const priceFormatted = parseIfJson(p.priceFormatted, { uz: "So'rov bo'yicha", ru: 'По запросу' });
  const features = parseIfJson(p.features, { uz: [], ru: [] });
  const applications = parseIfJson(p.applications, { uz: [], ru: [] });
  const standardCert = parseIfJson(p.standardCert, { uz: 'GOST / O‘zstandart', ru: 'ГОСТ / Узстандарт' });
  const seoTitle = parseIfJson(p.seoTitle, { uz: '', ru: '' });
  const seoDescription = parseIfJson(p.seoDescription, { uz: '', ru: '' });
  const seoKeywords = parseIfJson(p.seoKeywords, { uz: '', ru: '' });
  const images = parseArray(p.images || p.additionalImages);

  const inds = cleanIdArray(p.industryIds ?? p.industries);
  const tasks = cleanIdArray(p.industryTaskIds ?? p.tasks);

  return {
    id: p.id,
    slug: typeof slug === 'object' ? slug : { uz: p.id, ru: p.id },
    brandId: p.brand_id || 'b-maxtron',
    model: p.model || '',
    category: p.category || p.categoryId || 'sensors',
    categoryId: p.categoryId || p.category || 'sensors',
    name: typeof name === 'object' ? name : { uz: name, ru: name },
    tagline: typeof tagline === 'object' ? tagline : { uz: '', ru: '' },
    description: typeof description === 'object' ? description : { uz: description, ru: description },
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    priceFormatted: typeof priceFormatted === 'object' ? priceFormatted : { uz: "So'rov bo'yicha", ru: 'По запросу' },
    inStock: Boolean(p.inStock ?? p.isActive ?? 1),
    isActive: Boolean(p.isActive ?? 1),
    isPopular: Boolean(p.isPopular ?? 0),
    isNew: Boolean(p.isNew ?? 0),
    image: p.image || p.imageUrl || '',
    imageUrl: p.imageUrl || p.image || '',
    additionalImages: images,
    pdfCatalogUrl: p.pdfCatalogUrl || '',
    specs: parseSpecs(p.specs),
    features: typeof features === 'object' ? features : { uz: [], ru: [] },
    applications: typeof applications === 'object' ? applications : { uz: [], ru: [] },
    standardCert: typeof standardCert === 'object' ? standardCert : { uz: standardCert, ru: standardCert },
    warrantyMonths: Number(p.warrantyMonths) || 12,
    industryIds: inds,
    industryTaskIds: tasks,
    industries: inds,
    tasks: tasks,
    seoTitle: typeof seoTitle === 'object' ? seoTitle : { uz: '', ru: '' },
    seoDescription: typeof seoDescription === 'object' ? seoDescription : { uz: '', ru: '' },
    seoKeywords: typeof seoKeywords === 'object' ? seoKeywords : { uz: '', ru: '' },
    ogImage: p.ogImage || p.image || ''
  };
}

// 1. GET: Barcha mahsulotlarni olish
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM products ORDER BY id DESC');
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = rows.map(transformProductRow);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Products DB load error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. POST: Mahsulotni saqlash yoki yangilash (🔒 Faqat Admin)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    const prod = await req.json();
    if (!prod) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    const prodId = String(prod.id || `mx-${Date.now().toString().slice(-6)}`);
    const brandId = String(prod.brandId || 'b-maxtron').trim();
    const model = String(prod.model || prodId).trim();
    const categoryId = String(prod.category || prod.categoryId || 'sensors').trim();

    const slug = typeof prod.slug === 'object' ? JSON.stringify(prod.slug) : JSON.stringify({ uz: prodId, ru: prodId });
    const name = typeof prod.name === 'object' ? JSON.stringify(prod.name) : JSON.stringify({ uz: prod.name || '', ru: prod.name || '' });
    const tagline = typeof prod.tagline === 'object' ? JSON.stringify(prod.tagline) : JSON.stringify(prod.tagline || {});
    const description = typeof prod.description === 'object' ? JSON.stringify(prod.description) : JSON.stringify(prod.description || {});
    
    const price = Number(prod.price) || 0;
    const oldPrice = Number(prod.oldPrice) || 0;
    const priceFormatted = typeof prod.priceFormatted === 'object' ? JSON.stringify(prod.priceFormatted) : JSON.stringify({ uz: "So'rov bo'yicha", ru: 'По запросу' });
    
    const inStock = prod.inStock ? 1 : 0;
    const isPopular = prod.isPopular ? 1 : 0;
    const isNew = prod.isNew ? 1 : 0;
    const warrantyMonths = Number(prod.warrantyMonths) || 12;

    const imageUrl = prod.image || prod.imageUrl || '';
    const images = JSON.stringify(parseArray(prod.additionalImages || prod.images || []));
    const pdfCatalogUrl = prod.pdfCatalogUrl || prod.pdfFile || '';

    const specs = JSON.stringify(parseArray(prod.specs));
    const features = typeof prod.features === 'object' ? JSON.stringify(prod.features) : JSON.stringify({ uz: [], ru: [] });
    const applications = typeof prod.applications === 'object' ? JSON.stringify(prod.applications) : JSON.stringify({ uz: [], ru: [] });
    const standardCert = typeof prod.standardCert === 'object' ? JSON.stringify(prod.standardCert) : JSON.stringify({ uz: prod.standardCert || '', ru: prod.standardCert || '' });

    const industryIds = JSON.stringify(cleanIdArray(prod.industryIds ?? prod.industries));
    const industryTaskIds = JSON.stringify(cleanIdArray(prod.industryTaskIds ?? prod.tasks));

    const seoTitle = typeof prod.seoTitle === 'object' ? JSON.stringify(prod.seoTitle) : JSON.stringify(prod.seoTitle || {});
    const seoDescription = typeof prod.seoDescription === 'object' ? JSON.stringify(prod.seoDescription) : JSON.stringify(prod.seoDescription || {});
    const seoKeywords = typeof prod.seoKeywords === 'object' ? JSON.stringify(prod.seoKeywords) : JSON.stringify(prod.seoKeywords || {});
    const ogImage = prod.ogImage || imageUrl || '';

    await db.query(
      `INSERT INTO products 
        (id, brand_id, slug, title, description, categoryId, imageUrl, images, pdfCatalogUrl, specs, features, isActive, model, category, name, tagline, price, oldPrice, priceFormatted, inStock, isPopular, image, applications, isNew, standardCert, warrantyMonths, seoTitle, seoDescription, seoKeywords, ogImage, industryIds, industryTaskIds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        brand_id = VALUES(brand_id),
        slug = VALUES(slug),
        title = VALUES(title),
        description = VALUES(description),
        categoryId = VALUES(categoryId),
        imageUrl = VALUES(imageUrl),
        images = VALUES(images),
        pdfCatalogUrl = VALUES(pdfCatalogUrl),
        specs = VALUES(specs),
        features = VALUES(features),
        isActive = VALUES(isActive),
        model = VALUES(model),
        category = VALUES(category),
        name = VALUES(name),
        tagline = VALUES(tagline),
        price = VALUES(price),
        oldPrice = VALUES(oldPrice),
        priceFormatted = VALUES(priceFormatted),
        inStock = VALUES(inStock),
        isPopular = VALUES(isPopular),
        image = VALUES(image),
        applications = VALUES(applications),
        isNew = VALUES(isNew),
        standardCert = VALUES(standardCert),
        warrantyMonths = VALUES(warrantyMonths),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage),
        industryIds = VALUES(industryIds),
        industryTaskIds = VALUES(industryTaskIds)`,
      [
        prodId, brandId, slug, name, description, categoryId, imageUrl, images, pdfCatalogUrl,
        specs, features, inStock, model, categoryId, name, tagline, price, oldPrice,
        priceFormatted, inStock, isPopular, imageUrl, applications, isNew, standardCert,
        warrantyMonths, seoTitle, seoDescription, seoKeywords, ogImage,
        industryIds, industryTaskIds
      ]
    );

    return NextResponse.json({ success: true, id: prodId, message: 'Mahsulot muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Product DB save error:', error?.message);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}