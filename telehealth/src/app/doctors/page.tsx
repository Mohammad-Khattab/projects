'use client'
import { useState, useMemo } from 'react'
import { useLang } from '@/lib/i18n/LangContext'
import { doctors } from '@/data/doctors'
import DoctorCard from '@/components/doctors/DoctorCard'
import DoctorFilters from '@/components/doctors/DoctorFilters'

export default function DoctorsPage() {
  const { lang } = useLang()
  const [search,    setSearch]    = useState('')
  const [specialty, setSpecialty] = useState('')
  const [minRating, setMinRating] = useState(0)

  const t = {
    ar: { title: 'أطباؤنا المتخصصون', sub: 'تواصل مع أفضل الأطباء المعتمدين في تخصصك', empty: 'لا يوجد أطباء يطابقون معايير البحث', showing: 'طبيب متاح', of: 'من' },
    en: { title: 'Our Specialists', sub: 'Connect with the best certified doctors in your specialty', empty: 'No doctors match your search criteria', showing: 'doctors available', of: 'of' },
  }[lang]

  const filtered = useMemo(() => doctors.filter(d => {
    const nameMatch = d.name[lang].toLowerCase().includes(search.toLowerCase())
    const specMatch = !specialty || d.specialtyKey === specialty
    const rateMatch = d.rating >= minRating
    return nameMatch && specMatch && rateMatch
  }), [search, specialty, minRating, lang])

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-accent pt-16 pb-12 px-6 text-white text-center">
        <h1 className="text-4xl font-black mb-3 tracking-tight">{t.title}</h1>
        <p className="text-white/85 text-lg max-w-xl mx-auto">{t.sub}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <DoctorFilters lang={lang} onSearch={setSearch} onSpecialty={setSpecialty} onRating={setMinRating} />

        {/* Count */}
        <p className="text-[13px] text-muted mt-4 mb-6">
          {lang === 'ar'
            ? `${filtered.length} ${t.showing} ${t.of} ${doctors.length}`
            : `${filtered.length} ${t.showing} ${t.of} ${doctors.length}`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
