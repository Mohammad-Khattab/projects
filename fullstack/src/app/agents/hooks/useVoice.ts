'use client'
import { useState, useRef, useCallback } from 'react'
import { getToday } from '../lib/utils'
import type { ParsedTask } from '../types'

export type VoiceState = 'idle' | 'recording' | 'processing' | 'preview' | 'error'

export function useVoice() {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedTask | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startRecording = useCallback(() => {
    if (!isSupported) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    let finalText = ''

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('')
      finalText = text
      setTranscript(text)
    }

    recognition.onend = async () => {
      if (!finalText.trim()) { setState('idle'); return }
      setState('processing')
      try {
        const res = await fetch('/api/voice-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: finalText, today: getToday() }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Parse failed')
        }
        const data: ParsedTask = await res.json()
        setParsed(data)
        setState('preview')
      } catch (e) {
        setError(String(e))
        setState('error')
      }
    }

    recognition.onerror = (e: any) => {
      setError(`Mic error: ${e.error}`)
      setState('error')
    }

    recognitionRef.current = recognition
    recognition.start()
    setState('recording')
    setTranscript('')
    setError(null)
  }, [isSupported])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggleRecording = useCallback(() => {
    if (state === 'recording') stopRecording()
    else startRecording()
  }, [state, startRecording, stopRecording])

  const dismiss = useCallback(() => {
    setState('idle')
    setTranscript('')
    setParsed(null)
    setError(null)
  }, [])

  return { state, transcript, parsed, error, isSupported, toggleRecording, dismiss }
}
