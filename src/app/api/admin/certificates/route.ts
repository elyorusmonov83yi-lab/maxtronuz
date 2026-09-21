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

// 1. GET: Barcha sertifikatlarni olish (Ochiq endpoint)
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM certificates ORDER BY id DESC');
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const certificates = rows.map((c: any) => ({
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
    }));

    return NextResponse.json({ success: true, data: certificates });
  } catch (error: any) {
    console.error('Certificates GET Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Sertifikatlarni yuklashda xatolik' },
      { status: 500 }
    );
  }
}

// 2. POST: Sertifikatni saqlash yoki yangilash (Admin talab qilinadi)
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

    const cert = await req.json();
    if (!cert) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    const certId = String(cert.id || `cert-${Date.now()}`);
    const certNumber = String(cert.certNumber || cert.number || '');

    const title = typeof cert.title === 'object'
      ? JSON.stringify(cert.title)
      : JSON.stringify({ uz: cert.title || '', ru: cert.title || '' });

    const description = cert.description
      ? (typeof cert.description === 'object' ? JSON.stringify(cert.description) : String(cert.description))
      : null;

    const issuer = typeof cert.issuer === 'object'
      ? JSON.stringify(cert.issuer)
      : JSON.stringify({ uz: cert.issuer || '', ru: cert.issuer || '' });

    const issueDate = cert.issueDate ? String(cert.issueDate) : null;
    const validUntil = cert.validUntil ? String(cert.validUntil) : null;
    const image = String(cert.image || cert.previewUrl || '');
    const pdfUrl = String(cert.pdfUrl || '');

    await db.query(
      `INSERT INTO certificates 
        (id, title, description, issuer, issueDate, validUntil, certNumber, image, pdfUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        description = VALUES(description),
        issuer = VALUES(issuer),
        issueDate = VALUES(issueDate),
        validUntil = VALUES(validUntil),
        certNumber = VALUES(certNumber),
        image = VALUES(image),
        pdfUrl = VALUES(pdfUrl)`,
      [certId, title, description, issuer, issueDate, validUntil, certNumber, image, pdfUrl]
    );

    return NextResponse.json({
      success: true,
      id: certId,
      message: 'Sertifikat muvaffaqiyatli saqlandi'
    });
  } catch (error: any) {
    console.error('Certificates POST Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Sertifikatni saqlashda xatolik' },
      { status: 500 }
    );
  }
}