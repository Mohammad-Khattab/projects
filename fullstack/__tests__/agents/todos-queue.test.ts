import fs from 'fs'
import path from 'path'

// queue.ts is not created yet — these tests will fail
import { readQueue, appendToQueue, drainQueue } from '../../src/app/api/todos/queue'

const QUEUE_PATH = path.join(process.cwd(), 'data', 'pending-tasks.json')

beforeEach(() => {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true })
  fs.writeFileSync(QUEUE_PATH, '[]')
})

afterAll(() => {
  if (fs.existsSync(QUEUE_PATH)) fs.writeFileSync(QUEUE_PATH, '[]')
})

const makeTask = (id: string) => ({
  id,
  title: 'Test task',
  description: '',
  completed: false,
  priority: 'none' as const,
  category: 'Work' as const,
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
})

describe('todos queue', () => {
  it('readQueue returns empty array when file is empty', () => {
    expect(readQueue()).toEqual([])
  })

  it('appendToQueue adds a task to the file', () => {
    appendToQueue(makeTask('t1'))
    const result = readQueue()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })

  it('appendToQueue accumulates multiple tasks', () => {
    appendToQueue(makeTask('t1'))
    appendToQueue(makeTask('t2'))
    expect(readQueue()).toHaveLength(2)
  })

  it('drainQueue returns all tasks and empties the file', () => {
    appendToQueue(makeTask('t1'))
    appendToQueue(makeTask('t2'))
    const drained = drainQueue()
    expect(drained).toHaveLength(2)
    expect(readQueue()).toHaveLength(0)
  })

  it('drainQueue on empty file returns []', () => {
    expect(drainQueue()).toEqual([])
  })
})
