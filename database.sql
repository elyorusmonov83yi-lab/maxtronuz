-- MAXTRON - MariaDB / MySQL Database Schema & Seed Data
-- Бу файлни phpMyAdmin'га кириб "Import" (Импорт) тугмаси орқали юклайсиз.

CREATE DATABASE IF NOT EXISTS `maxtron_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `maxtron_db`;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` JSON NOT NULL,
  `description` JSON,
  `count` INT DEFAULT 0,
  `icon` VARCHAR(100) DEFAULT 'Activity',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `tagline` JSON NOT NULL,
  `description` JSON NOT NULL,
  `price` DECIMAL(15,2) DEFAULT 0,
  `oldPrice` DECIMAL(15,2) DEFAULT NULL,
  `priceFormatted` JSON,
  `inStock` TINYINT(1) DEFAULT 1,
  `isPopular` TINYINT(1) DEFAULT 0,
  `image` TEXT,
  `images` JSON,
  `pdfCatalogUrl` TEXT,
  `specs` JSON,
  `features` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_popular` (`isPopular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Certificates Table
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` JSON NOT NULL,
  `description` JSON,
  `certNumber` VARCHAR(100),
  `issueDate` VARCHAR(100),
  `validUntil` VARCHAR(100),
  `issuer` JSON,
  `image` TEXT,
  `pdfUrl` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Quotes / Orders Table
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` VARCHAR(100) PRIMARY KEY,
  `companyName` VARCHAR(255),
  `contactPerson` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150),
  `inn` VARCHAR(100),
  `productId` VARCHAR(100),
  `productName` VARCHAR(255),
  `quantity` INT DEFAULT 1,
  `notes` TEXT,
  `status` ENUM('new', 'in_review', 'contacted', 'completed', 'cancelled') DEFAULT 'new',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Users / Admin Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(100) PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(255),
  `role` ENUM('admin', 'manager') DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INITIAL SEED DATA FOR CATEGORIES
