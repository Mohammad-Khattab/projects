'use client'
import { useState, useEffect, useRef } from 'react'
import { priorityColor, formatDueLabel } from '../lib/utils'
import type { Task } from '../types'

const CAT_COLORS: Record<string, string> = {
  Work: '#6366f1',
  Personal: '#f59e0b',
  Creative: '#ec4899',
  Health: '#22c55e',
}

interface Props {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isNew?: boolean
}

export default function TaskCard({ task, onToggle, onEdit, onDelete, isNew }: Props) {
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
    'agents-task-card',
    task.completed ? 'done' : '',
    deleting ? 'deleting' : '',
    justCompleted ? 'agents-just-completed' : '',
    isNew ? 'agents-task-entering' : '',
  ].filter(Boolean).join(' ')

  const catColor = CAT_COLORS[task.category] ?? '#6366f1'

  return (
    <div
      className={classes}
      style={{ '--stripe': priorityColor(task.priority) } as React.CSSProperties}
      onClick={() => onEdit(task)}
    >
      {/* Circular checkbox */}
      <div
        className={`agents-card-check ${task.completed ? 'checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(task.id) }}
        role="checkbox"
        aria-checked={task.completed}
      >
        {task.completed && '✓'}
      </div>

      {/* Title */}
      <div className={`agents-card-title ${task.completed ? 'done' : ''}`}>
        {task.title}
      </div>

      {/* Description snippet */}
      {task.description && (
        <div className="agents-card-desc">{task.description}</div>
      )}

      {/* Footer */}
      <div className="agents-card-footer">
        <span
          className="agents-task-chip"
          style={{ background: `${catColor}22`, color: catColor }}
        >
          {task.category}
        </span>
        {task.dueDate && (
          <span className="agents-task-due">{formatDueLabel(task.dueDate)}</span>
        )}
      </div>

      {/* Hover actions */}
      <div className="agents-card-actions" onClick={e => e.stopPropagation()}>
        <button
          className="agents-icon-btn"
          onClick={() => onEdit(task)}
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
