import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { verifyAdminToken } from '@/server/auth';

const BASE_UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
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

    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat etilmagan fayl formati' },
        { status: 400 }
      );
    }

    // 5. Papkani aniqlash va yaratish
    const subDir = getSubdirectory(extension);
    const targetDir = path.join(BASE_UPLOAD_DIR, subDir);
    await fs.mkdir(targetDir, { recursive: true });

    // 6. Takrorlanmas nom yaratish va diskka yozish
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const filePath = path.join(targetDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subDir}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: originalName
    });
  } catch (error: any) {
    console.error('Upload API Error:', error?.message);
    return NextResponse.json(
      { success: false, message: error?.message || 'Fayl yuklashda server xatosi' },
      { status: 500 }
    );
  }
}