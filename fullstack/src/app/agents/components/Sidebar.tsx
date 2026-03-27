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
  { id: 'tasks',     icon: '✓', label: 'Tasks'     },
  { id: 'calendar',  icon: '⊙', label: 'Calendar'  },
  { id: 'analytics', icon: '↗', label: 'Analytics' },
]

export default function Sidebar({ view, onView, userName, onUserNameChange }: Props) {
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <nav className="agents-sidebar">
      {/* Logo */}
      <div className="agents-logo-wrap">
        <div className="agents-logo-icon">T</div>
        <span className="agents-logo-text">TaskFlow</span>
      </div>

      <div className="agents-divider" />

      {/* Nav items */}
      {NAV.map(item => (
        <button
          key={item.id}
          className={`agents-nav-item ${view === item.id ? 'active' : ''}`}
          onClick={() => onView(item.id)}
        >
          <span>{item.icon}</span>
          <span className="agents-nav-label">{item.label}</span>
        </button>
      ))}

      {/* Bottom: avatar */}
      <div className="agents-sidebar-bottom">
        <div className="agents-divider" />
        <button
          className="agents-nav-item"
          title={userName}
          onClick={() => {
            const name = window.prompt('Your name:', userName)
            if (name?.trim()) onUserNameChange(name.trim())
          }}
        >
          <div className="agents-avatar">{initials}</div>
          <span className="agents-nav-label">{userName}</span>
        </button>
      </div>
    </nav>
  )
}
