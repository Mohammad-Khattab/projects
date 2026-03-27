import { getToday, getTodayLabel, calcStreak, getDaysRemaining, priorityColor, formatDueLabel } from '../../src/app/agents/lib/utils'
import type { Task } from '../../src/app/agents/types'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test',
  description: '',
  completed: false,
  priority: 'none',
  category: 'Work',
  dueDate: null,
  createdAt: new Date().toISOString(),
  completedAt: null,
  ...overrides,
})

describe('getToday', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getTodayLabel', () => {
  it('returns time-aware greeting', () => {
    const label = getTodayLabel()
    expect(['Good morning', 'Good afternoon', 'Good evening'].some(g => label.startsWith(g))).toBe(true)
  })
})

describe('calcStreak', () => {
  it('returns 0 for no tasks', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('counts consecutive days with completions', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tasks = [
      makeTask({ completed: true, completedAt: today.toISOString() }),
      makeTask({ completed: true, completedAt: yesterday.toISOString() }),
    ]
    expect(calcStreak(tasks)).toBe(2)
  })

  it('stops at gap day', () => {
    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)
    const tasks = [
      makeTask({ completed: true, completedAt: today.toISOString() }),
      makeTask({ completed: true, completedAt: twoDaysAgo.toISOString() }),
    ]
    expect(calcStreak(tasks)).toBe(1)
  })
})

describe('getDaysRemaining', () => {
  it('returns null for null dueDate', () => {
    expect(getDaysRemaining(null)).toBeNull()
  })

  it('returns 0 for today', () => {
    expect(getDaysRemaining(getToday())).toBe(0)
  })
})

describe('priorityColor', () => {
  it('maps high to red', () => {
    expect(priorityColor('high')).toBe('#ef4444')
  })
  it('maps none to stone', () => {
    expect(priorityColor('none')).toBe('#BEB9A9')
  })
})

describe('formatDueLabel', () => {
  it('returns empty string for null', () => {
    expect(formatDueLabel(null)).toBe('')
  })

  it('returns "Today" for today', () => {
    expect(formatDueLabel(getToday())).toBe('Today')
  })

  it('returns "Xd overdue" for past dates', () => {
    const past = new Date()
    past.setDate(past.getDate() - 3)
    const pastStr = `${past.getFullYear()}-${String(past.getMonth()+1).padStart(2,'0')}-${String(past.getDate()).padStart(2,'0')}`
    expect(formatDueLabel(pastStr)).toBe('3d overdue')
  })

  it('returns "in Xd" for future dates beyond tomorrow', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    const futureStr = `${future.getFullYear()}-${String(future.getMonth()+1).padStart(2,'0')}-${String(future.getDate()).padStart(2,'0')}`
    expect(formatDueLabel(futureStr)).toBe('in 5d')
  })
})
