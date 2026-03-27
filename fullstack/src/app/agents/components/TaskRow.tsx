'use client'
import { useState, useEffect, useRef } from 'react'
import { priorityColor, formatDueLabel } from '../lib/utils'
import type { Task } from '../types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isNew?: boolean
}

export default function TaskRow({ task, onToggle, onEdit, onDelete, isNew }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const prevCompleted = useRef(task.completed)

  useEffect(() => {
    if (!prevCompleted.current && task.completed) {
      setJustCompleted(true)
      const t = setTimeout(() => setJustCompleted(false), 500)
      return () => clearTimeout(t)
    }
    prevCompleted.current = task.completed
  }, [task.completed])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    setTimeout(() => onDelete(task.id), 320)
  }

  const classes = [
    'agents-task-row',
    task.completed ? 'done' : '',
    deleting ? 'deleting' : '',
    justCompleted ? 'agents-just-completed' : '',
    isNew ? 'agents-task-entering' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div
        className={`agents-check ${task.completed ? 'checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(task.id) }}
        role="checkbox"
        aria-checked={task.completed}
      >
        {task.completed && '✓'}
      </div>
      <div
        className="agents-priority-dot"
        style={{ background: priorityColor(task.priority) }}
      />
      <div
        className={`agents-task-title ${task.completed ? 'done' : ''}`}
        onClick={() => onEdit(task)}
      >
        {task.title}
      </div>
      <div className="agents-task-chip">{task.category}</div>
      {task.dueDate && (
        <div className="agents-task-due">{formatDueLabel(task.dueDate)}</div>
      )}
      <div className="agents-task-actions">
        <button
          className="agents-icon-btn"
          onClick={e => { e.stopPropagation(); onEdit(task) }}
          title="Edit"
        >✎</button>
        <button
          className="agents-icon-btn danger"
          onClick={handleDelete}
          title="Delete"
        >×</button>
      </div>
    </div>
  )
}
