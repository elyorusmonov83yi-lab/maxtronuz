// api/app.ts
import express from "express";
import path2 from "path";
import dotenv2 from "dotenv";

// src/api/admin/header/route.ts
import { Router } from "express";

// src/server/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
var db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100
});
db.getConnection().then((conn) => {
  console.log("\u2705 Aiven MariaDB bazasiga muvaffaqiyatli ulandi!");
  conn.release();
}).catch((err) => {
  console.error("\u274C MariaDB ulanishda xatolik:", err.message);
});

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET;
var requireAdmin = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, error: "Serverda JWT_SECRET sozlanmagan" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Avtorizatsiyadan o\u2018tilmagan (Token topilmadi)" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Yaroqsiz yoki muddati o\u2018tgan token" });
  }
};
var requireSuperAdmin = (req, res, next) => {
  requireAdmin(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, error: "Bu amal faqat bosh administrator uchun ruxsat etilgan" });
    }
    next();
  });
};

// src/api/admin/header/route.ts
var router = Router();
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'header_settings' LIMIT 1"
    );
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      const val = rows[0].setting_value;
      if (typeof val === "object" && val !== null) {
        return res.json({ success: true, data: val });
      }
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (!trimmed || trimmed === "[object Object]") {
          return res.json({ success: true, data: {} });
        }
        try {
          return res.json({ success: true, data: JSON.parse(trimmed) });
        } catch {
          return res.json({ success: true, data: {} });
        }
      }
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error("Header DB load error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body === "object" && Object.keys(body).length === 0) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    const headerData = typeof body === "object" ? JSON.stringify(body) : String(body);
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES ('header_settings', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [headerData, headerData]
    );
    res.json({ success: true, message: "Header sozlamalari muvaffaqiyatli saqlandi" });
  } catch (error) {
    console.error("Header DB save error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default = router;

// src/api/admin/categories/route.ts
import { Router as Router2 } from "express";
var router2 = Router2();
function parseIfJson(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}
router2.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const categories = rows.map((c) => ({
      id: c.id,
      parentId: c.parentId && c.parentId !== "none" && c.parentId !== "" ? c.parentId : null,
      slug: parseIfJson(c.slug, { uz: c.id, ru: c.id }),
      name: parseIfJson(c.name, { uz: c.id, ru: c.id }),
      description: parseIfJson(c.description, { uz: "", ru: "" }),
      icon: c.icon || "Layers",
      image: c.image || "",
      seoTitle: parseIfJson(c.seoTitle, { uz: "", ru: "" }),
      seoDescription: parseIfJson(c.seoDescription, { uz: "", ru: "" }),
      seoKeywords: parseIfJson(c.seoKeywords, { uz: "", ru: "" }),
      ogImage: c.ogImage || ""
    }));
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories DB load error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.post("/", requireAdmin, async (req, res) => {
  try {
    const cat = req.body;
    if (!cat) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    const catId = cat.id || `cat-${Date.now().toString().slice(-6)}`;
    const parentId = cat.parentId && cat.parentId !== "none" && cat.parentId !== "" ? cat.parentId : null;
    const slug = typeof cat.slug === "object" ? JSON.stringify(cat.slug) : JSON.stringify({ uz: catId, ru: catId });
    const name = typeof cat.name === "object" ? JSON.stringify(cat.name) : JSON.stringify({ uz: cat.name || "", ru: cat.name || "" });
    const description = typeof cat.description === "object" ? JSON.stringify(cat.description) : JSON.stringify({ uz: "", ru: "" });
    const icon = cat.icon || "Layers";
    const image = cat.image || "";
    const seoTitle = typeof cat.seoTitle === "object" ? JSON.stringify(cat.seoTitle) : JSON.stringify({});
    const seoDescription = typeof cat.seoDescription === "object" ? JSON.stringify(cat.seoDescription) : JSON.stringify({});
    const seoKeywords = typeof cat.seoKeywords === "object" ? JSON.stringify(cat.seoKeywords) : JSON.stringify({});
    const ogImage = cat.ogImage || cat.image || "";
    await db.query(
      `INSERT INTO categories 
        (id, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        parentId = VALUES(parentId),
        slug = VALUES(slug),
        name = VALUES(name),
        description = VALUES(description),
        icon = VALUES(icon),
        image = VALUES(image),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage)`,
      [catId, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage]
    );
    res.json({ success: true, id: catId, message: "Kategoriya muvaffaqiyatli saqlandi" });
  } catch (error) {
    console.error("Category DB save error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router2.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Kategoriya o\u2018chirildi" });
  } catch (error) {
    console.error("Category DB delete error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default2 = router2;

// src/api/admin/products/route.ts
import { Router as Router3 } from "express";
var router3 = Router3();
function parseIfJson2(val, fallback = {}) {
  if (val === null || val === void 0) return fallback;
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}
function parseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string" && parsed.startsWith("[")) {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}
function cleanIdArray(val) {
  const arr = parseArray(val);
  return arr.map((item) => typeof item === "object" && item !== null ? String(item.id || item.value || "") : String(item)).filter((s) => s.trim().length > 0);
}
function parseSpecs(rawSpecs) {
  const parsed = parseArray(rawSpecs);
  return parsed.map((s) => {
    let name = s?.name;
    let value = s?.value;
    if (typeof name === "string") {
      try {
        name = JSON.parse(name);
      } catch {
      }
    }
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
      }
    }
    return {
      name: typeof name === "object" && name !== null ? { uz: name.uz || "", ru: name.ru || "" } : { uz: name || "", ru: name || "" },
      value: typeof value === "object" && value !== null ? { uz: value.uz || "", ru: value.ru || "" } : { uz: value || "", ru: value || "" }
    };
  });
}
router3.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const products = rows.map((p) => {
      const slug = parseIfJson2(p.slug, { uz: p.id, ru: p.id });
      const name = parseIfJson2(p.name || p.title, { uz: p.id, ru: p.id });
      const tagline = parseIfJson2(p.tagline, { uz: "", ru: "" });
      const description = parseIfJson2(p.description, { uz: "", ru: "" });
      const priceFormatted = parseIfJson2(p.priceFormatted, { uz: "So'rov bo'yicha", ru: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443" });
      const features = parseIfJson2(p.features, { uz: [], ru: [] });
      const applications = parseIfJson2(p.applications, { uz: [], ru: [] });
      const standardCert = parseIfJson2(p.standardCert, { uz: "GOST / O\u2018zstandart", ru: "\u0413\u041E\u0421\u0422 / \u0423\u0437\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442" });
      const seoTitle = parseIfJson2(p.seoTitle, { uz: "", ru: "" });
      const seoDescription = parseIfJson2(p.seoDescription, { uz: "", ru: "" });
      const seoKeywords = parseIfJson2(p.seoKeywords, { uz: "", ru: "" });
      const images = parseArray(p.images || p.additionalImages);
      const inds = cleanIdArray(p.industryIds ?? p.industries);
      const tasks = cleanIdArray(p.industryTaskIds ?? p.tasks);
      return {
        id: p.id,
        slug: typeof slug === "object" ? slug : { uz: p.id, ru: p.id },
        brandId: p.brand_id || "b-maxtron",
        // 🌟 Brand ID
        model: p.model || "",
        category: p.category || p.categoryId || "sensors",
        categoryId: p.categoryId || p.category || "sensors",
        name: typeof name === "object" ? name : { uz: name, ru: name },
        tagline: typeof tagline === "object" ? tagline : { uz: "", ru: "" },
        description: typeof description === "object" ? description : { uz: description, ru: description },
        price: Number(p.price) || 0,
        oldPrice: Number(p.oldPrice) || 0,
        priceFormatted: typeof priceFormatted === "object" ? priceFormatted : { uz: "So'rov bo'yicha", ru: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443" },
        inStock: Boolean(p.inStock ?? p.isActive ?? 1),
        isActive: Boolean(p.isActive ?? 1),
        isPopular: Boolean(p.isPopular ?? 0),
        isNew: Boolean(p.isNew ?? 0),
        image: p.image || p.imageUrl || "",
        imageUrl: p.imageUrl || p.image || "",
        additionalImages: images,
        pdfCatalogUrl: p.pdfCatalogUrl || "",
        specs: parseSpecs(p.specs),
        features: typeof features === "object" ? features : { uz: [], ru: [] },
        applications: typeof applications === "object" ? applications : { uz: [], ru: [] },
        standardCert: typeof standardCert === "object" ? standardCert : { uz: standardCert, ru: standardCert },
        warrantyMonths: Number(p.warrantyMonths) || 12,
        industryIds: inds,
        industryTaskIds: tasks,
        industries: inds,
        tasks,
        seoTitle: typeof seoTitle === "object" ? seoTitle : { uz: "", ru: "" },
        seoDescription: typeof seoDescription === "object" ? seoDescription : { uz: "", ru: "" },
        seoKeywords: typeof seoKeywords === "object" ? seoKeywords : { uz: "", ru: "" },
        ogImage: p.ogImage || p.image || ""
      };
    });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Products DB load error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router3.post("/", requireAdmin, async (req, res) => {
  try {
    const prod = req.body;
    if (!prod) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh" });
    }
    const prodId = String(prod.id || `mx-${Date.now().toString().slice(-6)}`);
    const brandId = String(prod.brandId || "b-maxtron").trim();
    const model = String(prod.model || prodId).trim();
    const categoryId = String(prod.category || prod.categoryId || "sensors").trim();
    const slug = typeof prod.slug === "object" ? JSON.stringify(prod.slug) : JSON.stringify({ uz: prodId, ru: prodId });
    const name = typeof prod.name === "object" ? JSON.stringify(prod.name) : JSON.stringify({ uz: prod.name || "", ru: prod.name || "" });
    const tagline = typeof prod.tagline === "object" ? JSON.stringify(prod.tagline) : JSON.stringify(prod.tagline || {});
    const description = typeof prod.description === "object" ? JSON.stringify(prod.description) : JSON.stringify(prod.description || {});
    const price = Number(prod.price) || 0;
    const oldPrice = Number(prod.oldPrice) || 0;
    const priceFormatted = typeof prod.priceFormatted === "object" ? JSON.stringify(prod.priceFormatted) : JSON.stringify({ uz: "So'rov bo'yicha", ru: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443" });
    const inStock = prod.inStock ? 1 : 0;
    const isPopular = prod.isPopular ? 1 : 0;
    const isNew = prod.isNew ? 1 : 0;
    const warrantyMonths = Number(prod.warrantyMonths) || 12;
    const imageUrl = prod.image || prod.imageUrl || "";
    const images = JSON.stringify(parseArray(prod.additionalImages || prod.images || []));
    const pdfCatalogUrl = prod.pdfCatalogUrl || prod.pdfFile || "";
    const specs = JSON.stringify(parseArray(prod.specs));
    const features = typeof prod.features === "object" ? JSON.stringify(prod.features) : JSON.stringify({ uz: [], ru: [] });
    const applications = typeof prod.applications === "object" ? JSON.stringify(prod.applications) : JSON.stringify({ uz: [], ru: [] });
    const standardCert = typeof prod.standardCert === "object" ? JSON.stringify(prod.standardCert) : JSON.stringify({ uz: prod.standardCert || "", ru: prod.standardCert || "" });
    const industryIds = JSON.stringify(cleanIdArray(prod.industryIds ?? prod.industries));
    const industryTaskIds = JSON.stringify(cleanIdArray(prod.industryTaskIds ?? prod.tasks));
    const seoTitle = typeof prod.seoTitle === "object" ? JSON.stringify(prod.seoTitle) : JSON.stringify(prod.seoTitle || {});
    const seoDescription = typeof prod.seoDescription === "object" ? JSON.stringify(prod.seoDescription) : JSON.stringify(prod.seoDescription || {});
    const seoKeywords = typeof prod.seoKeywords === "object" ? JSON.stringify(prod.seoKeywords) : JSON.stringify(prod.seoKeywords || {});
    const ogImage = prod.ogImage || imageUrl || "";
    await db.query(
      `INSERT INTO products 
        (id, brand_id, slug, title, description, categoryId, imageUrl, images, pdfCatalogUrl, specs, features, isActive, model, category, name, tagline, price, oldPrice, priceFormatted, inStock, isPopular, image, applications, isNew, standardCert, warrantyMonths, seoTitle, seoDescription, seoKeywords, ogImage, industryIds, industryTaskIds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        brand_id = VALUES(brand_id),
        slug = VALUES(slug),
        title = VALUES(title),
        description = VALUES(description),
        categoryId = VALUES(categoryId),
        imageUrl = VALUES(imageUrl),
        images = VALUES(images),
        pdfCatalogUrl = VALUES(pdfCatalogUrl),
        specs = VALUES(specs),
        features = VALUES(features),
        isActive = VALUES(isActive),
        model = VALUES(model),
        category = VALUES(category),
        name = VALUES(name),
        tagline = VALUES(tagline),
        price = VALUES(price),
        oldPrice = VALUES(oldPrice),
        priceFormatted = VALUES(priceFormatted),
        inStock = VALUES(inStock),
        isPopular = VALUES(isPopular),
        image = VALUES(image),
        applications = VALUES(applications),
        isNew = VALUES(isNew),
        standardCert = VALUES(standardCert),
        warrantyMonths = VALUES(warrantyMonths),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage),
        industryIds = VALUES(industryIds),
        industryTaskIds = VALUES(industryTaskIds)`,
      [
        prodId,
        brandId,
        slug,
        name,
        description,
        categoryId,
        imageUrl,
        images,
        pdfCatalogUrl,
        specs,
        features,
        inStock,
        model,
        categoryId,
        name,
        tagline,
        price,
        oldPrice,
        priceFormatted,
        inStock,
        isPopular,
        imageUrl,
        applications,
        isNew,
        standardCert,
        warrantyMonths,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        industryIds,
        industryTaskIds
      ]
    );
    res.json({ success: true, id: prodId, message: "Mahsulot muvaffaqiyatli saqlandi" });
  } catch (error) {
    console.error("Product DB save error:", error.message);
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});
router3.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Mahsulot o\u2018chirildi" });
  } catch (error) {
    console.error("Product DB delete error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default3 = router3;

// src/api/admin/quotes/route.ts
import { Router as Router4 } from "express";

// src/services/telegramService.ts
var memoryTelegramSettings = {
  enabled: true,
  botToken: "",
  chatId: "",
  notifyOnQuote: true,
  notifyOnContact: true
};
var TelegramService = {
  getSettings() {
    return memoryTelegramSettings;
  },
  saveSettings(settings) {
    memoryTelegramSettings = settings;
    window.dispatchEvent(new CustomEvent("maxtron_telegram_updated", { detail: settings }));
    return true;
  },
  async sendRawMessage(botToken, chatId, messageHtml) {
    if (!botToken || !chatId) {
      return { success: false, error: "Telegram Bot Token \u0432\u0430 Chat ID \u043A\u0438\u0440\u0438\u0442\u0438\u043B\u043C\u0430\u0433\u0430\u043D" };
    }
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: messageHtml,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const errorMsg = data.description || `\u0425\u0430\u0442\u043E\u043B\u0438\u043A \u043A\u043E\u0434\u0438: ${response.status}`;
        console.error("Telegram API error:", data);
        return { success: false, error: errorMsg };
      }
      return { success: true };
    } catch (error) {
      console.error("Telegram network error:", error);
      return { success: false, error: error.message || "\u0421\u0430\u0440\u0432\u0435\u0440 \u0431\u0438\u043B\u0430\u043D \u0443\u043B\u0430\u043D\u0438\u0448\u0434\u0430 \u0445\u0430\u0442\u043E\u043B\u0438\u043A" };
    }
  },
  async sendTestNotification(botToken, chatId) {
    const testMessage = `
\u26A1\uFE0F <b>MAXTRON \u2014 \u0422\u0435\u0441\u0442 \u0445\u0430\u0431\u0430\u0440\u0438!</b>

\u2705 Telegram \u0411\u043E\u0442 \u043C\u0443\u0432\u0430\u0444\u0444\u0430\u049B\u0438\u044F\u0442\u043B\u0438 \u0443\u043B\u0430\u043D\u0434\u0438!
\u{1F4C5} \u0412\u0430\u049B\u0442: ${(/* @__PURE__ */ new Date()).toLocaleString("uz-UZ")}

\u042D\u043D\u0434\u0438 \u0441\u0430\u0439\u0442 \u043E\u0440\u049B\u0430\u043B\u0438 \u044E\u0431\u043E\u0440\u0438\u043B\u0433\u0430\u043D \u0431\u0430\u0440\u0447\u0430 \u044F\u043D\u0433\u0438 \u0431\u0443\u044E\u0440\u0442\u043C\u0430 \u0432\u0430 \u0441\u045E\u0440\u043E\u0432\u043B\u0430\u0440 \u0443\u0448\u0431\u0443 \u0447\u0430\u0442\u0433\u0430 \u043A\u0435\u043B\u0438\u0431 \u0442\u0443\u0448\u0430\u0434\u0438.
    `.trim();
    return this.sendRawMessage(botToken, chatId, testMessage);
  },
  async sendQuoteNotification(quote) {
    const settings = this.getSettings();
    if (!settings.enabled || !settings.botToken || !settings.chatId || !settings.notifyOnQuote) {
      return false;
    }
    const message = `
\u{1F4E6} <b>\u042F\u041D\u0413\u0418 \u0411\u0423\u042E\u0420\u0422\u041C\u0410 / \u0421\u040E\u0420\u041E\u0412 (#${quote.id || "N/A"})</b>

\u{1F3E2} <b>\u041A\u043E\u0440\u0445\u043E\u043D\u0430:</b> ${quote.companyName}
\u{1F464} <b>\u041C\u0410\u0421\u042A\u0423\u041B:</b> ${quote.contactPerson}
\u{1F4DE} <b>\u0422\u0435\u043B\u0435\u0444\u043E\u043D:</b> ${quote.phone}
\u{1F4E7} <b>Email:</b> ${quote.email || "\u041A\u045E\u0440\u0441\u0430\u0442\u0438\u043B\u043C\u0430\u0433\u0430\u043D"}
\u{1F194} <b>\u0418\u041D\u041D:</b> ${quote.inn || "\u041A\u045E\u0440\u0441\u0430\u0442\u0438\u043B\u043C\u0430\u0433\u0430\u043D"}

\u2699\uFE0F <b>\u041C\u0430\u04B3\u0441\u0443\u043B\u043E\u0442:</b> ${quote.productName || "\u0423\u043C\u0443\u043C\u0438\u0439 \u0441\u045E\u0440\u043E\u0432"}
\u{1F522} <b>\u0421\u043E\u043D\u0438:</b> ${quote.quantity || 1} \u0434\u043E\u043D\u0430
\u{1F4DD} <b>\u0418\u0437\u043E\u04B3:</b> ${quote.notes || "\u0419\u045E\u049B"}

\u{1F4C5} <b>\u0412\u0430\u049B\u0442:</b> ${(/* @__PURE__ */ new Date()).toLocaleString("uz-UZ")}
    `.trim();
    const res = await this.sendRawMessage(settings.botToken, settings.chatId, message);
    return res.success;
  }
};

// src/api/admin/quotes/route.ts
var router4 = Router4();
router4.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM quotes ORDER BY id DESC"
    );
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const quotes = rows.map((q) => ({
      id: q.id,
      companyName: q.companyName || "",
      contactPerson: q.contactPerson || "",
      phone: q.phone || "",
      email: q.email || "",
      inn: q.inn || "",
      selectedProductId: q.selectedProductId || "",
      productName: q.productName || "",
      quantity: Number(q.quantity) || 1,
      totalEstimate: Number(q.totalEstimate) || 0,
      notes: q.notes || "",
      status: q.status || "new",
      createdAt: q.createdAt || q.created_at ? new Date(q.createdAt || q.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    }));
    res.json({ success: true, data: quotes });
  } catch (error) {
    console.error("Quotes DB load error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router4.post("/", async (req, res) => {
  try {
    const quote = req.body;
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(400).json({ success: false, message: "Buyurtma ma'lumotlari bo'sh" });
    }
    const quoteId = String(quote.id || `quote-${Date.now()}`);
    const companyName = String(quote.companyName || "");
    const contactPerson = String(quote.contactPerson || "");
    const phone = String(quote.phone || "");
    const email = String(quote.email || "");
    const inn = String(quote.inn || "");
    const selectedProductId = String(quote.selectedProductId || "");
    const productName = String(quote.productName || "Umumiy so\u2018rov");
    const quantity = Number(quote.quantity) || 1;
    const totalEstimate = Number(quote.totalEstimate) || 0;
    const notes = String(quote.notes || "");
    const status = String(quote.status || "new");
    await db.query(
      `INSERT INTO quotes 
        (id, companyName, contactPerson, phone, email, inn, selectedProductId, productName, quantity, totalEstimate, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        companyName = VALUES(companyName),
        contactPerson = VALUES(contactPerson),
        phone = VALUES(phone),
        email = VALUES(email),
        inn = VALUES(inn),
        selectedProductId = VALUES(selectedProductId),
        productName = VALUES(productName),
        quantity = VALUES(quantity),
        totalEstimate = VALUES(totalEstimate),
        notes = VALUES(notes),
        status = VALUES(status)`,
      [quoteId, companyName, contactPerson, phone, email, inn, selectedProductId, productName, quantity, totalEstimate, notes, status]
    );
    try {
      await TelegramService.sendQuoteNotification({
        id: quoteId,
        companyName,
        contactPerson,
        phone,
        email,
        inn,
        selectedProductId: productName ? `${productName} (${selectedProductId})` : selectedProductId,
        quantity,
        totalEstimate,
        notes
      });
    } catch (tgErr) {
      console.warn("\u26A0\uFE0F Telegram xabarnoma yuborishda xatolik:", tgErr.message);
    }
    res.json({ success: true, id: quoteId, message: "Buyurtmangiz muvaffaqiyatli qabul qilindi" });
  } catch (error) {
    console.error("Quote DB save error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router4.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status ko\u2018rsatilmadi" });
    }
    await db.query("UPDATE quotes SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true, message: "Status muvaffaqiyatli yangilandi" });
  } catch (error) {
    console.error("Quote status update error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router4.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM quotes WHERE id = ?", [id]);
    res.json({ success: true, message: "Buyurtma muvaffaqiyatli o\u2018chirildi" });
  } catch (error) {
    console.error("Quote DB delete error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default4 = router4;

// src/api/admin/certificates/route.ts
import { Router as Router5 } from "express";
var router5 = Router5();
function parseIfJson3(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val || fallback;
  }
}
router5.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM certificates ORDER BY id DESC");
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const certificates = rows.map((c) => ({
      id: c.id,
      number: c.certNumber || c.number || "",
      certNumber: c.certNumber || c.number || "",
      title: parseIfJson3(c.title, { uz: "", ru: "" }),
      description: parseIfJson3(c.description, null),
      issuer: parseIfJson3(c.issuer, { uz: "", ru: "" }),
      issueDate: c.issueDate || "",
      validUntil: c.validUntil || "",
      standard: c.standard || "",
      docNumber: c.docNumber || "",
      image: c.image || c.previewUrl || "",
      previewUrl: c.image || c.previewUrl || "",
      pdfUrl: c.pdfUrl || ""
    }));
    res.json({ success: true, data: certificates });
  } catch (error) {
    console.error("Certificates GET Error:", error.message);
    res.status(500).json({ success: false, message: "Sertifikatlarni yuklashda xatolik" });
  }
});
router5.post("/", requireAdmin, async (req, res) => {
  try {
    const cert = req.body;
    if (!cert) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    const certId = String(cert.id || `cert-${Date.now()}`);
    const certNumber = String(cert.certNumber || cert.number || "");
    const title = typeof cert.title === "object" ? JSON.stringify(cert.title) : JSON.stringify({ uz: cert.title || "", ru: cert.title || "" });
    const description = cert.description ? typeof cert.description === "object" ? JSON.stringify(cert.description) : JSON.stringify(cert.description) : null;
    const issuer = typeof cert.issuer === "object" ? JSON.stringify(cert.issuer) : JSON.stringify({ uz: cert.issuer || "", ru: cert.issuer || "" });
    const issueDate = cert.issueDate ? String(cert.issueDate) : null;
    const validUntil = cert.validUntil ? String(cert.validUntil) : null;
    const image = String(cert.image || cert.previewUrl || "");
    const pdfUrl = String(cert.pdfUrl || "");
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
    res.json({ success: true, id: certId, message: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043C\u0443\u0432\u0430\u0444\u0444\u0430\u049B\u0438\u044F\u0442\u043B\u0438 \u0441\u0430\u049B\u043B\u0430\u043D\u0434\u0438" });
  } catch (error) {
    console.error("Certificates POST Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Sertifikatni saqlashda xatolik" });
  }
});
router5.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM certificates WHERE id = ?", [id]);
    res.json({ success: true, message: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043C\u0443\u0432\u0430\u0444\u0444\u0430\u049B\u0438\u044F\u0442\u043B\u0438 \u045E\u0447\u0438\u0440\u0438\u043B\u0434\u0438" });
  } catch (error) {
    console.error("Certificates DELETE Error:", error.message);
    res.status(500).json({ success: false, message: "Sertifikatni o\u2018chirishda xatolik" });
  }
});
var route_default5 = router5;

// src/api/admin/clients/route.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM clients ORDER BY orderIndex ASC, id ASC"
    );
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const clients = rows.map((c) => ({
      id: c.id,
      name: c.name || "",
      shortName: c.shortName || "",
      category: c.category || "",
      logo: c.logo || "",
      website: c.website || "",
      orderIndex: Number(c.orderIndex) || 0
    }));
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error("Clients DB load error:", error.message);
    res.status(500).json({ success: false, message: "Hamkorlarni yuklashda xatolik" });
  }
});
router6.post("/", requireAdmin, async (req, res) => {
  try {
    const client = req.body;
    if (!client) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    const clientId = String(client.id || `client-${Date.now()}`);
    const name = String(client.name || "");
    const shortName = String(client.shortName || "");
    const category = String(client.category || "");
    const logo = String(client.logo || "");
    const website = String(client.website || "");
    const orderIndex = Number(client.orderIndex) || 0;
    await db.query(
      `INSERT INTO clients 
        (id, name, shortName, category, logo, website, orderIndex)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        shortName = VALUES(shortName),
        category = VALUES(category),
        logo = VALUES(logo),
        website = VALUES(website),
        orderIndex = VALUES(orderIndex)`,
      [clientId, name, shortName, category, logo, website, orderIndex]
    );
    res.json({ success: true, id: clientId, message: "Hamkor muvaffaqiyatli saqlandi" });
  } catch (error) {
    console.error("Client DB save error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Hamkorni saqlashda xatolik" });
  }
});
router6.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM clients WHERE id = ?", [id]);
    res.json({ success: true, message: "Hamkor o\u2018chirildi" });
  } catch (error) {
    console.error("Client DB delete error:", error.message);
    res.status(500).json({ success: false, message: "Hamkorni o\u2018chirishda xatolik" });
  }
});
var route_default6 = router6;

