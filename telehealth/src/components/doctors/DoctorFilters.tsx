'use client'
import type { Lang } from '@/lib/i18n/LangContext'

interface Props {
  lang: Lang
  onSearch:   (q: string) => void
  onSpecialty:(s: string) => void
  onRating:   (r: number) => void
}

const specialties = {
  ar: ['الكل', 'أمراض القلب', 'طب الأعصاب', 'الأمراض الجلدية', 'جراحة العظام', 'طب الأطفال', 'الجهاز الهضمي', 'الطب النفسي', 'الطب العام'],
  en: ['All',  'Cardiology',  'Neurology',   'Dermatology',     'Orthopedics',  'Pediatrics',  'Gastroenterology', 'Psychiatry',   'General Medicine'],
}

const specialtyKeys = ['', 'cardiology', 'neurology', 'dermatology', 'orthopedics', 'pediatrics', 'gastroenterology', 'psychiatry', 'general']

export default function DoctorFilters({ lang, onSearch, onSpecialty, onRating }: Props) {
  const t = {
    ar: { search: 'ابحث عن طبيب...', specialty: 'التخصص', rating: 'التقييم', allRatings: 'الكل', r49: '4.9+', r48: '4.8+', r47: '4.7+' },
    en: { search: 'Search doctors...', specialty: 'Specialty', rating: 'Rating', allRatings: 'All', r49: '4.9+', r48: '4.8+', r47: '4.7+' },
  }[lang]

  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder={t.search}
          onChange={e => onSearch(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-[14px] text-body placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Specialty */}
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-semibold text-muted whitespace-nowrap">{t.specialty}:</label>
        <select
          onChange={e => onSpecialty(specialtyKeys[Number(e.target.value)] ?? '')}
          className="border border-border rounded-xl px-3 py-2.5 text-[13px] text-body focus:outline-none focus:border-primary bg-white"
        >
          {specialties[lang].map((s, i) => (
            <option key={i} value={i}>{s}</option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-semibold text-muted whitespace-nowrap">{t.rating}:</label>
        <select
          onChange={e => onRating(Number(e.target.value))}
          className="border border-border rounded-xl px-3 py-2.5 text-[13px] text-body focus:outline-none focus:border-primary bg-white"
        >
          <option value={0}>{t.allRatings}</option>
          <option value={4.9}>{t.r49}</option>
          <option value={4.8}>{t.r48}</option>
          <option value={4.7}>{t.r47}</option>
        </select>
      </div>
    </div>
  )
}
