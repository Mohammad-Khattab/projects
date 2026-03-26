'use client'
import { useRef, useCallback } from 'react'
import type { Todo } from '../types'

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7685', medium: '#00e5ff', high: '#ff6d00', critical: '#ff1744'
}
const STATUS_COLORS: Record<string, string> = {
  pending: '#6b7685', in_progress: '#ff6d00', completed: '#00e676', failed: '#ff1744'
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', in_progress: 'Running', completed: 'Done', failed: 'Failed'
}
const AGENT_INITIALS: Record<string, string> = {
  Researcher: 'RE', Builder: 'BU', Planner: 'PL',
  'Agent-1': 'A1', 'Agent-2': 'A2', Writer: 'WR'
}
const AGENT_COLORS: Record<string, string> = {
  Researcher: '#00e5ff', Builder: '#ff6d00', Planner: '#00e676',
  'Agent-1': '#00e5ff', 'Agent-2': '#e040fb', Writer: '#6b7685'
}

export function TaskCard({ todo, flash }: { todo: Todo; flash: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    el.style.transform = `perspective(600px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) translateZ(6px)`
    el.style.transition = 'none'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current!
    el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)'
    el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'
  }, [])

  const pColor = PRIORITY_COLORS[todo.priority] ?? '#6b7685'
  const sColor = STATUS_COLORS[todo.status] ?? '#6b7685'
  const isActive = todo.status === 'in_progress'
  const agentColor = AGENT_COLORS[todo.assigned_agent ?? ''] ?? '#6b7685'

  const updatedRelative = (() => {
    const diff = Date.now() - new Date(todo.updated_at).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    return `${Math.floor(m / 60)}h ago`
  })()

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${flash ? 'rgba(0,229,255,0.7)' : 'var(--border)'}`,
        borderRadius: 14,
        padding: '16px 16px 14px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: flash ? '0 0 0 1px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        borderRadius: '14px 0 0 14px',
        background: pColor,
        boxShadow: (todo.priority === 'high' || todo.priority === 'critical') ? `0 0 8px ${pColor}` : 'none'
      }} />

      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--bright)', lineHeight: 1.5, marginBottom: 12 }}>
        {todo.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--mono)', fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap',
          color: sColor, background: `${sColor}18`, border: `1px solid ${sColor}44`
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: sColor,
            boxShadow: isActive ? `0 0 5px ${sColor}` : 'none',
            animation: isActive ? 'pulse 1.4s ease-in-out infinite' : 'none'
          }} />
          {STATUS_LABELS[todo.status]}
        </div>

        {todo.assigned_agent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)' }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 6, fontWeight: 700, flexShrink: 0,
              background: `${agentColor}18`, color: agentColor, border: `1px solid ${agentColor}40`
            }}>
              {AGENT_INITIALS[todo.assigned_agent] ?? '??'}
            </div>
            {todo.assigned_agent}
            <span style={{ color: 'var(--dim)', fontSize: 7 }}>{updatedRelative}</span>
          </div>
        )}
      </div>
    </div>
  )
}
