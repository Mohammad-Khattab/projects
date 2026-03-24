'use client'

import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '@/data/mmkl'
import WaveGrid from './WaveGrid'
import RefreshLoader from './RefreshLoader'
import StartScreen from './StartScreen'
import DashboardNav from './DashboardNav'
import CategorySection from './CategorySection'
import Footer from './Footer'
import ThemeSwitcher, { applyTheme, getSavedTheme } from './ThemeSwitcher'

const HIDDEN_KEY = 'mmkl-hidden'

function getHidden(): string[] {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]') } catch { return [] }
}
function saveHidden(ids: string[]) {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids)) } catch {}
}

export default function MmklDashboard() {
  const [loaderDone,  setLoaderDone]  = useState(false)
  const [startHidden, setStartHidden] = useState(false)
  const [startZoom,   setStartZoom]   = useState(false)
  const [dashVisible, setDashVisible] = useState(false)
  const [hiddenIds,   setHiddenIds]   = useState<string[]>([])
  const [theme,       setThemeState]  = useState('bone')
  const dashRef = useRef<HTMLDivElement>(null)
  const heroH1Ref = useRef<HTMLHeadingElement>(null)

  // Restore theme + hidden cards from localStorage on mount
  useEffect(() => {
    const saved = getSavedTheme()
    setThemeState(saved)
    applyTheme(saved)
    setHiddenIds(getHidden())
  }, [])

  // Refresh loader
  useEffect(() => {
    const id = setTimeout(() => setLoaderDone(true), 1600)
    return () => clearTimeout(id)
  }, [])

  // Apply theme CSS vars whenever theme changes
  function handleThemeChange(name: string) {
    setThemeState(name)
    applyTheme(name)
  }

  // Enter dashboard transition
  function enterDash() {
    setStartZoom(true)
    setTimeout(() => {
      setStartHidden(true)
      setDashVisible(true)
      const dash = dashRef.current
      if (dash) {
        dash.classList.add('entering')
        dash.addEventListener('animationend', () => dash.classList.remove('entering'), { once: true })
      }
    }, 650)
  }

  // Hide a card
  function removeCard(id: string) {
    setHiddenIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id]
      saveHidden(next)
      return next
    })
  }

  // Restore all cards
  function restoreAll() {
    setHiddenIds([])
    saveHidden([])
  }

  // Mouse parallax on hero + bg orbs
  useEffect(() => {
    const orbDefs = [
      { w: 520, h: 520, left: '8%',  top: '12%', speed: 22 },
      { w: 380, h: 380, left: '72%', top: '38%', speed: 32 },
      { w: 260, h: 260, left: '42%', top: '68%', speed: 14 },
    ]

    const dash = dashRef.current
    if (!dash) return

    const orbs = orbDefs.map(d => {
      const orb = document.createElement('div') as HTMLDivElement & { _speed: number }
      orb.className = 'mmkl-bg-orb'
      orb.style.cssText = `width:${d.w}px;height:${d.h}px;left:${d.left};top:${d.top};transform:translate(-50%,-50%)`
      orb._speed = d.speed
      dash.insertBefore(orb, dash.firstChild)
      return orb
    })

    function onMove(e: MouseEvent) {
      const mx = e.clientX / window.innerWidth  - 0.5
      const my = e.clientY / window.innerHeight - 0.5
      orbs.forEach(orb => {
        orb.style.transform = `translate(calc(-50% + ${mx * orb._speed}px), calc(-50% + ${my * orb._speed}px))`
      })
      if (heroH1Ref.current) {
        heroH1Ref.current.style.transform = `translate(${mx * 16}px, ${my * 8}px)`
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      orbs.forEach(o => o.remove())
    }
  }, [])

  return (
    <>
      {/* Fixed background layers */}
      <WaveGrid className="mmkl-grid-canvas" />
      <div className="mmkl-grid-glow" />
      <div className="mmkl-noise" />

      {/* Loader */}
      <RefreshLoader done={loaderDone} />

      {/* Start screen */}
      <StartScreen hidden={startHidden} zooming={startZoom} onEnter={enterDash} />

      {/* Dashboard */}
      <div
        ref={dashRef}
        className="mmkl-dash"
        style={{ opacity: dashVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.2s' }}
      >
        <DashboardNav />

        <section className="mmkl-hero">
          <div className="mmkl-eyebrow">MMKL Dashboard</div>
          <h1 className="mmkl-hero-h1" ref={heroH1Ref}>
            Everything<br />We&apos;ve Built.
          </h1>
          <p className="mmkl-hero-sub">
            A curated collection of games, tools, and apps — organized by category.
          </p>
        </section>

        {CATEGORIES.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            hiddenIds={hiddenIds}
            onRemove={removeCard}
          />
        ))}

        <Footer />

        {hiddenIds.length > 0 && (
          <div className="mmkl-restore-bar" style={{ display: 'block' }}>
            <button onClick={restoreAll}>↩ Restore hidden projects</button>
          </div>
        )}
      </div>

      {/* Theme switcher */}
      <ThemeSwitcher theme={theme} onThemeChange={handleThemeChange} />
    </>
  )
}
