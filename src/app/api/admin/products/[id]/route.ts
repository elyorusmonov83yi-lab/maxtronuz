import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("DIQQAT: GEMINI_API_KEY .env.local faylida topilmadi!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const AI_MODEL = 'gemini-3.8-flash';

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
        ? { uz: String(name.uz || name.ru || ''), ru: String(name.ru || name.uz || '') } 
        : { uz: String(name || ''), ru: String(name || '') },
      value: typeof value === 'object' && value !== null 
        ? { uz: String(value.uz || value.ru || ''), ru: String(value.ru || value.uz || '') } 
        : { uz: String(value || ''), ru: String(value || '') }
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
    brandId: p.brand_id || null,
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

// 2. POST: AI yordamida tovar parametrlarini avtomatik to'ldirish (🔒 Faqat Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Ruxsat berilmagan' }, { status: 401 });
    }

    const { id: identifier } = await params;
    const body = await req.json().catch(() => ({}));

    const [rows]: any = await db.query(
      `SELECT * FROM products 
       WHERE id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
       LIMIT 1`,
      [identifier, identifier, identifier]
    );

    const existsInDb = rows && rows.length > 0;
    const current = existsInDb ? rows[0] : null;

    const currentModel = (current?.model || body?.model || '').trim();
    if (!currentModel) {
      return NextResponse.json({ success: false, message: 'Uskuna modeli yoki artikuli kiritilmagan' }, { status: 400 });
    }

    // Mavjud yoki berilgan brend/kategoriya bo'lmasa, AI o'zi aniqlashi uchun ko'rsatma beramiz
    const currentBrandId = current?.brand_id || body?.brandId || '';
    const currentCategoryId = current?.categoryId || current?.category || body?.category || '';

    const rawName = current ? (current.name || current.title) : body?.name;
    const currentName = parseIfJson(rawName, { ru: currentModel, uz: currentModel });

    const rawDesc = current ? current.description : body?.description;
    const currentDesc = parseIfJson(rawDesc, { ru: '', uz: '' });

  // route.ts ichidagi prompt qismida:
const prompt = `
Siz sanoat uskunalari, KIPiA va avtomatika bo'yicha yetakchi muhandissiz.
Foydalanuvchi quyidagi uskunani kiritdi:
- Model / Artikul: "${currentModel}"
${currentBrandId ? `- Ko'rsatilgan brend: ${currentBrandId}` : "- Brend: Noma'lum (Model nomidan o'zingiz aniqlang)"}
${currentCategoryId ? `- Ko'rsatilgan toifa: ${currentCategoryId}` : "- Toifa: Noma'lum (Uskuna turiga qarab o'zingiz aniqlang)"}
- Mavjud ruscha nomi: ${currentName.ru || currentModel}
- Mavjud o'zbekcha nomi: ${currentName.uz || ''}
- Mavjud tavsif: ${currentDesc.ru || ''}

VAZIFANGIZ:
Ushbu uskunaning barcha parametrlarini to'liq aniqlang va AYNAN 2 TILLI (Ruscha va O'zbekcha Lotin imlosida) qilib to'liq to'ldiring:
1. "detectedBrand": Ishlab chiqaruvchi brendning aniq nomi.
2. "detectedCategory": Uskuna toifasi.
3. "name": Uskunaning to'liq professional nomi (RU va UZ).

4. "description" — JUDA BATAFSIL VA KENGAYTIRILGAN BO'LSIN (kamida 300-400 so'z, 3-4 ta to'liq abzas). HTML formatida (<p>, <strong>, <ul>, <li>) har ikki tilda yozilsin va quyidagi tarkibiy qismlarni o'z ichiga olsin:
   - 1-abzas: Uskunaning vazifasi, qaysi sanoat jarayonlarida qo'llanilishi va uning asosiy maqsadi.
   - 2-abzas: Ishlash prinsipi, qanday datchik/mexanizm ishlatilgani, o'lchash aniqligi va barqarorligi.
   - 3-abzas: Korpusning himoyalanganligi (IP klassi), og'ir muhitlarga (vibratsiya, harorat, agressiv muhitlar) chidamliligi va ulanish qulayligi.
   - 4-blok: Asosiy texnik afzalliklari bo'yicha qisqa xulosa.
   Qisqa 1-2 ta gap bilan cheklanib qolish qat'iyan taqiqlanadi!

