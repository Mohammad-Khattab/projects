'use client'
import { priorityColor, formatDueLabel } from '../lib/utils'
import type { Task } from '../types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export default function TaskRow({ task, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className={`agents-task-row ${task.completed ? 'done' : ''}`}>
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
          onClick={e => { e.stopPropagation(); onDelete(task.id) }}
          title="Delete"
        >×</button>
      </div>
    </div>
  )
}
