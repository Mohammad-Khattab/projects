'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/LangContext'
import { analyzeSymptoms, SymptomResult } from '@/lib/symptom-engine'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  result?: SymptomResult
  timestamp: Date
}

const CONFIDENCE_COLORS = [
  { min: 75, bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' },
  { min: 50, bg: 'bg-primary', text: 'text-primary', light: 'bg-blue-50' },
  { min: 0,  bg: 'bg-amber-400', text: 'text-amber-700', light: 'bg-amber-50' },
]

function getConfidenceColor(confidence: number) {
  return CONFIDENCE_COLORS.find(c => confidence >= c.min) ?? CONFIDENCE_COLORS[2]
}

export default function ChatBot() {
  const { lang, isRTL } = useLang()

  const welcomeText = lang === 'ar'
    ? 'مرحباً! أنا مساعدك الطبي الذكي. أخبرني عن أعراضك وسأساعدك في تحديد التخصص الطبي المناسب.'
    : 'Hello! I\'m your AI medical assistant. Tell me about your symptoms and I\'ll help identify the right medical specialty for you.'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: welcomeText,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Update welcome message when lang changes
  useEffect(() => {
    setMessages(prev => {
      const updated = [...prev]
      if (updated[0]?.id === 'welcome') {
        updated[0] = {
          ...updated[0],
          content: lang === 'ar'
            ? 'مرحباً! أنا مساعدك الطبي الذكي. أخبرني عن أعراضك وسأساعدك في تحديد التخصص الطبي المناسب.'
            : 'Hello! I\'m your AI medical assistant. Tell me about your symptoms and I\'ll help identify the right medical specialty for you.',
        }
      }
      return updated
    })
  }, [lang])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const result = analyzeSymptoms(text)
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: lang === 'ar'
          ? 'بناءً على أعراضك، قد يكون لديك:'
          : 'Based on your symptoms, you may have:',
        result,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 800)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary to-primary-dark text-white shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🤖</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {lang === 'ar' ? 'المساعد الطبي الذكي' : 'AI Medical Assistant'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-blue-100">
              {lang === 'ar' ? 'متاح الآن' : 'Online now'}
            </span>
          </div>
        </div>
        <div className="text-xs text-blue-100 bg-white/10 rounded-lg px-2.5 py-1">
          {lang === 'ar' ? 'للإرشاد فقط' : 'Guidance only'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? (isRTL ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold
              ${msg.role === 'bot' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {msg.role === 'bot' ? '🤖' : '👤'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-surface text-body border border-border/60 rounded-tl-sm'
                }`}>
                <p>{msg.content}</p>

                {/* Result card */}
                {msg.result && (
                  <div className="mt-3 space-y-2.5">
                    {msg.result.conditions.map((cond, i) => {
                      const col = getConfidenceColor(cond.confidence)
                      return (
                        <div key={i} className={`rounded-xl p-3 ${col.light} border border-black/5`}>
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className={`font-semibold text-xs ${col.text}`}>
                              {cond.name[lang]}
                            </span>
                            <span className={`text-xs font-bold ${col.text}`}>{cond.confidence}%</span>
                          </div>
                          {/* Confidence bar */}
                          <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${col.bg}`}
                              style={{ width: `${cond.confidence}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-muted">
                            {lang === 'ar' ? 'التخصص: ' : 'Specialty: '}
                            <span className="font-medium text-body">{cond.specialty[lang]}</span>
                          </p>
                        </div>
                      )
                    })}

                    {/* Recommended + CTA */}
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-xs text-muted mb-2">
                        {lang === 'ar' ? 'التخصص الموصى به:' : 'Recommended Specialty:'}
                        {' '}
                        <span className="font-bold text-primary">{msg.result.topSpecialty[lang]}</span>
                      </p>
                      <Link
                        href={`/book?specialty=${msg.result.topSpecialtyKey}`}
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg btn-depth-primary"
                      >
                        {lang === 'ar'
                          ? `← احجز مع طبيب ${msg.result.topSpecialty[lang]}`
                          : `Book with a ${msg.result.topSpecialty[lang]} Doctor →`}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">🤖</div>
            <div className="bg-surface border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    style={{
                      animation: 'typing 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-white shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            rows={1}
            placeholder={
              lang === 'ar'
                ? 'اكتب أعراضك هنا... (مثال: لدي صداع شديد ودوخة)'
                : 'Describe your symptoms... (e.g. I have a severe headache and dizziness)'
            }
            className="flex-1 resize-none rounded-xl border border-border px-4 py-2.5 text-sm text-body placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition disabled:opacity-50 disabled:bg-surface max-h-32"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center btn-depth-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label={lang === 'ar' ? 'إرسال' : 'Send'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: isRTL ? 'scaleX(-1)' : undefined }}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted mt-2 text-center">
          {lang === 'ar' ? 'اضغط Enter للإرسال · Shift+Enter لسطر جديد' : 'Press Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
