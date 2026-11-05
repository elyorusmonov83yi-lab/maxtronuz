import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';
import { GoogleGenAI } from '@google/genai';

type LangText = { ru: string; uz: string };
type LangList = { ru: string[]; uz: string[] };

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


// 503 yuklama vaqtida darhol javob beradigan eng tezkor va barqaror tartib:
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

const DEFAULT_LANG_TEXT: LangText = { ru: '', uz: '' };
const DEFAULT_LANG_LIST: LangList = { ru: [], uz: [] };

function parseIfJson<T = any>(value: any, fallback: T): any {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

function parseArray(value: any): any[] {
  const parsed = parseIfJson(value, []);
  if (Array.isArray(parsed)) return parsed;

  if (typeof parsed === 'string') {
    try {
      const twiceParsed = JSON.parse(parsed);
      return Array.isArray(twiceParsed) ? twiceParsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toBoolean(value: any, fallback = false): boolean {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false;
  }

  return Boolean(value);
}

function toNumber(value: any, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function localizedText(value: any, fallback: LangText = DEFAULT_LANG_TEXT): LangText {
  const parsed = parseIfJson(value, fallback);

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const ru = String(parsed.ru ?? parsed.uz ?? fallback.ru ?? '').trim();
    const uz = String(parsed.uz ?? parsed.ru ?? fallback.uz ?? '').trim();
    return {
      ru: ru || uz || fallback.ru || '',
      uz: uz || ru || fallback.uz || '',
    };
  }

  const text = parsed === null || parsed === undefined ? '' : String(parsed);
  return {
    ru: text || fallback.ru || '',
    uz: text || fallback.uz || '',
  };
}

function localizedList(value: any): LangList {
  const parsed = parseIfJson(value, DEFAULT_LANG_LIST);

  if (Array.isArray(parsed)) {
    const items = parsed.map((item) => String(item ?? '').trim()).filter(Boolean);
    return { ru: items, uz: items };
  }

  if (parsed && typeof parsed === 'object') {
    const ruRaw = Array.isArray(parsed.ru) ? parsed.ru : [];
    const uzRaw = Array.isArray(parsed.uz) ? parsed.uz : [];

    const ru = ruRaw.map((item: any) => String(item ?? '').trim()).filter(Boolean);
    const uz = uzRaw.map((item: any) => String(item ?? '').trim()).filter(Boolean);

    return {
      ru: ru.length ? ru : uz,
      uz: uz.length ? uz : ru,
    };
  }

  return DEFAULT_LANG_LIST;
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
      name: localizedText(name),
      value: localizedText(value),
    };
  }).filter(s => s.name.ru || s.name.uz || s.value.ru || s.value.uz);
}

function transformProductRow(p: any) {
  const slug = localizedText(p.slug, { uz: String(p.id), ru: String(p.id) });
  const name = localizedText(p.name || p.title, { uz: String(p.id), ru: String(p.id) });
  const tagline = localizedText(p.tagline);
  const description = localizedText(p.description);
  const priceFormatted = localizedText(p.priceFormatted, { uz: "So'rov bo'yicha", ru: 'По запросу' });
  const features = localizedList(p.features);
  const applications = localizedList(p.applications);
  const standardCert = localizedText(p.standardCert, { uz: 'GOST / O‘zstandart', ru: 'ГОСТ / Узстандарт' });
  const seoTitle = localizedText(p.seoTitle, name);
  const seoDescription = localizedText(p.seoDescription);
  const seoKeywords = localizedText(p.seoKeywords);
  const images = parseArray(p.images || p.additionalImages);

  const inds = cleanIdArray(p.industryIds ?? p.industries);
  const tasks = cleanIdArray(p.industryTaskIds ?? p.tasks);

  return {
    id: p.id,
    slug,
    brandId: p.brand_id || null,
    model: p.model || '',
    category: p.category || p.categoryId || 'sensors',
    categoryId: p.categoryId || p.category || 'sensors',
    name,
    tagline,
    description,
    price: toNumber(p.price, 0),
    oldPrice: toNumber(p.oldPrice, 0),
    priceFormatted,
    inStock: toBoolean(p.inStock ?? p.isActive, true),
    isActive: toBoolean(p.isActive, true),
    isPopular: toBoolean(p.isPopular, false),
    isNew: toBoolean(p.isNew, false),
    image: p.image || p.imageUrl || '',
    imageUrl: p.imageUrl || p.image || '',
    additionalImages: images,
    pdfCatalogUrl: p.pdfCatalogUrl || '',
    specs: parseSpecs(p.specs),
    features,
    applications,
    standardCert,
    warrantyMonths: toNumber(p.warrantyMonths, 12),
    industryIds: inds,
    industryTaskIds: tasks,
    industries: inds,
    tasks: tasks,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImage: p.ogImage || p.image || '',
  };
}