// src/api/admin/pages/route.ts
import { Router as Router7 } from "express";
var router7 = Router7();
function safeJsonParse(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}
router7.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pages ORDER BY createdAt ASC, id ASC");
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const pages = rows.map((p) => ({
      id: p.id,
      slug: p.slug || "",
      title: safeJsonParse(p.title, { uz: "", ru: "" }),
      subtitle: safeJsonParse(p.subtitle, { uz: "", ru: "" }),
      content: safeJsonParse(p.content, { uz: "", ru: "" }),
      isPublished: Boolean(p.isPublished ?? 1),
      showInHeader: Boolean(p.showInHeader ?? 0),
      showInFooter: Boolean(p.showInFooter ?? 1),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    }));
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error("Pages DB load error:", error.message);
    res.status(500).json({ success: false, message: "Sahifalarni yuklashda xatolik" });
  }
});
router7.post("/", requireAdmin, async (req, res) => {
  try {
    const page = req.body;
    if (!page) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    const pageId = String(page.id || `page-${Date.now()}`);
    const slug = (page.slug || pageId).toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");
    const title = typeof page.title === "object" ? JSON.stringify(page.title) : JSON.stringify({ uz: page.title || "", ru: page.title || "" });
    const subtitle = typeof page.subtitle === "object" ? JSON.stringify(page.subtitle) : JSON.stringify(page.subtitle || {});
    const content = typeof page.content === "object" ? JSON.stringify(page.content) : JSON.stringify(page.content || {});
    const isPublished = page.isPublished ? 1 : 0;
    const showInHeader = page.showInHeader ? 1 : 0;
    const showInFooter = page.showInFooter ? 1 : 0;
    await db.query(
      `INSERT INTO pages 
        (id, slug, title, subtitle, content, isPublished, showInHeader, showInFooter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        slug = VALUES(slug),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        content = VALUES(content),
        isPublished = VALUES(isPublished),
        showInHeader = VALUES(showInHeader),
        showInFooter = VALUES(showInFooter),
        updatedAt = CURRENT_TIMESTAMP`,
      [pageId, slug, title, subtitle, content, isPublished, showInHeader, showInFooter]
    );
    res.json({ success: true, id: pageId, message: "Sahifa muvaffaqiyatli saqlandi" });
  } catch (error) {
    console.error("Page DB save error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Sahifani saqlashda xatolik" });
  }
});
router7.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pages WHERE id = ?", [id]);
    res.json({ success: true, message: "Sahifa muvaffaqiyatli o\u2018chirildi" });
  } catch (error) {
    console.error("Page DB delete error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Sahifani o\u2018chirishda xatolik" });
  }
});
var route_default7 = router7;