INSERT INTO `categories` (`id`, `name`, `description`, `count`, `icon`) VALUES
('sensors', '{"uz_cyrl": "Датчик ва сенсорлар", "uz": "Datchik va sensorlar", "ru": "Датчики и сенсоры", "en": "Sensors & Transmitters"}', '{"uz_cyrl": "Босим, ҳарорат ва сатҳни ўлчовчи юқори аниқликдаги саноат сенсорлари.", "uz": "Bosim, harorat va sathni o\'lchovchi yuqori aniqlikdagi sanoat sensorlari.", "ru": "Высокоточные промышленные датчики давления, температуры и уровня.", "en": "High-precision industrial sensors for pressure, temperature, and level measurement."}', 4, 'Activity'),
('geodesy', '{"uz_cyrl": "Геодезия ускуналари", "uz": "Geodeziya uskunalari", "ru": "Геодезическое оборудование", "en": "Geodetic Equipment"}', '{"uz_cyrl": "Электрон тахеометрлар, нивелирлар ва юқори аниқликдаги GNSS RTK қабул қилувчилар.", "uz": "Elektron taxeometrlar, nivellirlar va yuqori aniqlikdagi GNSS RTK qabul qiluvchilar.", "ru": "Электронные тахеометры, нивелиры и высокоточные GNSS RTK приемники.", "en": "Total stations, digital levels, and high-accuracy GNSS RTK surveying receivers."}', 4, 'Compass'),
('electrical', '{"uz_cyrl": "Электротехника ва назорат", "uz": "Elektrotexnika va nazorat", "ru": "Электроизмерительные приборы", "en": "Electrical & Power Testing"}', '{"uz_cyrl": "Мультиметрлар, ток омбурлари, мегомметрлар ва электр тармоғи сифати анализаторлари.", "uz": "Multimetrlar, tok omburlari, megommetrlar va elektr tarmog\'i sifati analizatorlari.", "ru": "Мультиметры, токоизмерительные клещи, мегомметры и анализаторы качества сети.", "en": "Multimeters, clamp meters, insulation testers, and power quality analyzers."}', 4, 'Zap'),
('locators', '{"uz_cyrl": "Кабел ва қувур излагичлар", "uz": "Kabel va quvur izlagichlar", "ru": "Трассоискатели и кабелеискатели", "en": "Pipe & Cable Locators"}', '{"uz_cyrl": "Ер ости коммуникациялари, кабел трассалари ва сув сизиб чиқишини аниқловчи ускуналар.", "uz": "Yer osti kommunikatsiyalari, kabel trassalari va suv sizib chiqishini aniqlovchi uskunalar.", "ru": "Локаторы подземных коммуникаций, трассопоисковые системы и акустические течеискатели.", "en": "Underground utility locators, cable route tracers, and acoustic pipe leak detectors."}', 3, 'Radar'),
('thermal', '{"uz_cyrl": "Иссиқлик ва тепловизорлар", "uz": "Issiqlik va teplovizorlar", "ru": "Тепловизоры и пирометры", "en": "Thermal Imaging & IR"}', '{"uz_cyrl": "Саноат тепловизорлари, оптик пирометрлар ва инфрақизил тасвирлаш тизимлари.", "uz": "Sanoat teplovizorlari, optik pirometrlar va infraqizil tasvirlash tizimlari.", "ru": "Промышленные тепловизоры, оптические пирометры и ИК-системы неразрушающего контроля.", "en": "Industrial thermal cameras, precision optical pyrometers, and infrared diagnostic systems."}', 3, 'Flame'),
('ndt', '{"uz_cyrl": "Нодеструктив назорат (НК)", "uz": "Nodestruktiv nazorat (NK)", "ru": "Неразрушающий контроль (НК)", "en": "Non-Destructive Testing"}', '{"uz_cyrl": "Ултратовушли қалинлик ўлчагичлар, дефектоскоплар ва қатлам қалинлигини ўлчагичлар.", "uz": "Ultratovushli qalinlik o\'lchagichlar, defektoskoplar va qatlam qalinligini o\'lchagichlar.", "ru": "Ультразвуковые толщиномеры, дефектоскопы и толщиномеры защитных покрытий.", "en": "Ultrasonic thickness gauges, ultrasonic flaw detectors, and coating thickness gauges."}', 3, 'ShieldCheck')
ON DUPLICATE KEY UPDATE `id` = `id`;

