'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n/LangContext'
import AppointmentList from '@/components/portal/AppointmentList'
import VideoCallUI from '@/components/portal/VideoCallUI'

type MainTab = 'appointments' | 'chat' | 'records'
type ApptSubTab = 'upcoming' | 'past'

interface ChatDoctor {
  id: string
  name: { ar: string; en: string }
  avatar: string
  specialty: { ar: string; en: string }
  lastMessage: { ar: string; en: string }
  time: string
}

interface Message {
  id: string
  from: 'me' | 'doctor'
  text: { ar: string; en: string }
  time: string
}

const chatDoctors: ChatDoctor[] = [
  {
    id: 'doc1',
    name: { ar: 'د. سارة ميتشيل', en: 'Dr. Sarah Mitchell' },
    avatar: '👩‍⚕️',
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
    lastMessage: {
      ar: 'نتائج التحاليل تبدو جيدة، سنتحدث في الموعد القادم.',
      en: 'Test results look good, we will discuss at the next appointment.',
    },
    time: '10:24 ص',
  },
  {
    id: 'doc2',
    name: { ar: 'د. جيمس أوكافور', en: 'Dr. James Okafor' },
    avatar: '👨‍⚕️',
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
    lastMessage: {
      ar: 'هل استمررت في أخذ الدواء بانتظام؟',
      en: 'Have you been taking the medication regularly?',
    },
    time: 'أمس',
  },
  {
    id: 'doc3',
    name: { ar: 'د. بريا شارما', en: 'Dr. Priya Sharma' },
    avatar: '👩‍⚕️',
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    lastMessage: {
      ar: 'استخدم الكريم مرتين يومياً كما وصفت لك.',
      en: 'Use the cream twice daily as prescribed.',
    },
    time: '3 أيام',
  },
]

const initialMessages: Record<string, Message[]> = {
  doc1: [
    {
      id: 'm1',
      from: 'doctor',
      text: {
        ar: 'مرحباً محمد، كيف حالك اليوم؟',
        en: 'Hello Mohammed, how are you feeling today?',
      },
      time: '10:00 ص',
    },
    {
      id: 'm2',
      from: 'me',
      text: {
        ar: 'أشعر بتحسن ملحوظ الحمد لله.',
        en: 'I am feeling much better, thank God.',
      },
      time: '10:05 ص',
    },
    {
      id: 'm3',
      from: 'doctor',
      text: {
        ar: 'نتائج التحاليل تبدو جيدة، سنتحدث في الموعد القادم.',
        en: 'Test results look good, we will discuss at the next appointment.',
      },
      time: '10:24 ص',
    },
  ],
  doc2: [
    {
      id: 'm4',
      from: 'doctor',
      text: {
        ar: 'هل استمررت في أخذ الدواء بانتظام؟',
        en: 'Have you been taking the medication regularly?',
      },
      time: 'أمس',
    },
    {
      id: 'm5',
      from: 'me',
      text: {
        ar: 'نعم، أتناوله كل يوم كما أوصيت.',
        en: 'Yes, I take it every day as you advised.',
      },
      time: 'أمس',
    },
  ],
  doc3: [
    {
      id: 'm6',
      from: 'doctor',
      text: {
        ar: 'استخدم الكريم مرتين يومياً كما وصفت لك.',
        en: 'Use the cream twice daily as prescribed.',
      },
      time: '3 أيام',
    },
  ],
}

const medicalRecords = [
  {
    icon: '🩸',
    label: { ar: 'فصيلة الدم', en: 'Blood Type' },
    value: { ar: 'A+', en: 'A+' },
    color: 'from-red-50 to-red-100 border-red-200',
    textColor: 'text-red-700',
  },
  {
    icon: '📅',
    label: { ar: 'آخر زيارة', en: 'Last Visit' },
    value: { ar: '15 مارس 2026', en: 'March 15, 2026' },
    color: 'from-blue-50 to-blue-100 border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    icon: '⚠️',
    label: { ar: 'الحساسية', en: 'Allergies' },
    value: { ar: 'البنسلين، الغبار', en: 'Penicillin, Dust' },
    color: 'from-amber-50 to-amber-100 border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    icon: '💊',
    label: { ar: 'الأدوية الحالية', en: 'Current Medications' },
    value: { ar: 'أسبرين 100 ملغ، ليبيتور 20 ملغ', en: 'Aspirin 100mg, Lipitor 20mg' },
    color: 'from-green-50 to-green-100 border-green-200',
    textColor: 'text-green-700',
  },
  {
    icon: '📏',
    label: { ar: 'الوزن / الطول', en: 'Weight / Height' },
    value: { ar: '78 كغ / 175 سم', en: '78 kg / 175 cm' },
    color: 'from-purple-50 to-purple-100 border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    icon: '🫀',
    label: { ar: 'ضغط الدم', en: 'Blood Pressure' },
    value: { ar: '120/80 ملم زئبق', en: '120/80 mmHg' },
    color: 'from-cyan-50 to-cyan-100 border-cyan-200',
    textColor: 'text-cyan-700',
  },
]

