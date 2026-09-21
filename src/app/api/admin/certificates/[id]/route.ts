import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

function parseIfJson(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val || fallback;
  }
}

// 1. GET: Bitta sertifikatni ID bo'yicha olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.query(
      'SELECT * FROM certificates WHERE id = ? OR certNumber = ? LIMIT 1',
      [id, id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Sertifikat topilmadi' },
        { status: 404 }
      );
    }

    const c = rows[0];
    const certificate = {
      id: c.id,
      number: c.certNumber || c.number || '',
      certNumber: c.certNumber || c.number || '',
      title: parseIfJson(c.title, { uz: '', ru: '' }),
      description: parseIfJson(c.description, null),
      issuer: parseIfJson(c.issuer, { uz: '', ru: '' }),
      issueDate: c.issueDate || '',
      validUntil: c.validUntil || '',
      standard: c.standard || '',
      docNumber: c.docNumber || '',
      image: c.image || c.previewUrl || '',
      previewUrl: c.image || c.previewUrl || '',
      pdfUrl: c.pdfUrl || ''
    };

    return NextResponse.json({ success: true, data: certificate });
  } catch (error: any) {
    console.error('Certificate GET Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Sertifikatni o'chirish (Admin talab qilinadi)
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query('DELETE FROM certificates WHERE id = ?', [id]);
    return NextResponse.json({
      success: true,
      message: 'Sertifikat muvaffaqiyatli o‘chirildi'
    });
  } catch (error: any) {
    console.error('Certificates DELETE Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Sertifikatni o‘chirishda xatolik' },
      { status: 500 }
    );
  }
}