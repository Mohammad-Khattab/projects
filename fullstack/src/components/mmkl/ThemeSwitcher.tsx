'use client'

import { useEffect, useRef, useState } from 'react'
import { THEMES, type MmklTheme } from '@/data/mmkl'

const STORAGE_KEY = 'mmkl-theme'

interface ThemeSwitcherProps {
  theme: string
  onThemeChange: (name: string) => void
}

export default function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function select(t: MmklTheme) {
    onThemeChange(t.name)
    setTimeout(() => setOpen(false), 280)
  }

  return (
    <div className="mmkl-theme-sw" ref={ref}>
      {open && (
        <div className="mmkl-theme-panel open">
          <div className="mmkl-tp-label">Color Theme</div>
          {THEMES.map(t => (
            <div
              key={t.name}
              className={`mmkl-tp-opt${theme === t.name ? ' active' : ''}`}
              onClick={() => select(t)}
            >
              <div className="mmkl-tp-dot" style={{ background: t.color, color: t.color }} />
              <div>
                <div className="mmkl-tp-name">{t.label}</div>
                <div className="mmkl-tp-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="mmkl-theme-btn"
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        aria-label="Change color theme"
      >
        ◑
      </button>
    </div>
  )
}

/** Apply theme CSS vars to .mmkl-root and persist to localStorage */
export function applyTheme(name: string) {
  const t = THEMES.find(t => t.name === name)
  if (!t) return
  const root = document.querySelector('.mmkl-root') as HTMLElement | null ?? document.documentElement
  Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  try { localStorage.setItem(STORAGE_KEY, name) } catch {}
}

/** Read saved theme from localStorage (safe for SSR) */
export function getSavedTheme(): string {
  if (typeof window === 'undefined') return 'bone'
  try { return localStorage.getItem(STORAGE_KEY) || 'bone' } catch { return 'bone' }
}
