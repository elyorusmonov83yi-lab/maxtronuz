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
      parentId: c.parentId && c.parentId !== 'none' && c.parentId !== '' && c.parentId !== '0' && c.parentId !== 'null' ? c.parentId : null,
      slug: parseIfJson(c.slug, { uz: c.id, ru: c.id }),
      name: parseIfJson(c.name, { uz: c.id, ru: c.id }),
      description: parseIfJson(c.description, { uz: '', ru: '' }),
      icon: c.icon || 'Layers',
      imageUrl: c.imageUrl || '',
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
    
    const parentId = 
      cat.parentId && 
      cat.parentId !== 'none' && 
      cat.parentId !== '' && 
      cat.parentId !== '0' && 
      cat.parentId !== 'null' && 
      cat.parentId !== 'h' 
        ? cat.parentId 
        : null;

    const toJsonString = (val: any, fallback: any = {}) => {
      if (!val) return JSON.stringify(fallback);
      if (typeof val === 'string') {
        try {
          JSON.parse(val);
          return val;
        } catch {
          return JSON.stringify({ uz: val, ru: val });
        }
      }
      return JSON.stringify(val);
    };

    const slug = toJsonString(cat.slug, { uz: catId, ru: catId });
    const name = toJsonString(cat.name, { uz: '', ru: '' });
    const description = toJsonString(cat.description, { uz: '', ru: '' });
    const icon = cat.icon || 'Layers';
    const imageUrl = cat.imageUrl || cat.image || '';
    const seoTitle = toJsonString(cat.seoTitle, { uz: '', ru: '' });
    const seoDescription = toJsonString(cat.seoDescription, { uz: '', ru: '' });
    const seoKeywords = toJsonString(cat.seoKeywords, { uz: '', ru: '' });
    const ogImage = cat.ogImage || imageUrl || '';

    await db.query(
      `INSERT INTO categories 
        (id, parentId, slug, name, description, icon, imageUrl, seoTitle, seoDescription, seoKeywords, ogImage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        parentId = VALUES(parentId),
        slug = VALUES(slug),
        name = VALUES(name),
        description = VALUES(description),
        icon = VALUES(icon),
        imageUrl = VALUES(imageUrl),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage)`,
      [catId, parentId, slug, name, description, icon, imageUrl, seoTitle, seoDescription, seoKeywords, ogImage]
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