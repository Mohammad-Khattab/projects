# Task Manager Redesign + Voice Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the task manager layout with a collapsible sidebar + card grid + redesigned dashboard, and add a Python voice script that records audio, transcribes locally with faster-whisper, and adds the task via a new `/api/todos` endpoint.

**Architecture:** Fixed collapsible sidebar (56px→220px on hover) replaces the current flex sidebar. `TaskCard` replaces `TaskRow` in grid views. Dashboard gets a hero section + 3-column widget row (today/timer/streak). A server-side JSON queue bridges the Python script to localStorage.

**Tech Stack:** Next.js 14 App Router, TypeScript, CSS custom properties, faster-whisper (Python), sounddevice, scipy

---

## File Map

| File | Action |
|------|--------|
| `src/app/agents/components/Sidebar.tsx` | Rewrite — collapsible hover behavior |
| `src/app/agents/components/TaskCard.tsx` | **Create** — new card component for grid views |
| `src/app/agents/components/RightPanel.tsx` | **Delete** |
| `src/app/agents/components/views/DashboardView.tsx` | Full rewrite — hero + 3-col widgets + activity |
| `src/app/agents/components/views/TasksView.tsx` | Update — swap TaskRow → TaskCard, 2-col grid |
| `src/app/agents/components/views/CalendarView.tsx` | Update — use TaskCard in day panel |
| `src/app/agents/page.tsx` | Update — remove RightPanel, fix layout |
| `src/app/agents/hooks/useTasks.ts` | Update — add polling for `/api/todos` |
| `src/app/api/todos/queue.ts` | **Create** — read/write JSON queue file |
| `src/app/api/todos/route.ts` | **Create** — GET (drain) + POST (append) |
| `src/styles/globals.css` | Update — sidebar CSS, TaskCard CSS, hero/widget CSS |
| `data/pending-tasks.json` | **Create** — empty queue `[]` |
| `scripts/voice_task.py` | **Create** — Python recording + transcription |
| `scripts/requirements.txt` | **Create** — Python dependencies |
| `__tests__/agents/todos-queue.test.ts` | **Create** — queue helper unit tests |
| `__tests__/agents/useTasks.test.ts` | Update — add fetch mock + polling test |

---

## Task 1: `/api/todos` — data directory, queue helper, route, and tests

**Files:**
- Create: `fullstack/data/pending-tasks.json`
- Create: `fullstack/src/app/api/todos/queue.ts`
- Create: `fullstack/src/app/api/todos/route.ts`
- Create: `fullstack/__tests__/agents/todos-queue.test.ts`

- [ ] **Step 1: Write the failing tests for the queue helper**

Create `fullstack/__tests__/agents/todos-queue.test.ts`:

```typescript
import fs from 'fs'
import path from 'path'

// queue.ts is not created yet — these tests will fail
import { readQueue, appendToQueue, drainQueue } from '../../src/app/api/todos/queue'

const QUEUE_PATH = path.join(process.cwd(), 'data', 'pending-tasks.json')

beforeEach(() => {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true })
  fs.writeFileSync(QUEUE_PATH, '[]')
})

afterAll(() => {
  if (fs.existsSync(QUEUE_PATH)) fs.writeFileSync(QUEUE_PATH, '[]')
})

const makeTask = (id: string) => ({
  id,
  title: 'Test task',
  description: '',
  completed: false,
  priority: 'none' as const,
  category: 'Work' as const,
  dueDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
})

describe('todos queue', () => {
  it('readQueue returns empty array when file is empty', () => {
    expect(readQueue()).toEqual([])
  })

  it('appendToQueue adds a task to the file', () => {
    appendToQueue(makeTask('t1'))
    const result = readQueue()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('t1')
  })

  it('appendToQueue accumulates multiple tasks', () => {
    appendToQueue(makeTask('t1'))
    appendToQueue(makeTask('t2'))
    expect(readQueue()).toHaveLength(2)
  })

  it('drainQueue returns all tasks and empties the file', () => {
    appendToQueue(makeTask('t1'))
    appendToQueue(makeTask('t2'))
    const drained = drainQueue()
    expect(drained).toHaveLength(2)
    expect(readQueue()).toHaveLength(0)
  })

  it('drainQueue on empty file returns []', () => {
    expect(drainQueue()).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx jest __tests__/agents/todos-queue.test.ts --no-coverage
```

Expected: FAIL — "Cannot find module '../../src/app/api/todos/queue'"

- [ ] **Step 3: Create the data directory and empty queue file**

```bash
mkdir -p "C:\Claude Code Test 1\fullstack\data"
echo "[]" > "C:\Claude Code Test 1\fullstack\data\pending-tasks.json"
```

- [ ] **Step 4: Create the queue helper**

Create `fullstack/src/app/api/todos/queue.ts`:

```typescript
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
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx jest __tests__/agents/todos-queue.test.ts --no-coverage
```

Expected: 5 tests PASS

- [ ] **Step 6: Create the route handler**

Create `fullstack/src/app/api/todos/route.ts`:

```typescript
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
```

- [ ] **Step 7: Run all tests to confirm nothing broke**

