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

// 1. GET: Barcha sohalarni olish (Ochiq endpoint)
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM industries ORDER BY created_at ASC');
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const industries = rows.map((r: any) => ({
      id: r.id,
      slug: r.slug || r.id,
      name: parseIfJson(r.name, { uz: '', ru: '' }),
      desc: parseIfJson(r.description, { uz: '', ru: '' }),
      icon: r.icon || 'Building2',
      tasks: parseIfJson(r.tasks, [])
    }));

    return NextResponse.json({ success: true, data: industries });
  } catch (error: any) {
    console.error('Industries DB load error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. POST: Sohalarni to'plam tarzida saqlash (🔒 Faqat Admin)
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

    const payload = await req.json();

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    if (Array.isArray(payload)) {
      await db.query('START TRANSACTION');

      try {
        await db.query('DELETE FROM industries');

        for (const ind of payload) {
          const indId = String(ind.id || `ind_${Date.now().toString().slice(-6)}`);
          const slug = String(ind.slug || indId);
          const name = typeof ind.name === 'object' ? JSON.stringify(ind.name) : JSON.stringify({ uz: ind.name || '', ru: ind.name || '' });
          const desc = typeof ind.desc === 'object' ? JSON.stringify(ind.desc) : JSON.stringify({ uz: '', ru: '' });
          const icon = String(ind.icon || 'Building2');
          const tasks = Array.isArray(ind.tasks) ? JSON.stringify(ind.tasks) : JSON.stringify([]);

          await db.query(
            `INSERT INTO industries (id, slug, name, description, icon, tasks) VALUES (?, ?, ?, ?, ?, ?)`,
            [indId, slug, name, desc, icon, tasks]
          );
        }

        await db.query('COMMIT');
        return NextResponse.json({ success: true, message: 'Sohalar muvaffaqiyatli saqlandi' });
      } catch (txError) {
        await db.query('ROLLBACK');
        throw txError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Industries DB save error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}