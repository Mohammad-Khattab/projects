'use client'
import { useState, FormEvent } from 'react'
import { useLang } from '@/lib/i18n/LangContext'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const faqItems = [
  {
    q: { ar: 'كيف أحجز موعدًا؟', en: 'How do I book an appointment?' },
    a: {
      ar: 'يمكنك حجز موعد بسهولة من خلال النقر على "احجز الآن" واختيار الطبيب والتخصص والوقت المناسب لك. العملية لا تستغرق أكثر من دقيقتين.',
      en: 'You can easily book an appointment by clicking "Book Now", then selecting your preferred doctor, specialty, and available time slot. The process takes less than two minutes.',
    },
  },
  {
    q: { ar: 'هل خدماتكم متاحة 24 ساعة؟', en: 'Are your services available 24/7?' },
    a: {
      ar: 'تتوفر المنصة على مدار الساعة، لكن مواعيد الأطباء تعتمد على جداول عمل كل طبيب. يتوفر دعم الطوارئ على مدار 24 ساعة طوال أيام الأسبوع.',
      en: 'The platform is available around the clock, but doctor appointments depend on each physician\'s schedule. Emergency support is available 24/7 every day of the week.',
    },
  },
  {
    q: {
      ar: 'كيف تعمل استشارات الفيديو؟',
      en: 'How do video consultations work?',
    },
    a: {
      ar: 'بعد حجز موعد فيديو، ستتلقى رابطاً مباشراً قبل الموعد بـ 15 دقيقة. اضغط على "انضم للمكالمة" وستتواصل مباشرة مع طبيبك عبر بث مرئي آمن ومشفر.',
      en: 'After booking a video appointment, you will receive a direct link 15 minutes before the session. Click "Join Call" and you will connect directly with your doctor via a secure, encrypted video stream.',
    },
  },
  {
    q: { ar: 'هل معلوماتي آمنة؟', en: 'Is my information secure?' },
    a: {
      ar: 'نعم، نحن نستخدم أحدث بروتوكولات التشفير لحماية بياناتك الطبية والشخصية. منصتنا متوافقة مع معايير HIPAA وتخضع لمراجعات أمنية دورية.',
      en: 'Yes, we use the latest encryption protocols to protect your medical and personal data. Our platform is HIPAA-compliant and undergoes regular security audits.',
    },
  },
  {
    q: { ar: 'كيف يمكنني إلغاء الموعد؟', en: 'How can I cancel an appointment?' },
    a: {
      ar: 'يمكنك إلغاء موعدك من بوابة المريض ضمن تبويب "المواعيد". يُرجى الإلغاء قبل 24 ساعة على الأقل لتفادي أي رسوم. سيُرجع المبلغ خلال 3-5 أيام عمل.',
      en: 'You can cancel your appointment from the Patient Portal under the "Appointments" tab. Please cancel at least 24 hours in advance to avoid any charges. Refunds are processed within 3-5 business days.',
    },
  },
]

const subjectOptions = [
  { value: 'general', ar: 'استفسار عام', en: 'General Inquiry' },
  { value: 'support', ar: 'دعم تقني', en: 'Technical Support' },
  { value: 'billing', ar: 'الفواتير', en: 'Billing' },
  { value: 'appointment', ar: 'المواعيد', en: 'Appointment' },
  { value: 'feedback', ar: 'ملاحظات', en: 'Feedback' },
]

