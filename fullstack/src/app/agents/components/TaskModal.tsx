'use client'
import { useState, useEffect } from 'react'
import type { Task, Priority, Category } from '../types'

interface Props {
  task: Task | null       // null = new task mode
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => void
  onClose: () => void
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'none']
const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'none')
  const [category, setCategory] = useState<Category>(task?.category ?? 'Work')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setPriority(task?.priority ?? 'none')
    setCategory(task?.category ?? 'Work')
    setDueDate(task?.dueDate ?? '')
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), description, priority, category, dueDate: dueDate || null })
    onClose()
  }

  return (
    <div className="agents-modal-backdrop" onClick={onClose}>
      <div className="agents-modal" onClick={e => e.stopPropagation()}>
        <h3>{task?.id ? 'Edit Task' : 'New Task'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="agents-field">
            <label>Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>
          <div className="agents-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
            />
          </div>
          <div className="agents-field-row">
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as Category)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="agents-field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="agents-modal-actions">
            <button type="button" className="agents-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="agents-btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  )
}
