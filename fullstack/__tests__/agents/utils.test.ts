import { getToday, getTodayLabel, calcStreak, getDaysRemaining, priorityColor } from '../../src/app/agents/lib/utils'
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
