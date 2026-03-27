'use client'
import { useState, useEffect } from 'react'
import type { Task, Priority, Category } from '../types'

const STORAGE_KEY = 'agents_tasks'

type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTasks(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  // Persist to localStorage (never before load completes)
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks, loaded])

  // Poll /api/todos every 3s and merge new tasks from Python script
  useEffect(() => {
    if (!loaded) return
    const poll = async () => {
      if (typeof fetch === 'undefined') return
      if (document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/todos')
        if (!res.ok) return
        const { tasks: incoming } = await res.json() as { tasks: Task[] }
        if (!incoming?.length) return
        setTasks(prev => {
          const existingIds = new Set(prev.map(t => t.id))
          const novel = incoming.filter(t => !existingIds.has(t.id))
          return novel.length > 0 ? [...novel, ...prev] : prev
        })
      } catch {}
    }
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [loaded])

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
