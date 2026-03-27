'use client'
import FocusTimer from './FocusTimer'
import { calcStreak, formatDueLabel, getToday } from '../lib/utils'
import type { Task } from '../types'

interface Props { tasks: Task[] }

export default function RightPanel({ tasks }: Props) {
  const streak = calcStreak(tasks)
  const today = getToday()
  const todayTasks = tasks
    .filter(t => !t.completed && t.dueDate === today)
    .sort((a, b) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
      return order[a.priority] - order[b.priority]
    })

  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate > today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .at(0) ?? null

  return (
    <aside className="agents-right-panel">
      <FocusTimer />

      <div>
        <div className="agents-panel-title">Today</div>
        {todayTasks.length === 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,239,181,0.35)', fontStyle: 'italic' }}>Nothing due today</div>
        )}
        {todayTasks.slice(0, 4).map(t => (
          <div key={t.id} className="agents-schedule-item">
            <div className="agents-schedule-title">{t.title}</div>
            <div className="agents-schedule-cat">{t.category}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="agents-panel-title">Streak</div>
        <div className="agents-streak-box">
          <div className="agents-streak-num">{streak}</div>
          <div className="agents-streak-label">Consecutive<br />Days</div>
        </div>
      </div>

      {upcoming && (
        <div>
          <div className="agents-panel-title">Upcoming</div>
          <div className="agents-upcoming-card">
            <div className="agents-panel-title" style={{ marginBottom: 0 }}>Due Soon</div>
            <div className="agents-upcoming-title">{upcoming.title}</div>
            <div className="agents-upcoming-due">{formatDueLabel(upcoming.dueDate)}</div>
          </div>
        </div>
      )}
    </aside>
  )
}