// src/api/admin/settings/route.ts
import { Router as Router8 } from "express";
var router8 = Router8();
function safeJsonParse2(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val || fallback;
  }
}
router8.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT `key`, value FROM settings");
    if (!Array.isArray(rows)) {
      return res.json({ success: true, data: {} });
    }
    const allSettings = {};
    rows.forEach((r) => {
      allSettings[r.key] = safeJsonParse2(r.value, {});
    });
    res.json({ success: true, data: allSettings });
  } catch (error) {
    console.error("All settings fetch error:", error.message);
    res.status(500).json({ success: false, message: "Barcha sozlamalarni yuklashda xatolik", error: error.message });
  }
});
router8.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const [rows] = await db.query("SELECT value FROM settings WHERE `key` = ? LIMIT 1", [key]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: safeJsonParse2(rows[0].value, {}) });
  } catch (error) {
    console.error(`Settings [${req.params.key}] fetch error:`, error.message);
    res.status(500).json({ success: false, message: "Sozlamani yuklashda xatolik", error: error.message });
  }
});
router8.post("/:key", requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const rawBody = req.body;
    if (rawBody === void 0 || rawBody === null) {
      return res.status(400).json({ success: false, message: "Sozlama ma'lumotlari bo'sh" });
    }
    const value = typeof rawBody === "object" ? JSON.stringify(rawBody) : String(rawBody);
    await db.query(
      `INSERT INTO settings (\`key\`, value, updatedAt)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
        value = VALUES(value),
        updatedAt = CURRENT_TIMESTAMP`,
      [key, value]
    );
    res.json({ success: true, message: `\xAB${key}\xBB sozlamasi muvaffaqiyatli saqlandi` });
  } catch (error) {
    console.error(`Settings [${req.params.key}] save error:`, error.message);
    res.status(500).json({ success: false, message: "Sozlamani saqlashda xatolik", error: error.message });
  }
});
var route_default8 = router8;

