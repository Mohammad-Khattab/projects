'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavBarProps {
  scrapedAt?: string
  onRefresh?: () => void
  refreshing?: boolean
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NavBar({ scrapedAt, onRefresh, refreshing }: NavBarProps) {
  const pathname = usePathname()

  return (
    <nav style={{
      background: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>◈</span>
          <Link href="/" style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.01em'
          }}>
            GJU Study Hub
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link
            href="/"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: pathname === '/' ? 'var(--accent-from)' : 'var(--text-secondary)',
              background: pathname === '/' ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/calendar"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: pathname === '/calendar' ? 'var(--accent-from)' : 'var(--text-secondary)',
              background: pathname === '/calendar' ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            Calendar
          </Link>
          <Link
            href="/ai"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: pathname === '/ai' ? 'var(--accent-from)' : 'var(--text-secondary)',
              background: pathname === '/ai' ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            AI Studio
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {scrapedAt && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Updated {timeAgo(scrapedAt)}
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={refreshing}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            {refreshing ? <span className="spinner" /> : '↻'} Refresh
          </button>
        </div>
      </div>
    </nav>
  )
}
