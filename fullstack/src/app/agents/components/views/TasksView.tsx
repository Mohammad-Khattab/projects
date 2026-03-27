'use client'
import { useState } from 'react'
import TaskRow from '../TaskRow'
import { getToday } from '../../lib/utils'
import type { Task, FilterTab, Category } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'priority', label: 'Priority' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
]
const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']

export default function TasksView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  const filtered = tasks
    .filter(t => {
      if (filter === 'priority') return ['high', 'medium'].includes(t.priority) && !t.completed
      if (filter === 'scheduled') return !!t.dueDate && !t.completed
      if (filter === 'completed') return t.completed
      return !t.completed // 'all' hides completed
    })
    .filter(t => !activeCategory || t.category === activeCategory)
    .sort((a, b) => {
      const pOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  const totalVisible = tasks.filter(t => !t.completed).length

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">My Tasks</div>
        <div className="agents-sub">{totalVisible} active task{totalVisible !== 1 ? 's' : ''} across all categories.</div>
      </div>
      <div className="agents-content">
        <div className="agents-tabs">
          {FILTERS.map(f => (
            <button key={f.id} className={`agents-tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
          <button className="agents-add-btn" onClick={onOpenNew}>+ New Task</button>
        </div>

        <div className="agents-tags">
          <button className={`agents-tag ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} className={`agents-tag ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c === activeCategory ? null : c)}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: 'var(--a-muted)', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
            No tasks here. {filter === 'completed' ? 'Complete a task to see it here.' : 'Click "+ New Task" to add one.'}
          </div>
        )}
        {filtered.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
