export interface Doctor {
  id: string
  name: { ar: string; en: string }
  specialty: { ar: string; en: string }
  specialtyKey: string
  rating: number
  reviews: number
  avatar: string
  availableDays: string[]
  bio: { ar: string; en: string }
  price: number
}

export const doctors: Doctor[] = [
  {
    id: 'doc-001',
    name: { ar: 'د. سارة ميتشل', en: 'Dr. Sarah Mitchell' },
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
    specialtyKey: 'cardiology',
    rating: 4.9,
    reviews: 312,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    availableDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'استشارية في أمراض القلب والأوعية الدموية بخبرة تزيد على 15 عامًا. تخصصت في علاج قصور القلب وأمراض الشرايين التاجية. حاصلة على زمالة من الكلية الأمريكية لأمراض القلب.',
      en: 'Consultant cardiologist with over 15 years of experience in cardiovascular diseases. Specialized in heart failure and coronary artery disease management. Fellow of the American College of Cardiology.',
    },
    price: 380,
  },
  {
    id: 'doc-002',
    name: { ar: 'د. جيمس أوكافور', en: 'Dr. James Okafor' },
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
    specialtyKey: 'neurology',
    rating: 4.8,
    reviews: 287,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    availableDays: ['Sat', 'Mon', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيب أعصاب متخصص في الصداع النصفي والصرع واضطرابات النوم. يجمع بين الخبرة السريرية والبحث العلمي في مجال الأمراض العصبية التنكسية.',
      en: 'Neurologist specializing in migraines, epilepsy and sleep disorders. Combines clinical expertise with research in neurodegenerative diseases. Published author in leading neurology journals.',
    },
    price: 350,
  },
  {
    id: 'doc-003',
    name: { ar: 'د. بريا شارما', en: 'Dr. Priya Sharma' },
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    specialtyKey: 'dermatology',
    rating: 4.9,
    reviews: 421,
    avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
    bio: {
      ar: 'أخصائية أمراض جلدية وتجميل بخبرة 12 عامًا. متخصصة في علاج الأكزيما والصدفية وحب الشباب، إلى جانب تقنيات الليزر والإجراءات التجميلية غير الجراحية.',
      en: 'Dermatologist and cosmetic skin specialist with 12 years of experience. Expert in eczema, psoriasis, and acne treatment, alongside laser therapies and non-surgical cosmetic procedures.',
    },
    price: 320,
  },
  {
    id: 'doc-004',
    name: { ar: 'د. أحمد الرشيدي', en: 'Dr. Ahmad Al-Rashidi' },
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
    specialtyKey: 'orthopedics',
    rating: 4.8,
    reviews: 198,
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    availableDays: ['Sun', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'جراح عظام واستشاري إعادة تأهيل. حاصل على تدريب متقدم في جراحة استبدال المفاصل وعلاج إصابات الملاعب. عضو الجمعية السعودية لجراحة العظام.',
      en: 'Orthopedic surgeon and rehabilitation consultant. Holds advanced training in joint replacement surgery and sports injury management. Member of the Saudi Orthopedic Society.',
    },
    price: 370,
  },
  {
    id: 'doc-005',
    name: { ar: 'د. فاطمة الزهراوي', en: 'Dr. Fatima Al-Zahrawi' },
    specialty: { ar: 'طب الأطفال', en: 'Pediatrics' },
    specialtyKey: 'pediatrics',
    rating: 4.9,
    reviews: 356,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيبة أطفال متخصصة في صحة حديثي الولادة والأطفال في مرحلة النمو. خبرة واسعة في التطعيمات وتقييم التطور وإدارة الأمراض المزمنة لدى الأطفال.',
      en: 'Pediatrician specializing in neonatal health and child development. Extensive experience in vaccinations, developmental assessments, and managing chronic childhood conditions.',
    },
    price: 280,
  },
  {
    id: 'doc-006',
    name: { ar: 'د. عمر خليل', en: 'Dr. Omar Khalil' },
    specialty: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
    specialtyKey: 'gastroenterology',
    rating: 4.7,
    reviews: 244,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    availableDays: ['Sat', 'Mon', 'Tue', 'Thu'],
    bio: {
      ar: 'اختصاصي أمراض الجهاز الهضمي والكبد بخبرة تتجاوز 10 سنوات. ماهر في إجراء التنظير الهضمي العلوي والسفلي وعلاج القولون العصبي وأمراض الكبد المزمنة.',
      en: 'Gastroenterologist and hepatologist with over 10 years of experience. Skilled in upper and lower GI endoscopy, IBS management, and chronic liver disease treatment.',
    },
    price: 330,
  },
  {
    id: 'doc-007',
    name: { ar: 'د. ليلى حسن', en: 'Dr. Layla Hassan' },
    specialty: { ar: 'الطب النفسي', en: 'Psychiatry' },
    specialtyKey: 'psychiatry',
    rating: 4.8,
    reviews: 167,
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    availableDays: ['Sun', 'Mon', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيبة نفسية استشارية متخصصة في اضطرابات القلق والاكتئاب واضطراب ما بعد الصدمة. تتبنى نهجًا علاجيًا شاملًا يجمع الدواء مع العلاج النفسي المعرفي السلوكي.',
      en: 'Consultant psychiatrist specializing in anxiety disorders, depression, and PTSD. Adopts a comprehensive treatment approach combining medication with cognitive-behavioral therapy.',
    },
    price: 300,
  },
  {
    id: 'doc-008',
    name: { ar: 'د. كارلوس ريفيرا', en: 'Dr. Carlos Rivera' },
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
    specialtyKey: 'general',
    rating: 4.7,
    reviews: 389,
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيب عام متعدد الاختصاصات بخبرة 18 عامًا في الرعاية الأولية. يتقن تشخيص الأمراض المزمنة كالسكري وضغط الدم وتقديم الرعاية الوقائية الشاملة للأسرة.',
      en: 'Versatile general practitioner with 18 years of primary care experience. Expert in diagnosing chronic conditions such as diabetes and hypertension, and delivering comprehensive preventive family care.',
    },
    price: 200,
  },
  {
    id: 'doc-009',
    name: { ar: 'د. نورة العتيبي', en: 'Dr. Nora Al-Otaibi' },
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
    specialtyKey: 'cardiology',
    rating: 4.8,
    reviews: 201,
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    availableDays: ['Sat', 'Sun', 'Tue', 'Wed'],
    bio: {
      ar: 'استشارية قلبية متخصصة في تخطيط القلب وصور الأوعية الدموية وأمراض صمامات القلب. حاصلة على زمالة من الجمعية الأوروبية لأمراض القلب وعضو نشط في مبادرات الصحة القلبية للمرأة.',
      en: 'Cardiologist specializing in echocardiography, vascular imaging, and valvular heart disease. Fellow of the European Society of Cardiology and active member of women\'s cardiac health initiatives.',
    },
    price: 360,
  },
  {
    id: 'doc-010',
    name: { ar: 'د. مايكل تشن', en: 'Dr. Michael Chen' },
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
    specialtyKey: 'neurology',
    rating: 4.9,
    reviews: 445,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    availableDays: ['Sat', 'Mon', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيب أعصاب من الدرجة الأولى في علاج السكتة الدماغية والتصلب المتعدد وأمراض الأعصاب المحيطية. يرأس وحدة أبحاث الأعصاب الوظيفية ونشر أكثر من 40 ورقة بحثية محكمة.',
      en: 'Top-tier neurologist in stroke treatment, multiple sclerosis, and peripheral neuropathy. Heads the functional neurology research unit and has published over 40 peer-reviewed papers.',
    },
    price: 400,
  },
  {
    id: 'doc-011',
    name: { ar: 'د. سارة الغامدي', en: 'Dr. Sara Al-Ghamdi' },
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    specialtyKey: 'dermatology',
    rating: 4.7,
    reviews: 178,
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    availableDays: ['Sat', 'Sun', 'Wed', 'Thu'],
    bio: {
      ar: 'طبيبة جلدية سعودية حاصلة على زمالة في أمراض الجلد والشعر. خبرة في تشخيص وعلاج مشكلات الشعر والفروة وحالات التصبغ وأمراض الجلد الالتهابية المزمنة.',
      en: 'Saudi dermatologist with a fellowship in skin and hair disorders. Experienced in diagnosing and treating hair and scalp conditions, pigmentation issues, and chronic inflammatory skin diseases.',
    },
    price: 290,
  },
  {
    id: 'doc-012',
    name: { ar: 'د. خالد المنصوري', en: 'Dr. Khalid Al-Mansouri' },
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
    specialtyKey: 'orthopedics',
    rating: 4.9,
    reviews: 312,
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    availableDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    bio: {
      ar: 'جراح عظام وعمود فقري بارز بخبرة 20 عامًا. رائد في جراحة العمود الفقري بالمنظار وعلاج انزلاق الغضروف وتشوهات العمود الفقري. حاصل على تدريب متخصص من ألمانيا والولايات المتحدة.',
      en: 'Distinguished orthopedic and spine surgeon with 20 years of experience. Pioneer in endoscopic spine surgery, disc herniation treatment, and spinal deformity correction. Trained in Germany and the USA.',
    },
    price: 390,
  },
]
