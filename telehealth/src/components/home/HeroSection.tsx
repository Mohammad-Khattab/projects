'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'

/* ─── Bilingual strings ─────────────────────────────────────────────────── */
const strings = {
  ar: {
    badge: '✦ منصة الرعاية الصحية الموثوقة',
    h1Line1: 'رعايتك الصحية',
    h1Line2: 'في متناول يدك',
    subtitle:
      'احصل على استشارة طبية فورية من أفضل الأطباء المعتمدين — في أي وقت، من أي مكان، بأمان تام.',
    ctaPrimary: '🗓 احجز موعدك الآن',
    ctaGhost: '🔍 مدقق الأعراض',
    stats: [
      { value: '20+', label: 'طبيب معتمد' },
      { value: '80%', label: 'رضا المرضى' },
      { value: '24/7', label: 'متاح دائمًا' },
      { value: '950+', label: 'استشارة مكتملة' },
    ],
    featuresTitle: 'لماذا تختار ميدي كونيكت؟',
    features: [
      {
        icon: '⚡',
        title: 'استشارة فورية',
        desc: 'تواصل مع طبيب خلال دقائق معدودة دون انتظار.',
      },
      {
        icon: '🔒',
        title: 'خصوصية مضمونة',
        desc: 'بياناتك محمية بأعلى معايير التشفير والأمان.',
      },
      {
        icon: '🏆',
        title: 'أطباء معتمدون',
        desc: 'جميع الأطباء حاصلون على شهادات واعتمادات رسمية.',
      },
      {
        icon: '🌐',
        title: 'متاح 24/7',
        desc: 'خدمتنا لا تتوقف — طبيبك معك في أي وقت تحتاجه.',
      },
    ],
    doctorsTitle: 'أفضل الأطباء تقييمًا',
    doctors: [
      {
        name: 'د. سارة ميتشل',
        specialty: 'أمراض القلب',
        rating: '4.9',
        reviews: '312',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        available: 'متاح الآن',
      },
      {
        name: 'د. جيمس أوكافور',
        specialty: 'طب الأعصاب',
        rating: '4.8',
        reviews: '278',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        available: 'متاح الآن',
      },
      {
        name: 'د. بريا شارما',
        specialty: 'الأمراض الجلدية',
        rating: '4.9',
        reviews: '401',
        avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
        available: 'متاح الآن',
      },
    ],
    bookBtn: 'احجز',
    ctaSectionTitle: 'ابدأ رحلتك الصحية اليوم',
    ctaSectionSub: 'انضم إلى أكثر من 700 مريض يثقون بميدي كونيكت.',
    ctaSectionBtn: 'ابدأ الآن مجاناً',
  },
  en: {
    badge: '✦ TRUSTED TELEHEALTH PLATFORM',
    h1Line1: 'Healthcare at Your',
    h1Line2: 'Fingertips',
    subtitle:
      'Connect instantly with top certified doctors — anytime, anywhere, with complete security and peace of mind.',
    ctaPrimary: '🗓 Book Appointment',
    ctaGhost: '🔍 Symptom Checker',
    stats: [
      { value: '20+', label: 'Certified Doctors' },
      { value: '80%', label: 'Patient Satisfaction' },
      { value: '24/7', label: 'Available' },
      { value: '950+', label: 'Consultations' },
    ],
    featuresTitle: 'Why Choose MediConnect?',
    features: [
      {
        icon: '⚡',
        title: 'Instant Consultation',
        desc: 'Connect with a doctor within minutes — no waiting room.',
      },
      {
        icon: '🔒',
        title: 'Privacy Guaranteed',
        desc: 'Your data is protected with the highest encryption standards.',
      },
      {
        icon: '🏆',
        title: 'Certified Doctors',
        desc: 'Every doctor holds official certifications and board credentials.',
      },
      {
        icon: '🌐',
        title: 'Always Available',
        desc: 'Our service never stops — your doctor is with you anytime.',
      },
    ],
    doctorsTitle: 'Top-Rated Doctors',
    doctors: [
      {
        name: 'Dr. Sarah Mitchell',
        specialty: 'Cardiology',
        rating: '4.9',
        reviews: '312',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        available: 'Available Now',
      },
      {
        name: 'Dr. James Okafor',
        specialty: 'Neurology',
        rating: '4.8',
        reviews: '278',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        available: 'Available Now',
      },
      {
        name: 'Dr. Priya Sharma',
        specialty: 'Dermatology',
        rating: '4.9',
        reviews: '401',
        avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
        available: 'Available Now',
      },
    ],
    bookBtn: 'Book',
    ctaSectionTitle: 'Start Your Health Journey Today',
    ctaSectionSub: 'Join over 700 patients who trust MediConnect.',
    ctaSectionBtn: 'Get Started Free',
  },
}