// src/api/admin/users/route.ts
import { Router as Router9 } from "express";
import crypto from "crypto";
import { promisify } from "util";
import jwt2 from "jsonwebtoken";
var router9 = Router9();
var scrypt = promisify(crypto.scrypt);
function getJwtSecret() {
  return process.env.JWT_SECRET || null;
}
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}
async function verifyPassword(password, storedPassword) {
  const [algorithm, salt, hash] = storedPassword.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return Buffer.byteLength(password) === Buffer.byteLength(storedPassword) && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedPassword));
  }
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
router9.post("/login", async (req, res) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) return res.status(500).json({ success: false, message: "Serverda JWT_SECRET sozlanmagan" });
  try {
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!username || !password) return res.status(400).json({ success: false, message: "Login va parol kiritilishi shart" });
    const [rows] = await db.query(
      "SELECT id, name, username, password, role FROM admin_users WHERE LOWER(username) = ? LIMIT 1",
      [username]
    );
    const user = rows?.[0];
    if (!user || !await verifyPassword(password, String(user.password || ""))) {
      return res.status(401).json({ success: false, message: "Login yoki parol noto\u2018g\u2018ri" });
    }
    if (!String(user.password).startsWith("scrypt$")) {
      await db.query("UPDATE admin_users SET password = ? WHERE id = ?", [await hashPassword(password), user.id]);
    }
    const token = jwt2.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return res.json({ success: true, token, user: { id: user.id, name: user.name || user.username, username: user.username, role: user.role } });
  } catch (error) {
    console.error("POST /api/admin/users/login ERROR:", error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
});
router9.get("/me", requireAdmin, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});
router9.get("/", requireSuperAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, username, role, createdAt, created_at FROM admin_users");
    const users = Array.isArray(rows) ? rows.map((user) => ({
      id: user.id,
      name: user.name || user.username,
      fullName: user.name || user.username,
      username: user.username,
      role: user.role || "admin",
      createdAt: user.createdAt || null
    })) : [];
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/admin/users ERROR:", error);
    return res.status(500).json({ success: false, message: "Server xatosi", data: [] });
  }
});
router9.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const user = req.body || {};
    const userId = String(user.id || `usr_${Date.now()}`);
    const name = String(user.name || user.fullName || user.username || "").trim();
    const username = String(user.username || "").trim().toLowerCase();
    const password = String(user.password || "").trim();
    const role = user.role === "manager" ? "manager" : "admin";
    if (!username || password.length < 10) {
      return res.status(400).json({ success: false, message: "Login va kamida 10 belgili parol kiriting" });
    }
    await db.query(
      `INSERT INTO admin_users (id, name, username, password, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), username = VALUES(username), password = VALUES(password), role = VALUES(role)`,
      [userId, name, username, await hashPassword(password), role]
    );
    return res.json({ success: true, id: userId, message: "Foydalanuvchi saqlandi" });
  } catch (error) {
    console.error("POST /api/admin/users ERROR:", error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
});
router9.delete("/:id", requireSuperAdmin, async (req, res) => {
  if (req.user?.id === req.params.id) return res.status(400).json({ success: false, message: "O\u2018z akkauntingizni o\u2018chira olmaysiz" });
  try {
    await db.query("DELETE FROM admin_users WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Foydalanuvchi o\u2018chirildi" });
  } catch (error) {
    console.error("DELETE /api/admin/users ERROR:", error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
});
var route_default9 = router9;

// src/api/admin/upload/route.ts
import { Router as Router10 } from "express";
import path from "path";
import fs from "fs";
import crypto2 from "crypto";
import multer from "multer";
var router10 = Router10();
var baseUploadDir = path.resolve(process.cwd(), "public", "uploads");
var allowedExtensions = /* @__PURE__ */ new Set([".webp", ".avif", ".png", ".jpg", ".jpeg", ".svg", ".pdf", ".docx", ".xlsx"]);
var allowedMimeTypes = /* @__PURE__ */ new Set([
  "image/webp",
  "image/avif",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
var storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const folder = extension === ".pdf" ? "certificates" : [".docx", ".xlsx"].includes(extension) ? "documents" : "products";
    const directory = path.join(baseUploadDir, folder);
    fs.mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto2.randomUUID()}${extension}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Ruxsat etilmagan fayl formati"));
    }
    callback(null, true);
  }
});
router10.post("/", requireAdmin, (req, res) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? "Fayl hajmi 30 MB dan oshmasligi kerak" : error instanceof Error ? error.message : "Fayl yuklashda xatolik";
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: "Fayl yuborilmadi" });
    const directory = path.basename(path.dirname(req.file.path));
    return res.json({ success: true, url: `/uploads/${directory}/${req.file.filename}`, name: req.file.originalname });
  });
});
var route_default10 = router10;

