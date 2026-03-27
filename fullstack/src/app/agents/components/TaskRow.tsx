// placeholder — will be replaced by Task 7
'use client'
import type { Task } from '../types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}

export default function TaskRow({ task, onToggle, onEdit, onDelete }: Props) {
  return <div onClick={() => onEdit(task)}>{task.title}</div>
}
