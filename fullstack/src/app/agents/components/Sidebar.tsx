'use client'
import type { View } from '../types'

interface Props {
  view: View
  onView: (v: View) => void
  userName: string
  onUserNameChange: (name: string) => void
}

const NAV: { id: View; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'tasks',     icon: '✓', label: 'Tasks' },
  { id: 'calendar',  icon: '⊙', label: 'Calendar' },
  { id: 'analytics', icon: '↗', label: 'Analytics' },
]

export default function Sidebar({ view, onView, userName, onUserNameChange }: Props) {
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <nav className="agents-sidebar">
      <div className="agents-logo">T</div>
      <div className="agents-divider" />
      {NAV.map(n => (
        <button
          key={n.id}
          className={`agents-nav-icon ${view === n.id ? 'active' : ''}`}
          onClick={() => onView(n.id)}
          title={n.label}
          aria-label={n.label}
        >
          {n.icon}
          <span className="tooltip">{n.label}</span>
        </button>
      ))}
      <div className="agents-divider" />
      <button
        className="agents-nav-icon"
        title="Settings"
        onClick={() => {
          const name = prompt('Your name:', userName)
          if (name?.trim()) {
            localStorage.setItem('agents_username', name.trim())
            onUserNameChange(name.trim())
          }
        }}
      >
        ⚙
        <span className="tooltip">Settings</span>
      </button>
      <div className="agents-avatar">{initials}</div>
    </nav>
  )
}
