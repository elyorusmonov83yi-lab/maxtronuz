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

// 1. GET: Получение данных страницы "О нас" (Открытый эндпоинт для сайта и админки)
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM about_page WHERE id = 1');
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Данные страницы не найдены' },
        { status: 404 }
      );
    }

    const row = rows[0];

    const data = {
      id: row.id,
      heroBadge: parseIfJson(row.hero_badge, { uz: '', uz_cyrl: '', ru: '' }),
      heroTitle: parseIfJson(row.hero_title, { uz: '', uz_cyrl: '', ru: '' }),
      heroSubtitle: parseIfJson(row.hero_subtitle, { uz: '', uz_cyrl: '', ru: '' }),
      storyTitle: parseIfJson(row.story_title, { uz: '', uz_cyrl: '', ru: '' }),
      storyText: parseIfJson(row.story_text, { uz: '', uz_cyrl: '', ru: '' }),
      benefits: parseIfJson(row.benefits, { uz: [], uz_cyrl: [], ru: [] }),
      yearsExp: row.years_exp || '8+ йил',
      statExpLabel: parseIfJson(row.years_exp_label, { uz: '', uz_cyrl: '', ru: '' }),
      equipmentDelivered: row.equipment_delivered || '1,500+',
      statDeliveredLabel: parseIfJson(row.equipment_delivered_label, { uz: '', uz_cyrl: '', ru: '' }),
      warehouseItems: row.warehouse_items || '200+',
      statWarehouseLabel: parseIfJson(row.warehouse_items_label, { uz: '', uz_cyrl: '', ru: '' }),
      partnerClients: row.partner_clients || '500+',
      statPartnersLabel: parseIfJson(row.partner_clients_label, { uz: '', uz_cyrl: '', ru: '' }),
      supplySteps: parseIfJson(row.supply_steps, []),
      seoSettings: parseIfJson(row.seo_settings, {}),
      updatedAt: row.updated_at
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('About Page DB load error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// 2. POST / PUT: Сохранение данных из админки (Требуется токен администратора)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Отправлены пустые данные' },
        { status: 400 }
      );
    }

    const {
      heroBadge,
      heroTitle,
      heroSubtitle,
      storyTitle,
      storyText,
      benefits,
      yearsExp,
      statExpLabel,
      equipmentDelivered,
      statDeliveredLabel,
      warehouseItems,
      statWarehouseLabel,
      partnerClients,
      statPartnersLabel,
      supplySteps,
      seoSettings
    } = body;

    const toStr = (val: any, fallback: any = {}) =>
      typeof val === 'object' ? JSON.stringify(val) : JSON.stringify(fallback);

    await db.query(
      `INSERT INTO about_page (
        id, 
        hero_badge, 
        hero_title, 
        hero_subtitle, 
        story_title, 
        story_text, 
        benefits, 
        years_exp, 
        years_exp_label, 
        equipment_delivered, 
        equipment_delivered_label, 
        warehouse_items, 
        warehouse_items_label, 
        partner_clients, 
        partner_clients_label, 
        supply_steps, 
        seo_settings
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        hero_badge = VALUES(hero_badge),
        hero_title = VALUES(hero_title),
        hero_subtitle = VALUES(hero_subtitle),
        story_title = VALUES(story_title),
        story_text = VALUES(story_text),
        benefits = VALUES(benefits),
        years_exp = VALUES(years_exp),
        years_exp_label = VALUES(years_exp_label),
        equipment_delivered = VALUES(equipment_delivered),
        equipment_delivered_label = VALUES(equipment_delivered_label),
        warehouse_items = VALUES(warehouse_items),
        warehouse_items_label = VALUES(warehouse_items_label),
        partner_clients = VALUES(partner_clients),
        partner_clients_label = VALUES(partner_clients_label),
        supply_steps = VALUES(supply_steps),
        seo_settings = VALUES(seo_settings),
        updated_at = NOW()`,
      [
        toStr(heroBadge),
        toStr(heroTitle),
        toStr(heroSubtitle),
        toStr(storyTitle),
        toStr(storyText),
        toStr(benefits, { uz: [], uz_cyrl: [], ru: [] }),
        yearsExp || '8+ йил',
        toStr(statExpLabel),
        equipmentDelivered || '1,500+',
        toStr(statDeliveredLabel),
        warehouseItems || '200+',
        toStr(statWarehouseLabel),
        partnerClients || '500+',
        toStr(statPartnersLabel),
        toStr(supplySteps, []),
        toStr(seoSettings, {})
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Настройки «О компании» успешно сохранены в MySQL'
    });
  } catch (error: any) {
    console.error('About Page DB save error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка сервера' },
      { status: 500 }
    );
  }
}