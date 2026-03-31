export interface Disease {
  id: string
  name: { ar: string; en: string }
  category: { ar: string; en: string }
  symptoms: { ar: string[]; en: string[] }
  description: { ar: string; en: string }
  specialtyKey: string
  specialty: { ar: string; en: string }
}

export const diseases: Disease[] = [
  {
    id: 'dis-001',
    name: { ar: 'ارتفاع ضغط الدم', en: 'Hypertension' },
    category: { ar: 'أمراض القلب والأوعية الدموية', en: 'Cardiovascular' },
    symptoms: {
      ar: ['صداع شديد', 'ضيق في التنفس', 'نزيف الأنف', 'دوار', 'ألم في الصدر'],
      en: ['Severe headache', 'Shortness of breath', 'Nosebleed', 'Dizziness', 'Chest pain'],
    },
    description: {
      ar: 'ارتفاع ضغط الدم هو حالة مزمنة يكون فيها ضغط الدم في الشرايين مرتفعًا باستمرار. يُعدّ من أكثر الأمراض القلبية الوعائية شيوعًا وقد يؤدي إلى مضاعفات خطيرة إذا لم يُعالج.',
      en: 'Hypertension is a chronic condition in which blood pressure in the arteries is persistently elevated. It is one of the most common cardiovascular conditions and can lead to serious complications if untreated.',
    },
    specialtyKey: 'cardiology',
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
  },
  {
    id: 'dis-002',
    name: { ar: 'الشقيقة (الصداع النصفي)', en: 'Migraine' },
    category: { ar: 'أمراض عصبية', en: 'Neurological' },
    symptoms: {
      ar: ['صداع نابض شديد', 'غثيان', 'حساسية للضوء والصوت', 'رؤية ومضات', 'قيء'],
      en: ['Intense throbbing headache', 'Nausea', 'Sensitivity to light and sound', 'Visual aura', 'Vomiting'],
    },
    description: {
      ar: 'الشقيقة هي اضطراب عصبي يتسم بنوبات صداع شديدة متكررة، غالبًا مصحوبة بأعراض حسية. تؤثر على جودة الحياة وتتراوح شدتها من معتدلة إلى منهكة.',
      en: 'Migraine is a neurological disorder characterized by recurring intense headache attacks, often accompanied by sensory symptoms. It affects quality of life and ranges from moderate to debilitating.',
    },
    specialtyKey: 'neurology',
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
  },
  {
    id: 'dis-003',
    name: { ar: 'الأكزيما (التهاب الجلد التأتبي)', en: 'Eczema' },
    category: { ar: 'أمراض الجلد', en: 'Dermatology' },
    symptoms: {
      ar: ['حكة شديدة', 'جلد جاف ومتشقق', 'احمرار', 'طفح جلدي', 'تقشر الجلد'],
      en: ['Intense itching', 'Dry and cracked skin', 'Redness', 'Skin rash', 'Skin flaking'],
    },
    description: {
      ar: 'الأكزيما هي حالة التهابية جلدية مزمنة تسبب جفاف الجلد وحكة شديدة وطفحًا جلديًا. تشيع لدى الأطفال لكنها قد تستمر حتى مرحلة البلوغ.',
      en: 'Eczema is a chronic inflammatory skin condition causing dry skin, intense itching, and rashes. It is common in children but can persist into adulthood.',
    },
    specialtyKey: 'dermatology',
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
  },
  {
    id: 'dis-004',
    name: { ar: 'الإنفلونزا', en: 'Influenza' },
    category: { ar: 'أمراض معدية', en: 'Infectious Disease' },
    symptoms: {
      ar: ['حمى مفاجئة', 'سعال جاف', 'آلام العضلات', 'إرهاق', 'احتقان الأنف', 'صداع'],
      en: ['Sudden fever', 'Dry cough', 'Muscle aches', 'Fatigue', 'Nasal congestion', 'Headache'],
    },
    description: {
      ar: 'الإنفلونزا هي عدوى فيروسية تصيب الجهاز التنفسي. تنتشر بسرعة وقد تسبب مضاعفات خطيرة لدى كبار السن والأطفال والأشخاص الذين يعانون من أمراض مزمنة.',
      en: 'Influenza is a viral infection that attacks the respiratory system. It spreads rapidly and can cause serious complications in the elderly, children, and those with chronic conditions.',
    },
    specialtyKey: 'general',
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
  },
  {
    id: 'dis-005',
    name: { ar: 'الارتجاع المعدي المريئي', en: 'GERD' },
    category: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
    symptoms: {
      ar: ['حرقة المعدة', 'قلس الحمض', 'صعوبة البلع', 'ألم الصدر', 'سعال مزمن', 'بحة الصوت'],
      en: ['Heartburn', 'Acid reflux', 'Difficulty swallowing', 'Chest pain', 'Chronic cough', 'Hoarseness'],
    },
    description: {
      ar: 'الارتجاع المعدي المريئي هو حالة مزمنة يعود فيها حمض المعدة إلى المريء. يسبب إزعاجًا يوميًا ويمكن أن يؤدي إلى التهاب في المريء على المدى البعيد.',
      en: 'GERD is a chronic condition where stomach acid flows back into the esophagus. It causes daily discomfort and can lead to esophageal inflammation over the long term.',
    },
    specialtyKey: 'gastroenterology',
    specialty: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
  },
  {
    id: 'dis-006',
    name: { ar: 'التهاب المفاصل الروماتويدي', en: 'Rheumatoid Arthritis' },
    category: { ar: 'أمراض العظام والمفاصل', en: 'Musculoskeletal' },
    symptoms: {
      ar: ['ألم وتورم المفاصل', 'تيبس الصباح', 'إرهاق', 'حمى خفيفة', 'فقدان الشهية', 'تشوه المفاصل'],
      en: ['Joint pain and swelling', 'Morning stiffness', 'Fatigue', 'Low-grade fever', 'Loss of appetite', 'Joint deformity'],
    },
    description: {
      ar: 'التهاب المفاصل الروماتويدي هو مرض مناعي ذاتي يؤثر على المفاصل ويسبب التهابًا مزمنًا. قد يمتد ليطال أعضاء أخرى كالرئتين والقلب والعينين.',
      en: 'Rheumatoid arthritis is an autoimmune disease affecting the joints and causing chronic inflammation. It can extend to other organs such as the lungs, heart, and eyes.',
    },
    specialtyKey: 'orthopedics',
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
  },
  {
    id: 'dis-007',
    name: { ar: 'الاكتئاب الإكلينيكي', en: 'Depression' },
    category: { ar: 'الصحة النفسية', en: 'Mental Health' },
    symptoms: {
      ar: ['حزن مستمر', 'فقدان الاهتمام', 'اضطراب النوم', 'تغيرات في الشهية', 'صعوبة التركيز', 'أفكار انتحارية'],
      en: ['Persistent sadness', 'Loss of interest', 'Sleep disturbances', 'Appetite changes', 'Difficulty concentrating', 'Suicidal thoughts'],
    },
    description: {
      ar: 'الاكتئاب الإكلينيكي هو اضطراب مزاجي خطير يؤثر سلبًا على المشاعر والتفكير والسلوك اليومي. هو من أكثر الاضطرابات النفسية شيوعًا وقابل للعلاج.',
      en: 'Clinical depression is a serious mood disorder that negatively affects feelings, thinking, and daily behavior. It is one of the most common mental disorders and is highly treatable.',
    },
    specialtyKey: 'psychiatry',
    specialty: { ar: 'الطب النفسي', en: 'Psychiatry' },
  },
  {
    id: 'dis-008',
    name: { ar: 'الربو', en: 'Asthma' },
    category: { ar: 'أمراض الجهاز التنفسي', en: 'Respiratory' },
    symptoms: {
      ar: ['ضيق التنفس', 'سعال ليلي', 'صفير في التنفس', 'ضيق الصدر', 'نوبات اختناق'],
      en: ['Shortness of breath', 'Nocturnal cough', 'Wheezing', 'Chest tightness', 'Choking episodes'],
    },
    description: {
      ar: 'الربو هو مرض مزمن في الجهاز التنفسي يتسم بالتهاب مجاري الهواء وتضيقها. يمكن السيطرة عليه بالعلاج المناسب وتجنب المحفزات.',
      en: 'Asthma is a chronic respiratory disease characterized by inflammation and narrowing of the airways. It can be managed with appropriate treatment and avoidance of triggers.',
    },
    specialtyKey: 'general',
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
  },
  {
    id: 'dis-009',
    name: { ar: 'داء السكري من النوع الثاني', en: 'Type 2 Diabetes' },
    category: { ar: 'الغدد الصماء والتمثيل الغذائي', en: 'Endocrinology & Metabolism' },
    symptoms: {
      ar: ['عطش مفرط', 'كثرة التبول', 'إرهاق', 'تشوش الرؤية', 'بطء التئام الجروح', 'خدر في الأطراف'],
      en: ['Excessive thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow-healing wounds', 'Numbness in extremities'],
    },
    description: {
      ar: 'داء السكري من النوع الثاني هو اضطراب مزمن يؤثر على طريقة معالجة الجسم لسكر الدم. يمكن إدارته بتغييرات نمط الحياة والأدوية ومراقبة مستوى الغلوكوز.',
      en: 'Type 2 diabetes is a chronic disorder that affects how the body processes blood sugar. It can be managed through lifestyle changes, medications, and glucose level monitoring.',
    },
    specialtyKey: 'general',
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
  },
  {
    id: 'dis-010',
    name: { ar: 'الالتهاب الرئوي', en: 'Pneumonia' },
    category: { ar: 'أمراض الجهاز التنفسي', en: 'Respiratory' },
    symptoms: {
      ar: ['حمى مرتفعة', 'سعال مع بلغم', 'ألم الصدر عند التنفس', 'ضيق التنفس', 'إرهاق شديد', 'قشعريرة'],
      en: ['High fever', 'Productive cough', 'Chest pain when breathing', 'Shortness of breath', 'Severe fatigue', 'Chills'],
    },
    description: {
      ar: 'الالتهاب الرئوي هو عدوى تصيب أكياس هوائية في أحد الرئتين أو كليهما، مما يؤدي إلى امتلائها بالسوائل. يمكن أن يكون ناجمًا عن بكتيريا أو فيروسات أو فطريات.',
      en: 'Pneumonia is an infection that inflames the air sacs in one or both lungs, causing them to fill with fluid. It can be caused by bacteria, viruses, or fungi.',
    },
    specialtyKey: 'general',
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
  },
  {
    id: 'dis-011',
    name: { ar: 'الصدفية', en: 'Psoriasis' },
    category: { ar: 'أمراض الجلد', en: 'Dermatology' },
    symptoms: {
      ar: ['بقع جلدية حمراء مغطاة بقشور فضية', 'جفاف الجلد وتشققه', 'حكة أو حرقة', 'سماكة الأظافر', 'ألم المفاصل'],
      en: ['Red patches covered with silvery scales', 'Dry and cracked skin', 'Itching or burning', 'Thickened nails', 'Joint pain'],
    },
    description: {
      ar: 'الصدفية هي مرض جلدي مناعي ذاتي مزمن يُسرّع من دورة حياة خلايا الجلد. تتراكم الخلايا على سطح الجلد مكوّنةً قشورًا وبقعًا حمراء متهيجة.',
      en: 'Psoriasis is a chronic autoimmune skin disease that speeds up the life cycle of skin cells. Cells build up rapidly on the surface of the skin, forming scales and red inflamed patches.',
    },
    specialtyKey: 'dermatology',
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
  },
  {
    id: 'dis-012',
    name: { ar: 'آلام أسفل الظهر', en: 'Lower Back Pain' },
    category: { ar: 'أمراض العظام والمفاصل', en: 'Musculoskeletal' },
    symptoms: {
      ar: ['ألم أسفل الظهر', 'تيبس الظهر', 'ألم ينتشر للساق', 'صعوبة الوقوف أو الجلوس', 'تنميل في القدمين'],
      en: ['Lower back pain', 'Back stiffness', 'Pain radiating to the leg', 'Difficulty standing or sitting', 'Numbness in feet'],
    },
    description: {
      ar: 'آلام أسفل الظهر من أكثر المشكلات الطبية شيوعًا على مستوى العالم. يمكن أن تكون حادة أو مزمنة، وقد تنجم عن شد عضلي أو انزلاق غضروفي أو انحلال الفقار.',
      en: 'Lower back pain is one of the most common medical problems worldwide. It can be acute or chronic, and may result from muscle strain, disc herniation, or spondylolisthesis.',
    },
    specialtyKey: 'orthopedics',
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
  },
  {
    id: 'dis-013',
    name: { ar: 'اضطراب القلق العام', en: 'Generalized Anxiety Disorder' },
    category: { ar: 'الصحة النفسية', en: 'Mental Health' },
    symptoms: {
      ar: ['قلق مستمر ومفرط', 'توتر عضلي', 'اضطراب النوم', 'تعب', 'صعوبة التركيز', 'هيجان'],
      en: ['Persistent excessive worry', 'Muscle tension', 'Sleep disturbances', 'Fatigue', 'Difficulty concentrating', 'Irritability'],
    },
    description: {
      ar: 'اضطراب القلق العام هو حالة نفسية تتسم بقلق مزمن ومفرط تجاه أمور الحياة اليومية. يؤثر على التفكير والسلوك ويستجيب بشكل جيد للعلاج النفسي والدوائي.',
      en: 'Generalized anxiety disorder is a psychological condition characterized by chronic excessive worry about everyday matters. It affects thinking and behavior and responds well to therapy and medication.',
    },
    specialtyKey: 'psychiatry',
    specialty: { ar: 'الطب النفسي', en: 'Psychiatry' },
  },
  {
    id: 'dis-014',
    name: { ar: 'التهاب اللوزتين', en: 'Tonsillitis' },
    category: { ar: 'أمراض الأنف والأذن والحنجرة', en: 'ENT' },
    symptoms: {
      ar: ['التهاب الحلق الشديد', 'صعوبة البلع', 'حمى', 'تورم اللوزتين', 'رائحة الفم الكريهة', 'صعوبة فتح الفم'],
      en: ['Severe sore throat', 'Difficulty swallowing', 'Fever', 'Swollen tonsils', 'Bad breath', 'Difficulty opening the mouth'],
    },
    description: {
      ar: 'التهاب اللوزتين هو التهاب في اللوزتين الحلقيتين في الجزء الخلفي من الحلق. يمكن أن يكون بكتيريًا أو فيروسيًا ويُعالج بالمضادات الحيوية أو في الحالات المزمنة باستئصال اللوزتين.',
      en: 'Tonsillitis is inflammation of the palatine tonsils at the back of the throat. It can be bacterial or viral and is treated with antibiotics, or in chronic cases, tonsillectomy.',
    },
    specialtyKey: 'ent',
    specialty: { ar: 'الأنف والأذن والحنجرة', en: 'ENT' },
  },
  {
    id: 'dis-015',
    name: { ar: 'التهاب الملتحمة', en: 'Conjunctivitis' },
    category: { ar: 'أمراض العيون', en: 'Ophthalmology' },
    symptoms: {
      ar: ['احمرار العين', 'إفرازات من العين', 'حكة في العين', 'تورم الجفن', 'حساسية للضوء', 'دموع مفرطة'],
      en: ['Eye redness', 'Eye discharge', 'Itchy eyes', 'Eyelid swelling', 'Light sensitivity', 'Excessive tearing'],
    },
    description: {
      ar: 'التهاب الملتحمة هو التهاب يصيب الغشاء الشفاف المبطن للجفن وأمام العين. يمكن أن يكون معديًا (بكتيريًا أو فيروسيًا) أو تحسسيًا.',
      en: 'Conjunctivitis is inflammation of the transparent membrane lining the eyelid and the front of the eye. It can be infectious (bacterial or viral) or allergic.',
    },
    specialtyKey: 'ophthalmology',
    specialty: { ar: 'طب العيون', en: 'Ophthalmology' },
  },
  {
    id: 'dis-016',
    name: { ar: 'متلازمة القولون العصبي', en: 'Irritable Bowel Syndrome' },
    category: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
    symptoms: {
      ar: ['آلام وتقلصات البطن', 'انتفاخ', 'إسهال أو إمساك أو كليهما', 'كثرة الغازات', 'إلحاح في الإخراج', 'شعور بعدم اكتمال الإخراج'],
      en: ['Abdominal pain and cramping', 'Bloating', 'Diarrhea or constipation or both', 'Excess gas', 'Urgency to defecate', 'Feeling of incomplete evacuation'],
    },
    description: {
      ar: 'متلازمة القولون العصبي هي اضطراب وظيفي شائع في الأمعاء الغليظة. لا تسبب تغييرات دائمة في الأنسجة لكن تؤثر بشكل كبير على جودة الحياة.',
      en: 'Irritable bowel syndrome is a common functional disorder of the large intestine. It does not cause permanent tissue changes but significantly impacts quality of life.',
    },
    specialtyKey: 'gastroenterology',
    specialty: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
  },
  {
    id: 'dis-017',
    name: { ar: 'التهاب الجيوب الأنفية', en: 'Sinusitis' },
    category: { ar: 'أمراض الأنف والأذن والحنجرة', en: 'ENT' },
    symptoms: {
      ar: ['احتقان الأنف', 'ألم وضغط حول الوجه', 'صداع', 'إفرازات أنفية سميكة', 'فقدان حاسة الشم', 'سعال', 'ألم الأسنان'],
      en: ['Nasal congestion', 'Facial pain and pressure', 'Headache', 'Thick nasal discharge', 'Loss of smell', 'Cough', 'Tooth pain'],
    },
    description: {
      ar: 'التهاب الجيوب الأنفية هو التهاب يصيب التجاويف الهوائية الموجودة داخل عظام الوجه. يمكن أن يكون حادًا أو مزمنًا ويسبب ضغطًا وألمًا في الوجه.',
      en: 'Sinusitis is inflammation of the air cavities within the bones of the face. It can be acute or chronic and causes facial pressure and pain.',
    },
    specialtyKey: 'ent',
    specialty: { ar: 'الأنف والأذن والحنجرة', en: 'ENT' },
  },
  {
    id: 'dis-018',
    name: { ar: 'هشاشة العظام', en: 'Osteoporosis' },
    category: { ar: 'أمراض العظام والمفاصل', en: 'Musculoskeletal' },
    symptoms: {
      ar: ['كسور متكررة', 'آلام الظهر', 'تراجع الطول', 'وضعية الانحناء', 'ضعف العظام'],
      en: ['Frequent fractures', 'Back pain', 'Loss of height', 'Stooped posture', 'Bone fragility'],
    },
    description: {
      ar: 'هشاشة العظام هي حالة تصبح فيها العظام هشة وضعيفة لدرجة قد يؤدي معها حتى الانحناء الخفيف إلى كسر. تشيع بشكل خاص في النساء بعد سن اليأس.',
      en: 'Osteoporosis is a condition in which bones become so brittle and weak that even mild bending can cause a fracture. It is especially common in women after menopause.',
    },
    specialtyKey: 'orthopedics',
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
  },
  {
    id: 'dis-019',
    name: { ar: 'اضطراب فرط الحركة وتشتت الانتباه', en: 'ADHD' },
    category: { ar: 'صحة الأطفال والنفسية', en: 'Pediatric & Mental Health' },
    symptoms: {
      ar: ['صعوبة التركيز', 'فرط الحركة', 'التسرع واتخاذ قرارات متهورة', 'النسيان المتكرر', 'صعوبة إنهاء المهام', 'الحركة المستمرة'],
      en: ['Difficulty focusing', 'Hyperactivity', 'Impulsiveness', 'Frequent forgetfulness', 'Difficulty completing tasks', 'Constant movement'],
    },
    description: {
      ar: 'اضطراب فرط الحركة وتشتت الانتباه هو اضطراب عصبي نمائي يتسم بأنماط مستمرة من عدم الانتباه أو فرط الحركة أو الاندفاعية التي تؤثر على الأداء الوظيفي.',
      en: 'ADHD is a neurodevelopmental disorder characterized by persistent patterns of inattention or hyperactivity-impulsivity that interfere with functioning and development.',
    },
    specialtyKey: 'pediatrics',
    specialty: { ar: 'طب الأطفال', en: 'Pediatrics' },
  },
  {
    id: 'dis-020',
    name: { ar: 'الدوار (الدوخة الوضعية)', en: 'Vertigo' },
    category: { ar: 'أمراض عصبية وأذن', en: 'Neurological & ENT' },
    symptoms: {
      ar: ['إحساس بالدوران', 'فقدان التوازن', 'غثيان وقيء', 'تعرق', 'حركة لاإرادية للعين', 'صعوبة المشي'],
      en: ['Sensation of spinning', 'Loss of balance', 'Nausea and vomiting', 'Sweating', 'Involuntary eye movement', 'Difficulty walking'],
    },
    description: {
      ar: 'الدوار هو الشعور بأن الجسم أو المحيط يدور. يُعدّ من أكثر الأعراض العصبية شيوعًا وقد يكون ناجمًا عن مشكلة في الأذن الداخلية أو الدماغ.',
      en: 'Vertigo is the sensation that the body or surroundings are spinning. It is one of the most common neurological symptoms and may stem from an inner ear or brain problem.',
    },
    specialtyKey: 'neurology',
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
  },
]
