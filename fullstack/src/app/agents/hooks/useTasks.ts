'use client'
import { useState, useEffect, useRef } from 'react'
import type { Task, Priority, Category } from '../types'

const STORAGE_KEY = 'agents_tasks'

type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const isFirstRun = useRef(true)

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTasks(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on every change — skip the very first run (tasks = []) to avoid wiping localStorage
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (data: NewTask): Task => {
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    setTasks(prev => [task, ...prev])
    return task
  }

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const completed = !t.completed
      return { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
    }))
  }

  return { tasks, addTask, updateTask, deleteTask, toggleComplete }
}
