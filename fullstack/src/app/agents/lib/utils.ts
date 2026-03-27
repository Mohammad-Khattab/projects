import type { Task, Priority } from '../types'

export function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getTodayLabel(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function calcStreak(tasks: Task[]): number {
  const completedDays = new Set(
    tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => t.completedAt!.slice(0, 10))
  )
  let streak = 0
  const cursor = new Date()
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10)
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
  return { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#BEB9A9' }[p]
}

export function formatDueLabel(dueDate: string | null): string {
  const days = getDaysRemaining(dueDate)
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return dueDate!
}
