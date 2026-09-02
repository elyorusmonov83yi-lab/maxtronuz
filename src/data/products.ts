import { CategoryInfo, Product } from '../types';

export const categoriesData: CategoryInfo[] = [
  {
    id: 'sensors',
    icon: 'Activity',
    name: {
      uz_cyrl: 'Датчик ва сенсорлар',
      uz: 'Datchik va sensorlar',
      ru: 'Датчики и сенсоры',
      en: 'Sensors & Transmitters'
    },
    description: {
      uz_cyrl: 'Босим, ҳарорат ва сатҳни ўлчовчи юқори аниқликдаги саноат сенсорлари.',
      uz: "Bosim, harorat va sathni o'lchovchi yuqori aniqlikdagi sanoat sensorlari.",
      ru: 'Высокоточные промышленные датчики давления, температуры и уровня.',
      en: 'High-precision industrial sensors for pressure, temperature, and level measurement.'
    },
    count: 4
  },
  {
    id: 'geodesy',
    icon: 'Compass',
    name: {
      uz_cyrl: 'Геодезия ускуналари',
      uz: 'Geodeziya uskunalari',
      ru: 'Геодезическое оборудование',
      en: 'Geodetic Equipment'
    },
    description: {
      uz_cyrl: 'Электрон тахеометрлар, нивелирлар ва юқори аниқликдаги GNSS RTK қабул қилувчилар.',
      uz: "Elektron taxeometrlar, nivellirlar va yuqori aniqlikdagi GNSS RTK qabul qiluvchilar.",
      ru: 'Электронные тахеометры, нивелиры и высокоточные GNSS RTK приемники.',
      en: 'Total stations, digital levels, and high-accuracy GNSS RTK surveying receivers.'
    },
    count: 4
  },
  {
    id: 'electrical',
    icon: 'Zap',
    name: {
      uz_cyrl: 'Электротехника ва назорат',
      uz: 'Elektrotexnika va nazorat',
      ru: 'Электроизмерительные приборы',
      en: 'Electrical & Power Testing'
    },
    description: {
      uz_cyrl: 'Мультиметрлар, ток омбурлари, мегомметрлар ва электр тармоғи сифати анализаторлари.',
      uz: "Multimetrlar, tok omburlari, megommetrlar va elektr tarmog'i sifati analizatorlari.",
      ru: 'Мультиметры, токоизмерительные клещи, мегомметры и анализаторы качества сети.',
      en: 'Multimeters, clamp meters, insulation testers, and power quality analyzers.'
    },
    count: 4
  },
  {
    id: 'locators',
    icon: 'Radar',
    name: {
      uz_cyrl: 'Кабел ва қувур излагичлар',
      uz: 'Kabel va quvur izlagichlar',
      ru: 'Трассоискатели и кабелеискатели',
      en: 'Pipe & Cable Locators'
    },
    description: {
      uz_cyrl: 'Ер ости коммуникациялари, кабел трассалари ва сув сизиб чиқишини аниқловчи ускуналар.',
      uz: "Yer osti kommunikatsiyalari, kabel trassalari va suv sizib chiqishini aniqlovchi uskunalar.",
      ru: 'Локаторы подземных коммуникаций, трассопоисковые системы и акустические течеискатели.',
      en: 'Underground utility locators, cable route tracers, and acoustic pipe leak detectors.'
    },
    count: 3
  },
  {
    id: 'thermal',
    icon: 'Flame',
    name: {
      uz_cyrl: 'Иссиқлик ва тепловизорлар',
      uz: 'Issiqlik va teplovizorlar',
      ru: 'Тепловизоры и пирометры',
      en: 'Thermal Imaging & IR'
    },
    description: {
      uz_cyrl: 'Саноат тепловизорлари, оптик пирометрлар ва инфрақизил тасвирлаш тизимлари.',
      uz: "Sanoat teplovizorlari, optik pirometrlar va infraqizil tasvirlash tizimlari.",
      ru: 'Промышленные тепловизоры, оптические пирометры и ИК-системы неразрушающего контроля.',
      en: 'Industrial thermal cameras, precision optical pyrometers, and infrared diagnostic systems.'
    },
    count: 3
  },
  {
    id: 'ndt',
    icon: 'ShieldCheck',
    name: {
      uz_cyrl: 'Нодеструктив назорат (НК)',
      uz: 'Nodestruktiv nazorat (NK)',
      ru: 'Неразрушающий контроль (НК)',
      en: 'Non-Destructive Testing'
    },
    description: {
      uz_cyrl: 'Ултратовушли қалинлик ўлчагичлар, дефектоскоплар ва қатлам қалинлигини ўлчагичлар.',
      uz: "Ultratovushli qalinlik o'lchagichlar, defektoskoplar va qatlam qalinligini o'lchagichlar.",
      ru: 'Ультразвуковые толщиномеры, дефектоскопы и толщиномеры защитных покрытий.',
      en: 'Ultrasonic thickness gauges, ultrasonic flaw detectors, and coating thickness gauges.'
    },
    count: 3
  }
];

