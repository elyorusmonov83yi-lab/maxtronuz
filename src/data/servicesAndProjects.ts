export interface ProjectCase {
  id: string;
  client: string;
  logoText: string;
  image: string;
  year: string;
  location: { uz: string; uz_cyrl: string; ru: string };
  sector: { uz: string; uz_cyrl: string; ru: string };
  title: { uz: string; uz_cyrl: string; ru: string };
  description: { uz: string; uz_cyrl: string; ru: string };
  deliveredEquipment: string[];
  results: { uz: string[]; uz_cyrl: string[]; ru: string[] };
}

export const projectsData: ProjectCase[] = [
  {
    id: 'navoi-mining',
    client: 'NKMK (Навоий кон-металлургия комбинати)',
    logoText: 'НМК',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    year: '2025',
    location: { uz: 'Navoiy viloyati', uz_cyrl: 'Навоий вилояти', ru: 'Навоийская область' },
    sector: { uz: 'Kon-metallurgiya', uz_cyrl: 'Кон-металлургия', ru: 'Горно-металлургическая отрасль' },
    title: { 
      uz: 'gidrometallurgiya zavodida sarflov va bosimni avtomatik nazorat qilish tizimi', 
      uz_cyrl: 'гидрометаллургия заводида сарфлов ва босимни автоматик назорат қилиш тизими', 
      ru: 'Система автоматического контроля расхода и давления на гидрометаллургическом заводе' 
    },
    description: { 
      uz: 'Kislota va eritma uzatish quvurlarida texnologik jarayonlarni uzluksiz o‘lchash va avtomatlashtirish.', 
      uz_cyrl: 'Кислота ва эритма узатиш қувурларида технологик жараёнларни узлуксиз ўлчаш ва автоматлаштириш.', 
      ru: 'Непрерывное измерение и автоматизация технологических процессов на трубопроводах подачи кислот и растворов.' 
    },
    deliveredEquipment: ['CEM DT-333H', 'LD Ball Valves', 'Industrial Flow Meters'],
    results: {
      uz: ['Texnologik yo‘qotishlar 12% ga kamaydi', 'Favqulodda holatlar oldi olindi'],
      uz_cyrl: ['Технологик йўқотишлар 12% га камайди', 'Фавқулодда ҳолатлар олди олинди'],
      ru: ['Технологические потери снижены на 12%', 'Предотвращены нештатные ситуации']
    }
  }
];

export const servicesData: any[] = [];
