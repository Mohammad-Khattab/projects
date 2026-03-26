'use client'
import { useState } from 'react'
import { TaskCard } from './TaskCard'
import type { Todo } from '../types'

type Filter = 'all' | 'pending' | 'in_progress' | 'completed'

export function TaskGrid({ todos, flashId }: { todos: Todo[]; flashId: string | null }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? todos : todos.filter(t => t.status === filter)

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'Running' },
    { key: 'completed', label: 'Done' }
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--bright)', letterSpacing: '0.01em' }}>Active Tasks</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', marginTop: 2, letterSpacing: '0.06em' }}>
            realtime · updates instantly via websocket
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '5px 13px', borderRadius: 5, cursor: 'pointer',
                color: filter === tab.key ? 'var(--cyan)' : 'var(--muted)',
                background: filter === tab.key ? 'rgba(0,229,255,0.08)' : 'transparent',
                border: filter === tab.key ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {filtered.map(todo => (
          <TaskCard key={todo.id} todo={todo} flash={todo.id === flashId} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '40px 0' }}>
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}
