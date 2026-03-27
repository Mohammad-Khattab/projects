'use client'
import { useState } from 'react'
import { getTodayLabel, calcStreak, getToday } from '../../lib/utils'
import TaskRow from '../TaskRow'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  userName: string
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onAdd: (title: string) => void
}

export default function DashboardView({ tasks, userName, onToggle, onEdit, onDelete, onAdd }: Props) {
  const [quickTitle, setQuickTitle] = useState('')
  const today = getToday()
  const todayTasks = tasks.filter(t => t.dueDate === today)
  const totalTasks = tasks.length
  const dueTodayCount = todayTasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length
  const completionPct = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100)
  const streak = calcStreak(tasks)

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTitle.trim()) { onAdd(quickTitle.trim()); setQuickTitle('') }
  }

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">{getTodayLabel()}, {userName}.</div>
        <div className="agents-sub">
          You have <strong>{dueTodayCount} focus area{dueTodayCount !== 1 ? 's' : ''}</strong> for today.
        </div>
      </div>
      <div className="agents-content">
        <div className="agents-stats-row">
          <div className="agents-stat">
            <div className="agents-stat-val">{totalTasks}</div>
            <div className="agents-stat-label">Tasks Total</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{dueTodayCount}</div>
            <div className="agents-stat-label">Due Today</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completionPct}%</div>
            <div className="agents-stat-label">Complete</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{streak}🔥</div>
            <div className="agents-stat-label">Streak</div>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--a-espresso)', marginBottom: 10 }}>
          Today&apos;s Focus
        </div>
        {todayTasks.length === 0 && (
          <div style={{ color: 'var(--a-muted)', fontSize: 13, marginBottom: 12, fontStyle: 'italic' }}>
            No tasks due today — add one below.
          </div>
        )}
        {todayTasks.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}

        <form className="agents-quick-add" onSubmit={handleQuickAdd}>
          <input
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="Quick add a task for today… (press Enter)"
          />
          <button type="submit" className="agents-btn-primary">Add</button>
        </form>
      </div>
    </div>
  )
}