export const productsData: Product[] = [
  // --- SENSORS ---
  {
    id: 'mx-pt500',
    name: 'MAXTRON Прецизион босим датчиги',
    model: 'MX-PT500 Pro',
    category: 'sensors',
    tagline: {
      uz_cyrl: 'Нефть-газ ва гидротехника учун саноат босим датчиги',
      uz: "Neft-gaz va gidrotexnika uchun sanoat bosim datchigi",
      ru: 'Промышленный преобразователь давления для нефтегазового сектора',
      en: 'Industrial High-Accuracy Pressure Transmitter for Process Control'
    },
    description: {
      uz_cyrl: 'MX-PT500 Pro саноат босими датчиги агрессив муҳитларда юқори барқарорлик ва 0.075% аниқлик билан ишлайди. HART/4-20mA протоколи ва рақамли дисплейга эга.',
      uz: "MX-PT500 Pro sanoat bosimi datchigi agressiv muhitlarda yuqori barqarorlik va 0.075% aniqlik bilan ishlaydi. HART/4-20mA protokoli va raqamli displeyga ega.",
      ru: 'MX-PT500 Pro — интеллектуальный датчик давления с погрешностью 0.075%, поддержкой протокола HART и взрывозащищенным исполнением ATEX / Exd.',
      en: 'MX-PT500 Pro delivers exceptional 0.075% accuracy with HART / 4-20mA output, stainless 316L diaphragm, and ATEX explosion-proof certification.'
    },
    price: 4850000,
    oldPrice: 5400000,
    priceFormatted: {
      uz_cyrl: '4 850 000 сўм',
      uz: "4 850 000 so'm",
      ru: '4 850 000 сум',
      en: '4 850 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Ўлчов диапозони / Range', value: '-0.1 ... 100 MPa' },
      { name: 'Аниқлик синфи / Accuracy', value: '0.075% FS' },
      { name: 'Чиқиш сигнали / Output', value: '4-20mA + HART 7.0' },
      { name: 'Ҳимоя даражаси / IP Rating', value: 'IP67 / Ex d IIC T6' },
      { name: 'Иш ҳарорати / Temperature', value: '-40°C ... +85°C' }
    ],
    features: {
      uz_cyrl: [
        'HART рақамли алоқа интерфейси',
        'AISI 316L зангламас пўлат мембрана',
        'Портлашдан хавфсиз (Exd) корпус',
        'Нул нуқтасини автоматик калибровкалаш'
      ],
      uz: [
        'HART raqamli aloqa interfeysi',
        'AISI 316L zanglamas po\'lat membrana',
        'Portlashdan xavfsiz (Exd) korpus',
        'Nol nuqtasini avtomatik kalibrovkalash'
      ],
      ru: [
        'Цифровой протокол связи HART 7.0',
        'Мембрана из нержавеющей стали AISI 316L',
        'Взрывозащищенный корпус Ex d IIC T6',
        'Автоматическая температурная компенсация'
      ],
      en: [
        'Digital HART 7.0 communication protocol',
        'AISI 316L stainless steel wetted diaphragm',
        'ATEX explosion-proof housing (Ex d IIC T6)',
        'Automatic active temperature compensation'
      ]
    },
    applications: {
      uz_cyrl: ['Нефть ва газ қувурлари', 'Иссиқлик электр станциялари', 'Кимёвий ишлаб чиқариш', 'Сув таъминоти тармоқлари'],
      uz: ['Neft va gaz quvurlari', 'Issiqlik elektr stantsiyalari', 'Kimyoviy ishlab chiqarish', 'Suv ta\'minoti tarmoqlari'],
      ru: ['Нефтегазопроводы', 'Теплоэлектростанции (ТЭС)', 'Химическая промышленность', 'Водоканал и насосные станции'],
      en: ['Oil & Gas Pipelines', 'Thermal Power Plants', 'Chemical Processing', 'Municipal Water Networks']
    },
    standardCert: "O'zstandart № 02.4820-24, ISO 9001",
    warrantyMonths: 24
  },
  {
    id: 'mx-temp800',
    name: 'MAXTRON Ҳарорат трансмиттери',
    model: 'MX-TT800',
    category: 'sensors',
    tagline: {
      uz_cyrl: 'Pt100/Pt1000 ва термопаралар учун интеллектуал трансмиттер',
      uz: 'Pt100/Pt1000 va termoparalar uchun intellektual transmitter',
      ru: 'Интеллектуальный преобразователь температуры для Pt100 и ТХА',
      en: 'Smart Temperature Transmitter for RTD & Thermocouple inputs'
    },
    description: {
      uz_cyrl: 'Барча турдаги RTD ва термопара датчиклари билан интеграция қилинувчи рақамли ҳарорат датчиги.',
      uz: "Barcha turdagi RTD va termopara datchiklari bilan integratsiya qilinuvchi raqamli harorat datchigi.",
      ru: 'Высоконадежный преобразователь температуры с гальванической развязкой до 2 кВ и поддержкой термопар типов K, J, S, B, N.',
      en: 'Universal temperature transmitter with 2kV galvanic isolation, high linearity, and programmable input range.'
    },
    price: 3200000,
    oldPrice: 3600000,
    priceFormatted: {
      uz_cyrl: '3 200 000 сўм',
      uz: "3 200 000 so'm",
      ru: '3 200 000 сум',
      en: '3 200 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Ўлчов ҳарорати / Range', value: '-200°C ... +1370°C' },
      { name: 'Аниқлик / Accuracy', value: '±0.1°C (Pt100)' },
      { name: 'Кириш тури / Sensor Input', value: 'Pt100, Pt1000, Type K/J/S/N' },
      { name: 'Ҳимоя / Enclosure', value: 'IP66 / NEMA 4X' }
    ],
    features: {
      uz_cyrl: ['Гальваник ажратилган занжир', 'LCD ёруғлик кўрсаткич', 'Модбас RTU ва 4-20mA'],
      uz: ['Galvanik ajratilgan zanjir', 'LCD yorug\'lik ko\'rsatkich', 'Modbus RTU va 4-20mA'],
      ru: ['Гальваническая развязка 2000 В', 'Встроенный графический дисплей', 'Выход 4-20мА / Modbus'],
      en: ['2000V Galvanic Isolation', 'Backlit LCD interface', 'Dual 4-20mA / Modbus output']
    },
    applications: {
      uz_cyrl: ['Металлургия печлари', 'Нефтни қайта ишлаш', 'Озиқ-овқат саноати'],
      uz: ['Metallurgiya pechlari', 'Neftni qayta ishlash', 'Oziq-ovqat sanoati'],
      ru: ['Металлургические печи', 'Нефтепереработка', 'Пищевая промышленность'],
      en: ['Metallurgical furnaces', 'Refineries', 'Food & Pharma Processing']
    },
    standardCert: "O'zstandart № 02.3912-23",
    warrantyMonths: 24
  },
  {
    id: 'mx-level-ultra',
    name: 'MAXTRON Радарли сатҳ ўлчагич',
    model: 'MX-RL900 80GHz',
    category: 'sensors',
    tagline: {
      uz_cyrl: '80 GHz юқори частотали контактсиз суюқлик ва сочилувчан моддалар сатҳи датчиги',
      uz: "80 GHz yuqori chastotali kontaktsiz suyuqlik va sochiluvchan moddalar sathi datchigi",
      ru: 'Высокочастотный бесконтактный радарный уровнемер 80 ГГц',
      en: '80 GHz High-Frequency Non-Contact Radar Level Transmitter'
    },
    description: {
      uz_cyrl: '80 ГГц радар технологияси туфайли чанг, буғ ва кўпик таъсирида ҳам 1 мм аниқлик билан сатҳни ўлчайди.',
      uz: "80 GHz radar texnologiyasi tufayli chang, bug' va ko'pik ta'sirida ham 1 mm aniqlik bilan sathni o'lchaydi.",
      ru: 'Радарный уровнемер с узким лучом 3°, работающий в условиях сильного пылеобразования, пара и экстремальных температур до +250°C.',
      en: '80 GHz radar level meter featuring narrow 3-degree beam angle, penetrating dust, steam, foam up to 120 meters.'
    },
    price: 14500000,
    oldPrice: 16200000,
    priceFormatted: {
      uz_cyrl: '14 500 000 сўм',
      uz: "14 500 000 so'm",
      ru: '14 500 000 сум',
      en: '14 500 000 UZS'
    },
    inStock: true,
    isNew: true,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Масофа / Max Range', value: '0.1 ... 120 m' },
      { name: 'Аниқлик / Accuracy', value: '±1 mm' },
      { name: 'Нур бурчаги / Beam Angle', value: '3°' },
      { name: 'Босим / Process Pressure', value: '-1 ... 40 bar' }
    ],
    features: {
      uz_cyrl: ['Bluetooth орқали созлаш', 'Ҳеч қандай ҳаракатланувчи қисмларсиз', 'Агрессив кислота ва ишқорларга чидамли'],
      uz: ['Bluetooth orqali sozlash', 'Hech qanday harakatlanuvchi qismlarsiz', 'Agressiv kislota va ishqorlarga chidamli'],
      ru: ['Настройка через мобильное приложение (Bluetooth)', 'Фланцы из PTFE/Hastelloy', 'Устойчив к конденсату и парам'],
      en: ['Wireless Bluetooth mobile configuration', 'PTFE / Hastelloy antenna options', 'Immune to steam and heavy condensation']
    },
    applications: {
      uz_cyrl: ['Резервуар парклари', 'Цемент силос миноралари', 'Дон сақлаш омборлари'],
      uz: ['Rezervuar parklari', 'Tsement silos minoralari', 'Don saqlash omborlari'],
      ru: ['Резервуарные парки ГСМ', 'Цементные силосы', 'Зернохранилища и элеваторы'],
      en: ['Bulk fuel storage tanks', 'Cement silos', 'Grain elevators and bulk solids']
    },
    standardCert: "O'zstandart № 02.5510-25, ATEX Ex ia",
    warrantyMonths: 36
  },
  {
    id: 'mx-vibro-sense',
    name: 'MAXTRON Саноат тебраниш (вибрация) сенсори',
    model: 'MX-VS300 Triax',
    category: 'sensors',
    tagline: {
      uz_cyrl: 'Насос ва турбиналарнинг ҳолатини онлайн мониторинг қилиш тизими',
      uz: "Nasos va turbinalarning holatini onlayn monitoring qilish tizimi",
      ru: 'Трехосевой промышленный датчик вибрации и виброскорости',
      en: 'Triaxial Industrial Vibration & Velocity Transmitter'
    },
    description: {
      uz_cyrl: 'Роторли механизмлар, электродвигателлар ва подшипникларнинг эскиришини эрта босқичда аниқловчи 3 ўқли датчик.',
      uz: "Rotorli mexanizmlar, elektrodvigatellar va podshipniklarning eskirishini erta bosqichda aniqlovchi 3 o'qli datchik.",
      ru: 'Прецизионный пьезоэлектрический датчик для предиктивной вибродиагностики промышленного оборудования (ISO 10816).',
      en: 'Piezoelectric triaxial sensor designed for ISO 10816 machinery vibration diagnostics and predictive maintenance.'
    },
    price: 6300000,
    priceFormatted: {
      uz_cyrl: '6 300 000 сўм',
      uz: "6 300 000 so'm",
      ru: '6 300 000 сум',
      en: '6 300 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Частота / Freq Range', value: '0.5 Hz ... 12 kHz' },
      { name: 'Ўқлар / Axis', value: '3-axis (X, Y, Z)' },
      { name: 'Сезгирлик / Sensitivity', value: '100 mV/g' },
      { name: 'Ҳимоя / Protection', value: 'IP68 герметик' }
    ],
    features: {
      uz_cyrl: ['ISO 10816 стандарти', 'Магнитли тезкор маҳкамлагич', 'Шовқин фильтрацияси'],
      uz: ['ISO 10816 standarti', 'Magnitli tezkor mahkamlagich', 'Shovqin filtratsiyasi'],
      ru: ['Соответствие ISO 10816', 'Магнитное быстросъемное крепление', 'Встроенный фильтр высоких гармоник'],
      en: ['ISO 10816 compliance', 'Quick magnetic mount', 'Integrated dynamic harmonic filter']
    },
    applications: {
      uz_cyrl: ['ГЭС ва ИЭС турбиналари', 'Компрессор станциялари', 'Шахта вентиляторлари'],
      uz: ['GES va IES turbinalari', 'Kompressor stantsiyalari', 'Shaxta ventilyatorlari'],
      ru: ['Турбины ГЭС и ТЭС', 'Газокомпрессорные станции', 'Шахтные вентиляционные установки'],
      en: ['Hydro / Thermal turbines', 'Gas compressors', 'Mine ventilation fans']
    },
    standardCert: "O'zstandart № 02.4102-24",
    warrantyMonths: 24
  },

  // --- GEODESY ---
  {
    id: 'mx-geopro-x9',
    name: 'MAXTRON Электрон Тахеометр',
    model: 'GeoPro X9 Ultra',
    category: 'geodesy',
    tagline: {
      uz_cyrl: '1 сонияли бурчак аниқлиги ва 1500 м призмасиз лазерли ўлчаш',
      uz: "1 soniyali burchak aniqligi va 1500 m prizmasiz lazerli o'lchash",
      ru: 'Прецизионный электронный тахеометр с безотражательным дальномером 1500 м',
      en: 'High-Precision 1-Second Total Station with 1500m Reflectorless EDM'
    },
    description: {
      uz_cyrl: 'GeoPro X9 Ultra юқори малакали геодезистлар ва йирик инфратузилма қурилиши учун мўлжалланган. Икки томонлама рангли сенсорли дисплей ва кучли дастурий таъминот.',
      uz: "GeoPro X9 Ultra yuqori malakali geodezistlar va yirik infratuzilma qurilishi uchun mo'ljallangan. Ikki tomonlama rangli sensorli displey va kuchli dasturiy ta'minot.",
      ru: 'Инженерный тахеометр премиум-класса с угловой точностью 1", ОС Android, цветными экранами с двух сторон и передачей данных по Wi-Fi/4G.',
      en: 'Flagship engineering total station with 1" angular accuracy, dual touchscreen Android displays, 1500m reflectorless EDM, and auto-targeting.'
    },
    price: 89000000,
    oldPrice: 96000000,
    priceFormatted: {
      uz_cyrl: '89 000 000 сўм',
      uz: "89 000 000 so'm",
      ru: '89 000 000 сум',
      en: '89 000 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Бурчак аниқлиги / Angle Acc', value: '1" (0.3 mgon)' },
      { name: 'Призмасиз масофа / EDM Range', value: '1500 m' },
      { name: 'Призмали масофа / Prism Range', value: '5000 m (1 mm + 1.5 ppm)' },
      { name: 'ОС ва хотира / System', value: 'Android 11, 4GB RAM + 64GB' },
      { name: 'Батарея / Battery Life', value: '18 соат (2х Li-Ion)' }
    ],
    features: {
      uz_cyrl: [
        'Икки томонлама 5.5 дюйм рангли сенсорли экран',
        'Автоматик нишонга олиш (Auto-Tracking)',
        'CAD ва BIM форматларини тўғридан-тўғри очиш',
        'IP66 чанг ва сувга чидамлилик'
      ],
      uz: [
        'Ikki tomonlama 5.5 dyuym rangli sensorli ekran',
        'Avtomatik nishonga olish (Auto-Tracking)',
        'CAD va BIM formatlarini to\'g\'ridan-to\'g\'ri ochish',
        'IP66 chang va suvga chidamlilik'
      ],
      ru: [
        'Два цветных сенсорных дисплея 5.5"',
        'Система автоматического наведения на цель',
        'Прямая поддержка файлов AutoCAD DWG/DXF и IFC',
        'Класс защиты корпуса IP66'
      ],
      en: [
        'Dual 5.5-inch responsive color touchscreens',
        'Automated active target recognition',
        'Native AutoCAD DXF/DWG & BIM format import',
        'IP66 all-weather rugged metal housing'
      ]
    },
    applications: {
      uz_cyrl: ['Кўприк ва туннеллар қурилиши', 'Топографик суратга олиш', 'Карьер ва кончилик', 'Бинолар деформацияси мониторинги'],
      uz: ['Ko\'prik va tunnellar qurilishi', 'Topografik suratga olish', 'Karyer va konchilik', 'Binolar deformatsiyasi monitoringi'],
      ru: ['Строительство мостов и тоннелей', 'Высокоточная топосъемка', 'Горнодобывающие карьеры', 'Мониторинг деформаций зданий'],
      en: ['Bridge and tunnel engineering', 'High-accuracy topography', 'Open-pit mining', 'Structural deformation monitoring']
    },
    standardCert: "O'zstandart № 02.7718-24, ISO 17123",
    warrantyMonths: 36
  },
  {
    id: 'mx-gnss-rtk',
    name: 'MAXTRON Геодезик GNSS RTK қабул қилгич',
    model: 'GeoNav RTK-1408',
    category: 'geodesy',
    tagline: {
      uz_cyrl: '1408 канал ва IMU 60° қиялик компенсацияси',
      uz: "1408 kanal va IMU 60° qiyalik kompensatsiyasi",
      ru: 'Многочастотный GNSS RTK приемник 1408 каналов с IMU-инклинометром',
      en: '1408-Channel Multi-Constellation GNSS RTK Receiver with 60° IMU Tilt'
    },
    description: {
      uz_cyrl: 'GPS, ГЛОНАСС, Galileo, BeiDou, QZSS сунъий йўлдош тизимларини бир вақтда қабул қилувчи ихчам ва енгил RTK ровер.',
      uz: "GPS, GLONASS, Galileo, BeiDou, QZSS sun'iy yo'ldosh tizimlarini bir vaqtda qabul qiluvchi ixcham va yengil RTK rover.",
      ru: 'Сверхкомпактный RTK приемник весом всего 790 грамм. Обеспечивает точность в плане 8 мм + 1 ppm даже под кронами деревьев и в плотной городской застройке.',
      en: 'Compact 790g GNSS rover supporting all constellations, 60-degree calibration-free IMU tilt compensation, and integrated UHF modem.'
    },
    price: 46000000,
    oldPrice: 51000000,
    priceFormatted: {
      uz_cyrl: '46 000 000 сўм',
      uz: "46 000 000 so'm",
      ru: '46 000 000 сум',
      en: '46 000 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Каналлар / Channels', value: '1408 channels' },
      { name: 'RTK аниқлиги / RTK Accuracy', value: 'H: 8mm + 1ppm, V: 15mm + 1ppm' },
      { name: 'Қиялик / IMU Tilt Angle', value: '60° калибровкасиз (2cm аниқлик)' },
      { name: 'Алоқа / Radiomodem', value: '4G LTE, UHF 410-470MHz, Wi-Fi' }
    ],
    features: {
      uz_cyrl: ['Магний қотишмали мустаҳкам корпус', '2 метрдан бетонга қулашга чидамли', 'Иккита алмашинувчан батарея'],
      uz: ['Magniy qotishmali mustahkam korpus', '2 metrdan betonga qulashga chidamli', 'Ikkita almashinuvchan batareya'],
      ru: ['Ударопрочный корпус из магниевого сплава', 'Выдерживает падение с 2 м на бетон', 'Горячая замена батарей'],
      en: ['Ultra-rugged magnesium alloy body', '2-meter concrete drop resistance', 'Hot-swappable dual battery design']
    },
    applications: {
      uz_cyrl: ['Кадастр ва чегаралаш', 'Йўл қурилиши', 'Қишлоқ хўжалиги геодезияси'],
      uz: ['Kadastr va chegaralash', 'Yo\'l qurilishi', 'Qishloq xo\'jaligi geodeziyasi'],
      ru: ['Земельный кадастр', 'Дорожное строительство', 'Точное земледелие'],
      en: ['Cadastral surveying', 'Highway grading & earthworks', 'Precision agriculture']
    },
    standardCert: "O'zstandart № 02.6640-24",
    warrantyMonths: 36
  },
  {
    id: 'mx-laser-level',
    name: 'MAXTRON Рақамли электрон нивелир',
    model: 'DigiLevel DL-32',
    category: 'geodesy',
    tagline: {
      uz_cyrl: '0.3 мм/км аниқликдаги рақамли штрих-кодли нивелир',
      uz: "0.3 mm/km aniqlikdagi raqamli shtrix-kodli nivellir",
      ru: 'Цифровой нивелир с автоматическим считыванием штрих-кодовой рейки',
      en: 'High-Precision Digital Level with Barcode Staff Reading'
    },
    description: {
      uz_cyrl: 'Инсон омили ва кўриш хатоликларини бартараф этувчи электрон штрих-код ўқувчи нивелир.',
      uz: "Inson omili va ko'rish xatoliklarini bartaraf etuvchi elektron shtrix-kod o'quvchi nivellir.",
      ru: 'Автоматический цифровой нивелир исключает ошибки оператора при взятии отсчетов. Скорость одного измерения — менее 2 секунд.',
      en: 'Electronic barcode level completely eliminating human reading errors with 0.3mm per km double leveling precision.'
    },
    price: 18500000,
    oldPrice: 20000000,
    priceFormatted: {
      uz_cyrl: '18 500 000 сўм',
      uz: "18 500 000 so'm",
      ru: '18 500 000 сум',
      en: '18 500 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Аниқлик / Accuracy', value: '0.3 mm / km' },
      { name: 'Ўлчов вақти / Measuring Time', value: '< 1.5 sec' },
      { name: 'Масофа / Distance Range', value: '1.5 ... 105 m' },
      { name: 'Хотира / Internal Memory', value: '30,000 ўлчов нуқтаси' }
    ],
    features: {
      uz_cyrl: ['USB орқали маълумот олиш', 'Магнитли компенсатор', 'Ҳисоб-китобларни ускунанинг ўзида бажариш'],
      uz: ['USB orqali ma\'lumot olish', 'Magnitli kompensator', 'Hisob-kitoblarni uskunaning o\'zida bajarish'],
      ru: ['Экспорт данных на USB-флешку', 'Магнитный демпфер компенсатора', 'Встроенные программы уравнивания ходов'],
      en: ['Direct USB flash export', 'Magnetic damping compensator', 'Built-in leveling network calculations']
    },
    applications: {
      uz_cyrl: ['I ва II синф давлат нивелирлаш тармоқлари', 'Тўғон ва гидроиншоотлар мониторинги'],
      uz: ['I va II sinf davlat nivellirlash tarmoqlari', 'To\'g\'on va gidroinshootlar monitoringi'],
      ru: ['Государственное нивелирование I и II классов', 'Мониторинг осадки плотин и дамб'],
      en: ['Class I & II national geodetic leveling', 'Dam & hydropower structural settling monitoring']
    },
    standardCert: "O'zstandart № 02.1190-23",
    warrantyMonths: 24
  },
  {
    id: 'mx-disto-300',
    name: 'MAXTRON Профессионал лазер масофа ўлчагич',
    model: 'LaserPro 200X',
    category: 'geodesy',
    tagline: {
      uz_cyrl: '200 м оптик видоискательли саноат дальномери',
      uz: "200 m optik vidoiskatelli sanoat dalnomeri",
      ru: 'Лазерный дальномер 200 м с оптическим видоискателем и 4x зумом',
      en: '200m Industrial Laser Distance Meter with 4x Digital Camera Viewfinder'
    },
    description: {
      uz_cyrl: 'Қуёш нури остида ҳам очиқ майдонларда аниқ нишонга олиш имконини берувчи рақамли камерага эга.',
      uz: "Quyosh nuri ostida ham ochiq maydonlarda aniq nishonga olish imkonini beruvchi raqamli kameraga ega.",
      ru: 'Профессиональный дальномер с цифровой камерой 4х для работы на улице при ярком солнечном свете.',
      en: 'Outdoor laser distance meter with 4x digital zoom targeting camera, 360-degree tilt sensor, and Bluetooth connectivity.'
    },
    price: 3800000,
    priceFormatted: {
      uz_cyrl: '3 800 000 сўм',
      uz: "3 800 000 so'm",
      ru: '3 800 000 сум',
      en: '3 800 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Масофа / Range', value: '0.05 ... 200 m' },
      { name: 'Аниқлик / Accuracy', value: '±1.0 mm' },
      { name: 'Камера / Camera', value: '4x рақамли зум' },
      { name: 'Ҳимоя / IP', value: 'IP65' }
    ],
    features: {
      uz_cyrl: ['Пифагор ва ҳажм ҳисоблаш', 'Bluetooth 5.0 мобил иловага уланиш', '360° бурчак датчиги'],
      uz: ['Pifagor va hajm hisoblash', 'Bluetooth 5.0 mobil ilovaga ulanish', '360° burchak datchigi'],
      ru: ['Косвенные измерения по Пифагору', 'Передача чертежей по Bluetooth в CAD', 'Датчик угла наклона 360°'],
      en: ['Pythagorean height calculation', 'Bluetooth CAD blueprint transfer', '360° digital inclination sensor']
    },
    applications: {
      uz_cyrl: ['Бино архитектураси', 'Фасад ўлчовлари', 'Инвентаризация'],
      uz: ['Bino arxitekturasi', 'Fasad o\'lchovlari', 'Inventarizatsiya'],
      ru: ['Архитектурные замеры', 'Фасадные работы', 'БТИ и кадастровая оценка'],
      en: ['Architectural scanning', 'Facade construction', 'Facility management & inventory']
    },
    standardCert: "O'zstandart № 02.8831-24",
    warrantyMonths: 24
  },

  // --- ELECTRICAL ---
  {
    id: 'mx-dmm-890',
    name: 'MAXTRON True RMS Профессионал Мультиметр',
    model: 'MX-DMM890 Industrial',
    category: 'electrical',
    tagline: {
      uz_cyrl: 'CAT IV 600V / CAT III 1000V хавфсизлик синфидаги олий аниқликдаги мультиметр',
      uz: "CAT IV 600V / CAT III 1000V xavfsizlik sinfidagi oliy aniqlikdagi multimetr",
      ru: 'Промышленный мультиметр True RMS высокой точности с защитой CAT IV 600V',
      en: 'High-Precision True RMS Industrial Multimeter (CAT IV 600V / CAT III 1000V)'
    },
    description: {
      uz_cyrl: 'Саноат корхоналари ва энергетика тизимларида кучланиш, ток, частота, ҳарорат ва сиғимни юқори аниқликда ўлчаш.',
      uz: "Sanoat korxonalari va energetika tizimlarida kuchlanish, tok, chastota, harorat va sig'imni yuqori aniqlikda o'lchash.",
      ru: 'Флагманский мультиметр с разрядностью шкалы 60,000 отсчетов, записью трендов и беспроводной связью.',
      en: 'Heavy-duty 60,000 count True-RMS multimeter with logging, low-pass filter for VFDs, and CAT IV electrical safety ratings.'
    },
    price: 4200000,
    oldPrice: 4700000,
    priceFormatted: {
      uz_cyrl: '4 200 000 сўм',
      uz: "4 200 000 so'm",
      ru: '4 200 000 сум',
      en: '4 200 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Кучланиш / Voltage DC/AC', value: '0.01 mV ... 1000 V' },
      { name: 'Ток / Current DC/AC', value: '0.01 µA ... 20 A (30s)' },
      { name: 'Асосий хатолик / DC Accuracy', value: '0.025%' },
      { name: 'Дисплей шкаласи / Counts', value: '60,000 отсчетов' },
      { name: 'Хавфсизлик / Safety Rating', value: 'CAT IV 600V / CAT III 1000V' }
    ],
    features: {
      uz_cyrl: ['VFD частота ростлагичлар учун Low-Pass фильтр', 'Ўлчов маълумотларини ёзиб олиш (Datalogger)', 'Иккиталик ёритилувчи дисплей'],
      uz: ['VFD chastota rostlagichlar uchun Low-Pass filtr', 'O\'lchov ma\'lumotlarini yozib olish (Datalogger)', 'Ikkitalik yoritiluvchi displey'],
      ru: ['ФНЧ для измерений на частотно-регулируемых приводах (VFD)', 'Встроенный даталоггер на 20 000 точек', 'Оптически изолированный USB интерфейс'],
      en: ['Low-pass filter for noisy VFD drives', 'On-board logging for up to 20,000 samples', 'Optically isolated PC communication']
    },
    applications: {
      uz_cyrl: ['Электр тармоқлари хизмати', 'Автоматика ва КИПиА', 'Саноат ускуналари созлаш'],
      uz: ['Elektr tarmoqlari xizmati', 'Avtomatika va KIPiA', 'Sanoat uskunalari sozlash'],
      ru: ['Службы релейной защиты и автоматики (РЗА)', 'КИПиА и наладка станков', 'Тяжелая промышленность'],
      en: ['Power grid maintenance', 'Industrial automation & instrumentation', 'Substation equipment commissioning']
    },
    standardCert: "O'zstandart № 02.3391-24, IEC 61010",
    warrantyMonths: 36
  },
  {
    id: 'mx-meg-10kv',
    name: 'MAXTRON 10 кВ Рақамли Мегомметр',
    model: 'MegaVolt MV-10000',
    category: 'electrical',
    tagline: {
      uz_cyrl: '10 000 В гача юқори кучланишли изоляция қаршилиги ўлчагич',
      uz: "10 000 V gacha yuqori kuchlanishli izolyatsiya qarshiligi o'lchagich",
      ru: 'Цифровой мегаомметр высокого напряжения до 10 кВ (до 35 ТОм)',
      en: '10kV High-Voltage Digital Insulation Resistance Tester (up to 35 TΩ)'
    },
    description: {
      uz_cyrl: 'Трансформаторлар, юқори кучланишли кабеллар ва генераторларнинг изоляцияси сифатини ва эскириш даражасини аниқлаш.',
      uz: "Transformatorlar, yuqori kuchlanishli kabellar va generatorlarning izolyatsiyasi sifatini va eskirish darajasini aniqlash.",
      ru: 'Профессиональный прибор для измерения сопротивления изоляции до 35 ТОм с автоматическим расчетом коэффициентов абсорбции (DAR), поляризации (PI) и диэлектрического разряда (DD).',
      en: '10kV insulation tester providing automatic calculation of Polarization Index (PI), Dielectric Absorption Ratio (DAR), and Step Voltage tests.'
    },
    price: 24500000,
    oldPrice: 27000000,
    priceFormatted: {
      uz_cyrl: '24 500 000 сўм',
      uz: "24 500 000 so'm",
      ru: '24 500 000 сум',
      en: '24 500 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Синов кучланиши / Test Voltage', value: '500V, 1kV, 2.5kV, 5kV, 10kV' },
      { name: 'Қаршилик диапозони / Resistance', value: '0.01 MΩ ... 35 TΩ' },
      { name: 'Қисқа туташув токи / Short Current', value: '6 mA (тез қувватлаш)' },
      { name: 'Ҳисоб-китоблар / Diagnostics', value: 'PI, DAR, DD, SV, Ramp test' }
    ],
    features: {
      uz_cyrl: ['Кучли шовқинга қарши фильтрация (8 mA)', 'Қолдиқ зарядни автоматик разрядлаш', 'Экрани катта рангли TFT'],
      uz: ['Kuchli shovqinga qarshi filtratsiya (8 mA)', 'Qoldiq zaryadni avtomatik razryadlash', 'Ekrani katta rangli TFT'],
      ru: ['Высокая помехоустойчивость до 8 мА наведенных токов', 'Автоматический безопасный разряд емкостного заряда', 'Цветной графический дисплей'],
      en: ['Heavy 8mA noise suppression in active substations', 'Automatic capacitive charge discharge safety', 'Color graphical display with real-time curves']
    },
    applications: {
      uz_cyrl: ['Подстанция трансформаторлари', 'Юқори кучланишли кабел тармоқлари', 'Электродвигателлар'],
      uz: ['Podstantsiya transformatorlari', 'Yuqori kuchlanishli kabel tarmoqlari', 'Elektrodvigatellar'],
      ru: ['Силовые трансформаторы 110/220/500 кВ', 'Высоковольтные кабельные линии', 'Крупные генераторы и электродвигатели'],
      en: ['110/220/500 kV power transformers', 'High-voltage underground feeder cables', 'Heavy generator and motor stator windings']
    },
    standardCert: "O'zstandart № 02.4990-24, IEEE 43",
    warrantyMonths: 36
  },
  {
    id: 'mx-power-qual',
    name: 'MAXTRON 3 фазали электр сифати анализатори',
    model: 'PowerAnalyzer PQ-800',
    category: 'electrical',
    tagline: {
      uz_cyrl: 'ГОСТ 30804.4.30 бўйича «А» синф электр энергияси сифати таҳлили',
      uz: "GOST 30804.4.30 bo'yicha «A» sinf elektr energiyasi sifati tahlili",
      ru: 'Трехфазный анализатор качества электроэнергии Класса А',
      en: 'Three-Phase Class A Power Quality & Energy Analyzer'
    },
    description: {
      uz_cyrl: 'Электр тармоғидаги гармоникалар, силкинишлар, кучланиш тушишлари ва қувват коэффициентини тўлиқ назорат қилиш.',
      uz: "Elektr tarmog'idagi garmonikalar, silkinishlar, kuchlanish tushishlari va quvvat koeffitsientini to'liq nazorat qilish.",
      ru: 'Анализатор электроэнергии с поддержкой 50-й гармоники, регистрацией переходных процессов до 10 МГц и расчетом потерь.',
      en: 'Class A IEC 61000-4-30 compliant analyzer capturing dips, swells, flickers, unbalance, and harmonics up to the 50th.'
    },
    price: 39000000,
    priceFormatted: {
      uz_cyrl: '39 000 000 сўм',
      uz: "39 000 000 so'm",
      ru: '39 000 000 сум',
      en: '39 000 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Синф / Standard Class', value: 'Class A (IEC 61000-4-30)' },
      { name: 'Гармоникалар / Harmonics', value: '1 ... 50-тартибли' },
      { name: 'Ток сенсорлари / Current Probes', value: '4x Rogowski coils (10A ... 6000A)' },
      { name: 'Интерфейс / Connectivity', value: 'Ethernet, USB, Wi-Fi, Cloud report' }
    ],
    features: {
      uz_cyrl: ['Тўлиқ автоматик ҳисобот генерацияси', 'Транзиент жараёнларни қайд этиш', 'Кучланиш силкинишини ёзиш'],
      uz: ['To\'liq avtomatik hisobot generatsiyasi', 'Tranzient jarayonlarni qayd etish', 'Kuchlanish silkinishini yozish'],
      ru: ['Автоматическое формирование отчетов по ГОСТ 32144', 'Запись микросекундных импульсов и провалов напряжения', '4 гибких токовых клещей Роговского в комплекте'],
      en: ['Automatic standard compliance reporting', 'Microsecond transient and inrush capture', 'Includes 4 flexible Rogowski coils up to 6000A']
    },
    applications: {
      uz_cyrl: ['Саноат корхоналари энергетика аудити', 'Қуёш ва шамол электростанциялари', 'Подстанциялар'],
      uz: ['Sanoat korxonalari energetika auditi', 'Quyosh va shamol elektrostantsiyalari', 'Podstantsiyalar'],
      ru: ['Энергоаудит промышленных предприятий', 'Солнечные и ветровые электростанции', 'Распределительные сети'],
      en: ['Industrial energy audits', 'Solar & wind renewable farms', 'Substation power conditioning']
    },
    standardCert: "O'zstandart № 02.1905-24, IEC 61000-4-30 Class A",
    warrantyMonths: 24
  },
  {
    id: 'mx-clamp-pro',
    name: 'MAXTRON Рақамли ток омбури',
    model: 'ClampMaster CM-1000 AC/DC',
    category: 'electrical',
    tagline: {
      uz_cyrl: '1000A AC/DC True RMS ток ўлчовчи ихчам омбур',
      uz: "1000A AC/DC True RMS tok o'lchovchi ixcham ombur",
      ru: 'Токовые клещи 1000А AC/DC True RMS с бесконтактным детектором фазы',
      en: '1000A AC/DC True RMS Industrial Clamp Meter'
    },
    description: {
      uz_cyrl: 'Симларни узмасдан тўғридан-тўғри ўзгарувчан ва ўзгармас токни 1000 ампергача юқори аниқликда ўлчаш.',
      uz: "Simlarni uzmasdan to'g'ridan-to'g'ri o'zgaruvchan va o'zgarmas tokni 1000 ampergacha yuqori aniqlikda o'lchash.",
      ru: 'Клещи для измерения пусковых токов электродвигателей (Inrush), температуры, частоты и сопротивления.',
      en: 'Industrial clamp meter equipped with Inrush motor current capture, non-contact NCV detection, and temperature probe.'
    },
    price: 2650000,
    oldPrice: 2950000,
    priceFormatted: {
      uz_cyrl: '2 650 000 сўм',
      uz: "2 650 000 so'm",
      ru: '2 650 000 сум',
      en: '2 650 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Ток / AC/DC Current', value: '0.1 A ... 1000 A' },
      { name: 'Кучланиш / AC/DC Voltage', value: '1000 V' },
      { name: 'Омбур очилиш диаметри / Jaw Opening', value: '45 mm' },
      { name: 'Ҳимоя / Rating', value: 'CAT IV 600V' }
    ],
    features: {
      uz_cyrl: ['Inrush пусковой ток ўлчаш', 'Ёруғлик фонари', 'Bluetooth орқали телефонга уланиш'],
      uz: ['Inrush puskovoy tok o\'lchash', 'Yorug\'lik fonari', 'Bluetooth orqali telefonga ulanish'],
      ru: ['Режим фиксации пускового тока Inrush (100мс)', 'Встроенный светодиодный фонарик подсветки рабочей зоны', 'Беспроводной протокол передачи данных'],
      en: ['100ms Inrush motor starting current capture', 'Integrated high-power LED worklight', 'Wireless Bluetooth data streaming']
    },
    applications: {
      uz_cyrl: ['Электр двигателлар', 'Аккумулятор станциялари', 'Электромонтаж'],
      uz: ['Elektr dvigatellar', 'Akkumulyator stantsiyalari', 'Elektromontaj'],
      ru: ['Тяговые двигатели', 'Аккумуляторные батареи ИБП', 'Электромонтажные работы'],
      en: ['Traction & industrial motors', 'UPS battery banks', 'Commercial electrical installation']
    },
    standardCert: "O'zstandart № 02.7723-23",
    warrantyMonths: 24
  },

  // --- LOCATORS ---
  {
    id: 'mx-tracer-5000',
    name: 'MAXTRON Ер ости кабел ва қувур излагич (Трассоискатель)',
    model: 'MX-Tracer 5000 Pro',
    category: 'locators',
    tagline: {
      uz_cyrl: 'Ер ости коммуникацияларини 10 м чуқурликкача аниқловчи профессионал трассоискатель',
      uz: "Yer osti kommunikatsiyalarini 10 m chuqurlikkacha aniqlovchi professional trassoiskatel",
      ru: 'Профессиональный трассопоисковый комплекс с глубиной обнаружения до 10 м',
      en: 'Heavy-Duty Underground Pipe & Cable Locator System (Up to 10m Depth)'
    },
    description: {
      uz_cyrl: 'Электр кабеллари, газ ва сув қувурлари, оптик толали тармоқларнинг йўналиши ва чуқурлигини 1 см аниқликда топади. Генератор 10 Ватт қувватга эга.',
      uz: "Elektr kabellari, gaz va suv quvurlari, optik tolali tarmoqlarning yo'nalishi va chuqurligini 1 sm aniqlikda topadi. Generator 10 Vatt quvvatga ega.",
      ru: 'Интеллектуальный трассоискатель с 10-ваттным генератором, компасом направления трассы и автоматической оценкой глубины залегания кабеля/трубы.',
      en: 'Multi-frequency underground utility locator with 10W transmitter, real-time depth guidance, peak/null directional vectors, and GPS mapping.'
    },
    price: 34000000,
    oldPrice: 38000000,
    priceFormatted: {
      uz_cyrl: '34 000 000 сўм',
      uz: "34 000 000 so'm",
      ru: '34 000 000 сум',
      en: '34 000 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Аниқлаш чуқурлиги / Max Depth', value: '10 m (33 ft)' },
      { name: 'Генератор қуввати / Transmitter Power', value: '10 Watt (созланувчи)' },
      { name: 'Частоталар / Frequencies', value: '512Hz, 640Hz, 8kHz, 33kHz, 65kHz, 131kHz' },
      { name: 'Пассив режимлар / Passive Modes', value: 'Power (50Hz), Radio, CPS' },
      { name: 'Ҳимоя / Enclosure Rating', value: 'IP65 герметик' }
    ],
    features: {
      uz_cyrl: [
        'Трасса йўналиши кўрсаткичи (Компас-вектор)',
        'Кабел шикастланган жойини A-рамка билан аниқлаш',
        'GPS координатларни тўғридан-тўғри харитага тушириш',
        'Қуёшда ярақламайдиган юқори контрастли рангли дисплей'
      ],
      uz: [
        'Trassa yo\'nalishi ko\'rsatkichi (Kompas-vektor)',
        'Kabel shikastlangan joyini A-ramka bilan aniqlash',
        'GPS koordinatlarni to\'g\'ridan-to\'g\'ri xaritaga tushirish',
        'Quyoshda yaraqlamaydigan yuqori kontrastli rangli displey'
      ],
      ru: [
        'Электронный компас направления оси кабеля',
        'Локализация повреждений оболочки кабеля через А-рамку',
        'Встроенный GPS модуль для картографирования сетей',
        'Антибликовый цветной дисплей с высокой контрастностью'
      ],
      en: [
        'Real-time directional guidance compass vector',
        'A-Frame fault locator for cable sheath faults',
        'Integrated GPS receiver for automated GIS mapping',
        'High-contrast sunlight readable display'
      ]
    },
    applications: {
      uz_cyrl: ['Қурилиш олдидан ер қазиш хавфсизлиги', 'Ҳудудий электр тармоқлари', 'Газ таъминоти ва нефть қувурлари'],
      uz: ['Qurilish oldidan yer qazish xavfsizligi', 'Hududiy elektr tarmoqlari', 'Gaz ta\'minoti va neft quvurlari'],
      ru: ['Предотвращение повреждений при земляных работах', 'Городские электрические сети (РЭС)', 'Газораспределительные компании'],
      en: ['Excavation damage prevention', 'Municipal electricity distribution', 'Natural gas and petroleum pipeline management']
    },
    standardCert: "O'zstandart № 02.5519-24, CE, ISO 9001",
    warrantyMonths: 36
  },
  {
    id: 'mx-hydro-leak',
    name: 'MAXTRON Акустик сув сизиб чиқишини қидирувчи (Течеискатель)',
    model: 'HydroLeak HL-900',
    category: 'locators',
    tagline: {
      uz_cyrl: 'Босим остидаги қувурлардан сув ва суюқлик сизишини аниқловчи ультрасезувчан акустик қурилма',
      uz: "Bosim ostidagi quvurlardan suv va suyuqlik sizishini aniqlovchi ultrasezuvchan akustik qurilma",
      ru: 'Акустический корреляционный течеискатель для подземных водопроводов',
      en: 'Acoustic Underground Water Pipe Leak Detector with Digital Filtering'
    },
    description: {
      uz_cyrl: 'Асфальт, тупроқ ва бетон остидаги қувурлардан сув сизиб чиқиш шовқинини рақамли фильтрлар ёрдамида аниқлаб, тўғри нуқтани топади.',
      uz: "Asfalt, tuproq va beton ostidagi quvurlardan suv sizib chiqish shovqinini raqamli filtrlar yordamida aniqlab, to'g'ri nuqtani topadi.",
      ru: 'Универсальный акустический течеискатель с пьезомикрофонами высокой чувствительности и беспроводными наушниками с активным шумоподавлением.',
      en: 'High-sensitivity acoustic leak detector featuring smart frequency bandpass filtering and Bluetooth studio headphones.'
    },
    price: 21500000,
    oldPrice: 24000000,
    priceFormatted: {
      uz_cyrl: '21 500 000 сўм',
      uz: "21 500 000 so'm",
      ru: '21 500 000 сум',
      en: '21 500 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Частота диапозони / Freq Range', value: '1 Hz ... 10,000 Hz' },
      { name: 'Фильтрлар / Filter Bands', value: '256 рақамли поғона' },
      { name: 'Датчиклар / Sensors', value: 'Геофон ва пикетиш таёғи' },
      { name: 'Иш вақти / Battery', value: '30 соат узлуксиз' }
    ],
    features: {
      uz_cyrl: ['Шаҳар кўча шовқинини босиш тизими', 'Спектрал частота таҳлили', 'Сенсорли бошқарув панели'],
      uz: ['Shahar ko\'cha shovqinini bosish tizimi', 'Spektral chastota tahlili', 'Sensorli boshqaruv paneli'],
      ru: ['Умная фильтрация городского транспортного шума', 'Отображение спектрограммы утечки в реальном времени', 'Ударопрочный кейс с геофоном в комплекте'],
      en: ['Traffic noise suppression algorithm', 'Real-time FFT audio leak spectrogram', 'Rugged ground geophone and rod sensor included']
    },
    applications: {
      uz_cyrl: ['Шаҳар «Сув таъминоти» корхоналари', 'Иссиқлик қувурлари тармоқлари', 'Саноат заводлари'],
      uz: ['Shahar «Suv ta\'minoti» korxonalari', 'Issiqlik quvurlari tarmoqlari', 'Sanoat zavodlari'],
      ru: ['Городские Водоканалы', 'Теплосети и системы горячего водоснабжения', 'Крупные производственные комплексы'],
      en: ['Municipal water utility departments', 'District heating pipelines', 'Industrial manufacturing plants']
    },
    standardCert: "O'zstandart № 02.2980-23",
    warrantyMonths: 24
  },
  {
    id: 'mx-met-det',
    name: 'MAXTRON Ер ости люк ва металл излагич',
    model: 'MetalScan MS-120',
    category: 'locators',
    tagline: {
      uz_cyrl: 'Асфальт ва қор остидаги ёпиқ люклар ва қудуқларни топувчи қурилма',
      uz: "Asfalt va qor ostidagi yopiq lyuklar va quduqlarni topuvchi qurilma",
      ru: 'Магнитометрический локатор люков, задвижек и подземных гидрантов',
      en: 'Magnetic Ferromagnetic Locator for Valve Boxes & Manhole Covers'
    },
    description: {
      uz_cyrl: 'Ферромагнит магнит майдони ўзгаришини қайд этувчи қурилма чуқур кўмилган чўян қопқоқларни осон топади.',
      uz: "Ferromagnit magnit maydoni o'zgarishini qayd etuvchi qurilma chuqur ko'milgan cho'yan qopqoqlarni oson topadi.",
      ru: 'Импульсный локатор для быстрого поиска закопанных чугунных люков, подземных задвижек, гидрантов и геодезических реперов.',
      en: 'Rugged magnetic locator specifically engineered to detect buried iron manholes, well covers, and survey boundary markers.'
    },
    price: 8900000,
    priceFormatted: {
      uz_cyrl: '8 900 000 сўм',
      uz: "8 900 000 so'm",
      ru: '8 900 000 сум',
      en: '8 900 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Чуқурлик / Depth', value: '3.5 m гача (чўян люклар)' },
      { name: 'Тармоқ / Detection', value: 'Фақат ферромагнит металлар' },
      { name: 'Оғирлик / Weight', value: '1.1 kg' },
      { name: 'Ҳимоя / Water Resistance', value: 'IP67 сув остида ҳам ишлайди' }
    ],
    features: {
      uz_cyrl: ['Алюмин ва мис чиқиндиларни инкор этиш', 'Овозли ва график кўрсаткич', 'Сувга тўлиқ чидамли датчик'],
      uz: ['Alyumin va mis chiqindilarni inkor etish', 'Ovozli va grafik ko\'rsatkich', 'Suvga to\'liq chidamli datchik'],
      ru: ['Игнорирование мусора из цветных металлов (фольга, банки)', 'Звуковая и визуальная шкала интенсивности', 'Водонепроницаемый датчик'],
      en: ['Rejection of non-ferrous trash (cans, foils)', 'Dual acoustic and visual signal bar display', 'Submersible waterproof sensor stem']
    },
    applications: {
      uz_cyrl: ['Йўлсозлик хизматлари', 'Коммунал тармоқлар', 'Геодезик реперларни излаш'],
      uz: ['Yo\'lsozlik xizmatlari', 'Kommunal tarmoqlar', 'Geodezik reperlarni izlash'],
      ru: ['Дорожные службы перед асфальтированием', 'Коммунальное хозяйство', 'Поиск засыпанных геодезических реперов'],
      en: ['Road paving contractors', 'Municipal utility management', 'Locating covered geodetic benchmarks']
    },
    standardCert: "O'zstandart № 02.1009-22",
    warrantyMonths: 24
  },

  // --- THERMAL ---
  {
    id: 'mx-thermo-t640',
    name: 'MAXTRON Профессионал Саноат Тепловизори',
    model: 'ThermoScan Pro T640',
    category: 'thermal',
    tagline: {
      uz_cyrl: '640x480 пиксел ва -40°C дан +1500°C гача ўлчов диапозони',
      uz: "640x480 piksel va -40°C dan +1500°C gacha o'lchov diapazoni",
      ru: 'Промышленный тепловизор высокого разрешения 640x480 с диапазоном до +1500°C',
      en: 'High-Resolution 640x480 Industrial Thermal Imaging Camera (up to 1500°C)'
    },
    description: {
      uz_cyrl: 'Энергетика, заводлар ва қурилишда иссиқлик йўқотилиши, контактларнинг қизиб кетиши ва мой қувурлари ҳолатини назорат қилиш.',
      uz: "Energetika, zavodlar va qurilishda issiqlik yo'qotilishi, kontaktlarning qizib ketishi va moy quvurlari holatini nazorat qilish.",
      ru: 'Премиальная термографическая камера с матрицей 640х480, лазерным дальномером, лазерным целеуказателем и функцией наложения ИК и оптического спектра (MSX/Fusion).',
      en: 'Benchmark thermography device with 640x480 sensor, ultra-sensitive NETD < 30mK, autofocus, laser distance meter, and radiometric video recording.'
    },
    price: 52000000,
    oldPrice: 58000000,
    priceFormatted: {
      uz_cyrl: '52 000 000 сўм',
      uz: "52 000 000 so'm",
      ru: '52 000 000 сум',
      en: '52 000 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Матрица / IR Resolution', value: '640 x 480 pixels (307,200 ўлчов нуқтаси)' },
      { name: 'Ҳарорат / Temp Range', value: '-40°C ... +1500°C' },
      { name: 'Иссиқлик сезгирлиги / NETD', value: '< 30 mK (0.03°C)' },
      { name: 'Кадрлар частотаси / Frame Rate', value: '50 Hz (силлиқ тасвир)' },
      { name: 'Дисплей / Display', value: '4.3" сенсорли LCD + видоискатель' }
    ],
    features: {
      uz_cyrl: [
        'Автофокус ва лазерли масофа ўлчагич',
        'Оптик ва ИҚ тасвирни бирлаштириш (Dual Spectrum Fusion)',
        'Wi-Fi орқали планшетга жонли узатиш',
        'Ҳар бир пикселнинг ҳароратини сақловчи радиометрик формат'
      ],
      uz: [
        'Avtofokus va lazerli masofa o\'lchagich',
        'Optik va IQ tasvirni birlashtirish (Dual Spectrum Fusion)',
        'Wi-Fi orqali planshetga jonli uzatish',
        'Har bir pikselning haroratini saqlovchi radiometrik format'
      ],
      ru: [
        'Непрерывный лазерный автофокус',
        'Технология наложения контуров реального изображения на термограмму',
        'Запись радиометрического видеопотока 50 кадров/сек',
        'Голосовые и текстовые аннотации к снимкам'
      ],
      en: [
        'Continuous laser-assisted precision autofocus',
        'Dual-spectrum optical and thermal contour fusion',
        'Full radiometric 50Hz video recording',
        'Integrated voice memos and automatic PDF reports'
      ]
    },
    applications: {
      uz_cyrl: ['Юқори кучланишли подстанциялар тафтиши', 'Биноларнинг иссиқлик изоляцияси аудити', 'Металлургия ва қуйиш печлари'],
      uz: ['Yuqori kuchlanishli podstantsiyalar taftishi', 'Binolarning issiqlik izolyatsiyasi auditi', 'Metallurgiya va quyish pechlari'],
      ru: ['Диагностика высоковольтных выключателей и шин', 'Энергоаудит зданий и теплоизоляции', 'Контроль футеровки металлургических печей'],
      en: ['Substation switchgear inspection', 'Building envelope energy auditing', 'Refractory lining monitoring in blast furnaces']
    },
    standardCert: "O'zstandart № 02.8390-24, ISO 18434-1",
    warrantyMonths: 36
  },
  {
    id: 'mx-pyro-2000',
    name: 'MAXTRON Юқори ҳароратли оптик пирометр',
    model: 'PyroScan PS-2000',
    category: 'thermal',
    tagline: {
      uz_cyrl: '+2000°C гача контактсиз эритилган металл ва печлар ҳароратини ўлчагич',
      uz: "+2000°C gacha kontaktsiz eritilgan metall va pechlar haroratini o'lchagich",
      ru: 'Высокотемпературный оптический пирометр до +2000°C (оптика 120:1)',
      en: 'High-Temperature Optical Pyrometer up to 2000°C with 120:1 Optics'
    },
    description: {
      uz_cyrl: 'Эритилган металл, шиша ва керамика ишлаб чиқариш учун қисқа тўлқинли ультрааниқ пирометр.',
      uz: "Eritilgan metall, shisha va keramika ishlab chiqarish uchun qisqa to'lqinli ultraaniq pirometr.",
      ru: 'Коротковолновый пирометр с оптическим разрешением 120:1 и двойным лазерным прицелом для измерения температуры расплавов.',
      en: 'Short-wavelength infrared pyrometer engineered for molten metal, foundries, glass ovens with 120:1 distance-to-spot ratio.'
    },
    price: 9400000,
    priceFormatted: {
      uz_cyrl: '9 400 000 сўм',
      uz: "9 400 000 so'm",
      ru: '9 400 000 сум',
      en: '9 400 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Диапозон / Temp Range', value: '+300°C ... +2000°C' },
      { name: 'Оптик нисбат / Optical Ratio', value: '120 : 1' },
      { name: 'Спектрал соҳа / Spectral Response', value: '1.0 ... 1.6 µm' },
      { name: 'Жавоб вақти / Response Time', value: '10 ms' }
    ],
    features: {
      uz_cyrl: ['Қўш лазерли нишон кўрсаткич', 'Эмиссия коэффициенти созланиши', 'USB маълумот узатиш'],
      uz: ['Qo\'sh lazerli nishon ko\'rsatkich', 'Emissiya koeffitsienti sozlanishi', 'USB ma\'lumot uzatish'],
      ru: ['Двойной лазерный целеуказатель границ пятна', 'Регулируемый коэффициент излучения 0.10 ... 1.00', 'Быстрый отклик 10 мс'],
      en: ['Dual laser target outline indicators', 'Adjustable emissivity 0.10 - 1.00', 'Ultra-fast 10ms response time']
    },
    applications: {
      uz_cyrl: ['Металл қуйиш цехлари', 'Термик ишлов бериш', 'Клинкер печлари'],
      uz: ['Metall quyish tsexlari', 'Termik ishlov berish', 'Klinker pechlari'],
      ru: ['Литейное производство', 'Термообработка металлов и закалка', 'Цементные вращающиеся печи'],
      en: ['Foundries and melt shops', 'Induction hardening and heat treat', 'Cement rotary kilns']
    },
    standardCert: "O'zstandart № 02.1990-23",
    warrantyMonths: 24
  },
  {
    id: 'mx-thermo-pocket',
    name: 'MAXTRON Ихчам Саноат Тепловизори',
    model: 'PocketScan P256',
    category: 'thermal',
    tagline: {
      uz_cyrl: 'Чўнтакка сиғувчи 256x192 сенсорли ихчам тепловизор',
      uz: "Cho'ntakka sig'uvchi 256x192 sensorli ixcham teplovizor",
      ru: 'Компактный карманный тепловизор 256x192 с сенсорным экраном',
      en: 'Pocket-Sized 256x192 Professional Touchscreen Thermal Imager'
    },
    description: {
      uz_cyrl: 'Ҳар кунлик электромонтаж ва электр қутилари назорати учун энг қулай ихчам асбоб.',
      uz: "Har kunlik elektromontaj va elektr qutilari nazorati uchun eng qulay ixcham asbob.",
      ru: 'Легкий и прочный карманный тепловизор в ударозащищенном корпусе (выдерживает падение с 2 метров).',
      en: 'Everyday carry compact thermal camera featuring 256x192 IR sensor, 3.5" touchscreen, and 2-meter drop protection.'
    },
    price: 6800000,
    oldPrice: 7500000,
    priceFormatted: {
      uz_cyrl: '6 800 000 сўм',
      uz: "6 800 000 so'm",
      ru: '6 800 000 сум',
      en: '6 800 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Матрица / IR Resolution', value: '256 x 192 pixels' },
      { name: 'Ҳарорат / Temp Range', value: '-20°C ... +400°C' },
      { name: 'Батарея / Battery', value: '6 соат узлуксиз' },
      { name: 'Ҳимоя / Drop Rating', value: 'IP54, 2 м қулашга чидамли' }
    ],
    features: {
      uz_cyrl: ['WiFi орқали булутга сақлаш', '3.5 дюйм сенсорли экран', 'Аниқ ҳарорат нуқталари'],
      uz: ['WiFi orqali bulutga saqlash', '3.5 dyuym sensorli ekran', 'Aniq harorat nuqtalari'],
      ru: ['Мгновенная выгрузка отчетов через Wi-Fi', 'Яркий сенсорный экран 3.5"', 'Автоматический поиск горячих/холодных точек'],
      en: ['Instant Wi-Fi cloud synchronization', 'Vibrant 3.5" capacitive touchscreen', 'Auto hot and cold spot tracking']
    },
    applications: {
      uz_cyrl: ['Электр шкафлар', 'HVAC ва вентиляция', 'Автомобил диагностикаси'],
      uz: ['Elektr shkaflar', 'HVAC va ventilyatsiya', 'Avtomobil diagnostikasi'],
      ru: ['Электрощитовые и распределительные коробки', 'Вентиляция и кондиционирование (HVAC)', 'Автодиагностика'],
      en: ['Electrical switchboards', 'HVAC & building diagnostics', 'Fleet & automotive diagnostics']
    },
    standardCert: "O'zstandart № 02.9912-24",
    warrantyMonths: 24
  },

  // --- NDT ---
  {
    id: 'mx-thick-ultra',
    name: 'MAXTRON Ультратовушли Қалинлик Ўлчагич',
    model: 'UltraSonic UT-820 Pro',
    category: 'ndt',
    tagline: {
      uz_cyrl: 'Бўёқ ва қопламани қирмасдан металл қалинлигини (Echo-Echo) ўлчовчи қурилма',
      uz: "Bo'yoq va qoplamani qirmasdan metall qalinligini (Echo-Echo) o'lchovchi qurilma",
      ru: 'Ультразвуковой толщиномер металла с режимом измерения через покрытие (Echo-Echo)',
      en: 'Precision Ultrasonic Metal Thickness Gauge with Through-Coating Mode'
    },
    description: {
      uz_cyrl: 'Қувурлар, резервуарлар ва босим остидаги идишларнинг коррозия туфайли юпқалашиб қолган жойларини 0.001 мм аниқликда аниқлайди.',
      uz: "Quvurlar, rezervuarlar va bosim ostidagi idishlarning korroziya tufayli yupqalashib qolgan joylarini 0.001 mm aniqlikda aniqlaydi.",
      ru: 'Прецизионный прибор для замера остаточной толщины стенок труб, котлов и резервуаров без снятия защитного слоя краски или изоляции.',
      en: 'Industrial ultrasonic gauge measuring remaining wall thickness through paint and coatings without surface scraping, resolution down to 0.001mm.'
    },
    price: 8200000,
    oldPrice: 9100000,
    priceFormatted: {
      uz_cyrl: '8 200 000 сўм',
      uz: "8 200 000 so'm",
      ru: '8 200 000 сум',
      en: '8 200 000 UZS'
    },
    inStock: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Ўлчов диапозони / Range', value: '0.65 mm ... 600 mm (пўлат бўйича)' },
      { name: 'Аниқлик / Resolution', value: '0.001 mm / 0.01 mm' },
      { name: 'Режимлар / Test Modes', value: 'Pulse-Echo (PE) ва Echo-Echo (EE)' },
      { name: 'Овоз тезлиги / Velocity', value: '1000 ... 9999 m/s' }
    ],
    features: {
      uz_cyrl: ['A-Scan ва B-Scan реал вақт кўриниши', 'Юқори ҳарорат датчиги (+350°C гача)', '100 000 та ўлчов хотираси'],
      uz: ['A-Scan va B-Scan real vaqt ko\'rinishi', 'Yuqori harorat datchigi (+350°C gacha)', '100 000 ta o\'lchov xotirasi'],
      ru: ['Отображение графиков A-Скан и B-Скан в реальном времени', 'Возможность работы с высокотемпературными датчиками до +350°C', 'Память на 100 000 измерений с выгрузкой в Excel'],
      en: ['Real-time A-Scan waveform & B-Scan cross-sectional imaging', 'High-temp probe options up to +350°C for live online testing', '100,000-point data logging with instant CSV export']
    },
    applications: {
      uz_cyrl: ['Нефть-газ резервуарлари', 'Буғ қозонлари ва иссиқлик тармоқлари', 'Кемасозлик ва кўприклар'],
      uz: ['Neft-gaz rezervuarlari', 'Bug\' qozonlari va issiqlik tarmoqlari', 'Kemasozlik va ko\'priklar'],
      ru: ['Емкости и резервуары хранения нефти/газа', 'Паровые котлы и технологические трубопроводы', 'Судоремонт и мостовые конструкции'],
      en: ['Petroleum & chemical storage tanks', 'Steam boiler tubes and process piping', 'Ship hull and bridge structural inspection']
    },
    standardCert: "O'zstandart № 02.4410-24, ASTM E797",
    warrantyMonths: 36
  },
  {
    id: 'mx-flaw-fd',
    name: 'MAXTRON Рақамли Ультратовушли Дефектоскоп',
    model: 'FlawMaster FD-600',
    category: 'ndt',
    tagline: {
      uz_cyrl: 'Пайвандланган чоклар, металл ёриқлари ва бўшлиқларни аниқловчи дефектоскоп',
      uz: "Payvandlangan choklar, metall yoriqlari va bo'shliqlarni aniqlovchi defektoskop",
      ru: 'Цифровой ультразвуковой дефектоскоп сварных соединений и поковок',
      en: 'Digital Ultrasonic Flaw Detector for Welds, Castings & Forgings'
    },
    description: {
      uz_cyrl: 'Пайванд чоклари сифатини ва металл ичидаги микроёриқларни бузмасдан аниқловчи профессионал НК ускунаси.',
      uz: "Payvand choklari sifatini va metall ichidagi mikroyoriqlarni buzmasdan aniqlovchi professional NK uskunasi.",
      ru: 'Универсальный дефектоскоп с поддержкой методик DAC, TVG, DGS (АРД-диаграмм) и стандартов AWS D1.1.',
      en: 'Heavy-duty ultrasonic flaw detector compliant with AWS D1.1, EN12668-1, featuring DAC curves and AVG/DGS evaluation.'
    },
    price: 36000000,
    oldPrice: 40000000,
    priceFormatted: {
      uz_cyrl: '36 000 000 сўм',
      uz: "36 000 000 so'm",
      ru: '36 000 000 сум',
      en: '36 000 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Частота / Freq Range', value: '0.5 MHz ... 20 MHz' },
      { name: 'Диапозон / Range', value: '0 ... 10,000 mm' },
      { name: 'Кучайтириш / Gain', value: '0 ... 110 dB' },
      { name: 'Дисплей / Display', value: '7.0" рангли юқори ёруғликли TFT' }
    ],
    features: {
      uz_cyrl: ['АРД (DGS) ва DAC эгри чизиқлари', 'Пайванд чоки геометриясини моделлаштириш', 'Мустаҳкам металл ҳимояли корпус'],
      uz: ['ARD (DGS) va DAC egri chiziqlari', 'Payvand choki geometriyasini modellashtirish', 'Mustahkam metall himoyali korpus'],
      ru: ['Автоматическое построение кривых DAC, АРД (DGS)', 'Встроенный калькулятор геометрии сварного шва', 'Класс защиты IP66'],
      en: ['Automated DAC, TCG and DGS/AVG curve generation', 'Dynamic weld geometry overlay profiling', 'IP66 IP rating for offshore & shop environments']
    },
    applications: {
      uz_cyrl: ['Магистрал қувурлар пайванди', 'Қурилиш металл конструкциялари', 'Темир йўл рельслари назорати'],
      uz: ['Magistral quvurlar payvandi', 'Qurilish metall konstruktsiyalari', 'Temir yo\'l relslari nazorati'],
      ru: ['Контроль стыков магистральных газопроводов', 'Строительные металлоконструкции', 'Железнодорожные рельсы и колесные пары'],
      en: ['Transmission pipeline girth welds', 'High-rise structural steel fabrication', 'Railway rail and axle flaw testing']
    },
    standardCert: "O'zstandart № 02.3200-24, EN 12668-1",
    warrantyMonths: 36
  },
  {
    id: 'mx-coat-gauge',
    name: 'MAXTRON Қоплама ва бўёқ қалинлиги ўлчагич',
    model: 'CoatScan CS-500 F/NF',
    category: 'ndt',
    tagline: {
      uz_cyrl: 'Магнит ва номагнит металлар устидаги бўёқ ва рух қатламини ўлчаш',
      uz: "Magnit va nomagnit metallar ustidagi bo'yoq va rux qatlamini o'lchash",
      ru: 'Толщиномер лакокрасочных и защитных покрытий (F/NF 0-5000 мкм)',
      en: 'Dual F/NF Coating & Paint Thickness Gauge (0-5000 µm)'
    },
    description: {
      uz_cyrl: 'Металл констукцияларда бўёқ, оцинковка, хром, эмаль ва полимер қопламалар қалинлигини ўлчаш.',
      uz: "Metall konstuktsiyalarda bo'yoq, otsinkovka, xrom, emal va polimer qoplamalar qalinligini o'lchash.",
      ru: 'Универсальный толщиномер с автоматическим распознаванием основы (сталь / алюминий) и датчиком на рубиновом наконечнике.',
      en: 'Automated substrate detection (Ferrous/Non-Ferrous) with wear-resistant ruby tip sensor, range up to 5000 µm.'
    },
    price: 4900000,
    oldPrice: 5500000,
    priceFormatted: {
      uz_cyrl: '4 900 000 сўм',
      uz: "4 900 000 so'm",
      ru: '4 900 000 сум',
      en: '4 900 000 UZS'
    },
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    specs: [
      { name: 'Диапозон / Range', value: '0 ... 5000 µm (0 - 5 mm)' },
      { name: 'Аниқлик / Accuracy', value: '±(1% + 1 µm)' },
      { name: 'Металл тури / Substrates', value: 'Fe (пўлат, чўян) ва NFe (алюмин, мис)' },
      { name: 'Хотира / Memory', value: '2500 ўлчов' }
    ],
    features: {
      uz_cyrl: ['Рубин учлик (емирилмайди)', 'Автоматик база таниб олиш', 'Статистика: Мин, Макс, Ўртача'],
      uz: ['Rubin uchlik (yemirilmaydi)', 'Avtomatik baza tanib olish', 'Statistika: Min, Maks, O\'rtacha'],
      ru: ['Сверхтвердый наконечник из синтетического рубина', 'Автоопределение материала основы (черные / цветные металлы)', 'Полная статистическая обработка на дисплее'],
      en: ['Heavy-wear synthetic ruby probe tip', 'Auto substrate recognition (Fe / NFe)', 'Live on-screen statistical evaluation']
    },
    applications: {
      uz_cyrl: ['Антикоррозия қопламалари', 'Автомобил саноати', 'Цинк ва гальваника'],
      uz: ['Antikorroziya qoplamalari', 'Avtomobil sanoati', 'Tsink va galvanika'],
      ru: ['Антикоррозийная обработка металлоконструкций', 'Автомобильная промышленность и экспертиза', 'Гальванические и цинковые производства'],
      en: ['Anti-corrosion protective coatings', 'Automotive body inspection', 'Galvanizing and powder coat quality control']
    },
    standardCert: "O'zstandart № 02.7712-23",
    warrantyMonths: 24
  }
];
