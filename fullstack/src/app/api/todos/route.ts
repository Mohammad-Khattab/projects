import { NextRequest, NextResponse } from 'next/server'
import { appendToQueue, drainQueue } from './queue'
import type { Task, Priority, Category } from '../../agents/types'

export async function GET() {
  const tasks = drainQueue()
  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    title?: string
    priority?: Priority
    category?: Category
    dueDate?: string | null
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  const task: Task = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    description: '',
    completed: false,
    priority: body.priority ?? 'none',
    category: body.category ?? 'Work',
    dueDate: body.dueDate ?? null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
  appendToQueue(task)
  return NextResponse.json({ ok: true, id: task.id })
}
