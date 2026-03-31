'use client'
import { useState, useEffect } from 'react'

interface Props {
  doctor: {
    name: { ar: string; en: string }
    avatar: string
  }
  lang: 'ar' | 'en'
  onClose: () => void
}

export default function VideoCallUI({ doctor, lang, onClose }: Props) {
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const t = {
    you: { ar: 'أنت', en: 'You' },
    connected: { ar: 'متصل - جودة ممتازة', en: 'Connected - Excellent Quality' },
    mute: { ar: 'كتم الصوت', en: 'Mute' },
    unmute: { ar: 'تشغيل الصوت', en: 'Unmute' },
    camOff: { ar: 'إيقاف الكاميرا', en: 'Turn Off Camera' },
    camOn: { ar: 'تشغيل الكاميرا', en: 'Turn On Camera' },
    endCall: { ar: 'إنهاء المكالمة', en: 'End Call' },
    chat: { ar: 'المحادثة', en: 'Chat' },
    share: { ar: 'مشاركة الشاشة', en: 'Share Screen' },
    hd: { ar: 'HD', en: 'HD' },
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
    >
      {/* Main call window */}
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[700px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">

        {/* Doctor video area (main, ~75% height) */}
        <div className="relative h-[75%] flex items-center justify-center">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 40%, #1d4ed840 0%, transparent 60%), radial-gradient(circle at 70% 60%, #06b6d430 0%, transparent 60%)',
            }}
          />

          {/* Doctor avatar */}
          <div className="relative flex flex-col items-center gap-4 z-10">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-6xl border-4 border-white/20 shadow-2xl">
              {doctor.avatar}
            </div>
          </div>

          {/* Doctor name overlay (bottom of video) */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl">
              <span className="text-white font-semibold text-sm">{doctor.name[lang]}</span>
            </div>
            {/* HD badge */}
            <div className="bg-accent/80 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {t.hd[lang]}
            </div>
          </div>

          {/* Call duration */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <span className="text-white font-mono text-sm font-semibold tracking-widest">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Connection status bar */}
        <div className="flex items-center justify-center gap-2 py-2 bg-black/30 border-t border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">{t.connected[lang]}</span>
        </div>

        {/* Patient PiP (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-24 h-32 bg-slate-700 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg flex flex-col items-center justify-center gap-1">
          <span className="text-3xl">{cameraOff ? '🚫' : '📷'}</span>
          <span className="text-white text-xs font-medium">{t.you[lang]}</span>
        </div>

        {/* Control bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 py-5 px-4 bg-gradient-to-t from-black/80 to-transparent">

          {/* Mute */}
          <button
            onClick={() => setMuted((m) => !m)}
            title={muted ? t.unmute[lang] : t.mute[lang]}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${
              muted
                ? 'bg-red-500/80 text-white border border-red-400/50'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            {muted ? '🔇' : '🎤'}
          </button>

          {/* Camera */}
          <button
            onClick={() => setCameraOff((c) => !c)}
            title={cameraOff ? t.camOn[lang] : t.camOff[lang]}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${
              cameraOff
                ? 'bg-red-500/80 text-white border border-red-400/50'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            {cameraOff ? '📷' : '📹'}
          </button>

          {/* End call */}
          <button
            onClick={onClose}
            title={t.endCall[lang]}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl flex items-center justify-center shadow-lg border-4 border-red-400/50 transition-all hover:scale-110 active:scale-90"
          >
            🔴
          </button>

          {/* Chat */}
          <button
            title={t.chat[lang]}
            className="w-12 h-12 rounded-full bg-white/10 text-white text-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
          >
            💬
          </button>

          {/* Screen share */}
          <button
            title={t.share[lang]}
            className="w-12 h-12 rounded-full bg-white/10 text-white text-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
          >
            🖥️
          </button>
        </div>
      </div>
    </div>
  )
}
