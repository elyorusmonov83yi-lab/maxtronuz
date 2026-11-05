import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("DIQQAT: GEMINI_API_KEY .env.local faylida topilmadi!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// 503 va yuklama xatolariga qarshi navbatma-navbat sinab ko'riladigan modellar
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
 
];

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

    let rawBrand = current?.brand_id || body?.brandId || '';
    if (['maxtron', 'b-maxtron'].includes(rawBrand.toLowerCase())) {
      rawBrand = '';
    }

    const currentCategoryId = current?.categoryId || current?.category || body?.category || '';

    const rawName = current ? (current.name || current.title) : body?.name;
    const currentName = parseIfJson(rawName, { ru: currentModel, uz: currentModel });

    const rawDesc = current ? current.description : body?.description;
    const currentDesc = parseIfJson(rawDesc, { ru: '', uz: '' });

    const prompt = `
Siz sanoat uskunalari, KIPiA va elektrotexnika bo'yicha mustaqil bosh muhandissiz.

QAT'IY CHEKLOV VA TALAB:
1. "MAXTRON" so'zini tovar nomiga (name), modeliga, brendiga (detectedBrand) yoki tavsifiga (description) ISHLAB CHIQARUVCHI BREND SIFATIDA ASLO QO'SHMANG! MAXTRON mahsulot ishlab chiqarmaydi.
2. XATO: "Кабельные наконечники MAXTRON TA 120"
   TO'G'RI: "Кабельные наконечники ТА-120" (yoki "Медно-алюминиевые наконечники ТА 120").
3. Agar haqiqiy zavod brendi noma'lum bo'lsa yoki tovar standart GOST/DIN bo'lsa, "detectedBrand" maydoniga "Standart / GOST" yoki "Universal" deb yozing, o'zingizdan brend to'qimang.

BERILGAN MA'LUMOTLAR:
- Model / Artikul: "${currentModel}"
${rawBrand ? `- Ko'rsatilgan brend: ${rawBrand}` : "- Ishlab chiqaruvchi brend: Noma'lum (Modeldan o'zingiz aniqlang yoki GOST/Universal deb belgilang)"}
${currentCategoryId ? `- Toifa: ${currentCategoryId}` : "- Toifa: Uskunaga qarab o'zingiz aniqlang"}
- Mavjud nomi: ${currentName.ru || currentModel}
- Mavjud tavsifi: ${currentDesc.ru || ''}

VAZIFANGIZ:
Ushbu uskunaning barcha parametrlarini AYNAN 2 TILLI (Ruscha va O'zbekcha Lotin imlosida) qilib to'liq to'ldiring:
1. "detectedBrand": Ishlab chiqaruvchi asl brend nomi (masalan: WIKA, Siemens, ABB, Danfoss yoki "Standart / GOST").
2. "detectedCategory": Uskuna toifasi (masalan: "Кабельные наконечники", "Датчики давления").
3. "name": Uskunaning toza texnik nomi (RU va UZ).
4. "description": JUDA BATAFSIL VA KENGAYTIRILGAN (kamida 250-350 so'z, 3 ta to'liq abzas). HTML formatida (<p>, <strong>, <ul>, <li>) har ikki tilda yozilsin:
   - 1-abzas: Uskunaning vazifasi, materiali va asosiy qo'llanish sohasi.
   - 2-abzas: Texnik ishlash prinsipi, montaj xususiyatlari, o'tkazuvchanligi yoki chidamliligi.
   - 3-abzas: Ishchi harorat, IP himoya darajasi va standartlarga muvofiqligi.
5. "specs": 8-12 tagacha aniq texnik parametr (kesim yuzasi, kuchlanish, tok, material, himoya klassi va h.k.).
6. "features" va "applications": Kamida 4-6 tadan aniq band.
7. Hech bir 'uz' maydoni bo'sh qolmasin.
`;

    const aiConfig = {
      systemInstruction: "Har doim faqat JSON formatida javob bering. Hech qachon tovar nomiga 'MAXTRON' so'zini qo'shmang. Har bir matnli maydonda 'ru' va 'uz' (o'zbekcha lotin imlosida) to'liq to'ldirilishi shart.",
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          detectedBrand: { type: 'STRING' },
          detectedCategory: { type: 'STRING' },
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
    };

    // Fallback zanjiri: bitta model band (503) bo'lsa, to'xtamasdan keyingisiga o'tadi
    let response: any = null;
    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: aiConfig
        });

        if (response?.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Fallback] ${modelName} xatolik berdi (${err?.message || err}). Keyingisi tekshirilmoqda...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (!response?.text) {
      throw lastError || new Error("Barcha zaxira AI modellar band, iltimos 10 soniyadan so'ng qayta urinib ko'ring.");
    }

    const enriched = JSON.parse(response.text || '{}');

    if (enriched.name?.ru) enriched.name.ru = enriched.name.ru.replace(/MAXTRON\s*/gi, '').trim();
    if (enriched.name?.uz) enriched.name.uz = enriched.name.uz.replace(/MAXTRON\s*/gi, '').trim();

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
        brandId: rawBrand || null,
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