export default function ContactPage() {
  const { lang, isRTL } = useLang()

  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const t = {
    title: { ar: 'تواصل معنا', en: 'Contact Us' },
    subtitle: {
      ar: 'فريق الدعم لدينا جاهز للإجابة على استفساراتك وحل مشكلاتك في أسرع وقت',
      en: 'Our support team is ready to answer your questions and resolve your issues as quickly as possible',
    },
    formTitle: { ar: 'أرسل رسالة', en: 'Send a Message' },
    name: { ar: 'الاسم', en: 'Name' },
    namePlaceholder: { ar: 'اسمك الكامل', en: 'Your full name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    emailPlaceholder: { ar: 'example@email.com', en: 'example@email.com' },
    subject: { ar: 'الموضوع', en: 'Subject' },
    subjectPlaceholder: { ar: 'اختر الموضوع', en: 'Select a subject' },
    message: { ar: 'الرسالة', en: 'Message' },
    messagePlaceholder: {
      ar: 'اكتب رسالتك هنا...',
      en: 'Write your message here...',
    },
    send: { ar: 'إرسال الرسالة', en: 'Send Message' },
    sending: { ar: 'جارٍ الإرسال...', en: 'Sending...' },
    successMsg: {
      ar: 'تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.',
      en: 'Message sent successfully! We will get back to you shortly.',
    },
    required: { ar: 'هذا الحقل مطلوب', en: 'This field is required' },
    invalidEmail: {
      ar: 'يرجى إدخال بريد إلكتروني صحيح',
      en: 'Please enter a valid email address',
    },
    contactInfo: { ar: 'معلومات التواصل', en: 'Contact Information' },
    faqTitle: { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  }

  const validate = () => {
    const newErrors: Partial<FormState> = {}
    if (!form.name.trim()) newErrors.name = t.required[lang]
    if (!form.email.trim()) newErrors.email = t.required[lang]
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t.invalidEmail[lang]
    if (!form.subject) newErrors.subject = t.required[lang]
    if (!form.message.trim()) newErrors.message = t.required[lang]
    return newErrors
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

  const contactCards = [
    {
      icon: '📧',
      label: { ar: 'البريد الإلكتروني', en: 'Email' },
      value: 'support@mediconnect.com',
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      icon: '📞',
      label: { ar: 'الهاتف', en: 'Phone' },
      value: '+966 11 234 5678',
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      icon: '🕐',
      label: { ar: 'ساعات العمل', en: 'Working Hours' },
      value: lang === 'ar' ? 'السبت-الخميس 8 ص - 8 م' : 'Sat–Thu 8 AM – 8 PM',
      color: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100',
    },
    {
      icon: '📍',
      label: { ar: 'العنوان', en: 'Address' },
      value:
        lang === 'ar'
          ? 'الرياض، المملكة العربية السعودية'
          : 'Riyadh, Saudi Arabia',
      color: 'bg-purple-50 border-purple-200',
      iconBg: 'bg-purple-100',
    },
  ]

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h1 className="text-4xl font-bold mb-3">{t.title[lang]}</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">{t.subtitle[lang]}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Contact Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{t.formTitle[lang]}</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                  ✅
                </div>
                <p className="text-green-700 font-semibold text-base">{t.successMsg[lang]}</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-primary underline underline-offset-2 hover:no-underline"
                >
                  {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.name[lang]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.namePlaceholder[lang]}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.email[lang]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t.emailPlaceholder[lang]}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.subject[lang]} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors bg-white ${
                      errors.subject
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400 text-slate-400'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                    } ${!form.subject ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    <option value="" disabled>
                      {t.subjectPlaceholder[lang]}
                    </option>
                    {subjectOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt[lang]}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.message[lang]} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t.messagePlaceholder[lang]}
                    rows={5}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.message
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-depth-primary w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.sending[lang]}
                    </>
                  ) : (
                    <>
                      <span>✉️</span>
                      {t.send[lang]}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT — Contact info + FAQ */}
          <div className="flex flex-col gap-6">
            {/* Contact info cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">{t.contactInfo[lang]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contactCards.map((card, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${card.color}`}
                  >
                    <div
                      className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">
                        {card.label[lang]}
                      </p>
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ accordion */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">{t.faqTitle[lang]}</h2>
              <div className="space-y-2">
                {faqItems.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border transition-colors ${
                      openFaq === i
                        ? 'border-primary/30 bg-primary/3'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-start"
                    >
                      <span
                        className={`text-sm font-semibold ${
                          openFaq === i ? 'text-primary' : 'text-slate-700'
                        }`}
                      >
                        {item.q[lang]}
                      </span>
                      <span
                        className={`flex-shrink-0 text-base transition-transform duration-200 ${
                          openFaq === i ? 'rotate-180 text-primary' : 'text-slate-400'
                        }`}
                      >
                        ▾
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{item.a[lang]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
