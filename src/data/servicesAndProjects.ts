export interface ServiceItem {
  id: string;
  icon: string;
  title: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  shortDesc: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  fullDesc: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  features: {
    uz_cyrl: string[];
    uz: string[];
    ru: string[];
    en: string[];
  };
  duration: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
}

export interface ProjectCase {
  id: string;
  client: string;
  logoText: string;
  sector: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  year: string;
  location: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  title: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz_cyrl: string;
    uz: string;
    ru: string;
    en: string;
  };
  deliveredEquipment: string[];
  results: {
    uz_cyrl: string[];
    uz: string[];
    ru: string[];
    en: string[];
  };
  image: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: 'direct-supply',
    icon: 'Package',
    title: {
      uz_cyrl: 'Тўғридан-тўғри ускуналар савдоси ва буюртма асосида импорт',
      uz: "To'g'ridan-to'g'ri uskunalar savdosi va buyurtma asosida import",
      ru: 'Прямые поставки оборудования со склада и импорт под заказ',
      en: 'Direct Equipment Sales & Custom Import Procurement'
    },
    shortDesc: {
      uz_cyrl: 'Тошкент омборидан тайёр ускуналарни харид қилиш ва ноёб моделларни заводдан тезкор олиб келиш.',
      uz: "Toshkent omboridan tayyor uskunalarni xarid qilish va noyob modellarni zavoddan tezkor olib kelish.",
      ru: 'Поставка измерительных приборов со склада в Ташкенте и срочный импорт под ваше ТЗ.',
      en: 'Immediate dispatch from Tashkent warehouse and express custom import directly from manufacturers.'
    },
    fullDesc: {
      uz_cyrl: 'MAXTRON жаҳоннинг етакчи брендларидан тўғридан-тўғри воситачиларсиз олиб сотади. Омбордаги 200+ турдаги приборларни 1 кунда етказиб берамиз, махсус саноат ускуналарини эса ишлаб чиқарувчи заводдан тўғридан-тўғри импорт қилиб шартнома асосида тақдим этамиз.',
      uz: "MAXTRON jahonning yetakchi brendlaridan to'g'ridan-to'g'ri vositachilarsiz olib sotadi. Ombordagi 200+ turdagi priborlarni 1 kunda yetkazib beramiz, maxsus sanoat uskunalarini esa ishlab chiqaruvchi zavoddan to'g'ridan-to'g'ri import qilib shartnoma asosida taqdim etamiz.",
      ru: 'MAXTRON осуществляет прямую дистрибуцию и продажу оборудования мировых брендов без наценок посредников. Отгрузка со склада за 24 часа, а также комплексный импорт сложных измерительных комплексов с таможенной очисткой под ключ.',
      en: 'MAXTRON performs direct distribution and supply of global brands without intermediary markups. In-stock shipping within 24 hours, plus turnkey procurement for specialized instrumentation.'
    },
    features: {
      uz_cyrl: ['Тошкент омборидан зудлик билан олиш', 'ҚҚСли тўлиқ расмий шартнома', 'Дунё бўйлаб тўғридан-тўғри импорт логистикаси', 'Энг қулай улгуржи нархлар'],
      uz: ["Toshkent omboridan zudlik bilan olish", "QQSli to'liq rasmiy shartnoma", "Dunyo bo'ylab to'g'ridan-to'g'ri import logistikasi", "Eng qulay ulgurji narxlar"],
      ru: ['Отгрузка со склада в Ташкенте', '100% официальный договор с НДС', 'Прямая внешнеэкономическая логистика', 'Оптовые дистрибьюторские цены'],
      en: ['Immediate pickup from Tashkent warehouse', 'Full VAT invoice & contract', 'Global direct import logistics', 'Competitive wholesale prices']
    },
    duration: {
      uz_cyrl: '1 кун (омбордан) / 7-14 кун (буюртма)',
      uz: '1 kun (ombordan) / 7-14 kun (buyurtma)',
      ru: '1 день (со склада) / 7-14 дней (под заказ)',
      en: '1 day (in stock) / 7-14 days (on order)'
    }
  },
  {
    id: 'metrology-verification',
    icon: 'ShieldCheck',
    title: {
      uz_cyrl: 'Давлат метрологик қиёслаш ва аттестация',
      uz: "Davlat metrologik qiyoslash va attestatsiya",
      ru: 'Государственная поверка и метрологическая аттестация СИ',
      en: 'State Metrological Verification & Certification'
    },
    shortDesc: {
      uz_cyrl: 'Ўзстандарт агентлиги талаблари асосида ускуналарни метрологик қиёслаш ва реестрга киритиш.',
      uz: "O'zstandart agentligi talablari asosida uskunalarni metrologik qiyoslash va reestrga kiritish.",
      ru: 'Официальная поверка средств измерений с выдачей свидетельства государственного образца РУз.',
      en: 'Official instrument verification with state compliance certificate issuance.'
    },
    fullDesc: {
      uz_cyrl: 'MAXTRON аккредитацияланган метрология лабораторияси билан ҳамкорликда барча турдаги босим, ҳарорат, геодезия ва электротехника приборларини давлат қиёслашидан ўтказади ва E-Metrologiya тизимига рўйхатдан ўтказади.',
      uz: "MAXTRON akkreditatsiyalangan metrologiya laboratoriyasi bilan hamkorlikda barcha turdagi bosim, harorat, geodeziya va elektrotexnika priborlarini davlat qiyoslashidan o'tkazadi va E-Metrologiya tizimiga ro'yxatdan o'tkazadi.",
      ru: 'Совместно с аккредитованными метрологическими центрами проводим поверку приборов давления, температуры, геодезии и неразрушающего контроля с внесением в единую базу E-Metrologiya.',
      en: 'In partnership with accredited metrology centers, we perform verification of pressure, thermal, electrical, and surveying equipment registered in E-Metrologiya.'
    },
    features: {
      uz_cyrl: ['Давлат намунасидаги қиёслаш сертификати', 'E-Metrologiya тизимига киритиш', 'Тезкор текширув (1-3 иш куни)', 'Аниқлик даражаси ва хатоликлар протоколи'],
      uz: ["Davlat namunasidagi qiyoslash sertifikati", "E-Metrologiya tizimiga kiritish", "Tezkor tekshiruv (1-3 ish kuni)", "Aniqlik darajasi va xatoliklar protokoli"],
      ru: ['Свидетельство государственного образца', 'Внесение в базу E-Metrologiya', 'Срочная поверка за 1-3 дня', 'Протокол калибровки и погрешностей'],
      en: ['Official state verification certificate', 'Registered in national registry', 'Express check (1-3 business days)', 'Calibration and error tolerance report']
    },
    duration: {
      uz_cyrl: '1-3 иш куни',
      uz: '1-3 ish kuni',
      ru: '1-3 рабочих дня',
      en: '1-3 business days'
    }
  },
  {
    id: 'calibration-diagnostics',
    icon: 'SlidersHorizontal',
    title: {
      uz_cyrl: 'Лаборатория калибровкаси ва диагностика',
      uz: 'Laboratoriya kalibrovkasi va diagnostika',
      ru: 'Калибровка, юстировка и лабораторная диагностика',
      en: 'Calibration & Laboratory Diagnostics'
    },
    shortDesc: {
      uz_cyrl: 'Эталон ускуналар ёрдамида юқори аниқликдаги калибровка ва параметрларни созлаш.',
      uz: "Etalon uskunalar yordamida yuqori aniqlikdagi kalibrovka va parametrlarni sozlash.",
      ru: 'Точная настройка и калибровка на эталонных стендах европейского и японского производства.',
      en: 'High-precision calibration and tuning using certified secondary and primary standards.'
    },
    fullDesc: {
      uz_cyrl: 'Мураккаб саноат шароитларида ишлатилувчи датчиклар ва ўлчов асбобларининг вақт ўтиши билан юзага келадиган хатоликларини бартараф этиш учун тозалаш, дастурий янгилаш ва эталон билан мослаштириш ишлари.',
      uz: "Murakkab sanoat sharoitlarida ishlatiluvchi datchiklar va o'lchov asboblarining vaqt o'tishi bilan yuzaga keladigan xatoliklarini bartaraf etish uchun tozalash, dasturiy yangilash va etalon bilan moslashtirish ishlari.",
      ru: 'Устранение дрейфа показаний датчиков и приборов, калибровка каналов измерения, обновление микропрограммного обеспечения и чистка сенсорных матриц.',
      en: 'Eliminating measurement drift, fine-tuning sensor channels, firmware updates, and precision alignment.'
    },
    features: {
      uz_cyrl: ['ISO 17025 стандарт талаблари', 'Калибровка сертификати', 'Датчик ва сенсорлар сезгирлигини тиклаш', 'Ҳарорат ва босим компенсацияси'],
      uz: ['ISO 17025 standart talablari', 'Kalibrovka sertifikati', 'Datchik va sensorlar sezgirligini tiklash', 'Harorat va bosim kompensatsiyasi'],
      ru: ['Соответствие ISO/IEC 17025', 'Сертификат калибровки с графиками', 'Восстановление чувствительности датчиков', 'Температурная и барометрическая компенсация'],
      en: ['ISO/IEC 17025 compliance', 'Calibration certificate with curve data', 'Sensor sensitivity restoration', 'Thermal and pressure compensation']
    },
    duration: {
      uz_cyrl: '2-4 иш куни',
      uz: '2-4 ish kuni',
      ru: '2-4 рабочих дня',
      en: '2-4 business days'
    }
  },
  {
    id: 'warranty-repair',
    icon: 'Wrench',
    title: {
      uz_cyrl: 'Кафолатли ва пост-кафолатли сервис таъмирлаш',
      uz: "Kafolatli va post-kafolatli servis ta'mirlash",
      ru: 'Гарантийный и постгарантийный сервисный ремонт',
      en: 'Warranty & Post-Warranty Service Repair'
    },
    shortDesc: {
      uz_cyrl: 'Ишлаб чиқарувчининг асл эҳтиёт қисмлари билан Тошкентдаги расмий сервис марказимизда таъмирлаш.',
      uz: "Ishlab chiqaruvchining asl ehtiyot qismlari bilan Toshkentdagi rasmiy servis markazimizda ta'mirlash.",
      ru: 'Ремонт в авторизованном сервисном центре в Ташкенте с использованием оригинальных компонентов.',
      en: 'Authorized repair in Tashkent utilizing original manufacturer spare parts.'
    },
    fullDesc: {
      uz_cyrl: 'MAXTRON сервис муҳандислари ишлаб чиқарувчи заводларда малака оширган. Биз оптик тизимларни созлаш, электрон платаларни қайта тиклаш, экран ва батарея блокларини алмаштиришни кафолат билан бажарамиз.',
      uz: "MAXTRON servis muhandislari ishlab chiqaruvchi zavodlarda malaka oshirgan. Biz optik tizimlarni sozlash, elektron platalarni qayta tiklash, ekran va batareya bloklarini almashtirishni kafolat bilan bajaramiz.",
      ru: 'Наши инженеры прошли сертификацию на заводах-изготовителях. Выполняем юстировку оптических блоков, замену сенсоров, ремонт плат и аккумуляторных батарей с предоставлением гарантии.',
      en: 'Factory-certified engineers performing optical alignment, sensor replacements, circuit board repair, and battery refurbishment with full warranty.'
    },
    features: {
      uz_cyrl: ['Фақат асл завод эҳтиёт қисмлари', '12 ойгача таъмирлаш кафолати', 'Бепул бирламчи диагностика', 'Таъмирлаш даврида алмаштириш фонди'],
      uz: ['Faqat asl zavod ehtiyot qismlari', "12 oygacha ta'mirlash kafolati", "Bepul birlamchi diagnostika", "Ta'mirlash davrida almashtirish fondi"],
      ru: ['Оригинальные заводские запчасти', 'Гарантия на ремонт до 12 месяцев', 'Бесплатная входная диагностика', 'Подменный фонд приборов на время ремонта'],
      en: ['Original factory parts', 'Up to 12 months repair warranty', 'Free initial diagnostics', 'Loaner pool availability during repair']
    },
    duration: {
      uz_cyrl: '1-5 иш куни',
      uz: '1-5 ish kuni',
      ru: '1-5 рабочих дней',
      en: '1-5 business days'
    }
  },
  {
    id: 'commissioning-training',
    icon: 'GraduationCap',
    title: {
      uz_cyrl: 'Жойнинг ўзида ўрнатиш, ишга тушириш ва ходимларни ўқитиш',
      uz: "Joyning o'zida o'rnatish, ishga tushirish va xodimlarni o'qitish",
      ru: 'Шеф-монтаж, пусконаладка и обучение персонала заказчика',
      en: 'On-Site Commissioning, Setup & Operator Training'
    },
    shortDesc: {
      uz_cyrl: 'Буюртмачи объектига бориб ускуналарни интеграция қилиш ва мутахассисларга амалий кўникма бериш.',
      uz: "Buyurtmachi obyektiga borib uskunalarni integratsiya qilish va mutaxassislarga amaliy ko'nikma berish.",
      ru: 'Выезд инженеров на объект заказчика по всему Узбекистану, пусконаладочные работы и тренинг персонала.',
      en: 'Field deployment across Uzbekistan, equipment commissioning, and practical operator workshops.'
    },
    fullDesc: {
      uz_cyrl: 'Мутахассисларимиз корхонангизга ташриф буюриб, ускуналарни ишлаб чиқариш циклига интеграция қилади, дастурий таъминотни созлайди ва операторлар билан хавфсиз ҳамда самарали ишлаш бўйича кўргазмали тренинг ўтказади.',
      uz: "Mutaxassislarimiz korxonangizga tashrif buyurib, uskunalarni ishlab chiqarish sikliga integratsiya qiladi, dasturiy ta'minotni sozlaydi va operatorlar bilan xavfsiz hamda samarali ishlash bo'yicha ko'rgazmali trening o'tkazadi.",
      ru: 'Инженеры MAXTRON выезжают на предприятие заказчика, интегрируют приборы в производственные линии, настраивают SCADA/ПО и обучают операторов с выдачей сертификатов прохождения курса.',
      en: 'MAXTRON engineers visit your plant to integrate sensors into SCADA lines, set up software, and conduct certified hands-on safety & operation workshops.'
    },
    features: {
      uz_cyrl: ['Ўзбекистоннинг барча вилоятларига чиқиш', 'Амалий ва назарий ўқув қўлланмалар', 'Мутахассис сертификатларини бериш', 'Масофавий доимий техник маслаҳат'],
      uz: ["O'zbekistonning barcha viloyatlariga chiqish", "Amaliy va nazariy o'quv qo'llanmalar", 'Mutaxassis sertifikatlarini berish', 'Masofaviy doimiy texnik maslahat'],
      ru: ['Выезд в любую точку Узбекистана', 'Практические и методические пособия', 'Сертификат оператора после обучения', 'Постоянная удаленная техподдержка'],
      en: ['Nationwide deployment in Uzbekistan', 'Handbooks and training materials', 'Operator competency certificates', 'Ongoing remote engineering support']
    },
    duration: {
      uz_cyrl: 'Келишув асосида',
      uz: 'Kelishuv asosida',
      ru: 'По согласованию',
      en: 'By agreement'
    }
  }
];

