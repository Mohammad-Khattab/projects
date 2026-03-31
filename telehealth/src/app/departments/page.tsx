'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'
import { departments } from '@/data/departments'

export default function DepartmentsPage() {
  const { lang, isRTL } = useLang()

  const t = {
    title: { ar: 'أقسامنا الطبية', en: 'Our Medical Departments' },
    subtitle: {
      ar: 'نقدم رعاية صحية متكاملة عبر أكثر من 8 تخصصات طبية متميزة بكوادر من أفضل الأطباء',
      en: 'We provide comprehensive healthcare across 8+ medical specialties with the best physicians',
    },
    doctorsAvailable: { ar: 'طبيب متاح', en: 'doctors available' },
    viewDoctors: { ar: 'عرض الأطباء', en: 'View Doctors' },
    departmentsCount: { ar: 'الأقسام المتاحة', en: 'Available Departments' },
    allSpecialties: { ar: 'جميع التخصصات', en: 'All Specialties' },
  }

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-5 border border-white/20">
            <span>🏥</span>
            <span>{t.allSpecialties[lang]}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t.title[lang]}
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.subtitle[lang]}
          </p>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold">{departments.length}+</p>
              <p className="text-white/60 text-sm mt-1">{t.departmentsCount[lang]}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">
                {departments.reduce((sum, d) => sum + d.doctorCount, 0)}+
              </p>
              <p className="text-white/60 text-sm mt-1">
                {lang === 'ar' ? 'طبيب متخصص' : 'Specialist Doctors'}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-white/60 text-sm mt-1">
                {lang === 'ar' ? 'دعم مستمر' : 'Ongoing Support'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card top color strip */}
              <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />

              <div className="p-5 flex flex-col flex-1">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/10 flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {dept.icon}
                </div>

                {/* Name */}
                <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug">
                  {dept.name[lang]}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 flex-1 mb-4">
                  {dept.description[lang]}
                </p>

                {/* Doctors badge */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-sm">👨‍⚕️</span>
                  <span className="text-xs font-semibold text-primary">
                    {dept.doctorCount}{' '}
                    {lang === 'ar' ? t.doctorsAvailable.ar : t.doctorsAvailable.en}
                  </span>
                </div>

                {/* CTA button */}
                <Link
                  href="/doctors"
                  className="btn-depth-primary w-full bg-primary text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors text-center block"
                >
                  {t.viewDoctors[lang]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
