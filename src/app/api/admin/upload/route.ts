import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyAdminToken } from '@/server/auth';
import { r2 } from '@/lib/r2';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

const ALLOWED_EXTENSIONS = new Set([
  '.webp', '.avif', '.png', '.jpg', '.jpeg', '.svg',
  '.pdf', '.docx', '.xlsx'
]);

const ALLOWED_MIME_TYPES = new Set([
  'image/webp',
  'image/avif',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

function getSubdirectory(extension: string): string {
  if (extension === '.pdf') return 'certificates';
  if (extension === '.docx' || extension === '.xlsx') return 'documents';
  return 'products';
}

export async function POST(req: NextRequest) {
  try {
    // 1. Admin tekshiruvi
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    // 2. FormData o'qish
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'Fayl yuborilmadi' },
        { status: 400 }
      );
    }

    // 3. Hajmni tekshirish (30 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Fayl hajmi 30 MB dan oshmasligi kerak' },
        { status: 400 }
      );
    }

    // 4. Kengaytma va MIME-type tekshiruvi
    const originalName = file.name || 'document';
    const extension = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat etilmagan fayl formati' },
        { status: 400 }
      );
    }

    // 5. R2 kaliti (yo'li) va fayl nomini shakllantirish
    const subDir = getSubdirectory(extension);
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const r2Key = `uploads/${subDir}/${filename}`;

    // 6. Faylni Buffer ko'rinishida olish
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Cloudflare R2 ga yuklash (Bucket nomini avtomatik tozalash va himoya)
    const rawBucket = process.env.R2_BUCKET_NAME || 'maxtron-media';
    const cleanBucket = rawBucket.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

    await r2.send(
      new PutObjectCommand({
        Bucket: cleanBucket,
        Key: r2Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 8. Ommaviy doimiy havola yasash
    const publicBaseUrl = (
      process.env.R2_PUBLIC_URL || 
      'https://pub-c5bf1cc313b64b11a814e82fc55b22d5.r2.dev'
    ).replace(/\/$/, '');
    
    const permanentUrl = `${publicBaseUrl}/${r2Key}`;

    return NextResponse.json({
      success: true,
      url: permanentUrl,
      name: originalName,
    });
  } catch (error: any) {
    console.error('Upload API Error:', error?.message);
    return NextResponse.json(
      { success: false, message: error?.message || 'Fayl yuklashda server xatosi' },
      { status: 500 }
    );
  }
}