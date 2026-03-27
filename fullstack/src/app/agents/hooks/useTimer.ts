'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { TimerState } from '../types'

const DURATIONS = { work: 25 * 60, 'short-break': 5 * 60, 'long-break': 15 * 60 }

function nextMode(current: TimerState['mode'], sessions: number): TimerState['mode'] {
  if (current !== 'work') return 'work'
  return sessions % 4 === 0 ? 'long-break' : 'short-break'
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    mode: 'work',
    remaining: DURATIONS.work,
    running: false,
    sessions: 0,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.remaining > 1) return { ...prev, remaining: prev.remaining - 1 }
          // Session complete — auto-advance mode
          const sessions = prev.mode === 'work' ? prev.sessions + 1 : prev.sessions
          const mode = nextMode(prev.mode, sessions)
          return { mode, remaining: DURATIONS[mode], running: false, sessions }
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state.running])

  const toggle = useCallback(() => setState(p => ({ ...p, running: !p.running })), [])

  const skip = useCallback(() => setState(prev => {
    const sessions = prev.mode === 'work' ? prev.sessions + 1 : prev.sessions
    const mode = nextMode(prev.mode, sessions)
    return { mode, remaining: DURATIONS[mode], running: false, sessions }
  }), [])

  const reset = useCallback(() => setState({
    mode: 'work', remaining: DURATIONS.work, running: false, sessions: 0
  }), [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const progress = 1 - state.remaining / DURATIONS[state.mode]
  const modeLabel = { work: 'Deep Work', 'short-break': 'Short Break', 'long-break': 'Long Break' }[state.mode]

  return { ...state, toggle, skip, reset, formatTime, progress, modeLabel }
}
