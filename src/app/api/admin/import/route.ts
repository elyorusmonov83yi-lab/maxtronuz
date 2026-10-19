import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Yuklash uchun tovarlar topilmadi" }, { status: 400 });
    }

    let count = 0;

    for (const item of products) {
      const slugVal = item.slug || item.model || '';
      const slugJson = JSON.stringify({
        ru: slugVal,
        uz: slugVal,
      });

      const nameJson = JSON.stringify({
        ru: item.name_ru || item.name || '',
        uz: item.name_uz || item.name || '',
      });

      const descJson = JSON.stringify({
        ru: item.description_ru || '',
        uz: item.description_uz || '',
      });

      const seoTitleJson = JSON.stringify({
        ru: item.seo_title_ru || '',
        uz: item.seo_title_uz || '',
      });

      const seoDescJson = JSON.stringify({
        ru: item.seo_desc_ru || '',
        uz: item.seo_desc_uz || '',
      });

      await db.query(
        `INSERT INTO products (
          model, brand, price, in_stock, image,
          slug, name, description, seo_title, seo_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          seo_title = VALUES(seo_title),
          seo_description = VALUES(seo_description),
          image = VALUES(image),
          price = VALUES(price),
          in_stock = VALUES(in_stock)`,
        [
          item.model || slugVal,
          item.brand || 'MAXTRON',
          Number(item.price) || 0,
          item.in_stock ? 1 : 0,
          item.image_url || item.image || '',
          slugJson,
          nameJson,
          descJson,
          seoTitleJson,
          seoDescJson,
        ]
      );
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Import jarayonida xatolik:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}