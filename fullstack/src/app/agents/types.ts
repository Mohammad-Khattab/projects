export type Priority = 'high' | 'medium' | 'low' | 'none'
export type Category = 'Work' | 'Personal' | 'Creative' | 'Health'
export type View = 'dashboard' | 'tasks' | 'calendar' | 'analytics'
export type FilterTab = 'all' | 'priority' | 'scheduled' | 'completed'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate: string | null   // 'YYYY-MM-DD'
  createdAt: string        // ISO timestamp
  completedAt: string | null
}

export interface TimerState {
  mode: 'work' | 'short-break' | 'long-break'
  remaining: number        // seconds
  running: boolean
  sessions: number         // completed work sessions this page-load
}

export interface ParsedTask {
  title: string
  dueDate: string | null
  priority: Priority
  category: Category
  confidence: number       // 0–1
}
