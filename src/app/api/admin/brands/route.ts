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

export async function GET() {
  try {
    const [rows]: any = await db.query(
      'SELECT * FROM brands ORDER BY orderIndex ASC, created_at DESC'
    );

    const brands = (rows || []).map((b: any) => ({
      ...b,
      name: parseIfJson(b.name, b.name),
      description: parseIfJson(b.description, b.description),
    }));

    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    console.error('Brands GET error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { id, name, slug, logo, image, description, country, website, siteUrl, orderIndex, isActive } = body;

    const brandId = id || `brand_${Date.now()}`;
    const brandName = typeof name === 'object' ? JSON.stringify(name) : (name || '');
    const brandDesc = typeof description === 'object' ? JSON.stringify(description) : (description || '');
    const brandLogo = logo || image || '';
    const brandSlug = slug || brandId;
    const brandWebsite = website || siteUrl || '';
    const brandCountry = country || '';
    const brandOrder = Number(orderIndex) || 0;
    const brandActive = isActive === false ? 0 : 1;

    await db.query(
      `INSERT INTO brands (id, name, slug, logo, description, country, website, orderIndex, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         slug = VALUES(slug),
         logo = VALUES(logo),
         description = VALUES(description),
         country = VALUES(country),
         website = VALUES(website),
         orderIndex = VALUES(orderIndex),
         isActive = VALUES(isActive)`,
      [brandId, brandName, brandSlug, brandLogo, brandDesc, brandCountry, brandWebsite, brandOrder, brandActive]
    );

    return NextResponse.json({ success: true, data: { id: brandId } });
  } catch (error: any) {
    console.error('Brands POST error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}
