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

// 1. GET: Bitta toifani ID yoki Slug bo'yicha olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const [rows]: any = await db.query(
      `SELECT * FROM categories 
       WHERE id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
       LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kategoriya topilmadi' },
        { status: 404 }
      );
    }

    const c = rows[0];
    const category = {
      id: c.id,
      parentId: c.parentId && c.parentId !== 'none' && c.parentId !== '' ? c.parentId : null,
      slug: parseIfJson(c.slug, { uz: c.id, ru: c.id }),
      name: parseIfJson(c.name, { uz: c.id, ru: c.id }),
      description: parseIfJson(c.description, { uz: '', ru: '' }),
      icon: c.icon || 'Layers',
      imageUrl: c.imageUrl || c.image || '',
      seoTitle: parseIfJson(c.seoTitle, { uz: '', ru: '' }),
      seoDescription: parseIfJson(c.seoDescription, { uz: '', ru: '' }),
      seoKeywords: parseIfJson(c.seoKeywords, { uz: '', ru: '' }),
      ogImage: c.ogImage || c.imageUrl || c.image || ''
    };

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Category DB fetch error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. PUT: Kategoriyani tahrirlash va rasmni saqlash (Admin talab qilinadi)
export async function PUT(
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
    const cat = await req.json();
    if (!cat) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

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

    const parentId = cat.parentId && cat.parentId !== 'none' && cat.parentId !== '' && cat.parentId !== '0' ? cat.parentId : null;
    const slug = toJsonString(cat.slug, { uz: identifier, ru: identifier });
    const name = toJsonString(cat.name, { uz: '', ru: '' });
    const description = toJsonString(cat.description, { uz: '', ru: '' });
    const icon = cat.icon || 'Layers';
    const imageUrl = cat.imageUrl || cat.image || '';
    const seoTitle = toJsonString(cat.seoTitle, { uz: '', ru: '' });
    const seoDescription = toJsonString(cat.seoDescription, { uz: '', ru: '' });
    const seoKeywords = toJsonString(cat.seoKeywords, { uz: '', ru: '' });
    const ogImage = cat.ogImage || imageUrl || '';

    await db.query(
      `UPDATE categories 
       SET parentId = ?, slug = ?, name = ?, description = ?, icon = ?, imageUrl = ?, seoTitle = ?, seoDescription = ?, seoKeywords = ?, ogImage = ?
       WHERE id = ? OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ?`,
      [parentId, slug, name, description, icon, imageUrl, seoTitle, seoDescription, seoKeywords, ogImage, identifier, identifier, identifier]
    );

    return NextResponse.json({ success: true, message: 'Kategoriya muvaffaqiyatli yangilandi' });
  } catch (error: any) {
    console.error('Category DB update error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Toifani o'chirish (Admin talab qilinadi)
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
      `DELETE FROM categories 
       WHERE id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ?`,
      [identifier, identifier, identifier]
    );

    return NextResponse.json({ success: true, message: 'Kategoriya o‘chirildi' });
  } catch (error: any) {
    console.error('Category DB delete error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}