// src/api/admin/industries/route.ts
import { Router as Router11 } from "express";
var router11 = Router11();
function parseIfJson4(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}
router11.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM industries ORDER BY created_at ASC");
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });
    const industries = rows.map((r) => ({
      id: r.id,
      slug: r.slug || r.id,
      name: parseIfJson4(r.name, { uz: "", ru: "" }),
      desc: parseIfJson4(r.description, { uz: "", ru: "" }),
      icon: r.icon || "Building2",
      tasks: parseIfJson4(r.tasks, [])
    }));
    res.json({ success: true, data: industries });
  } catch (error) {
    console.error("Industries DB load error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router11.post("/", requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || Array.isArray(payload) && payload.length === 0) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }
    if (Array.isArray(payload)) {
      await db.query("START TRANSACTION");
      await db.query("DELETE FROM industries");
      for (const ind of payload) {
        const indId = String(ind.id || `ind_${Date.now().toString().slice(-6)}`);
        const slug = String(ind.slug || indId);
        const name = typeof ind.name === "object" ? JSON.stringify(ind.name) : JSON.stringify({ uz: ind.name || "", ru: ind.name || "" });
        const desc = typeof ind.desc === "object" ? JSON.stringify(ind.desc) : JSON.stringify({ uz: "", ru: "" });
        const icon = String(ind.icon || "Building2");
        const tasks = Array.isArray(ind.tasks) ? JSON.stringify(ind.tasks) : JSON.stringify([]);
        await db.query(
          `INSERT INTO industries (id, slug, name, description, icon, tasks) VALUES (?, ?, ?, ?, ?, ?)`,
          [indId, slug, name, desc, icon, tasks]
        );
      }
      await db.query("COMMIT");
      return res.json({ success: true, message: "Sohalar muvaffaqiyatli saqlandi" });
    }
    res.json({ success: true });
  } catch (error) {
    try {
      await db.query("ROLLBACK");
    } catch (rbErr) {
      console.error("Rollback error:", rbErr);
    }
    console.error("Industries DB save error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
router11.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM industries WHERE id = ?", [id]);
    res.json({ success: true, message: "Soha muvaffaqiyatli o\u2018chirildi" });
  } catch (error) {
    console.error("Industries DB delete error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default11 = router11;

// src/api/admin/brands/route.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM brands ORDER BY name ASC");
    res.json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router12.post("/", requireAdmin, async (req, res) => {
  try {
    const b = req.body;
    if (!b || !b.name) {
      return res.status(400).json({ success: false, message: "Brend nomi bo'sh" });
    }
    const id = String(b.id || `brand-${Date.now()}`);
    const name = String(b.name).trim();
    const slug = String(b.slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();
    const country = String(b.country || "").trim();
    const website = String(b.website || "").trim();
    const logo = String(b.logo || "").trim();
    const isActive = b.isActive !== false ? 1 : 0;
    await db.query(
      `INSERT INTO brands (id, name, slug, country, website, logo, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        slug = VALUES(slug),
        country = VALUES(country),
        website = VALUES(website),
        logo = VALUES(logo),
        isActive = VALUES(isActive)`,
      [id, name, slug, country, website, logo, isActive]
    );
    res.json({ success: true, id, message: "Brend saqlandi" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router12.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM brands WHERE id = ?", [id]);
    res.json({ success: true, message: "Brend o\u2018chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
var route_default12 = router12;

// src/server/sitemap.ts
var escapeXml = (value) => value.replace(/[<>&'\"]/g, (char) => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&apos;",
  "'": "&apos;",
  '"': "&quot;"
})[char]);
function getSiteUrl() {
  try {
    return new URL(process.env.SITE_URL || "https://maxtron.uz").origin;
  } catch {
    return "https://maxtron.uz";
  }
}
function getLastModified(value) {
  if (!value) return void 0;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? void 0 : date.toISOString().slice(0, 10);
}
function localizedValues(value, fallback) {
  if (!value) return [fallback];
  if (typeof value === "object") return [...new Set(Object.values(value).map(String).filter(Boolean))];
  if (typeof value === "string") {
    try {
      return localizedValues(JSON.parse(value), fallback);
    } catch {
      return [value];
    }
  }
  return [fallback];
}
async function serveSitemap(_req, res) {
  const siteUrl = getSiteUrl();
  const entries = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/catalog", changefreq: "daily", priority: "0.9" },
    { path: "/certificates", changefreq: "weekly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.7" },
    { path: "/contact", changefreq: "monthly", priority: "0.7" }
  ];
  try {
    const [productsResult, categoriesResult, pagesResult] = await Promise.all([
      db.query("SELECT * FROM products"),
      db.query("SELECT * FROM categories"),
      db.query("SELECT * FROM pages")
    ]);
    const products = productsResult[0] || [];
    const categories = categoriesResult[0] || [];
    const pages = pagesResult[0] || [];
    products.filter((product) => product.isActive === void 0 || Number(product.isActive) !== 0).forEach((product) => {
      const lastmod = product.updatedAt || product.updated_at || product.createdAt || product.created_at;
      localizedValues(product.slug, String(product.id)).forEach((slug) => {
        entries.push({ path: `/product/${encodeURIComponent(slug)}`, lastmod, changefreq: "weekly", priority: "0.8" });
      });
    });
    categories.forEach((category) => {
      const lastmod = category.updatedAt || category.updated_at || category.createdAt || category.created_at;
      localizedValues(category.slug, String(category.id)).forEach((slug) => {
        entries.push({ path: `/catalog/${encodeURIComponent(slug)}`, lastmod, changefreq: "weekly", priority: "0.7" });
      });
    });
    pages.filter((page) => page.isPublished === void 0 || Number(page.isPublished) !== 0).forEach((page) => {
      entries.push({ path: `/page/${encodeURIComponent(String(page.slug))}`, lastmod: page.updatedAt || page.updated_at || page.createdAt || page.created_at, changefreq: "monthly", priority: "0.6" });
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }
  const uniqueEntries = [...new Map(entries.map((entry) => [entry.path, entry])).values()];
  const xmlEntries = uniqueEntries.map((entry) => {
    const lastmod = getLastModified(entry.lastmod);
    return `  <url>
    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join("\n");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`);
}

// api/app.ts
dotenv2.config();
var app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
var uploadsDir = path2.join(process.cwd(), "public", "uploads");
app.use("/uploads", express.static(uploadsDir));
app.get("/sitemap.xml", serveSitemap);
app.use("/api/admin/header", route_default);
app.use("/api/header", route_default);
app.use("/api/admin/categories", route_default2);
app.use("/api/categories", route_default2);
app.use("/api/admin/products", route_default3);
app.use("/api/products", route_default3);
app.use("/api/admin/quotes", route_default4);
app.use("/api/quotes", route_default4);
app.use("/api/admin/certificates", route_default5);
app.use("/api/certificates", route_default5);
app.use("/api/admin/clients", route_default6);
app.use("/api/clients", route_default6);
app.use("/api/admin/pages", route_default7);
app.use("/api/pages", route_default7);
app.use("/api/admin/settings", route_default8);
app.use("/api/settings", route_default8);
app.use("/api/admin/brands", route_default12);
app.use("/api/brands", route_default12);
app.use("/api/admin/users", route_default9);
app.use("/api/users", route_default9);
app.use("/api/admin/upload", route_default10);
app.use("/api/upload", route_default10);
app.use("/api/admin/industries", route_default11);
app.use("/api/industries", route_default11);
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    storage: "mariadb_database",
    databaseConnected: true
  });
});
var app_default = app;
export {
  app_default as default
};
