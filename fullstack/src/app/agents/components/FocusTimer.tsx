'use client'
import { useTimer } from '../hooks/useTimer'

export default function FocusTimer() {
  const { remaining, running, sessions, toggle, skip, formatTime, progress, modeLabel } = useTimer()

  return (
    <div>
      <div className="agents-panel-title">Focus Flow</div>
      <div className="agents-timer-time">{formatTime(remaining)}</div>
      <div className="agents-timer-mode">{modeLabel} · Session {sessions + 1}</div>
      <div className="agents-timer-progress">
        <div className="agents-timer-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="agents-session-dots">
        {[0,1,2,3].map(i => (
          <div key={i} className={`agents-session-dot ${i < sessions % 4 ? 'done' : ''}`} />
        ))}
      </div>
      <div className="agents-timer-controls">
        <button className="agents-timer-btn primary" onClick={toggle}>
          {running ? '⏸' : '▶'}
        </button>
        <button className="agents-timer-btn" onClick={skip}>Skip →</button>
      </div>
    </div>
  )
}
