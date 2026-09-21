import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

function parseIfJson(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}

// 1. GET: Barcha toifalarni olish (Ochiq endpoint)
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM categories ORDER BY id ASC');
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const categories = rows.map((c: any) => ({
      id: c.id,
      parentId: c.parentId && c.parentId !== 'none' && c.parentId !== '' ? c.parentId : null,
      slug: parseIfJson(c.slug, { uz: c.id, ru: c.id }),
      name: parseIfJson(c.name, { uz: c.id, ru: c.id }),
      description: parseIfJson(c.description, { uz: '', ru: '' }),
      icon: c.icon || 'Layers',
      image: c.image || '',
      seoTitle: parseIfJson(c.seoTitle, { uz: '', ru: '' }),
      seoDescription: parseIfJson(c.seoDescription, { uz: '', ru: '' }),
      seoKeywords: parseIfJson(c.seoKeywords, { uz: '', ru: '' }),
      ogImage: c.ogImage || ''
    }));

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Categories DB load error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. POST: Toifani saqlash yoki yangilash (Admin talab qilinadi)
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

    const cat = await req.json();
    if (!cat) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    const catId = cat.id || `cat-${Date.now().toString().slice(-6)}`;
    const parentId = cat.parentId && cat.parentId !== 'none' && cat.parentId !== '' ? cat.parentId : null;

    const slug = typeof cat.slug === 'object' ? JSON.stringify(cat.slug) : JSON.stringify({ uz: catId, ru: catId });
    const name = typeof cat.name === 'object' ? JSON.stringify(cat.name) : JSON.stringify({ uz: cat.name || '', ru: cat.name || '' });
    const description = typeof cat.description === 'object' ? JSON.stringify(cat.description) : JSON.stringify({ uz: '', ru: '' });
    const icon = cat.icon || 'Layers';
    const image = cat.image || '';
    const seoTitle = typeof cat.seoTitle === 'object' ? JSON.stringify(cat.seoTitle) : JSON.stringify({});
    const seoDescription = typeof cat.seoDescription === 'object' ? JSON.stringify(cat.seoDescription) : JSON.stringify({});
    const seoKeywords = typeof cat.seoKeywords === 'object' ? JSON.stringify(cat.seoKeywords) : JSON.stringify({});
    const ogImage = cat.ogImage || cat.image || '';

    await db.query(
      `INSERT INTO categories 
        (id, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        parentId = VALUES(parentId),
        slug = VALUES(slug),
        name = VALUES(name),
        description = VALUES(description),
        icon = VALUES(icon),
        image = VALUES(image),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage)`,
      [catId, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage]
    );

    return NextResponse.json({ success: true, id: catId, message: 'Kategoriya muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Category DB save error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}