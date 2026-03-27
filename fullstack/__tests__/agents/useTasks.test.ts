import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../../src/app/agents/hooks/useTasks'

// Mock localStorage
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
})
