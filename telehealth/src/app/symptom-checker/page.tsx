'use client'
import ChatBot from '@/components/symptom-checker/ChatBot'
import { useLang } from '@/lib/i18n/LangContext'

const EXAMPLE_SYMPTOMS = [
  { ar: 'ألم في الصدر وضيق التنفس', en: 'Chest pain and shortness of breath' },
  { ar: 'صداع شديد ودوخة', en: 'Severe headache and dizziness' },
  { ar: 'طفح جلدي وحكة', en: 'Skin rash and itching' },
  { ar: 'ألم في المفاصل وصعوبة في الحركة', en: 'Joint pain and difficulty moving' },
  { ar: 'قلق وأرق واضطراب في النوم', en: 'Anxiety, insomnia and sleep disturbance' },
  { ar: 'غثيان وألم في البطن', en: 'Nausea and abdominal pain' },
]

export default function SymptomCheckerPage() {
  const { lang, isRTL } = useLang()

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-accent/80 text-white">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10 animate-grid"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Orbs */}
        <div className="absolute top-6 right-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-orb" />
        <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" style={{ animation: 'floatOrb 8s ease-in-out infinite', animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {lang === 'ar' ? 'مدقق الأعراض الذكي' : 'AI Symptom Checker'}
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed mb-6">
            {lang === 'ar'
              ? 'صف أعراضك باللغة العربية أو الإنجليزية وسنحللها فوراً لمساعدتك في اختيار التخصص الطبي المناسب'
              : 'Describe your symptoms in Arabic or English and we\'ll analyze them instantly to help you find the right medical specialty'}
          </p>

          {/* Disclaimer badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 rounded-xl px-4 py-2.5 text-sm text-amber-100">
            <svg className="w-4 h-4 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>
              {lang === 'ar'
                ? 'هذه الأداة للإرشاد فقط وليست بديلاً عن الاستشارة الطبية المتخصصة'
                : 'This tool is for guidance only and is not a substitute for professional medical advice'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: '🏥', value: '10+', label: lang === 'ar' ? 'تخصص طبي' : 'Medical Specialties' },
              { icon: '⚡', value: lang === 'ar' ? 'فوري' : 'Instant', label: lang === 'ar' ? 'تحليل الأعراض' : 'Symptom Analysis' },
              { icon: '🌐', value: lang === 'ar' ? 'ثنائي' : 'Bilingual', label: lang === 'ar' ? 'عربي وإنجليزي' : 'Arabic & English' },
              { icon: '🔒', value: '100%', label: lang === 'ar' ? 'خصوصية' : 'Private' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{stat.icon}</span>
                <span className="font-bold text-primary">{stat.value}</span>
                <span className="text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* ChatBot */}
        <div className="animate-fade-up">
          <ChatBot />
        </div>

        {/* Tips / example symptoms */}
        <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="font-semibold text-body">
                {lang === 'ar' ? 'أمثلة على الأعراض التي يمكن تجربتها' : 'Example symptoms you can try'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXAMPLE_SYMPTOMS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border/60 text-sm text-muted hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-body/80">{s[lang]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-semibold text-body mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {lang === 'ar' ? 'كيف يعمل مدقق الأعراض؟' : 'How does the Symptom Checker work?'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  icon: '✍️',
                  title: { ar: 'صف أعراضك', en: 'Describe Symptoms' },
                  desc: { ar: 'اكتب ما تشعر به بكلماتك الخاصة باللغة العربية أو الإنجليزية', en: 'Write what you feel in your own words in Arabic or English' },
                },
                {
                  step: '02',
                  icon: '🧠',
                  title: { ar: 'تحليل ذكي', en: 'Smart Analysis' },
                  desc: { ar: 'يحلل النظام أعراضك ويقارنها بآلاف الحالات الطبية', en: 'The system analyzes your symptoms against thousands of medical cases' },
                },
                {
                  step: '03',
                  icon: '📋',
                  title: { ar: 'توصية التخصص', en: 'Specialty Recommendation' },
                  desc: { ar: 'تحصل على قائمة بالحالات المحتملة والتخصص الطبي المناسب', en: 'Get a list of possible conditions and the right medical specialty' },
                },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-surface">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xs font-mono text-accent font-bold mb-1">{item.step}</div>
                  <h3 className="font-semibold text-sm text-body mb-1">{item.title[lang]}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.desc[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