```bash
npx jest --no-coverage
```

Expected: 36 tests PASS (31 existing + 5 new)

- [ ] **Step 8: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/data/pending-tasks.json fullstack/src/app/api/todos/ fullstack/__tests__/agents/todos-queue.test.ts
git commit -m "feat: add /api/todos queue endpoint and data directory"
```

---

## Task 2: Update `useTasks` to poll `/api/todos` + update test

**Files:**
- Modify: `fullstack/src/app/agents/hooks/useTasks.ts`
- Modify: `fullstack/__tests__/agents/useTasks.test.ts`

- [ ] **Step 1: Add fetch mock + polling test to the existing test file**

Open `fullstack/__tests__/agents/useTasks.test.ts`. Add `global.fetch` mock to the `beforeEach` block and add a new test at the end. The final file should look like this:

```typescript
/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../../src/app/agents/hooks/useTasks'
import type { Task } from '../../src/app/agents/types'

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  mockStorage['agents_tasks'] = '[]'
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v },
      removeItem: (k: string) => { delete mockStorage[k] },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    },
    writable: true,
    configurable: true,
  })
  // Mock fetch so polling doesn't throw in any test
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ tasks: [] }),
  })
})

describe('useTasks', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(0)
  })

  it('addTask creates a task with id and createdAt', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Buy milk', description: '', priority: 'low', category: 'Personal', dueDate: null })
    })
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBeTruthy()
    expect(result.current.tasks[0].completed).toBe(false)
    expect(result.current.tasks[0].completedAt).toBeNull()
  })

  it('toggleComplete flips completed and sets completedAt', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Task', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.toggleComplete(id) })
    expect(result.current.tasks[0].completed).toBe(true)
    expect(result.current.tasks[0].completedAt).toBeTruthy()
    act(() => { result.current.toggleComplete(id) })
    expect(result.current.tasks[0].completed).toBe(false)
    expect(result.current.tasks[0].completedAt).toBeNull()
  })

  it('deleteTask removes the task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Delete me', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.deleteTask(id) })
    expect(result.current.tasks).toHaveLength(0)
  })

  it('updateTask patches fields', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Old', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const id = result.current.tasks[0].id
    act(() => { result.current.updateTask(id, { title: 'New', priority: 'high' }) })
    expect(result.current.tasks[0].title).toBe('New')
    expect(result.current.tasks[0].priority).toBe('high')
  })

  it('polls /api/todos and merges incoming tasks', async () => {
    jest.useFakeTimers()
    const incoming: Task[] = [{
      id: 'remote1',
      title: 'Voice task',
      description: '',
      completed: false,
      priority: 'none',
      category: 'Work',
      dueDate: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
    }]
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: incoming }),
    })

    const { result } = renderHook(() => useTasks())

    await act(async () => {
      jest.advanceTimersByTime(3100)
      // Flush microtasks (the async fetch chain)
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    })

    expect(result.current.tasks.some(t => t.id === 'remote1')).toBe(true)
    jest.useRealTimers()
  })

  it('does not add duplicate tasks from poll', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useTasks())
    // Add a task locally
    act(() => {
      result.current.addTask({ title: 'Local', description: '', priority: 'none', category: 'Work', dueDate: null })
    })
    const existingId = result.current.tasks[0].id
    const incoming: Task[] = [{
      id: existingId, title: 'Local', description: '', completed: false,
      priority: 'none', category: 'Work', dueDate: null,
      createdAt: '2026-01-01T00:00:00.000Z', completedAt: null,
    }]
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ tasks: incoming }) })

    await act(async () => {
      jest.advanceTimersByTime(3100)
      await new Promise(resolve => setImmediate(resolve))
      await new Promise(resolve => setImmediate(resolve))
    })

    // Still only 1 task — no duplicate
    expect(result.current.tasks).toHaveLength(1)
    jest.useRealTimers()
  })
})
```

- [ ] **Step 2: Run tests to confirm the 2 new tests fail (polling not yet implemented)**

```bash
npx jest __tests__/agents/useTasks.test.ts --no-coverage
```

Expected: 5 PASS, 2 FAIL — "polls" and "duplicate" tests fail

- [ ] **Step 3: Add polling to useTasks**

Replace the full content of `fullstack/src/app/agents/hooks/useTasks.ts` with:

```typescript
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
```

- [ ] **Step 4: Run all tests**

```bash
npx jest --no-coverage
```

Expected: 38 tests PASS (36 existing + 2 new)

- [ ] **Step 5: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/hooks/useTasks.ts fullstack/__tests__/agents/useTasks.test.ts
git commit -m "feat: poll /api/todos every 3s and merge tasks into localStorage"
```

---

## Task 3: CSS — sidebar collapsible + TaskCard + Dashboard hero/widgets

**Files:**
- Modify: `fullstack/src/styles/globals.css`

This task replaces specific CSS blocks and adds new ones. Do each replacement in order.

- [ ] **Step 1: Replace `.agents-root` — remove `display: flex`**

Find the block that starts with `.agents-root {` (around line 333). Replace the entire rule with:

