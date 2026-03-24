'use client'

import WaveGrid from './WaveGrid'

interface StartScreenProps {
  hidden: boolean
  zooming: boolean
  onEnter: () => void
}

export default function StartScreen({ hidden, zooming, onEnter }: StartScreenProps) {
  const cls = [
    'mmkl-start',
    hidden  ? 'hidden'  : '',
    zooming ? 'zooming' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <WaveGrid className="mmkl-start-canvas" color="rgba(255,255,255,0.1)" />
      <div className="mmkl-orb mmkl-orb-1" />
      <div className="mmkl-orb mmkl-orb-2" />
      <div className="mmkl-orb mmkl-orb-3" />
      <div className="mmkl-start-glow" />
      <div className="mmkl-start-content">
        <div className="mmkl-start-eyebrow">MMKL Universe</div>
        <div className="mmkl-start-title">
          <span className="mmkl-glass">MMKL</span>
        </div>
        <div className="mmkl-start-sub">Games · Projects · Tools — one place.</div>
        <button className="mmkl-enter-btn" onClick={onEnter}>
          Enter
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
