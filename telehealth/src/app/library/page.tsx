'use client'
import { useState, useMemo } from 'react'
import { useLang } from '@/lib/i18n/LangContext'
import { diseases } from '@/data/diseases'

const categoryColors: Record<string, string> = {
  cardiology:       'bg-red-100 text-red-700',
  neurology:        'bg-purple-100 text-purple-700',
  dermatology:      'bg-pink-100 text-pink-700',
  general:          'bg-blue-100 text-blue-700',
  gastroenterology: 'bg-green-100 text-green-700',
  orthopedics:      'bg-orange-100 text-orange-700',
  psychiatry:       'bg-indigo-100 text-indigo-700',
  pediatrics:       'bg-yellow-100 text-yellow-700',
  ophthalmology:    'bg-cyan-100 text-cyan-700',
  ent:              'bg-teal-100 text-teal-700',
}

export default function LibraryPage() {
  const { lang } = useLang()
  const [query, setQuery] = useState('')

  const t = {
    ar: {
      title: 'المكتبة الصحية',
      sub: 'تعرّف على الأمراض الشائعة وأعراضها والتخصصات المناسبة لعلاجها',
      placeholder: 'ابحث عن مرض أو عرض...',
      symptoms: 'الأعراض:',
      specialty: 'التخصص:',
      more: 'اعرف أكثر',
      empty: 'لا توجد نتائج تطابق بحثك',
      showing: 'نتيجة',
    },
    en: {
      title: 'Health Library',
      sub: 'Learn about common diseases, their symptoms, and the right specialty for treatment',
      placeholder: 'Search disease or symptom...',
      symptoms: 'Symptoms:',
      specialty: 'Specialty:',
      more: 'Learn More',
      empty: 'No results match your search',
      showing: 'results',
    },
  }[lang]

  const filtered = useMemo(() => {
    if (!query.trim()) return diseases
    const q = query.toLowerCase()
    return diseases.filter(d => {
      const nameMatch = d.name[lang].toLowerCase().includes(q)
      const symMatch  = d.symptoms[lang].some(s => s.toLowerCase().includes(q))
      const catMatch  = d.category[lang].toLowerCase().includes(q)
      return nameMatch || symMatch || catMatch
    })
  }, [query, lang])

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-accent pt-16 pb-12 px-6 text-white text-center">
        <h1 className="text-4xl font-black mb-3 tracking-tight">{t.title}</h1>
        <p className="text-white/85 text-lg max-w-xl mx-auto">{t.sub}</p>

        {/* Search */}
        <div className="max-w-lg mx-auto mt-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-5 py-3.5 rounded-2xl text-body text-[15px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-[13px] text-muted mb-6">{filtered.length} {t.showing}</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(disease => {
              const badgeClass = categoryColors[disease.specialtyKey] ?? 'bg-gray-100 text-gray-700'
              const symptoms   = disease.symptoms[lang].slice(0, 4)
              const hasMore    = disease.symptoms[lang].length > 4

              return (
                <div
                  key={disease.id}
                  className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(29,78,216,.1)] hover:border-blue-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-body text-[16px] leading-tight">{disease.name[lang]}</h3>
                    <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                      {disease.category[lang]}
                    </span>
                  </div>

                  <p className="text-[13px] text-muted line-clamp-2 leading-relaxed">{disease.description[lang]}</p>

                  <div>
                    <p className="text-[12px] font-semibold text-body mb-1.5">{t.symptoms}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {symptoms.map((s, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                      {hasMore && <span className="text-[11px] text-muted px-1">...</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-muted">{t.specialty}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {disease.specialty[lang]}
                      </span>
                    </div>
                    <button className="text-[12px] font-semibold text-primary hover:text-primary-dark transition-colors">
                      {t.more} →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