5. "specs": 8-12 tagacha aniq texnik parametr (diapazon, chiqish signali, ta'minot kuchlanishi, xatolik klassi, korpus materiali, ishchi harorat va h.k.).
6. "features" va "applications": Kamida 4-6 tadan aniq band.
7. Hech bir 'uz' maydoni bo'sh qolmasin.
`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Har doim faqat JSON formatida javob bering. Har bir matnli maydonda 'ru' va 'uz' (o'zbekcha lotin imlosida) to'liq to'ldirilishi majburiydir. 'detectedBrand' va 'detectedCategory' aniq ko'rsatilishi shart.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            detectedBrand: {
              type: 'STRING',
              description: 'Ishlab chiqaruvchi brend nomi (masalan: WIKA, Danfoss)'
            },
            detectedCategory: {
              type: 'STRING',
              description: 'Uskuna toifasi (masalan: Датчики давления)'
            },
            name: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            tagline: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            description: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            standardCert: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            features: {
              type: 'OBJECT',
              properties: {
                ru: { type: 'ARRAY', items: { type: 'STRING' } },
                uz: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ['ru', 'uz']
            },
            applications: {
              type: 'OBJECT',
              properties: {
                ru: { type: 'ARRAY', items: { type: 'STRING' } },
                uz: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ['ru', 'uz']
            },
            specs: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: {
                    type: 'OBJECT',
                    properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
                    required: ['ru', 'uz']
                  },
                  value: {
                    type: 'OBJECT',
                    properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
                    required: ['ru', 'uz']
                  }
                },
                required: ['name', 'value']
              }
            },
            seoTitle: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            seoDescription: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            },
            seoKeywords: {
              type: 'OBJECT',
              properties: { ru: { type: 'STRING' }, uz: { type: 'STRING' } },
              required: ['ru', 'uz']
            }
          },
          required: [
            'detectedBrand',
            'detectedCategory',
            'name',
            'tagline',
            'description',
            'standardCert',
            'features',
            'applications',
            'specs',
            'seoTitle',
            'seoDescription',
            'seoKeywords'
          ]
        },
        temperature: 0.2
      }
    });

    const enriched = JSON.parse(response.text || '{}');
    const normalizedSpecs = parseSpecs(enriched.specs);

    if (existsInDb) {
      await db.query(
        `UPDATE products 
         SET name = ?,
             specs = ?,
             features = ?,
             applications = ?,
             tagline = ?,
             standardCert = ?,
             description = ?,
             seoTitle = ?,
             seoDescription = ?,
             seoKeywords = ?
         WHERE id = ?`,
        [
          JSON.stringify(enriched.name || currentName),
          JSON.stringify(normalizedSpecs),
          JSON.stringify(enriched.features || { ru: [], uz: [] }),
          JSON.stringify(enriched.applications || { ru: [], uz: [] }),
          JSON.stringify(enriched.tagline || { ru: '', uz: '' }),
          JSON.stringify(enriched.standardCert || { ru: 'ГОСТ', uz: 'GOST' }),
          JSON.stringify(enriched.description || currentDesc),
          JSON.stringify(enriched.seoTitle || { ru: '', uz: '' }),
          JSON.stringify(enriched.seoDescription || { ru: '', uz: '' }),
          JSON.stringify(enriched.seoKeywords || { ru: '', uz: '' }),
          current.id
        ]
      );

      const [updatedRows]: any = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [current.id]);
      const updatedProduct = transformProductRow(updatedRows[0]);

      return NextResponse.json({
        success: true,
        message: 'Mahsulot AI orqali 2 tilda muvaffaqiyatli to‘ldirildi',
        data: {
          ...updatedProduct,
          detectedBrand: enriched.detectedBrand || '',
          detectedCategory: enriched.detectedCategory || ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI maʼlumotlari 2 tilda muvaffaqiyatli tayyorlandi',
      data: {
        id: identifier,
        model: currentModel,
        brandId: currentBrandId,
        category: currentCategoryId,
        detectedBrand: enriched.detectedBrand || '',
        detectedCategory: enriched.detectedCategory || '',
        name: enriched.name,
        tagline: enriched.tagline,
        description: enriched.description,
        standardCert: enriched.standardCert,
        specs: normalizedSpecs,
        features: enriched.features,
        applications: enriched.applications,
        seoTitle: enriched.seoTitle,
        seoDescription: enriched.seoDescription,
        seoKeywords: enriched.seoKeywords
      }
    });
  } catch (error: any) {
    console.error('Product AI enrichment error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'AI to‘ldirishda xatolik' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Mahsulotni o'chirish (🔒 Faqat Admin)
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