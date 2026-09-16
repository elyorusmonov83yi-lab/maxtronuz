import { Certificate } from '../types.ts';

export const certificatesData: Certificate[] = [
  {
    id: 'cert-ozstandart-1',
    number: 'UZ.SMT.02.4820-2024',
    title: {
      uz_cyrl: 'Ўлчов воситалари турини тасдиқлаш ҳақидаги сертификат (Давлат Реестри)',
      uz: "O'lchov vositalari turini tasdiqlash haqidagi sertifikat (Davlat Reestri)",
      ru: 'Сертификат об утверждении типа средств измерений (Госреестр СИ РУз)',
      en: 'Certificate of Pattern Approval for Measuring Instruments (State Registry of Uzbekistan)'
    },
    issuer: {
      uz_cyrl: 'Ўзбекистон техник жиҳатдан тартибга солиш агентлиги (Ўзстандарт)',
      uz: "O'zbekiston texnik jihatdan tartibga solish agentligi (O'zstandart)",
      ru: 'Агентство по техническому регулированию при Министерстве инвестиций, промышленности и торговли РУз (Узстандарт)',
      en: 'Uzbekistan Technical Regulatory Agency (Uzstandard)'
    },
    validUntil: '2029-12-31',
    standard: "O'z DSt ISO/IEC 17025",
    type: 'metrology',
    docNumber: '№ 004820',
    previewUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cert-iso-9001',
    number: 'ISO 9001:2015 / QMS-2023-88',
    title: {
      uz_cyrl: 'Сифат менежменти тизими халқаро мувофиқлик сертификати ISO 9001:2015',
      uz: 'Sifat menejmenti tizimi xalqaro muvofiqlik sertifikati ISO 9001:2015',
      ru: 'Сертификат соответствия системы менеджмента качества ISO 9001:2015',
      en: 'ISO 9001:2015 Quality Management System Certification'
    },
    issuer: {
      uz_cyrl: 'TÜV Rheinland International / «O‘zbekiston Milliy Sertifikatlashtirish Tizimi»',
      uz: 'TÜV Rheinland International / «O‘zbekiston Milliy Sertifikatlashtirish Tizimi»',
      ru: 'TÜV Rheinland International & Национальная система сертификации Узбекистана',
      en: 'TÜV Rheinland International Quality Certification Body'
    },
    validUntil: '2028-06-15',
    standard: 'ISO 9001:2015',
    type: 'iso',
    docNumber: '№ 9001-QMS-8812',
    previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cert-lab-accredit',
    number: 'O\'ZAK.SL.0142',
    title: {
      uz_cyrl: 'Қиёслаш ва калибровкалаш синов лабораториясининг аккредитация аттестати',
      uz: "Qiyoslash va kalibrovkalash sinov laboratoriyasining akkreditatsiya attestati",
      ru: 'Аттестат аккредитации калибровочно-поверочной лаборатории',
      en: 'Accreditation Certificate of Calibration & Verification Testing Laboratory'
    },
    issuer: {
      uz_cyrl: 'Ўзбекистон аккредитация маркази (O‘ZAKK)',
      uz: "O'zbekiston akkreditatsiya markazi (O‘ZAKK)",
      ru: 'Государственный центр аккредитации Республики Узбекистан (O‘ZAKK)',
      en: 'Uzbekistan Accreditation Center (O‘ZAKK)'
    },
    validUntil: '2028-11-20',
    standard: 'O\'z DSt ISO/IEC 17025:2019',
    type: 'metrology',
    docNumber: '№ 0142-SL',
    previewUrl: 'https://images.unsplash.com/photo-1589330694653-dad6bc0140ce?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cert-gost-atex',
    number: 'ЕАЭС / ГОСТ RU.3041.04',
    title: {
      uz_cyrl: 'Портлашдан хавфсизлик ва электромагнит мослик мувофиқлик сертификати',
      uz: "Portlashdan xavfsizlik va elektromagnit moslik muvofiqlik sertifikati",
      ru: 'Сертификат соответствия ТР ТС 012/2011 «О безопасности оборудования во взрывоопасных средах»',
      en: 'Conformity Certificate for Equipment in Hazardous & Explosion-Prone Environments'
    },
    issuer: {
      uz_cyrl: 'СаноатХавфсизлик давлат инспекцияси ва Сертификатлаш органи',
      uz: "SanoatXavfsizlik davlat inspektsiyasi va Sertifikatlashtirish organi",
      ru: 'Орган по сертификации взрывозащищенного и промышленного оборудования',
      en: 'Industrial Explosion-Proof Safety Certification Body'
    },
    validUntil: '2027-08-30',
    standard: 'ГОСТ 31610.0-2014 (IEC 60079-0)',
    type: 'conformity',
    docNumber: '№ RU C-UZ.3041.B',
    previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
  }
];

export const clientPartners = [
  { name: 'NKMC (Navoiy KMK)', desc: 'Навоий кон-металлургия комбинати' },
  { name: 'AMMC (Olmaliq KMK)', desc: 'Олмалиқ кон-металлургия комбинати' },
  { name: 'Uzbekneftegaz', desc: 'Ўзбекнефтгаз АЖ' },
  { name: 'O‘zbekiston Temir Yo‘llari', desc: 'Ўзбекистон темир йўллари АЖ' },
  { name: 'Hududiy Elektr Tarmoqlari', desc: 'Ҳудудий электр тармоқлари АЖ' },
  { name: 'O‘zsuvta’minot', desc: 'Ўзсувтаъминот АЖ' }
];
