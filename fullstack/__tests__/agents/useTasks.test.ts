/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../../src/app/agents/hooks/useTasks'
import type { Task } from '../../src/app/agents/types'

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  mockStorage['agents_tasks'] = '[]'
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v },
      removeItem: (k: string) => { delete mockStorage[k] },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    },
    writable: true,
    configurable: true,
  })
  // Mock fetch so polling doesn't throw in any test
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ tasks: [] }),
  })
})

describe('useTasks', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(0)
  })

  it('addTask creates a task with id and createdAt', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Buy milk', description: '', priority: 'low', category: 'Personal', dueDate: null })
    })
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBeTruthy()
    expect(result.current.tasks[0].completed).toBe(false)
    expect(result.current.tasks[0].completedAt).toBeNull()
  })

  it('toggleComplete flips completed and sets completedAt', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Task', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.toggleComplete(id) })
    expect(result.current.tasks[0].completed).toBe(true)
    expect(result.current.tasks[0].completedAt).toBeTruthy()
    act(() => { result.current.toggleComplete(id) })
    expect(result.current.tasks[0].completed).toBe(false)
    expect(result.current.tasks[0].completedAt).toBeNull()
  })

  it('deleteTask removes the task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Delete me', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.deleteTask(id) })
    expect(result.current.tasks).toHaveLength(0)
  })

  it('updateTask patches fields', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Old', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.updateTask(id, { title: 'New', priority: 'high' }) })
    expect(result.current.tasks[0].title).toBe('New')
    expect(result.current.tasks[0].priority).toBe('high')
  })

  it('polls /api/todos and merges incoming tasks', async () => {
    jest.useFakeTimers()
    const incoming: Task[] = [{
      id: 'remote1',
      title: 'Voice task',
      description: '',
      completed: false,
      priority: 'none',
      category: 'Work',
      dueDate: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
    }]
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: incoming }),
    })

    const { result } = renderHook(() => useTasks())

    await act(async () => {
      jest.advanceTimersByTime(3100)
      // Flush microtasks (the async fetch chain)
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    })

    expect(result.current.tasks.some(t => t.id === 'remote1')).toBe(true)
    jest.useRealTimers()
  }, 15000)

  it('does not add duplicate tasks from poll', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useTasks())
    // Add a task locally
    act(() => {
      result.current.addTask({ title: 'Local', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const existingId = result.current.tasks[0].id
    const incoming: Task[] = [{
      id: existingId, title: 'Local', description: '', completed: false,
      priority: 'none', category: 'Work', dueDate: null,
      createdAt: '2026-01-01T00:00:00.000Z', completedAt: null,
    }]
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ tasks: incoming }) })

    await act(async () => {
      jest.advanceTimersByTime(3100)
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    })

    // Still only 1 task — no duplicate
    expect(result.current.tasks).toHaveLength(1)
    jest.useRealTimers()
  }, 15000)
})