-- INITIAL SEED DATA FOR PRODUCTS
INSERT INTO `products` (`id`, `name`, `model`, `category`, `tagline`, `description`, `price`, `oldPrice`, `priceFormatted`, `inStock`, `isPopular`, `image`, `specs`, `features`) VALUES
(
  'mx-pt500', 
  'MAXTRON Прецизион босим датчиги', 
  'MX-PT500 Pro', 
  'sensors', 
  '{"uz_cyrl": "Нефть-газ ва гидротехника учун саноат босим датчиги", "uz": "Neft-gaz va gidrotexnika uchun sanoat bosim datchigi", "ru": "Промышленный преобразователь давления для нефтегазового сектора", "en": "Industrial High-Accuracy Pressure Transmitter for Process Control"}',
  '{"uz_cyrl": "MX-PT500 Pro саноат босими датчиги агрессив муҳитларда юқори барқарорлик ва 0.075% аниқлик билан ишлайди. HART/4-20mA протоколи ва рақамли дисплейга эга.", "uz": "MX-PT500 Pro sanoat bosimi datchigi agressiv muhitlarda yuqori barqarorlik va 0.075% aniqlik bilan ishlaydi. HART/4-20mA protokoli va raqamli displeyga ega.", "ru": "MX-PT500 Pro — интеллектуальный датчик давления с погрешностью 0.075%, поддержкой протокола HART и взрывозащищенным исполнением ATEX / Exd.", "en": "MX-PT500 Pro delivers exceptional 0.075% accuracy with HART / 4-20mA output, stainless 316L diaphragm, and ATEX explosion-proof certification."}',
  4850000.00,
  5400000.00,
  '{"uz_cyrl": "4 850 000 сўм", "uz": "4 850 000 so\'m", "ru": "4 850 000 сум", "en": "4 850 000 UZS"}',
  1,
  1,
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  '[{"name": "Ўлчов диапозони", "value": "-0.1 ... 100 MPa"}, {"name": "Аниқлик синфи", "value": "0.075% FS"}, {"name": "Чиқиш сигнали", "value": "4-20mA + HART 7.0"}]',
  '{"uz_cyrl": ["HART рақамли алоқа интерфейси", "AISI 316L зангламас пўлат мембрана", "Портлашдан хавфсиз (Exd) корпус"], "uz": ["HART raqamli aloqa interfeysi", "AISI 316L zanglamas po\'lat membrana", "Portlashdan xavfsiz (Exd) korpus"], "ru": ["Цифровой интерфейс HART", "Мембрана из стали AISI 316L", "Взрывозащита Exd IIC T6"], "en": ["HART digital communication", "Stainless steel 316L diaphragm", "Explosion-proof Exd housing"]}'
),
(
  'mx-loc9000', 
  'MAXTRON Мукаммал кабел ва қувур излагич', 
  'MX-Loc9000 Ultimate', 
  'locators', 
  '{"uz_cyrl": "Ер ости коммуникациялари ва чуқур кабелларни аниқловчи тизим", "uz": "Yer osti kommunikatsiyalari va chuqur kabellarni aniqlovchi tizim", "ru": "Профессиональный Трассоискатель подземных коммуникаций и кабелей", "en": "Professional Underground Pipe & Cable Locator System"}',
  '{"uz_cyrl": "MX-Loc9000 10 метр чуқурликкача бўлган ер ости қувурлари ва электр кабеллари трассасини 100% аниқлик билан топиш имконини беради.", "uz": "MX-Loc9000 10 metr chuqurlikkacha bo\'lgan yer osti quvurlari va elektr kabellari trassasini 100% aniqlik bilan topish imkonini beradi.", "ru": "MX-Loc9000 позволяет с высокой точностью локализовать подземные газопроводы, водопроводы и силовые кабели на глубине до 10 метров.", "en": "MX-Loc9000 locates underground metallic pipes, cables, and optical lines up to 10m depth with digital depth display."}',
  28900000.00,
  32000000.00,
  '{"uz_cyrl": "28 900 000 сўм", "uz": "28 900 000 so\'m", "ru": "28 900 000 сум", "en": "28 900 000 UZS"}',
  1,
  1,
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  '[{"name": "Максимал чуқурлик", "value": "10 метр (33 ft)"}, {"name": "Генератор қуввати", "value": "10 Вт (128 Гц - 200 кГц)"}]',
  '{"uz_cyrl": ["Чуқурликни автоматик миллиметрлаб кўрсатиш", "10 Вт кўп частотали генератор", "GPS ва Bluetooth маълумот ёзиш"], "uz": ["Chuqurlikni avtomatik millimetrlab ko\'rsatish", "10 W ko\'p chastotali generator", "GPS va Bluetooth ma\'lumot yozish"], "ru": ["Автоматическое цифровое измерение глубины", "Мультичастотный генератор 10 Вт", "Встроенный GPS и Bluetooth"], "en": ["Automatic depth measurement", "10W multi-frequency transmitter", "GPS mapping and Bluetooth"]}'
)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- INITIAL SEED FOR ADMIN USER (username: admin, password: admin123)
INSERT INTO `users` (`id`, `username`, `password_hash`, `fullName`, `role`) VALUES
('usr_admin_1', 'admin', 'admin123', 'Баш Администратор', 'admin')
ON DUPLICATE KEY UPDATE `username` = `username`;