export default function PortalPage() {
  const { lang, isRTL } = useLang()
  const [activeTab, setActiveTab] = useState<MainTab>('appointments')
  const [apptSubTab, setApptSubTab] = useState<ApptSubTab>('upcoming')
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [videoCallDoctor, setVideoCallDoctor] = useState<{ name: { ar: string; en: string }; avatar: string } | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string>('doc1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [chatInput, setChatInput] = useState('')

  const t = {
    welcome: { ar: 'مرحباً، محمد! 👋', en: 'Welcome, Mohammed! 👋' },
    subtitle: {
      ar: 'إليك ملخص حالتك الصحية اليوم',
      en: 'Here is your health summary for today',
    },
    tabs: {
      appointments: { ar: 'المواعيد', en: 'Appointments' },
      chat: { ar: 'المحادثة', en: 'Chat' },
      records: { ar: 'السجلات', en: 'Records' },
    },
    upcoming: { ar: 'القادمة', en: 'Upcoming' },
    past: { ar: 'السابقة', en: 'Past' },
    typeMessage: { ar: 'اكتب رسالتك...', en: 'Type your message...' },
    send: { ar: 'إرسال', en: 'Send' },
    medicalRecords: { ar: 'السجلات الطبية', en: 'Medical Records' },
    recordsSubtitle: {
      ar: 'معلوماتك الطبية المحفوظة',
      en: 'Your saved medical information',
    },
    selectDoctor: { ar: 'اختر طبيبًا للمحادثة', en: 'Select a doctor to chat' },
  }

  const mainTabs: { key: MainTab; icon: string }[] = [
    { key: 'appointments', icon: '📅' },
    { key: 'chat', icon: '💬' },
    { key: 'records', icon: '📋' },
  ]

  const sendMessage = () => {
    const text = chatInput.trim()
    if (!text) return
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      from: 'me',
      text: { ar: text, en: text },
      time: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setMessages((prev) => ({
      ...prev,
      [selectedDoctor]: [...(prev[selectedDoctor] || []), newMsg],
    }))
    setChatInput('')
    // Mock doctor reply after 1.2 seconds
    setTimeout(() => {
      const replies: Message['text'][] = [
        { ar: 'شكراً على رسالتك، سأراجعها وأرد عليك قريباً.', en: 'Thank you for your message, I will review it and get back to you shortly.' },
        { ar: 'فهمت، هل هناك أي أعراض أخرى تودّ إضافتها؟', en: 'I understand, are there any other symptoms you would like to add?' },
        { ar: 'حسناً، دعنا نتناقش في موعدنا القادم.', en: 'Alright, let us discuss this at our next appointment.' },
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      const doctorMsg: Message = {
        id: `m-${Date.now()}-r`,
        from: 'doctor',
        text: reply,
        time: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages((prev) => ({
        ...prev,
        [selectedDoctor]: [...(prev[selectedDoctor] || []), doctorMsg],
      }))
    }, 1200)
  }

  const activeDoctor = chatDoctors.find((d) => d.id === selectedDoctor)!
  const activeMsgs = messages[selectedDoctor] || []

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Video call overlay */}
      {showVideoCall && videoCallDoctor && (
        <VideoCallUI
          doctor={videoCallDoctor}
          lang={lang}
          onClose={() => { setShowVideoCall(false); setVideoCallDoctor(null) }}
        />
      )}

      {/* Page header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-1">{t.welcome[lang]}</h1>
          <p className="text-white/70 text-base">{t.subtitle[lang]}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-8 w-fit">
          {mainTabs.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{icon}</span>
              <span>{t.tabs[key][lang]}</span>
            </button>
          ))}
        </div>

        {/* Appointments tab */}
        {activeTab === 'appointments' && (
          <div>
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
              {(['upcoming', 'past'] as ApptSubTab[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setApptSubTab(sub)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    apptSubTab === sub
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {sub === 'upcoming' ? t.upcoming[lang] : t.past[lang]}
                </button>
              ))}
            </div>
            <AppointmentList lang={lang} type={apptSubTab} />
          </div>
        )}

        {/* Chat tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[560px]">
            {/* Doctor list */}
            <div className="w-64 flex-shrink-0 border-e border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {t.selectDoctor[lang]}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`w-full text-start p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                      selectedDoctor === doc.id ? 'bg-primary/5 border-e-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl flex-shrink-0">
                        {doc.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 text-sm truncate">
                            {doc.name[lang]}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0 ms-1">
                            {doc.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {doc.specialty[lang]}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-1 line-clamp-1">
                          {doc.lastMessage[lang]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl">
                  {activeDoctor.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{activeDoctor.name[lang]}</p>
                  <p className="text-xs text-slate-500">{activeDoctor.specialty[lang]}</p>
                </div>
                <div className="ms-auto flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-600 font-medium">
                    {lang === 'ar' ? 'متصل' : 'Online'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeMsgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.from === 'doctor' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-base flex-shrink-0">
                        {activeDoctor.avatar}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.from === 'me'
                          ? 'bg-primary text-white rounded-ee-md'
                          : 'bg-slate-100 text-slate-800 rounded-es-md'
                      }`}
                    >
                      <p>{msg.text[lang]}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.from === 'me' ? 'text-white/60' : 'text-slate-400'
                        } text-end`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t.typeMessage[lang]}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    onClick={sendMessage}
                    className="btn-depth-primary bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {t.send[lang]}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Records tab */}
        {activeTab === 'records' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">{t.medicalRecords[lang]}</h2>
              <p className="text-slate-500 text-sm mt-1">{t.recordsSubtitle[lang]}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicalRecords.map((rec, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${rec.color} border rounded-2xl p-5 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{rec.icon}</span>
                    <span className={`text-sm font-semibold ${rec.textColor}`}>
                      {rec.label[lang]}
                    </span>
                  </div>
                  <p className={`text-base font-bold ${rec.textColor}`}>{rec.value[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