// 1. GET: Bitta tovar ma'lumotlarini olish
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

// 2. POST: AI yordamida tovar parametrlarini avtomatik to'ldirish
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

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY kaliti topilmadi' },
        { status: 500 }
      );
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
    const currentName = localizedText(current ? (current.name || current.title) : body?.name, { ru: currentModel, uz: currentModel });
    const currentDesc = localizedText(current ? current.description : body?.description);

    const prompt = `
Siz sanoat uskunalari, KIPiA va elektrotexnika bo'yicha mustaqil bosh muhandissiz.

QAT'IY CHEKLOV VA TALAB:
1. "MAXTRON" so'zini tovar nomiga (name), modeliga, brendiga (detectedBrand) yoki tavsifiga (description) ISHLAB CHIQARUVCHI BREND SIFATIDA ASLO QO'SHMANG! MAXTRON ishlab chiqaruvchi emas.
2. Agar haqiqiy brend noma'lum bo'lsa yoki standart GOST/DIN bo'lsa, "detectedBrand" maydoniga "Standart / GOST" yoki "Universal" deb yozing.

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
4. "description": JUDA BATAFSIL (kamida 250-350 so'z, 3 ta to'liq abzas). HTML formatida (<p>, <strong>, <ul>, <li>) har ikki tilda yozilsin.
5. "specs": 8-12 tagacha aniq texnik parametr (kesim yuzasi, kuchlanish, tok, material, himoya klassi va h.k.).
6. "features" va "applications": Kamida 4-6 tadan aniq band.
7. Hech bir 'uz' maydoni bo'sh qolmasin.
`;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const aiConfig: any = {
      systemInstruction: "Har doim faqat toza JSON formatida javob bering. Hech qachon tovar nomiga 'MAXTRON' so'zini qo'shmang. Har bir matnli maydonda 'ru' va 'uz' (o'zbekcha lotin imlosida) to'liq to'ldirilishi shart.",
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

    let response: any = null;
    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[AI Request] ${modelName} modeliga so'rov yuborilmoqda...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: aiConfig
        });

        if (response?.text) {
          console.log(`[AI Success] ${modelName} muvaffaqiyatli javob berdi.`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[AI Fallback] ${modelName} xatolik berdi: ${errMsg}`);

        // Agar so'rov formati xato bo'lsa (400), keyingi modellarni sinash befoyda
        if (errMsg.includes('400') || err?.status === 400) {
          console.error('[AI Fatal Error 400] So‘rov formati xato, zanjir to‘xtatildi.');
          break;
        }

        // 503 (High demand) yoki 429 xatolarida keyingi modelga o'tishdan oldin 1.2 soniya kutish
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    if (!response?.text) {
      const errStr = lastError?.message || (typeof lastError === 'string' ? lastError : JSON.stringify(lastError));
      throw new Error(errStr || "AI modellar bilan bog'lanishda xatolik yuz berdi.");
    }

    let cleanJson = response.text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const enriched = JSON.parse(cleanJson || '{}');

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

// 3. DELETE: Mahsulotni o'chirish
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