```css
.agents-root {
  --a-accent:       #6366f1;
  --a-accent-to:    #8b5cf6;
  --a-espresso:     #6366f1;
  --a-stone:        #64748b;
  --a-cream:        #e2e8f0;
  --a-bg:           #0a0a0f;
  --a-white:        rgba(255,255,255,0.04);
  --a-border:       rgba(255,255,255,0.08);
  --a-border-hover: rgba(99,102,241,0.4);
  --a-text:         #e2e8f0;
  --a-muted:        #64748b;
  --a-radius:       10px;
  --a-radius-sm:    6px;
  --a-shadow:       0 2px 20px rgba(0,0,0,0.5);
  --a-shadow-md:    0 4px 32px rgba(0,0,0,0.6);
  --a-transition:   200ms ease;
  --a-glass-bg:     rgba(255,255,255,0.04);
  --a-glass-blur:   blur(20px);
  --a-glow:         0 0 20px rgba(99,102,241,0.25);

  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--a-bg);
  color: var(--a-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
}
```

- [ ] **Step 2: Replace the entire `/* Sidebar */` section**

Find the comment `/* Sidebar */` and replace everything from that comment down through `.agents-avatar { ... }` (the block ending around line 436) with:

```css
/* Sidebar — collapsible */
.agents-sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  z-index: 40;
  width: 56px;
  background: rgba(10,10,15,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 0;
  gap: 2px;
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
}
.agents-sidebar:hover { width: 220px; }

.agents-logo-wrap {
  width: 100%;
  padding: 0 16px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.agents-logo-icon {
  width: 26px; height: 26px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff;
  flex-shrink: 0;
}
.agents-logo-text {
  font-size: 15px; font-weight: 700; color: #a5b4fc;
  opacity: 0;
  transition: opacity 0.15s ease 0.1s;
  white-space: nowrap;
}
.agents-sidebar:hover .agents-logo-text { opacity: 1; }

.agents-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; flex-shrink: 0; }

.agents-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 15px;
  cursor: pointer;
  color: rgba(226,232,240,0.4);
  font-size: 17px;
  transition: all var(--a-transition);
  background: none;
  border: none;
  border-left: 3px solid transparent;
  text-align: left;
  white-space: nowrap;
  box-sizing: border-box;
  flex-shrink: 0;
}
.agents-nav-item:hover { background: rgba(99,102,241,0.1); color: #e2e8f0; }
.agents-nav-item.active {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  border-left-color: #6366f1;
}
.agents-nav-label {
  font-size: 13px; font-weight: 500;
  opacity: 0;
  transition: opacity 0.15s ease 0.1s;
  overflow: hidden;
  color: inherit;
}
.agents-sidebar:hover .agents-nav-label { opacity: 1; }

.agents-sidebar-bottom { margin-top: auto; width: 100%; }

.agents-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  flex-shrink: 0;
  border: none;
}
```

- [ ] **Step 3: Replace the `/* Main content area */` block**

Find `.agents-main {` and replace the entire `.agents-main` rule with:

```css
/* Main content area */
.agents-main {
  position: absolute;
  left: 56px; right: 0; top: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--a-bg);
}
```

Keep `.agents-main-header`, `.agents-greeting`, `.agents-sub`, `.agents-content` as they are.

- [ ] **Step 4: Add new CSS classes at the end of the agents section (before `/* Animations */`)**

Insert the following block just before the `/* Animations */` comment:

```css
/* Task Cards */
.agents-task-card {
  background: var(--a-white);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius);
  padding: 16px 16px 12px 20px;
  position: relative;
  cursor: pointer;
  transition: all var(--a-transition);
  overflow: hidden;
}
.agents-task-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--stripe, transparent);
  border-radius: var(--a-radius) 0 0 var(--a-radius);
}
.agents-task-card:hover { transform: translateY(-2px); border-color: var(--a-border-hover); box-shadow: var(--a-glow); }
.agents-task-card.done { opacity: 0.45; }
.agents-task-card.deleting { animation: agents-task-delete 0.32s ease forwards; pointer-events: none; }
.agents-task-card.agents-task-entering { animation: agents-task-enter 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }

.agents-card-check {
  position: absolute;
  top: 13px; right: 13px;
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(100,116,139,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--a-transition);
  font-size: 10px; color: #fff;
  z-index: 2;
}
.agents-card-check.checked { background: #6366f1; border-color: #6366f1; animation: agents-check-bounce 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.agents-card-check:hover:not(.checked) { border-color: #6366f1; }

.agents-card-title {
  font-size: 14px; font-weight: 600; color: var(--a-text);
  margin-bottom: 6px; padding-right: 32px; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.agents-card-title.done { text-decoration: line-through; color: var(--a-muted); }

.agents-card-desc {
  font-size: 12px; color: var(--a-muted); margin-bottom: 10px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.agents-card-footer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.agents-card-actions {
  position: absolute; bottom: 10px; right: 10px;
  display: none; gap: 4px;
}
.agents-task-card:hover .agents-card-actions { display: flex; }

.agents-task-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }

/* Dashboard Hero + Widgets */
.agents-dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 24px;
}
.agents-hero-greeting { font-size: 28px; font-weight: 800; color: var(--a-text); line-height: 1.2; }
.agents-hero-date { font-size: 13px; color: var(--a-muted); margin-top: 4px; }

.agents-widget-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
.agents-widget {
  background: var(--a-white);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius);
  padding: 18px;
  overflow: hidden;
}
.agents-widget-title {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--a-muted); margin-bottom: 12px;
}
```

