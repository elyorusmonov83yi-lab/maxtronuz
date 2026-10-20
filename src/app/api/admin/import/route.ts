import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Import qilish uchun tovarlar topilmadi." },
        { status: 400 }
      );
    }

    let inserted = 0;
    let updated = 0;

    for (const item of products) {
      const modelVal = String(item.model || item.code || '').trim();

      // Nomlarni aniqlash: name_ru, name_uz, title_ru yoki obyekt shaklida kelganda
      let nameRu = '';
      let nameUz = '';

      if (typeof item.name === 'object' && item.name !== null) {
        nameRu = String(item.name.ru || item.name_ru || item.title || '').trim();
        nameUz = String(item.name.uz || item.name_uz || nameRu).trim();
      } else {
        nameRu = String(item.name_ru || item.title_ru || item.name || item.title || modelVal).trim();
        nameUz = String(item.name_uz || item.title_uz || item.name || nameRu).trim();
      }

      // Agar nom baribir bo'sh bo'lsa, oxirgi chora sifatida model olinadi
      if (!nameRu) nameRu = modelVal;
      if (!nameUz) nameUz = nameRu;

      const nameObj = { ru: nameRu, uz: nameUz };

      // Tavsifni aniqlash
      let descRu = '';
      let descUz = '';

      if (typeof item.description === 'object' && item.description !== null) {
        descRu = String(item.description.ru || item.description_ru || '').trim();
        descUz = String(item.description.uz || item.description_uz || '').trim();
      } else {
        descRu = String(item.description_ru || item.description || '').trim();
        descUz = String(item.description_uz || '').trim();
      }

      const descObj = { ru: descRu, uz: descUz };

      // Slug va ID shakllantirish
      const rawSlug = String(item.slug?.ru || item.slug || item.id || modelVal);
      const slugVal = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const slugObj = typeof item.slug === 'object' && item.slug !== null
        ? item.slug
        : { ru: slugVal, uz: slugVal };

      const idVal = String(item.id || slugVal || `p-${Date.now()}-${inserted + updated}`).trim();
      const brandIdVal = String(item.brand_id || item.brand || 'maxtron').trim().toLowerCase().replace(/\s+/g, '-');
      const categoryIdVal = String(item.categoryId || item.category_id || item.category || 'all').trim();
      const imageVal = String(item.image || item.imageUrl || item.image_url || '').trim();
      const priceVal = Number(item.price) || 0;
      const inStockVal = item.inStock !== undefined ? (item.inStock ? 1 : 0) : (item.in_stock ? 1 : 0);

      const [result]: any = await db.query(
        `INSERT INTO products (
          id, model, brand_id, categoryId, category,
          slug, title, name, description,
          image, imageUrl, price, inStock, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          model = VALUES(model),
          brand_id = VALUES(brand_id),
          categoryId = VALUES(categoryId),
          category = VALUES(category),
          slug = VALUES(slug),
          title = VALUES(title),
          name = VALUES(name),
          description = VALUES(description),
          image = VALUES(image),
          imageUrl = VALUES(imageUrl),
          price = VALUES(price),
          inStock = VALUES(inStock),
          isActive = 1`,
        [
          idVal,
          modelVal || idVal,
          brandIdVal,
          categoryIdVal,
          categoryIdVal,
          JSON.stringify(slugObj),
          JSON.stringify(nameObj),
          JSON.stringify(nameObj),
          JSON.stringify(descObj),
          imageVal,
          imageVal,
          priceVal,
          inStockVal,
        ]
      );

      if (result.affectedRows === 1) {
        inserted++;
      } else if (result.affectedRows === 2) {
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import muvaffaqiyatli yakunlandi: ${inserted} ta yangi qo'shildi, ${updated} ta yangilandi.`,
      stats: { inserted, updated, total: products.length },
    });
  } catch (error: any) {
    console.error("Import API xatosi:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Bazada saqlashda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}