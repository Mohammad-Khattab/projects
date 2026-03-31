'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

export default function Footer() {
  const { lang, isRTL } = useLang()

  const text = {
    ar: {
      logoMain: 'ميدي',
      logoAccent: 'كونيكت',
      tagline: 'منصة الرعاية الصحية الرقمية الموثوقة — متاحة على مدار الساعة',
      quickLinksTitle: 'روابط سريعة',
      specialtiesTitle: 'التخصصات',
      contactTitle: 'تواصل معنا',
      quickLinks: [
        { label: 'الرئيسية', href: '/' },
        { label: 'الأطباء', href: '/doctors' },
        { label: 'احجز موعد', href: '/book' },
        { label: 'المكتبة الصحية', href: '/library' },
        { label: 'مدقق الأعراض', href: '/symptom-checker' },
        { label: 'بوابة المريض', href: '/portal' },
      ],
      specialties: [
        'أمراض القلب',
        'طب الأعصاب',
        'الأمراض الجلدية',
        'طب الأطفال',
        'طب العظام',
        'الطب النفسي',
      ],
      contactPhone: '+966 11 123 4567',
      contactEmail: 'care@mediconnect.sa',
      contactAddress: 'الرياض، المملكة العربية السعودية',
      copyright: '© 2025 ميدي كونيكت. جميع الحقوق محفوظة.',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
    },
    en: {
      logoMain: 'Medi',
      logoAccent: 'Connect',
      tagline: 'Trusted digital healthcare platform — available around the clock.',
      quickLinksTitle: 'Quick Links',
      specialtiesTitle: 'Specialties',
      contactTitle: 'Contact Us',
      quickLinks: [
        { label: 'Home', href: '/' },
        { label: 'Doctors', href: '/doctors' },
        { label: 'Book', href: '/book' },
        { label: 'Health Library', href: '/library' },
        { label: 'Symptom Checker', href: '/symptom-checker' },
        { label: 'Patient Portal', href: '/portal' },
      ],
      specialties: [
        'Cardiology',
        'Neurology',
        'Dermatology',
        'Pediatrics',
        'Orthopedics',
        'Psychiatry',
      ],
      contactPhone: '+966 11 123 4567',
      contactEmail: 'care@mediconnect.sa',
      contactAddress: 'Riyadh, Saudi Arabia',
      copyright: '© 2025 MediConnect. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
  }[lang]

  return (
    <footer
      className="bg-[#0f172a] text-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.6))' }}>⚕</span>
              <span className="text-white font-bold text-xl">
                {text.logoMain}
                <span className="text-accent-light">{text.logoAccent}</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mt-3 max-w-xs">
              {text.tagline}
            </p>
            <div className="mt-6 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">
                {lang === 'ar' ? 'النظام يعمل' : 'System Online'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-white/10">
              {text.quickLinksTitle}
            </h3>
            <ul className="space-y-3">
              {text.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-accent-light text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/40 group-hover:bg-accent-light transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-white/10">
              {text.specialtiesTitle}
            </h3>
            <ul className="space-y-3">
              {text.specialties.map((s) => (
                <li key={s}>
                  <span className="text-white/55 hover:text-accent-light text-sm transition-colors duration-200 cursor-default flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-accent/40 group-hover:bg-accent-light transition-colors" />
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-white/10">
              {text.contactTitle}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-accent-light text-base mt-0.5">📞</span>
                <span className="text-white/55 text-sm" dir="ltr">{text.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-light text-base mt-0.5">✉️</span>
                <span className="text-white/55 text-sm" dir="ltr">{text.contactEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-light text-base mt-0.5">📍</span>
                <span className="text-white/55 text-sm">{text.contactAddress}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#0a0f1e]">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <p className="text-white/35 text-sm">{text.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-white/35 hover:text-white/60 text-sm transition-colors">
              {text.privacyPolicy}
            </Link>
            <span className="text-white/15">|</span>
            <Link href="/terms" className="text-white/35 hover:text-white/60 text-sm transition-colors">
              {text.termsOfService}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