- [ ] **Step 5: Update the responsive breakpoint**

Find the `@media (max-width: 767px)` block at the bottom and replace it with:

```css
/* Responsive */
@media (max-width: 767px) {
  .agents-sidebar {
    width: 100% !important;
    height: 56px;
    flex-direction: row;
    padding: 0 12px;
    gap: 0;
    justify-content: space-around;
    position: fixed;
    left: 0; right: 0; top: auto; bottom: 0;
  }
  .agents-logo-wrap { display: none; }
  .agents-divider { display: none; }
  .agents-nav-label { display: none; }
  .agents-sidebar-bottom { display: none; }
  .agents-main { left: 0; bottom: 56px; }
  .agents-task-grid { grid-template-columns: 1fr; }
  .agents-widget-row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/styles/globals.css
git commit -m "feat: CSS — collapsible sidebar, TaskCard, dashboard hero/widget classes"
```

---

## Task 4: Create `TaskCard` component

**Files:**
- Create: `fullstack/src/app/agents/components/TaskCard.tsx`

- [ ] **Step 1: Create the file**

Create `fullstack/src/app/agents/components/TaskCard.tsx`:

```typescript
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
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/components/TaskCard.tsx
git commit -m "feat: add TaskCard component with priority stripe and card layout"
```

---

## Task 5: Rewrite `Sidebar` — collapsible hover

**Files:**
- Modify: `fullstack/src/app/agents/components/Sidebar.tsx`

- [ ] **Step 1: Replace the full file contents**

```typescript
'use client'
import type { View } from '../types'

interface Props {
  view: View
  onView: (v: View) => void
  userName: string
  onUserNameChange: (name: string) => void
}

const NAV: { id: View; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'tasks',     icon: '✓', label: 'Tasks'     },
  { id: 'calendar',  icon: '⊙', label: 'Calendar'  },
  { id: 'analytics', icon: '↗', label: 'Analytics' },
]

export default function Sidebar({ view, onView, userName, onUserNameChange }: Props) {
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <nav className="agents-sidebar">
      {/* Logo */}
      <div className="agents-logo-wrap">
        <div className="agents-logo-icon">T</div>
        <span className="agents-logo-text">Tasks</span>
      </div>

      <div className="agents-divider" />

      {/* Nav items */}
      {NAV.map(n => (
        <button
          key={n.id}
          className={`agents-nav-item ${view === n.id ? 'active' : ''}`}
          onClick={() => onView(n.id)}
          aria-label={n.label}
        >
          <span style={{ fontSize: 17, flexShrink: 0, width: 26, textAlign: 'center', lineHeight: 1 }}>
            {n.icon}
          </span>
          <span className="agents-nav-label">{n.label}</span>
        </button>
      ))}

      {/* Bottom section */}
      <div className="agents-sidebar-bottom">
        <div className="agents-divider" />
        <button
          className="agents-nav-item"
          onClick={() => {
            const name = prompt('Your name:', userName)
            if (name?.trim()) {
              localStorage.setItem('agents_username', name.trim())
              onUserNameChange(name.trim())
            }
          }}
          aria-label="Settings"
        >
          <span style={{ fontSize: 17, flexShrink: 0, width: 26, textAlign: 'center', lineHeight: 1 }}>⚙</span>
          <span className="agents-nav-label">Settings</span>
        </button>
        <div className="agents-nav-item" style={{ cursor: 'default' }}>
          <div className="agents-avatar">{initials}</div>
          <span className="agents-nav-label" style={{ fontSize: 13, color: 'var(--a-text)', fontWeight: 500 }}>
            {userName}
          </span>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/components/Sidebar.tsx
git commit -m "feat: collapsible sidebar with hover-expand and nav labels"
```

---

## Task 6: Rewrite `DashboardView` — hero + 3-col widgets + activity

**Files:**
- Modify: `fullstack/src/app/agents/components/views/DashboardView.tsx`

- [ ] **Step 1: Replace the full file contents**

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { getTodayLabel, calcStreak, getToday, formatDueLabel } from '../../lib/utils'
import TaskRow from '../TaskRow'
import FocusTimer from '../FocusTimer'
import { useCountUp } from '../../hooks/useCountUp'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  userName: string
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onAdd: (title: string) => void
}

function getWeekCompletions(tasks: Task[], weeksAgo: number): number {
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - (weeksAgo + 1) * 7)
  const end   = new Date(now); end.setDate(now.getDate() - weeksAgo * 7)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d < end
  }).length
}

