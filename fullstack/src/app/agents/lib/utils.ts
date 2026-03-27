import type { Task, Priority } from '../types'

export function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function getTodayLabel(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function toLocalDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function calcStreak(tasks: Task[]): number {
  const completedDays = new Set(
    tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => toLocalDate(t.completedAt!))
  )
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (true) {
    const dateStr = toLocalDate(cursor.toISOString())
    if (!completedDays.has(dateStr)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function priorityColor(p: Priority): string {
  const colors: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#BEB9A9' }
  return colors[p]
}

export function formatDueLabel(dueDate: string | null): string {
  const days = getDaysRemaining(dueDate)
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `in ${days}d`
}
