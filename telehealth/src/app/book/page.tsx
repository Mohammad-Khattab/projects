'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'
import { doctors, Doctor } from '@/data/doctors'
import Calendar from '@/components/booking/Calendar'
import TimeSlotPicker from '@/components/booking/TimeSlotPicker'

// ─── Helpers ────────────────────────────────────────────────────────────────

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const AR_DAYS_LONG = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const EN_DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDate(date: Date, lang: 'ar' | 'en') {
  const day = lang === 'ar' ? AR_DAYS_LONG[date.getDay()] : EN_DAYS_LONG[date.getDay()]
  const month = lang === 'ar' ? AR_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()]
  return `${day}، ${date.getDate()} ${month} ${date.getFullYear()}`
}

function formatSlotDisplay(slot: string, lang: 'ar' | 'en') {
  const [hourStr, minStr] = slot.split(':')
  const hour = parseInt(hourStr)
  const min = minStr === '00' ? '00' : minStr
  if (lang === 'ar') {
    return `${hour}:${min} ${hour < 12 ? 'ص' : 'م'}`
  }
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h}:${min} ${hour < 12 || hour === 12 ? (hour < 12 ? 'AM' : 'PM') : 'PM'}`
}

// ─── Progress Steps ──────────────────────────────────────────────────────────

const STEP_LABELS = {
  ar: ['اختر الطبيب', 'التاريخ', 'الوقت والنوع', 'التأكيد'],
  en: ['Select Doctor', 'Pick Date', 'Time & Type', 'Confirmed'],
}

function ProgressBar({ step, lang }: { step: number; lang: 'ar' | 'en' }) {
  const labels = STEP_LABELS[lang]
  return (
    <div className="flex items-center justify-between px-4 py-5 bg-white border-b border-border">
      {labels.map((label, i) => {
        const num = i + 1
        const isActive = step === num
        const isComplete = step > num
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 relative">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${isComplete ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                  isActive ? 'bg-primary text-white shadow-md shadow-primary/30' :
                  'bg-surface text-muted border border-border'}`}>
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-primary' : isComplete ? 'text-emerald-600' : 'text-muted'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300
                ${isComplete ? 'bg-emerald-400' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Doctor Card ─────────────────────────────────────────────────────────────

function DoctorCard({ doctor, lang, compact = false }: { doctor: Doctor; lang: 'ar' | 'en'; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">{doctor.avatar}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-body truncate">{doctor.name[lang]}</p>
          <p className="text-xs text-muted">{doctor.specialty[lang]}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{doctor.price} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          <div className="flex items-center gap-0.5 justify-end">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs text-muted">{doctor.rating}</span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
          {doctor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-body">{doctor.name[lang]}</h3>
          <p className="text-sm text-primary font-medium">{doctor.specialty[lang]}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className="text-sm font-semibold">{doctor.rating}</span>
              <span className="text-xs text-muted">({doctor.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {doctor.availableDays.join(' · ')}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-primary">{doctor.price}</p>
          <p className="text-xs text-muted">{lang === 'ar' ? 'ر.س / جلسة' : 'SAR / session'}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main page (inner, uses useSearchParams) ─────────────────────────────────

function BookPageInner() {
  const { lang, isRTL } = useLang()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [appointmentType, setAppointmentType] = useState<'video' | 'inperson'>('video')
  const [isBooked, setIsBooked] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Pre-select doctor from URL params
  useEffect(() => {
    const doctorId = searchParams.get('doctor')
    const specialtyKey = searchParams.get('specialty')
    if (doctorId) {
      const doc = doctors.find(d => d.id === doctorId)
      if (doc) setSelectedDoctor(doc)
    } else if (specialtyKey) {
      const doc = doctors.find(d => d.specialtyKey === specialtyKey)
      if (doc) setSelectedDoctor(doc)
    }
  }, [searchParams])

  const filteredDoctors = doctors.filter(d => {
    const q = search.toLowerCase()
    return d.name.ar.includes(q) || d.name.en.toLowerCase().includes(q) ||
      d.specialty.ar.includes(q) || d.specialty.en.toLowerCase().includes(q)
  })

  const handleBook = () => {
    setIsBooked(true)
    setStep(4)
  }

  const resetBooking = () => {
    setStep(1)
    setSelectedDoctor(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setAppointmentType('video')
    setIsBooked(false)
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-1">
            {lang === 'ar' ? 'حجز موعد' : 'Book Appointment'}
          </h1>
          <p className="text-blue-100 text-sm">
            {lang === 'ar'
              ? 'احجز موعدك مع أفضل الأطباء في خطوات بسيطة'
              : 'Book your appointment with top doctors in simple steps'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-0 sm:px-6">
        <ProgressBar step={step} lang={lang} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* ── STEP 1: Select Doctor ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h2 className="font-bold text-body mb-4">
                {lang === 'ar' ? '١. اختر طبيبك' : '1. Choose Your Doctor'}
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <svg className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder={lang === 'ar' ? 'ابحث عن طبيب أو تخصص...' : 'Search doctor or specialty...'}
                  className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                />
              </div>

              {/* Dropdown */}
              {dropdownOpen && filteredDoctors.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden shadow-lg mb-4 max-h-64 overflow-y-auto">
                  {filteredDoctors.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoctor(doc); setDropdownOpen(false); setSearch('') }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition border-b border-border last:border-0 text-start"
                    >
                      <span className="text-xl">{doc.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-body truncate">{doc.name[lang]}</p>
                        <p className="text-xs text-muted">{doc.specialty[lang]}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-bold text-primary">{doc.price} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
                        <p className="text-xs text-muted">★ {doc.rating}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected doctor or prompt */}
              {selectedDoctor ? (
                <div className="space-y-3">
                  <DoctorCard doctor={selectedDoctor} lang={lang} />
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-xs text-muted hover:text-primary transition underline"
                  >
                    {lang === 'ar' ? 'تغيير الطبيب' : 'Change doctor'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-3xl mb-3">🔍</div>
                  <p className="text-muted text-sm">
                    {lang === 'ar' ? 'ابحث عن طبيب أو اختر من القائمة أعلاه' : 'Search for a doctor or select from the list above'}
                  </p>
                </div>
              )}
            </div>

            <button
              disabled={!selectedDoctor}
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl btn-depth-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {lang === 'ar' ? 'متابعة إلى اختيار التاريخ ←' : 'Continue to Date Selection →'}
            </button>
          </div>
        )}

        {/* ── STEP 2: Select Date ── */}
        {step === 2 && selectedDoctor && (
          <div className="space-y-5 animate-fade-up">
            <DoctorCard doctor={selectedDoctor} lang={lang} compact />

            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h2 className="font-bold text-body mb-4">
                {lang === 'ar' ? '٢. اختر تاريخ الموعد' : '2. Choose Appointment Date'}
              </h2>
              <Calendar
                lang={lang}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availableDays={selectedDoctor.availableDays}
              />
              {selectedDate && (
                <p className="mt-3 text-sm text-center text-primary font-medium">
                  ✓ {formatDate(selectedDate, lang)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-body hover:bg-surface transition"
              >
                {lang === 'ar' ? '← رجوع' : '← Back'}
              </button>
              <button
                disabled={!selectedDate}
                onClick={() => setStep(3)}
                className="flex-[2] py-3 bg-primary text-white font-semibold rounded-xl btn-depth-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {lang === 'ar' ? 'متابعة إلى اختيار الوقت ←' : 'Continue to Time Selection →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Time + Type ── */}
        {step === 3 && selectedDoctor && selectedDate && (
          <div className="space-y-5 animate-fade-up">
            <DoctorCard doctor={selectedDoctor} lang={lang} compact />

            <TimeSlotPicker lang={lang} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />

            {/* Appointment type */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-body mb-4 text-sm">
                {lang === 'ar' ? 'نوع الاستشارة' : 'Appointment Type'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'video' as const, icon: '📹', label: { ar: 'مكالمة فيديو', en: 'Video Call' }, desc: { ar: 'استشارة عن بُعد', en: 'Remote consultation' } },
                  { value: 'inperson' as const, icon: '🏥', label: { ar: 'حضوري', en: 'In-Person' }, desc: { ar: 'زيارة العيادة', en: 'Clinic visit' } },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAppointmentType(opt.value)}
                    className={`p-4 rounded-xl border-2 text-start transition-all duration-150
                      ${appointmentType === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'}`}
                  >
                    <span className="text-2xl block mb-1.5">{opt.icon}</span>
                    <p className={`font-semibold text-sm ${appointmentType === opt.value ? 'text-primary' : 'text-body'}`}>
                      {opt.label[lang]}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{opt.desc[lang]}</p>
                    {appointmentType === opt.value && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs text-primary font-medium">{lang === 'ar' ? 'محدد' : 'Selected'}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedSlot && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <h3 className="font-semibold text-primary text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {lang === 'ar' ? 'ملخص الموعد' : 'Appointment Summary'}
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: { ar: 'الطبيب', en: 'Doctor' }, value: selectedDoctor.name[lang] },
                    { label: { ar: 'التاريخ', en: 'Date' }, value: formatDate(selectedDate, lang) },
                    { label: { ar: 'الوقت', en: 'Time' }, value: formatSlotDisplay(selectedSlot, lang) },
                    { label: { ar: 'نوع الاستشارة', en: 'Type' }, value: appointmentType === 'video' ? (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call') : (lang === 'ar' ? 'حضوري' : 'In-Person') },
                    { label: { ar: 'السعر', en: 'Price' }, value: `${selectedDoctor.price} ${lang === 'ar' ? 'ر.س' : 'SAR'}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-muted">{row.label[lang]}</span>
                      <span className="font-semibold text-body">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-body hover:bg-surface transition"
              >
                {lang === 'ar' ? '← رجوع' : '← Back'}
              </button>
              <button
                disabled={!selectedSlot}
                onClick={handleBook}
                className="flex-[2] py-3 bg-primary text-white font-semibold rounded-xl btn-depth-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {lang === 'ar' ? 'تأكيد الحجز ✓' : 'Confirm Booking ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && isBooked && selectedDoctor && selectedDate && selectedSlot && (
          <div className="animate-fade-up">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Success header */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center py-10 px-6">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2">
                  {lang === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
                </h2>
                <p className="text-emerald-100">
                  {lang === 'ar'
                    ? 'سيتواصل معك الطبيب قبل الموعد بفترة كافية'
                    : 'The doctor will contact you well before the appointment'}
                </p>
              </div>

              {/* Appointment details */}
              <div className="p-6 space-y-4">
                <DoctorCard doctor={selectedDoctor} lang={lang} compact />

                <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-body mb-1">
                    {lang === 'ar' ? 'تفاصيل الموعد' : 'Appointment Details'}
                  </h4>
                  {[
                    { icon: '📅', label: { ar: 'التاريخ', en: 'Date' }, value: formatDate(selectedDate, lang) },
                    { icon: '🕐', label: { ar: 'الوقت', en: 'Time' }, value: formatSlotDisplay(selectedSlot, lang) },
                    { icon: appointmentType === 'video' ? '📹' : '🏥', label: { ar: 'نوع الاستشارة', en: 'Type' }, value: appointmentType === 'video' ? (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call') : (lang === 'ar' ? 'حضوري' : 'In-Person') },
                    { icon: '💳', label: { ar: 'السعر', en: 'Price' }, value: `${selectedDoctor.price} ${lang === 'ar' ? 'ر.س' : 'SAR'}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{row.icon}</span>
                      <span className="text-sm text-muted flex-1">{row.label[lang]}</span>
                      <span className="text-sm font-semibold text-body">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/portal"
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl btn-depth-primary text-center text-sm transition"
                  >
                    {lang === 'ar' ? 'عرض في البوابة' : 'View in Portal'}
                  </Link>
                  <button
                    onClick={resetBooking}
                    className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-body hover:bg-surface transition"
                  >
                    {lang === 'ar' ? 'حجز آخر' : 'Book Another'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    }>
      <BookPageInner />
    </Suspense>
  )
}