export default function DashboardView({ tasks, userName, onToggle, onEdit, onDelete, onAdd }: Props) {
  const [quickTitle, setQuickTitle] = useState('')
  const [greeting, setGreeting] = useState('Good morning')
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set())
  const prevLengthRef = useRef(tasks.length)
  const today = getToday()

  useEffect(() => { setGreeting(getTodayLabel()) }, [])

  useEffect(() => {
    if (tasks.length > prevLengthRef.current && tasks[0]) {
      const id = tasks[0].id
      setNewTaskIds(prev => new Set([...prev, id]))
      setTimeout(() => setNewTaskIds(prev => { const n = new Set(prev); n.delete(id); return n }), 600)
    }
    prevLengthRef.current = tasks.length
  }, [tasks])

  const todayTasks    = tasks.filter(t => t.dueDate === today)
  const totalTasks    = tasks.length
  const completedCount = tasks.filter(t => t.completed).length
  const completionPct  = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100)
  const dueTodayCount  = todayTasks.filter(t => !t.completed).length
  const streak         = calcStreak(tasks)
  const thisWeek       = getWeekCompletions(tasks, 0)
  const lastWeek       = getWeekCompletions(tasks, 1)

  const animPct    = useCountUp(completionPct)
  const animStreak = useCountUp(streak)
  const animTotal  = useCountUp(totalTasks)
  const animToday  = useCountUp(dueTodayCount)

  const statsReveal    = useScrollReveal()
  const activityReveal = useScrollReveal()

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { dateStr, hasCompletion: tasks.some(t => t.completedAt?.slice(0, 10) === dateStr) }
  })

  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate > today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .at(0) ?? null

  // SVG progress ring
  const radius       = 38
  const circumference = 2 * Math.PI * radius
  const strokeOffset  = circumference - (animPct / 100) * circumference

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTitle.trim()) { onAdd(quickTitle.trim()); setQuickTitle('') }
  }

  return (
    <div>
      {/* Stats banner */}
      <div className="agents-main-header">
        <div ref={statsReveal.ref} className={`agents-reveal ${statsReveal.isVisible ? 'visible' : ''}`}>
          <div className="agents-stats-row" style={{ marginBottom: 0 }}>
            <div className="agents-stat">
              <div className="agents-stat-val">{animTotal}</div>
              <div className="agents-stat-label">Total</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animToday}</div>
              <div className="agents-stat-label">Due Today</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{completedCount}</div>
              <div className="agents-stat-label">Completed</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animStreak}🔥</div>
              <div className="agents-stat-label">Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="agents-content">
        {/* Hero */}
        <div className="agents-dashboard-hero">
          <div>
            <div className="agents-hero-greeting">{greeting}, {userName}.</div>
            <div className="agents-hero-date">{todayDate}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--a-muted)' }}>
              {dueTodayCount > 0
                ? `You have ${dueTodayCount} task${dueTodayCount !== 1 ? 's' : ''} due today.`
                : 'Nothing due today — great job!'}
            </div>
          </div>
          {/* SVG circular progress ring */}
          <svg width="110" height="110" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="url(#dash-ring)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="dash-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <text x="50" y="47" textAnchor="middle" fill="#e2e8f0" fontSize="17" fontWeight="700">{animPct}%</text>
            <text x="50" y="60" textAnchor="middle" fill="#64748b" fontSize="9">complete</text>
          </svg>
        </div>

        {/* 3-column widget row */}
        <div className="agents-widget-row">
          {/* Today's Focus */}
          <div className="agents-widget">
            <div className="agents-widget-title">Today&apos;s Focus</div>
            {todayTasks.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--a-muted)', fontStyle: 'italic', marginBottom: 12 }}>
                Nothing due today.
              </div>
            )}
            {todayTasks.slice(0, 4).map(t => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                isNew={newTaskIds.has(t.id)}
              />
            ))}
            <form className="agents-quick-add" onSubmit={handleQuickAdd} style={{ marginTop: 10 }}>
              <input
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                placeholder="Quick add for today…"
              />
              <button type="submit" className="agents-btn-primary">Add</button>
            </form>
          </div>

          {/* Focus Timer */}
          <div className="agents-widget">
            <FocusTimer />
          </div>

          {/* Streak & Upcoming */}
          <div className="agents-widget">
            <div className="agents-widget-title">Streak</div>
            <div className="agents-streak-box" style={{ marginBottom: 18 }}>
              <div className="agents-streak-num">{animStreak}</div>
              <div className="agents-streak-label">Consecutive<br />Days</div>
            </div>
            {upcoming && (
              <>
                <div className="agents-widget-title">Up Next</div>
                <div className="agents-upcoming-card">
                  <div className="agents-upcoming-title">{upcoming.title}</div>
                  <div className="agents-upcoming-due">{formatDueLabel(upcoming.dueDate)}</div>
                </div>
              </>
            )}
            {!upcoming && (
              <div style={{ fontSize: 11, color: 'var(--a-muted)', fontStyle: 'italic' }}>No upcoming tasks.</div>
            )}
          </div>
        </div>

        {/* Activity section */}
        <div ref={activityReveal.ref} className={`agents-reveal ${activityReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>Activity — Last 14 Days</div>
              <div className="agents-streak-grid">
                {last14.map(({ dateStr, hasCompletion }) => (
                  <div key={dateStr} className={`agents-streak-cell ${hasCompletion ? 'has-completion' : ''}`} title={dateStr} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--a-muted)' }}>
                <span>14 days ago</span><span>Today</span>
              </div>
            </div>
            <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>This Week vs Last Week</div>
              {[{ label: 'This Week', val: thisWeek }, { label: 'Last Week', val: lastWeek }].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 72, fontSize: 11, color: 'var(--a-muted)' }}>{label}</div>
                  <div className="agents-bar-track" style={{ flex: 1 }}>
                    <div className="agents-bar-fill" style={{ width: `${Math.min((val / Math.max(thisWeek, lastWeek, 1)) * 100, 100)}%` }} />
                  </div>
                  <div style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--a-text)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/components/views/DashboardView.tsx
git commit -m "feat: redesign Dashboard — hero section, progress ring, 3-col widget row"
```

---

## Task 7: Update `TasksView` — 2-column card grid using TaskCard

**Files:**
- Modify: `fullstack/src/app/agents/components/views/TasksView.tsx`

- [ ] **Step 1: Replace the full file contents**

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import TaskCard from '../TaskCard'
import type { Task, FilterTab, Category } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'priority',  label: 'Priority'  },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
]
const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']

