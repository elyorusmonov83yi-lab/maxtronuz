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
      image: c.image || '',
      seoTitle: parseIfJson(c.seoTitle, { uz: '', ru: '' }),
      seoDescription: parseIfJson(c.seoDescription, { uz: '', ru: '' }),
      seoKeywords: parseIfJson(c.seoKeywords, { uz: '', ru: '' }),
      ogImage: c.ogImage || ''
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

// 2. DELETE: Toifani o'chirish (Admin talab qilinadi)
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