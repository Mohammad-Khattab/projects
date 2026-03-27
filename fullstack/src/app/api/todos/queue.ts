import fs from 'fs'
import path from 'path'
import type { Task } from '../../agents/types'

const QUEUE_PATH = path.join(process.cwd(), 'data', 'pending-tasks.json')

export function readQueue(): Task[] {
  try {
    const raw = fs.readFileSync(QUEUE_PATH, 'utf-8')
    return JSON.parse(raw) as Task[]
  } catch {
    return []
  }
}

export function appendToQueue(task: Task): void {
  const tasks = readQueue()
  tasks.push(task)
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true })
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(tasks, null, 2))
}

export function drainQueue(): Task[] {
  const tasks = readQueue()
  fs.writeFileSync(QUEUE_PATH, '[]')
  return tasks
}