export default function TasksView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set())
  const prevLengthRef = useRef(tasks.length)

  useEffect(() => {
    if (tasks.length > prevLengthRef.current && tasks[0]) {
      const id = tasks[0].id
      setNewTaskIds(prev => new Set([...prev, id]))
      setTimeout(() => setNewTaskIds(prev => { const n = new Set(prev); n.delete(id); return n }), 600)
    }
    prevLengthRef.current = tasks.length
  }, [tasks])

  const filtered = tasks
    .filter(t => {
      if (filter === 'priority')  return ['high', 'medium'].includes(t.priority) && !t.completed
      if (filter === 'scheduled') return !!t.dueDate && !t.completed
      if (filter === 'completed') return t.completed
      return !t.completed
    })
    .filter(t => !activeCategory || t.category === activeCategory)
    .sort((a, b) => {
      const pOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  const totalVisible = tasks.filter(t => !t.completed).length

  return (
    <div>
      <div className="agents-main-header">
        <div className="agents-greeting">My Tasks</div>
        <div className="agents-sub">
          {totalVisible} active task{totalVisible !== 1 ? 's' : ''} across all categories.
        </div>
      </div>
      <div className="agents-content">
        <div className="agents-tabs">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`agents-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <button className="agents-add-btn" onClick={onOpenNew}>+ New Task</button>
        </div>

        <div className="agents-tags">
          <button
            className={`agents-tag ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`agents-tag ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c === activeCategory ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: 'var(--a-muted)', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
            No tasks here.{' '}
            {filter === 'completed'
              ? 'Complete a task to see it here.'
              : 'Click "+ New Task" to add one.'}
          </div>
        )}

        <div className="agents-task-grid">
          {filtered.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              isNew={newTaskIds.has(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/components/views/TasksView.tsx
git commit -m "feat: TasksView uses 2-column TaskCard grid"
```

---

## Task 8: Update `CalendarView` — TaskCard in day panel

**Files:**
- Modify: `fullstack/src/app/agents/components/views/CalendarView.tsx`

- [ ] **Step 1: Replace `TaskRow` import with `TaskCard` and update the day panel**

The only changes are: import `TaskCard` instead of `TaskRow`, and use `TaskCard` in the selected-day panel. Replace the full file:

```typescript
'use client'
import { useState } from 'react'
import { priorityColor, getToday } from '../../lib/utils'
import TaskCard from '../TaskCard'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const today = getToday()
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(today)

  const firstDay     = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth  = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const daysInPrev   = new Date(cursor.year, cursor.month, 0).getDate()

  const cells: { date: string; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(cursor.year, cursor.month - 1, daysInPrev - i)
    cells.push({ date: d.toISOString().slice(0, 10), isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.year, cursor.month, d).toISOString().slice(0, 10)
    cells.push({ date, isCurrentMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(cursor.year, cursor.month + 1, cells.length - daysInMonth - firstDay + 1)
    cells.push({ date: d.toISOString().slice(0, 10), isCurrentMonth: false })
  }

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.dueDate) { (acc[t.dueDate] ??= []).push(t) }
    return acc
  }, {})

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : []

  const prevMonth = () => setCursor(c => {
    const m = c.month === 0 ? 11 : c.month - 1
    const y = c.month === 0 ? c.year - 1 : c.year
    return { year: y, month: m }
  })
  const nextMonth = () => setCursor(c => {
    const m = c.month === 11 ? 0 : c.month + 1
    const y = c.month === 11 ? c.year + 1 : c.year
    return { year: y, month: m }
  })

  return (
    <div className="agents-view-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="agents-main-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="agents-greeting">{MONTHS[cursor.month]} {cursor.year}</div>
          <button onClick={prevMonth} className="agents-icon-btn">‹</button>
          <button onClick={nextMonth} className="agents-icon-btn">›</button>
          <button onClick={onOpenNew} className="agents-add-btn" style={{ marginLeft: 'auto' }}>+ New Task</button>
        </div>
      </div>
      <div className="agents-content" style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="agents-cal-grid">
            {DAYS.map(d => <div key={d} className="agents-cal-header">{d}</div>)}
            {cells.map(({ date, isCurrentMonth }) => {
              const dayTasks  = tasksByDate[date] ?? []
              const isToday   = date === today
              const isSelected = date === selectedDate
              return (
                <div
                  key={date}
                  className={`agents-cal-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  style={isSelected && !isToday ? { background: 'rgba(99,102,241,0.1)', outline: '2px solid rgba(99,102,241,0.6)' } : {}}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{new Date(date + 'T00:00:00').getDate()}</span>
                  {dayTasks.length > 0 && (
                    <div className="agents-cal-dots">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="agents-cal-dot" style={{ background: priorityColor(t.priority) }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {selectedTasks.length === 0 && (
              <div style={{ color: 'var(--a-muted)', fontSize: 12, fontStyle: 'italic' }}>No tasks this day.</div>
            )}
            {selectedTasks.map(t => (
              <TaskCard key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd "C:\Claude Code Test 1"
git add fullstack/src/app/agents/components/views/CalendarView.tsx
git commit -m "feat: CalendarView day panel uses TaskCard"
```

---

## Task 9: Update `page.tsx` — remove RightPanel, fix layout

**Files:**
- Modify: `fullstack/src/app/agents/page.tsx`
- Delete: `fullstack/src/app/agents/components/RightPanel.tsx`

- [ ] **Step 1: Replace full `page.tsx` contents**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import Sidebar from './components/Sidebar'
import TaskModal from './components/TaskModal'
import VoiceFab from './components/VoiceFab'
import DashboardView from './components/views/DashboardView'
import TasksView from './components/views/TasksView'
import CalendarView from './components/views/CalendarView'
import AnalyticsView from './components/views/AnalyticsView'
import type { View, Task } from './types'

const VIEW_ORDER: View[] = ['dashboard', 'tasks', 'calendar', 'analytics']

export default function AgentsPage() {
  const [view, setView]               = useState<View>('dashboard')
  const [prevView, setPrevView]       = useState<View | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [userName, setUserName]       = useState('Alex')
  const [modalTask, setModalTask]     = useState<Task | 'new' | null>(null)
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  useEffect(() => {
    const stored = localStorage.getItem('agents_username')
    if (stored) setUserName(stored)
  }, [])

  const handleViewChange = (newView: View) => {
    if (newView === view || transitioning) return
    setPrevView(view)
    setTransitioning(true)
    setView(newView)
    setTimeout(() => { setPrevView(null); setTransitioning(false) }, 300)
  }

  const openNew   = () => setModalTask('new')
  const openEdit  = (t: Task) => setModalTask(t)
  const closeModal = () => setModalTask(null)

  const handleSave = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    if (modalTask === 'new' || modalTask === null) { addTask(data) }
    else { updateTask(modalTask.id, data) }
  }

  const handleQuickAdd = (title: string) => {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    addTask({ title, description: '', priority: 'none', category: 'Work', dueDate: today })
  }

  const handleVoiceConfirm = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    addTask(data)
  }

  const props = { tasks, onToggle: toggleComplete, onEdit: openEdit, onDelete: deleteTask }

  const direction = prevView
    ? VIEW_ORDER.indexOf(view) > VIEW_ORDER.indexOf(prevView) ? 'right' : 'left'
    : 'right'

  return (
    <div className="agents-root">
      <Sidebar view={view} onView={handleViewChange} userName={userName} onUserNameChange={setUserName} />

      <div className="agents-main">
        {/* Outgoing view */}
        {prevView && (
          <div className={`agents-view-container agents-view-exit-${direction === 'right' ? 'left' : 'right'}`}>
            {prevView === 'dashboard' && <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />}
            {prevView === 'tasks'     && <TasksView {...props} onOpenNew={openNew} />}
            {prevView === 'calendar'  && <CalendarView {...props} onOpenNew={openNew} />}
            {prevView === 'analytics' && <AnalyticsView tasks={tasks} />}
          </div>
        )}

        {/* Incoming view */}
        <div className={`agents-view-container ${prevView ? `agents-view-enter-${direction}` : ''}`}>
          {view === 'dashboard' && <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />}
          {view === 'tasks'     && <TasksView {...props} onOpenNew={openNew} />}
          {view === 'calendar'  && <CalendarView {...props} onOpenNew={openNew} />}
          {view === 'analytics' && <AnalyticsView tasks={tasks} />}
          {view !== 'calendar'  && <VoiceFab onConfirm={handleVoiceConfirm} />}
        </div>
      </div>

      {modalTask !== null && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Delete RightPanel**

```bash
rm "C:\Claude Code Test 1\fullstack\src\app\agents\components\RightPanel.tsx"
```

- [ ] **Step 3: Run full test suite and TypeScript check**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit && npx jest --no-coverage
```

Expected: 0 TypeScript errors, 38 tests PASS

- [ ] **Step 4: Commit**

```bash
cd "C:\Claude Code Test 1"
git add -A
git commit -m "feat: remove RightPanel, page.tsx uses 2-panel layout with fixed sidebar"
```

---

## Task 10: Python voice script

**Files:**
- Create: `scripts/voice_task.py`
- Create: `scripts/requirements.txt`

- [ ] **Step 1: Create the requirements file**

Create `scripts/requirements.txt`:

```
faster-whisper>=1.0.0
sounddevice>=0.4.6
scipy>=1.11.0
numpy>=1.24.0
```

- [ ] **Step 2: Create the script**

Create `scripts/voice_task.py`:

```python
#!/usr/bin/env python3
"""
voice_task.py — Record 5 seconds of audio, transcribe locally with faster-whisper,
                then add the result as a task to the task manager.

Requirements:
    pip install faster-whisper sounddevice scipy numpy

Usage:
    python scripts/voice_task.py

The Next.js dev server must be running:
    npm run dev:fullstack   (from repo root)
"""

import sys
import os
import time
import tempfile
import json
import urllib.request
import urllib.error

SAMPLE_RATE  = 16000
DURATION     = 5          # seconds to record
API_URL      = "http://localhost:3001/api/todos"
MODEL_SIZE   = "base"     # tiny | base | small | medium | large-v3


def record_audio(duration: int, sample_rate: int):
    try:
        import numpy as np
        import sounddevice as sd
    except ImportError:
        print("ERROR: Run:  pip install sounddevice numpy scipy faster-whisper")
        sys.exit(1)

    print("Recording in:", end=" ", flush=True)
    for i in (3, 2, 1):
        print(f"{i}...", end=" ", flush=True)
        time.sleep(1)
    print(f"\n🎙  Listening for {duration} seconds...", flush=True)

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="int16",
    )
    sd.wait()
    print("✓  Done recording.", flush=True)
    return audio


def transcribe(audio, sample_rate: int) -> str:
    from scipy.io.wavfile import write as wav_write
    from faster_whisper import WhisperModel

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp_path = f.name

    try:
        wav_write(tmp_path, sample_rate, audio)
        print(f"⏳  Transcribing with Whisper '{MODEL_SIZE}' model...", flush=True)
        model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(tmp_path, beam_size=5)
        text = " ".join(seg.text.strip() for seg in segments).strip()
        return text
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def add_task(title: str) -> dict:
    payload = json.dumps({
        "title": title,
        "priority": "none",
        "category": "Work",
        "dueDate": None,
    }).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def main():
    print("=== Voice Task — Task Manager ===\n")

    audio      = record_audio(DURATION, SAMPLE_RATE)
    transcript = transcribe(audio, SAMPLE_RATE)

    if not transcript:
        print("\n⚠  No speech detected. Try again.")
        sys.exit(1)

    print(f'\n📝  Transcript: "{transcript}"')
    confirm = input("Add this as a task? [Y/n]: ").strip().lower()
    if confirm not in ("", "y", "yes"):
        print("Cancelled.")
        sys.exit(0)

    try:
        result = add_task(transcript)
        print(f"\n✅  Task added!  ID: {result.get('id', '?')}")
        print(f"    Open http://localhost:3001/agents — it will appear within 3 seconds.")
    except urllib.error.URLError as e:
        print(f"\n❌  Could not reach the server: {e}")
        print(f"    Make sure the dev server is running:  npm run dev:fullstack")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Verify the scripts directory exists and files are created correctly**

```bash
ls "C:\Claude Code Test 1\scripts" 2>/dev/null || ls "C:\Claude Code Test 1\scripts\"
```

Both `voice_task.py` and `requirements.txt` should appear.

- [ ] **Step 4: Run final full test suite**

```bash
cd "C:\Claude Code Test 1\fullstack"
npx tsc --noEmit && npx jest --no-coverage
```

Expected: 0 TypeScript errors, 38 tests PASS

- [ ] **Step 5: Commit**

```bash
cd "C:\Claude Code Test 1"
git add scripts/voice_task.py scripts/requirements.txt
git commit -m "feat: Python voice script — record, transcribe with faster-whisper, POST to /api/todos"
```

---

## Self-Review

**Spec coverage:**
- ✅ Collapsible sidebar (56px → 220px hover) — Task 3 + Task 5
- ✅ 2-column TaskCard grid — Task 4 + Task 7
- ✅ Dashboard hero + progress ring + 3-col widgets — Task 6
- ✅ Timer moved into Dashboard widget — Task 6 imports FocusTimer
- ✅ RightPanel removed — Task 9
- ✅ CalendarView day panel uses TaskCard — Task 8
- ✅ `/api/todos` GET + POST — Task 1
- ✅ `useTasks` polling every 3s — Task 2
- ✅ Python script: record → faster-whisper → POST — Task 10
- ✅ Duplicate task prevention in poll — Task 2 test + implementation
- ✅ `data/pending-tasks.json` created — Task 1

**No placeholders found.**

**Type consistency:**
- `TaskCard` uses same props interface shape as `TaskRow` — confirmed
- `appendToQueue` / `drainQueue` / `readQueue` named consistently across `queue.ts` and `route.ts` — confirmed
- `Task` type imported from same source in all files — confirmed
