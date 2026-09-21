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

// 1. GET: Bitta mahsulotni ID yoki ko'p tilli Slug bo'yicha olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const [rows]: any = await db.query(
      `SELECT * FROM products 
       WHERE id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
       LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Mahsulot topilmadi' },
        { status: 404 }
      );
    }

    const product = transformProductRow(rows[0]);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Product single GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Mahsulotni o'chirish (🔒 Faqat Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    const { id: identifier } = await params;
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Identifikator ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query(
      `DELETE FROM products 
       WHERE id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ?`,
      [identifier, identifier, identifier]
    );

    return NextResponse.json({ success: true, message: 'Mahsulot o‘chirildi' });
  } catch (error: any) {
    console.error('Product DB delete error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}