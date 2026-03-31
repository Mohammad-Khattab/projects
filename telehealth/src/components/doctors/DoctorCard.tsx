'use client'
import Link from 'next/link'
import type { Doctor } from '@/data/doctors'
import type { Lang } from '@/lib/i18n/LangContext'

const specialtyColors: Record<string, string> = {
  cardiology:       'bg-red-100 text-red-700',
  neurology:        'bg-purple-100 text-purple-700',
  dermatology:      'bg-pink-100 text-pink-700',
  orthopedics:      'bg-orange-100 text-orange-700',
  pediatrics:       'bg-yellow-100 text-yellow-700',
  gastroenterology: 'bg-green-100 text-green-700',
  psychiatry:       'bg-indigo-100 text-indigo-700',
  general:          'bg-blue-100 text-blue-700',
  ophthalmology:    'bg-cyan-100 text-cyan-700',
  ent:              'bg-teal-100 text-teal-700',
}

const dayLabels: Record<string, { ar: string; en: string }> = {
  Sat: { ar: 'سبت', en: 'Sat' },
  Sun: { ar: 'أحد', en: 'Sun' },
  Mon: { ar: 'إثن', en: 'Mon' },
  Tue: { ar: 'ثلث', en: 'Tue' },
  Wed: { ar: 'أرب', en: 'Wed' },
  Thu: { ar: 'خمس', en: 'Thu' },
}

interface Props {
  doctor: Doctor
  lang: Lang
}

export default function DoctorCard({ doctor, lang }: Props) {
  const name      = doctor.name[lang]
  const specialty = doctor.specialty[lang]
  const bio       = doctor.bio[lang]
  const bookLabel = lang === 'ar' ? 'احجز الآن' : 'Book Now'
  const reviewLbl = lang === 'ar' ? 'تقييم' : 'reviews'
  const sarLbl    = lang === 'ar' ? 'ر.س' : 'SAR'
  const availLbl  = lang === 'ar' ? 'متاح:' : 'Available:'

  const badgeClass = specialtyColors[doctor.specialtyKey] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(29,78,216,.12)] hover:border-blue-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex-shrink-0 shadow-sm overflow-hidden">
          <img
            src={doctor.avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-body text-[15px] leading-tight">{name}</h3>
          <span className={`mt-1 inline-block text-[11px] font-600 px-2 py-0.5 rounded-full ${badgeClass}`}>
            {specialty}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-semibold text-body">{doctor.rating}</span>
            <span className="text-xs text-muted">· {doctor.reviews} {reviewLbl}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[13px] font-bold text-primary">{doctor.price}</div>
          <div className="text-[11px] text-muted">{sarLbl}</div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-[13px] text-muted leading-relaxed line-clamp-2">{bio}</p>

      {/* Available days */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] text-muted font-medium">{availLbl}</span>
        {doctor.availableDays.map(day => (
          <span key={day} className="text-[11px] bg-blue-50 text-primary-dark px-2 py-0.5 rounded-md font-medium">
            {dayLabels[day]?.[lang] ?? day}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={`/book?doctor=${doctor.id}`}
        className="mt-auto w-full text-center bg-primary text-white text-[13px] font-bold py-2.5 rounded-xl btn-depth-primary"
      >
        {bookLabel}
      </Link>
    </div>
  )
}
