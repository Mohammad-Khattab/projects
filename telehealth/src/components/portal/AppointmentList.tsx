'use client'
import { useState } from 'react'
import Link from 'next/link'
import VideoCallUI from './VideoCallUI'

interface Appointment {
  id: string
  doctorName: { ar: string; en: string }
  specialty: { ar: string; en: string }
  date: string
  time: string
  type: 'video' | 'inperson'
  avatar: string
  status: 'upcoming' | 'past'
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: { ar: 'د. سارة ميتشيل', en: 'Dr. Sarah Mitchell' },
    specialty: { ar: 'أمراض القلب', en: 'Cardiology' },
    date: '2026-04-05',
    time: '10:00 AM',
    type: 'video',
    avatar: '👨‍⚕️',
    status: 'upcoming',
  },
  {
    id: '2',
    doctorName: { ar: 'د. جيمس أوكافور', en: 'Dr. James Okafor' },
    specialty: { ar: 'طب الأعصاب', en: 'Neurology' },
    date: '2026-04-12',
    time: '2:30 PM',
    type: 'inperson',
    avatar: '👩‍⚕️',
    status: 'upcoming',
  },
  {
    id: '3',
    doctorName: { ar: 'د. بريا شارما', en: 'Dr. Priya Sharma' },
    specialty: { ar: 'الأمراض الجلدية', en: 'Dermatology' },
    date: '2026-03-15',
    time: '11:00 AM',
    type: 'video',
    avatar: '👨‍⚕️',
    status: 'past',
  },
  {
    id: '4',
    doctorName: { ar: 'د. أحمد الرشيدي', en: 'Dr. Ahmad Al-Rashidi' },
    specialty: { ar: 'جراحة العظام', en: 'Orthopedics' },
    date: '2026-03-01',
    time: '9:00 AM',
    type: 'inperson',
    avatar: '👩‍⚕️',
    status: 'past',
  },
]

interface Props {
  lang: 'ar' | 'en'
  type: 'upcoming' | 'past'
}

function formatDate(dateStr: string, lang: 'ar' | 'en') {
  const date = new Date(dateStr)
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AppointmentList({ lang, type }: Props) {
  const [videoCall, setVideoCall] = useState<Appointment | null>(null)
  const [cancelled, setCancelled] = useState<Set<string>>(new Set())

  const filtered = mockAppointments.filter(
    (a) => a.status === type && !cancelled.has(a.id)
  )

  const t = {
    noUpcoming: { ar: 'لا توجد مواعيد قادمة', en: 'No upcoming appointments' },
    noPast: { ar: 'لا توجد مواعيد سابقة', en: 'No past appointments' },
    video: { ar: 'فيديو', en: 'Video' },
    inperson: { ar: 'حضوري', en: 'In-Person' },
    join: { ar: 'انضم للمكالمة', en: 'Join Call' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    bookAgain: { ar: 'احجز مجدداً', en: 'Book Again' },
    upcoming: { ar: 'قادم', en: 'Upcoming' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    at: { ar: 'الساعة', en: 'at' },
    confirmCancel: {
      ar: 'هل أنت متأكد من إلغاء هذا الموعد؟',
      en: 'Are you sure you want to cancel this appointment?',
    },
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">{type === 'upcoming' ? '📅' : '📋'}</span>
        <p className="text-slate-500 text-lg">
          {type === 'upcoming' ? t.noUpcoming[lang] : t.noPast[lang]}
        </p>
      </div>
    )
  }

  return (
    <>
      {videoCall && (
        <VideoCallUI
          doctor={{ name: videoCall.doctorName, avatar: videoCall.avatar }}
          lang={lang}
          onClose={() => setVideoCall(null)}
        />
      )}
      <div className="space-y-4">
        {filtered.map((appt) => (
          <div
            key={appt.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100">
                {appt.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {appt.doctorName[lang]}
                    </h3>
                    <p className="text-slate-500 text-sm">{appt.specialty[lang]}</p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                      type === 'upcoming'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {type === 'upcoming' ? t.upcoming[lang] : t.completed[lang]}
                  </span>
                </div>

                {/* Date / time / type row */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span>📅</span>
                    {formatDate(appt.date, lang)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span>🕐</span>
                    {t.at[lang]} {appt.time}
                  </span>

                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      appt.type === 'video'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {appt.type === 'video' ? '📹' : '🏥'}{' '}
                    {appt.type === 'video' ? t.video[lang] : t.inperson[lang]}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {type === 'upcoming' ? (
                    <>
                      {appt.type === 'video' && (
                        <button
                          onClick={() => setVideoCall(appt)}
                          className="btn-depth-primary bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          {t.join[lang]}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(t.confirmCancel[lang])) {
                            setCancelled((prev) => new Set(prev).add(appt.id))
                          }
                        }}
                        className="text-sm font-medium px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t.cancel[lang]}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/book"
                      className="btn-depth-primary bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      {t.bookAgain[lang]}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