/* ─── Floating medical items config ────────────────────────────────────── */
const floatingItems = [
  {
    emoji: '🩺',
    style: {
      top: '10%',
      left: '4%',
      fontSize: '110px',
      animation: 'floatY 5s ease-in-out infinite',
      tiltAnimation: 'tiltA 9s ease-in-out infinite',
    },
  },
  {
    emoji: '💉',
    style: {
      top: '15%',
      right: '5%',
      fontSize: '100px',
      animation: 'floatY 4s ease-in-out -2s infinite',
      tiltAnimation: 'tiltB 7.5s ease-in-out -2s infinite',
    },
  },
  {
    emoji: '💊',
    style: {
      bottom: '20%',
      left: '6%',
      fontSize: '95px',
      animation: 'floatY 6s ease-in-out -4s infinite',
      tiltAnimation: 'tiltA 11s ease-in-out -4s infinite',
    },
  },
  {
    emoji: '❤️‍🩹',
    style: {
      bottom: '18%',
      right: '7%',
      fontSize: '105px',
      animation: 'floatY 4.5s ease-in-out -1s infinite',
      tiltAnimation: 'tiltB 8.5s ease-in-out -1s infinite',
    },
  },
  {
    emoji: '🧬',
    style: {
      top: '45%',
      left: '1.5%',
      fontSize: '88px',
      animation: 'floatY 7s ease-in-out -3s infinite',
      tiltAnimation: 'tiltA 13s ease-in-out -3s infinite',
    },
  },
  {
    emoji: '🔬',
    style: {
      top: '6%',
      right: '20%',
      fontSize: '90px',
      animation: 'floatY 5.5s ease-in-out -5s infinite',
      tiltAnimation: 'tiltB 10s ease-in-out -5s infinite',
    },
  },
]

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const { lang, isRTL } = useLang()
  const t = strings[lang]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #0284c7 70%, #06b6d4 100%)',
        }}
      >
        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none animate-grid"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            zIndex: 0,
          }}
        />

        {/* Blur orbs */}
        <div
          className="absolute animate-orb pointer-events-none"
          style={{
            top: '-10%',
            left: isRTL ? 'auto' : '-5%',
            right: isRTL ? '-5%' : 'auto',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: 0,
          }}
        />
        <div
          className="absolute animate-orb pointer-events-none"
          style={{
            bottom: '-8%',
            right: isRTL ? 'auto' : '-5%',
            left: isRTL ? '-5%' : 'auto',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            zIndex: 0,
            animationDelay: '-3s',
          }}
        />

        {/* Floating 3D medical items */}
        {floatingItems.map((item, i) => (
          <div
            key={i}
            className="absolute pointer-events-none hidden lg:block"
            style={{
              top: item.style.top,
              bottom: item.style.bottom,
              left: item.style.left,
              right: item.style.right,
              animation: item.style.animation,
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: item.style.fontSize,
                display: 'block',
                filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.4))',
                animation: item.style.tiltAnimation,
              }}
            >
              {item.emoji}
            </span>
          </div>
        ))}

        {/* Hero content */}
        <div
          className="relative text-center px-4 sm:px-8 max-w-3xl mx-auto"
          style={{ zIndex: 2 }}
        >
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full mb-6 tracking-wider backdrop-blur-sm">
            {t.badge}
          </div>

          {/* H1 */}
          <h1
            className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-3"
            style={{ animationDelay: '0.1s', textShadow: '0 2px 32px rgba(0,0,0,0.2)' }}
          >
            {t.h1Line1}
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #38bdf8, #a5f3fc, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.h1Line2}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-up text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8"
            style={{ animationDelay: '0.2s' }}
          >
            {t.subtitle}
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/book"
              className="btn-depth-white bg-white text-primary font-bold text-base px-8 py-3.5 rounded-xl hover:bg-white/95 transition-colors duration-200 w-full sm:w-auto text-center"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/symptom-checker"
              className="btn-depth-ghost border-2 border-white/60 text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto text-center"
            >
              {t.ctaGhost}
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up grid grid-cols-2 sm:grid-cols-4 gap-0 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden"
            style={{ animationDelay: '0.45s' }}
          >
            {t.stats.map((stat, i) => (
              <div
                key={i}
                className={`py-5 px-4 text-center ${
                  i < t.stats.length - 1
                    ? isRTL
                      ? 'border-l border-white/15'
                      : 'border-r border-white/15'
                    : ''
                } ${i >= 2 ? 'border-t sm:border-t-0 border-white/15' : ''}`}
              >
                <div
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-white/60 text-xs sm:text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SVG WAVE DIVIDER ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden -mt-1" style={{ background: '#f1f5f9' }}>
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: '80px', display: 'block' }}
        >
          <path
            d="M0,0 C360,80 1080,0 1440,60 L1440,0 Z"
            fill="url(#heroGradEnd)"
          />
          <defs>
            <linearGradient id="heroGradEnd" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section className="bg-surface py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] mb-3">
              {t.featuresTitle}
            </h2>
            <div
              className="h-1 w-16 mx-auto rounded-full"
              style={{ background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-7 border border-[#e2e8f0] hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-[#1e293b] font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS SECTION ──────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] mb-3">
              {t.doctorsTitle}
            </h2>
            <div
              className="h-1 w-16 mx-auto rounded-full"
              style={{ background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.doctors.map((doc, i) => (
              <div
                key={i}
                className="group bg-surface rounded-2xl p-7 border border-[#e2e8f0] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
              >
                {/* Avatar */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300"
                  >
                    <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {doc.available}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-[#1e293b] font-bold text-lg mb-1">{doc.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">{doc.specialty}</p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="text-amber-400 text-sm">★★★★★</span>
                  <span className="text-[#1e293b] font-bold text-sm">{doc.rating}</span>
                  <span className="text-[#64748b] text-xs">({doc.reviews})</span>
                </div>

                {/* Book button */}
                <Link
                  href="/book"
                  className="btn-depth-primary block w-full text-center bg-primary text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-primary-dark transition-colors duration-200"
                >
                  {t.bookBtn}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA SECTION ───────────────────────────────────────────── */}
      <section
        className="py-24 px-4 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0284c7 100%)',
        }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none animate-grid"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-2xl mx-auto" style={{ zIndex: 1 }}>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.2)' }}
          >
            {t.ctaSectionTitle}
          </h2>
          <p className="text-white/65 text-base sm:text-lg mb-10 leading-relaxed">
            {t.ctaSectionSub}
          </p>
          <Link
            href="/book"
            className="btn-depth-white inline-block bg-white text-primary font-extrabold text-lg px-10 py-4 rounded-xl hover:bg-white/95 transition-colors duration-200"
          >
            {t.ctaSectionBtn}
          </Link>
        </div>
      </section>

    </div>
  )
}