export const projectsData: ProjectCase[] = [
  {
    id: 'case-nkmc',
    client: 'NKMC (Navoiy KMK)',
    logoText: 'NMMC / НГМК',
    sector: {
      uz_cyrl: 'Тоғ-кон ва металлургия',
      uz: "Tog'-kon va metallurgiya",
      ru: 'Горно-металлургическая промышленность',
      en: 'Mining & Metallurgical Industry'
    },
    year: '2024',
    location: {
      uz_cyrl: 'Навоий вилояти, Мурунтов',
      uz: 'Navoiy viloyati, Muruntov',
      ru: 'Навоийская область, Мурунтау',
      en: 'Navoi region, Muruntau'
    },
    title: {
      uz_cyrl: 'Мурунтов карьерида ер ости коммуникацияларини ва геотехник назорат тизимини жиҳозлаш',
      uz: "Muruntov karyerida yer osti kommunikatsiyalarini va geotexnik nazorat tizimini jihozlash",
      ru: 'Комплексное оснащение трассопоисковыми системами и GNSS RTK карьера Мурунтау',
      en: 'Turnkey Locator Systems & GNSS RTK Monitoring for Muruntau Open-Pit Mine'
    },
    description: {
      uz_cyrl: 'Навоий кон-металлургия комбинати очиқ конлари ва фабрикалари учун чуқурликдаги юқори кучланишли кабеллар ва сув қувурлари трассасини аниқлаш, шунингдек нишаблик силжишини 1 мм аниқликда мониторинг қилиш ускуналари тўлиқ етказиб берилди ва қиёсланди.',
      uz: "Navoiy kon-metallurgiya kombinati ochiq konlari va fabrikalari uchun chuqurlikdagi yuqori kuchlanishli kabellar va suv quvurlari trassasini aniqlash, shuningdek nishablik siljishini 1 mm aniqlikda monitoring qilish uskunalari to'liq yetkazib berildi va qiyoslandi.",
      ru: 'Поставка трассоискателей MX-LOC-9000, роботизированных тахеометров и тепловизоров для непрерывного контроля кабельных эстакад и мониторинга устойчивости бортов карьера.',
      en: 'Delivery of high-end pipe & cable locators MX-LOC-9000, robotic total stations, and radiometric thermal imagers for slope stability monitoring.'
    },
    deliveredEquipment: ['MX-LOC-9000 PRO (8 комплект)', 'MX-GEO-RTK8 (12 комплект)', 'MX-TH-950 HD (4 дона)', 'MX-NDT-350 УЗК (6 дона)'],
    results: {
      uz_cyrl: ['Кабел шикастланиш ҳолатлари 94% га камайди', 'Геодезик ўлчов тезлиги 3 баробар ошди', 'Барча ускуналар E-Metrologiya реестрига киритилди'],
      uz: ["Kabel shikastlanish holatlari 94% ga kamaydi", "Geodezik o'lchov tezligi 3 barobar oshdi", "Barcha uskunalar E-Metrologiya reestriga kiritildi"],
      ru: ['Снижение аварийных повреждений кабелей на 94%', 'Ускорение маркшейдерских съемок в 3 раза', '100% приборов внесены в Госреестр СИ РУз'],
      en: ['94% decrease in underground cable strikes', '3x faster surveying cycle', '100% registered in State Registry']
    },
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'case-uzbekneftegaz',
    client: 'Uzbekneftegaz',
    logoText: 'UNG / Ўзбекнефтгаз',
    sector: {
      uz_cyrl: 'Нефт ва газ саноати',
      uz: 'Neft va gaz sanoati',
      ru: 'Нефтегазовая отрасль',
      en: 'Oil & Gas Sector'
    },
    year: '2023 - 2024',
    location: {
      uz_cyrl: 'Қашқадарё вилояти, Шўртан',
      uz: "Qashqadaryo viloyati, Sho'rtan",
      ru: 'Кашкадарьинская область, Шуртан',
      en: 'Kashkadarya region, Shurtan'
    },
    title: {
      uz_cyrl: 'Шўртан ГХК ва газ қувурлари магистралида портлашдан хавфсиз босим датчиклари ва дефектоскоплар жорий этилиши',
      uz: "Sho'rtan GXK va gaz quvurlari magistralida portlashdan xavfsiz bosim datchiklari va defektoskoplar joriy etilishi",
      ru: 'Оснащение магистральных газопроводов Шуртанского ГХК взрывозащищенными датчиками давления и УЗК',
      en: 'Ex-Proof Pressure Transmitters & Ultrasonic NDT Inspection for Shurtan Gas Chemical Complex'
    },
    description: {
      uz_cyrl: 'Юқори босим ва портлаш хавфи юқори бўлган зоналар учун ATEX / ГОСТ сертификатига эга MX-SENS-100 босим датчиклари ҳамда қувур чокларини текширувчи рақамли ултратовуш дефектоскоплар тизими жорий қилинди.',
      uz: "Yuqori bosim va portlash xavfi yuqori bo'lgan zonalar uchun ATEX / GOST sertifikatiga ega MX-SENS-100 bosim datchiklari hamda quvur choklarini tekshiruvchi raqamli ultratovush defektoskoplar tizimi joriy qilindi.",
      ru: 'Внедрение взрывозащищенных датчиков давления HART/4-20mA и портативных дефектоскопов для контроля сварных швов технологических трубопроводов.',
      en: 'Integration of ATEX-certified smart pressure transmitters with HART protocol and portable digital ultrasonic flaw detectors for pipeline weld testing.'
    },
    deliveredEquipment: ['MX-SENS-100 Ex (45 дона)', 'MX-NDT-350 УЗК (8 дона)', 'MX-ELEC-400 Анализатор (5 дона)'],
    results: {
      uz_cyrl: ['Юқори босимли тармоқда 0.05% ўлчов аниқлигига эришилди', 'Қувур дефектларини эрта аниқлаш 100% га таъминланди', 'Автоматлаштирилган SCADA тизимига уланди'],
      uz: ["Yuqori bosimli tarmoqda 0.05% o'lchov aniqligiga erishildi", "Quvur defektlarini erta aniqlash 100% ga ta'minlandi", "Avtomatlashtirilgan SCADA tizimiga ulandi"],
      ru: ['Достигнута точность измерений 0.05% в критических узлах', '100% выявление скрытых дефектов сварных швов', 'Бесшовная интеграция в заводскую SCADA'],
      en: ['0.05% accuracy achieved in critical pressure nodes', '100% detection of sub-surface weld flaws', 'Direct SCADA DCS integration']
    },
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'case-ammc',
    client: 'AMMC (Olmaliq KMK)',
    logoText: 'AMMC / АГМК',
    sector: {
      uz_cyrl: 'Кон-бойитиш ва металлургия',
      uz: "Kon-boyitish va metallurgiya",
      ru: 'Горно-обогатительная и цветная металлургия',
      en: 'Non-Ferrous Mining & Smelting'
    },
    year: '2023',
    location: {
      uz_cyrl: 'Тошкент вилояти, Олмалиқ',
      uz: 'Toshkent viloyati, Olmaliq',
      ru: 'Ташкентская область, Алмалык',
      en: 'Tashkent region, Almalyk'
    },
    title: {
      uz_cyrl: '3-Мис бойитиш фабрикаси энергетика инфратузилмаси ва электр тармоғи сифати таҳлили',
      uz: "3-Mis boyitish fabrikasi energetika infratuzilmasi va elektr tarmog'i sifati tahlili",
      ru: 'Энергоаудит и анализ качества электросети строящейся Медно-обогатительной фабрики МОФ-3',
      en: 'Power Quality Analysis & High-Voltage Testing for Copper Concentrator Plant-3'
    },
    description: {
      uz_cyrl: 'Олмалиқ КМК янги 3-Мис бойитиш фабрикаси юқори кучланишли подстанциялари ва трансформатор блокларини синовдан ўтказиш учун уч фазали сифат анализаторлари, мегомметрлар ва контактсиз тепловизорлар тўлиқ етказиб берилди.',
      uz: "Olmaliq KMK yangi 3-Mis boyitish fabrikasi yuqori kuchlanishli podstansiyalari va transformator bloklarini sinovdan o'tkazish uchun uch fazali sifat analizatorlari, megommetrlar va kontaktsiz teplovizorlar to'liq yetkazib berildi.",
      ru: 'Поставка класса А трехфазных анализаторов качества электроэнергии MX-ELEC-400 и тепловизоров для предиктивной диагностики трансформаторных подстанций.',
      en: 'Delivery of Class-A 3-phase power quality analyzers MX-ELEC-400 and high-resolution thermal cameras for substation predictive maintenance.'
    },
    deliveredEquipment: ['MX-ELEC-400 (6 комплект)', 'MX-TH-950 HD (3 дона)', 'MX-ELEC-1000 Мультиметрлар (20 дона)'],
    results: {
      uz_cyrl: ['Гармоник тебранишлар ва электр исрофи 18% га камайтирилди', 'Юқори ҳароратли қизиш нуқталари сонияларда аниқланди', 'Муҳандислар гуруҳи ўқув курсидан ўтди'],
      uz: ["Garmonik tebranishlar va elektr isrofi 18% ga kamaytirildi", "Yuqori haroratli qizish nuqtalari soniyalarda aniqlandi", "Muhandislar guruhi o'quv kursidan o'tdi"],
      ru: ['Снижение потерь электроэнергии и гармонических искажений на 18%', 'Мгновенное обнаружение точек критического перегрева', 'Обучение 15 инженеров службы главного энергетика'],
      en: ['18% reduction in reactive power loss and harmonics', 'Instant detection of hot-spots in busbars', 'Certified training for 15 chief energy engineers']
    },
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  }
];
