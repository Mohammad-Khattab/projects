'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

export default function Navbar() {
  const { lang, toggleLang, isRTL } = useLang()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const text = {
    ar: {
      logoMain: 'ميدي',
      logoAccent: 'كونيكت',
      home: 'الرئيسية',
      doctors: 'الأطباء',
      book: 'احجز موعد',
      more: 'المزيد ▾',
      library: 'المكتبة الصحية',
      symptomChecker: 'مدقق الأعراض',
      portal: 'بوابة المريض',
      departments: 'الأقسام',
      contact: 'اتصل بنا',
      langToggle: '🌐 English',
      login: 'تسجيل الدخول',
    },
    en: {
      logoMain: 'Medi',
      logoAccent: 'Connect',
      home: 'Home',
      doctors: 'Doctors',
      book: 'Book',
      more: 'More ▾',
      library: 'Health Library',
      symptomChecker: 'Symptom Checker',
      portal: 'Patient Portal',
      departments: 'Departments',
      contact: 'Contact',
      langToggle: '🌐 العربية',
      login: 'Login',
    },
  }[lang]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const mainLinks = [
    { label: text.home, href: '/' },
    { label: text.doctors, href: '/doctors' },
    { label: text.book, href: '/book' },
  ]

  const moreLinks = [
    { label: text.library, href: '/library' },
    { label: text.symptomChecker, href: '/symptom-checker' },
    { label: text.portal, href: '/portal' },
    { label: text.departments, href: '/departments' },
    { label: text.contact, href: '/contact' },
  ]

  return (
    <nav
      className="sticky top-0 z-50 bg-primary backdrop-blur-md border-b border-white/10"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ boxShadow: '0 2px 32px rgba(29,78,216,0.4)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <span
              className="text-2xl"
              style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' }}
            >
              ⚕
            </span>
            <span className="text-white font-bold text-xl tracking-tight">
              {text.logoMain}
              <span className="text-accent-light">{text.logoAccent}</span>
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/85 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-white/85 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
              >
                {text.more}
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute top-full mt-2 w-52 bg-[#1e3a8a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-fade-up ${
                    isRTL ? 'right-0' : 'left-0'
                  }`}
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                >
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block"
            >
              {text.langToggle}
            </button>

            {/* Login */}
            <button
              className="btn-depth-white bg-white text-primary font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/95 transition-colors duration-200"
            >
              {text.login}
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}
