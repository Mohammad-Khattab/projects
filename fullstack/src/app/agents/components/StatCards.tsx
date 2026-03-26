'use client'
import { useEffect, useRef } from 'react'
import type { Todo } from '../types'

function AnimatedNum({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef(0)

  useEffect(() => {
    const el = ref.current!
    const start = prev.current
    const end = value
    prev.current = value
    if (start === end) return
    let i = start
    const step = () => {
      i = Math.min(i + 1, end)
      el.textContent = String(i)
      if (i < end) setTimeout(step, 80)
    }
    setTimeout(step, 100)
  }, [value])

  return <div ref={ref} style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
}

interface Card { label: string; color: string; icon: string; value: number; pct: number; trend: string; trendColor: string }

export function StatCards({ todos }: { todos: Todo[] }) {
  const total  = todos.length
  const active = todos.filter(t => t.status === 'in_progress').length
  const done   = todos.filter(t => t.status === 'completed').length
  const failed = todos.filter(t => t.status === 'failed').length

  const cards: Card[] = [
    { label: 'Total Tasks', color: '#00e5ff', icon: '⬡', value: total,  pct: 100,                          trend: `+${total} total`,     trendColor: '#00e5ff' },
    { label: 'In Progress', color: '#ff6d00', icon: '◉', value: active, pct: total ? active/total*100 : 0,  trend: `${active} running`,   trendColor: '#ff6d00' },
    { label: 'Completed',   color: '#00e676', icon: '✓', value: done,   pct: total ? done/total*100 : 0,    trend: `${total ? Math.round(done/total*100) : 0}% rate`, trendColor: '#00e676' },
    { label: 'Failed',      color: '#ff1744', icon: '✕', value: failed, pct: total ? failed/total*100 : 0,  trend: failed === 0 ? 'clean' : `${failed} failed`,       trendColor: failed === 0 ? '#6b7685' : '#ff1744' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden',
          transition: 'transform 0.2s, border-color 0.2s', cursor: 'default'
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.13)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = '' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: `${c.color}18`, border: `1px solid ${c.color}30` }}>{c.icon}</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 7px', borderRadius: 100, color: c.trendColor, background: `${c.trendColor}18`, border: `1px solid ${c.trendColor}30` }}>{c.trend}</span>
          </div>
          <div style={{ color: c.color }}><AnimatedNum value={c.value} /></div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{c.label}</div>
          <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, width: `${c.pct}%`, background: c.color, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
