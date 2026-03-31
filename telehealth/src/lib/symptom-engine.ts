export interface Condition {
  name: { ar: string; en: string }
  confidence: number
  specialty: { ar: string; en: string }
  specialtyKey: string
}

export interface SymptomResult {
  conditions: Condition[]
  topSpecialty: { ar: string; en: string }
  topSpecialtyKey: string
}

interface Rule {
  keywords: string[]
  condition: { ar: string; en: string }
  specialty: { ar: string; en: string }
  specialtyKey: string
  weight: number
}

const RULES: Rule[] = [
  {
    keywords: ['chest pain', 'ألم الصدر', 'heart', 'قلب', 'palpitation', 'خفقان', 'shortness of breath', 'ضيق التنفس', 'pressure chest'],
    condition: { ar: 'أمراض القلب', en: 'Cardiac Condition' },
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
    specialtyKey: 'cardiology',
    weight: 3,
  },
  {
    keywords: ['headache', 'صداع', 'migraine', 'شقيقة', 'dizziness', 'دوخة', 'vertigo', 'دوار', 'numbness', 'تنميل', 'seizure', 'تشنج'],
    condition: { ar: 'اضطراب عصبي', en: 'Neurological Disorder' },
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
    specialtyKey: 'neurology',
    weight: 3,
  },
  {
    keywords: ['rash', 'طفح', 'itching', 'حكة', 'skin', 'جلد', 'acne', 'حب الشباب', 'eczema', 'أكزيما', 'psoriasis', 'صدفية'],
    condition: { ar: 'مشكلة جلدية', en: 'Skin Condition' },
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    specialtyKey: 'dermatology',
    weight: 3,
  },
  {
    keywords: ['fever', 'حمى', 'cough', 'سعال', 'cold', 'زكام', 'flu', 'إنفلونزا', 'sore throat', 'التهاب الحلق', 'fatigue', 'تعب', 'body ache', 'ألم الجسم'],
    condition: { ar: 'عدوى تنفسية', en: 'Respiratory Infection' },
    specialty: { ar: 'الطب العام', en: 'General Medicine' },
    specialtyKey: 'general',
    weight: 2,
  },
  {
    keywords: ['stomach', 'معدة', 'abdominal pain', 'ألم البطن', 'nausea', 'غثيان', 'vomiting', 'قيء', 'diarrhea', 'إسهال', 'constipation', 'إمساك', 'bloating', 'انتفاخ'],
    condition: { ar: 'اضطراب هضمي', en: 'Gastrointestinal Disorder' },
    specialty: { ar: 'أمراض الجهاز الهضمي', en: 'Gastroenterology' },
    specialtyKey: 'gastroenterology',
    weight: 3,
  },
  {
    keywords: ['joint pain', 'ألم المفاصل', 'back pain', 'ألم الظهر', 'bone', 'عظم', 'fracture', 'كسر', 'arthritis', 'التهاب مفاصل', 'spine', 'عمود فقري'],
    condition: { ar: 'مشكلة عظمية مفصلية', en: 'Musculoskeletal Condition' },
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
    specialtyKey: 'orthopedics',
    weight: 3,
  },
  {
    keywords: ['anxiety', 'قلق', 'depression', 'اكتئاب', 'stress', 'ضغط نفسي', 'insomnia', 'أرق', 'mood', 'مزاج', 'panic', 'ذعر', 'mental', 'نفسي'],
    condition: { ar: 'اضطراب نفسي', en: 'Mental Health Condition' },
    specialty: { ar: 'الطب النفسي', en: 'Psychiatry' },
    specialtyKey: 'psychiatry',
    weight: 3,
  },
  {
    keywords: ['eye', 'عين', 'vision', 'بصر', 'blurry', 'ضبابية', 'redness eye', 'احمرار العين', 'eye pain', 'ألم العين'],
    condition: { ar: 'مشكلة في العيون', en: 'Eye Condition' },
    specialty: { ar: 'طب العيون', en: 'Ophthalmology' },
    specialtyKey: 'ophthalmology',
    weight: 3,
  },
  {
    keywords: ['ear', 'أذن', 'nose', 'أنف', 'throat', 'حلق', 'hearing loss', 'فقدان السمع', 'nasal', 'أنفي', 'tonsil', 'لوزتين'],
    condition: { ar: 'مشكلة في الأنف والأذن والحنجرة', en: 'ENT Condition' },
    specialty: { ar: 'الأنف والأذن والحنجرة', en: 'ENT' },
    specialtyKey: 'ent',
    weight: 3,
  },
  {
    keywords: ['child', 'طفل', 'baby', 'رضيع', 'infant', 'رضيع', 'pediatric', 'أطفال', 'growth', 'نمو', 'vaccination', 'تطعيم'],
    condition: { ar: 'صحة الأطفال', en: 'Pediatric Concern' },
    specialty: { ar: 'طب الأطفال', en: 'Pediatrics' },
    specialtyKey: 'pediatrics',
    weight: 3,
  },
]

export function analyzeSymptoms(input: string): SymptomResult {
  const lower = input.toLowerCase()

  const scores: Map<string, { rule: Rule; score: number }> = new Map()

  for (const rule of RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += rule.weight
      }
    }
    if (score > 0) {
      const existing = scores.get(rule.specialtyKey)
      if (!existing || existing.score < score) {
        scores.set(rule.specialtyKey, { rule, score })
      }
    }
  }

  if (scores.size === 0) {
    return {
      conditions: [{
        name: { ar: 'حالة طبية عامة', en: 'General Medical Condition' },
        confidence: 60,
        specialty: { ar: 'الطب العام', en: 'General Medicine' },
        specialtyKey: 'general',
      }],
      topSpecialty: { ar: 'الطب العام', en: 'General Medicine' },
      topSpecialtyKey: 'general',
    }
  }

  const sorted = Array.from(scores.values()).sort((a, b) => b.score - a.score)
  const maxScore = sorted[0].score

  const conditions: Condition[] = sorted.slice(0, 3).map(({ rule, score }) => ({
    name: rule.condition,
    confidence: Math.round((score / (maxScore * 1.2)) * 100),
    specialty: rule.specialty,
    specialtyKey: rule.specialtyKey,
  }))

  return {
    conditions,
    topSpecialty: sorted[0].rule.specialty,
    topSpecialtyKey: sorted[0].rule.specialtyKey,
  }
}
