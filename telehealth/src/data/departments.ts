export interface Department {
  id: string
  name: { ar: string; en: string }
  icon: string
  description: { ar: string; en: string }
  doctorCount: number
  specialtyKey: string
}

export const departments: Department[] = [
  {
    id: 'cardiology',
    name: { ar: 'أمراض القلب', en: 'Cardiology' },
    icon: '❤️',
    description: {
      ar: 'رعاية متخصصة لأمراض القلب والأوعية الدموية، تشمل تشخيص وعلاج جميع حالات القلب.',
      en: 'Specialized care for heart and cardiovascular diseases, covering diagnosis and treatment of all cardiac conditions.',
    },
    doctorCount: 8,
    specialtyKey: 'cardiology',
  },
  {
    id: 'neurology',
    name: { ar: 'طب الأعصاب', en: 'Neurology' },
    icon: '🧠',
    description: {
      ar: 'تشخيص وعلاج اضطرابات الجهاز العصبي بما فيها الصداع النصفي، الصرع، والسكتة الدماغية.',
      en: 'Diagnosis and treatment of nervous system disorders including migraines, epilepsy, and stroke.',
    },
    doctorCount: 6,
    specialtyKey: 'neurology',
  },
  {
    id: 'dermatology',
    name: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    icon: '🩺',
    description: {
      ar: 'علاج طيف واسع من مشكلات الجلد والشعر والأظافر من حب الشباب إلى الأمراض الجلدية المزمنة.',
      en: 'Treatment of a wide range of skin, hair, and nail conditions from acne to chronic dermatological diseases.',
    },
    doctorCount: 5,
    specialtyKey: 'dermatology',
  },
  {
    id: 'orthopedics',
    name: { ar: 'جراحة العظام', en: 'Orthopedics' },
    icon: '🦴',
    description: {
      ar: 'رعاية الجهاز العضلي الهيكلي وعلاج إصابات العظام والمفاصل والأربطة والعضلات.',
      en: 'Care for the musculoskeletal system and treatment of bones, joints, ligaments, and muscle injuries.',
    },
    doctorCount: 7,
    specialtyKey: 'orthopedics',
  },
  {
    id: 'pediatrics',
    name: { ar: 'طب الأطفال', en: 'Pediatrics' },
    icon: '👶',
    description: {
      ar: 'رعاية صحية شاملة للأطفال من الولادة حتى سن المراهقة، تشمل التطعيمات والمتابعة الدورية.',
      en: 'Comprehensive healthcare for children from birth through adolescence, including vaccinations and regular check-ups.',
    },
    doctorCount: 9,
    specialtyKey: 'pediatrics',
  },
  {
    id: 'psychiatry',
    name: { ar: 'الطب النفسي', en: 'Psychiatry' },
    icon: '🧘',
    description: {
      ar: 'دعم متخصص للصحة النفسية يشمل تشخيص وعلاج الاكتئاب، القلق، واضطرابات المزاج.',
      en: 'Specialized mental health support including diagnosis and treatment of depression, anxiety, and mood disorders.',
    },
    doctorCount: 4,
    specialtyKey: 'psychiatry',
  },
  {
    id: 'ophthalmology',
    name: { ar: 'طب العيون', en: 'Ophthalmology' },
    icon: '👁️',
    description: {
      ar: 'رعاية متكاملة لصحة العين تشمل فحص النظر والجراحة وعلاج أمراض الشبكية.',
      en: 'Comprehensive eye care including vision examination, surgery, and retinal disease treatment.',
    },
    doctorCount: 5,
    specialtyKey: 'ophthalmology',
  },
  {
    id: 'endocrinology',
    name: { ar: 'الغدد الصماء والسكري', en: 'Endocrinology & Diabetes' },
    icon: '🩸',
    description: {
      ar: 'إدارة مرض السكري واضطرابات الغدد كالدرق والغدة الكظرية والهرمونات.',
      en: 'Management of diabetes and glandular disorders such as thyroid, adrenal, and hormonal imbalances.',
    },
    doctorCount: 6,
    specialtyKey: 'endocrinology',
  },
]
