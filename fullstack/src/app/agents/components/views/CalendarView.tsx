'use client'
import { useState } from 'react'
import { priorityColor, getToday } from '../../lib/utils'
import TaskCard from '../TaskCard'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const today = getToday()
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(today)

  const firstDay     = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth  = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const daysInPrev   = new Date(cursor.year, cursor.month, 0).getDate()

  const cells: { date: string; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(cursor.year, cursor.month - 1, daysInPrev - i)
    cells.push({ date: d.toISOString().slice(0, 10), isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.year, cursor.month, d).toISOString().slice(0, 10)
    cells.push({ date, isCurrentMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(cursor.year, cursor.month + 1, cells.length - daysInMonth - firstDay + 1)
    cells.push({ date: d.toISOString().slice(0, 10), isCurrentMonth: false })
  }

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.dueDate) { (acc[t.dueDate] ??= []).push(t) }
    return acc
  }, {})

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : []

  const prevMonth = () => setCursor(c => {
    const m = c.month === 0 ? 11 : c.month - 1
    const y = c.month === 0 ? c.year - 1 : c.year
    return { year: y, month: m }
  })
  const nextMonth = () => setCursor(c => {
    const m = c.month === 11 ? 0 : c.month + 1
    const y = c.month === 11 ? c.year + 1 : c.year
    return { year: y, month: m }
  })

  return (
    <div className="agents-view-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="agents-main-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="agents-greeting">{MONTHS[cursor.month]} {cursor.year}</div>
          <button onClick={prevMonth} className="agents-icon-btn">‹</button>
          <button onClick={nextMonth} className="agents-icon-btn">›</button>
          <button onClick={onOpenNew} className="agents-add-btn" style={{ marginLeft: 'auto' }}>+ New Task</button>
        </div>
      </div>
      <div className="agents-content" style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="agents-cal-grid">
            {DAYS.map(d => <div key={d} className="agents-cal-header">{d}</div>)}
            {cells.map(({ date, isCurrentMonth }) => {
              const dayTasks  = tasksByDate[date] ?? []
              const isToday   = date === today
              const isSelected = date === selectedDate
              return (
                <div
                  key={date}
                  className={`agents-cal-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  style={isSelected && !isToday ? { background: 'rgba(99,102,241,0.1)', outline: '2px solid rgba(99,102,241,0.6)' } : {}}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{new Date(date + 'T00:00:00').getDate()}</span>
                  {dayTasks.length > 0 && (
                    <div className="agents-cal-dots">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="agents-cal-dot" style={{ background: priorityColor(t.priority) }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {selectedTasks.length === 0 && (
              <div style={{ color: 'var(--a-muted)', fontSize: 12, fontStyle: 'italic' }}>No tasks this day.</div>
            )}
            {selectedTasks.map(t => (
              <TaskCard key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
