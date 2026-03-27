# Task Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured task manager at `/agents` with voice input, Pomodoro timer, calendar, and analytics using a warm earth-tone palette fused from 5 UI reference designs.

**Architecture:** Three-column shell (62px icon sidebar + flex-1 scrollable main + 200px fixed right panel). View switching via in-app state (no URL routing). All task data persisted in `localStorage` via `useTasks` hook. Voice input uses browser Web Speech API for live transcription + Claude `claude-haiku-4-5-20251001` for NLP parsing via `/api/voice-parse`.

**Tech Stack:** Next.js 14 App Router · TypeScript · localStorage · Web Speech API · `@anthropic-ai/sdk` (already installed) · Scoped `.agents-*` CSS in `globals.css`

**Important:** `ANTHROPIC_API_KEY` in `fullstack/.env.local` is currently a placeholder. The voice feature requires a real key from console.anthropic.com. All other features work without it.

---

## File Map

```
fullstack/src/app/agents/
├── page.tsx                    # 'use client' — shell layout, view state, voice wiring
├── types.ts                    # All TS interfaces (Task, TimerState, ParsedTask, etc.)
├── hooks/
│   ├── useTasks.ts             # Task CRUD + localStorage sync
│   ├── useTimer.ts             # Pomodoro countdown + mode progression
│   └── useVoice.ts             # Web Speech API + /api/voice-parse call
└── components/
    ├── Sidebar.tsx             # 62px icon nav — espresso bg
    ├── RightPanel.tsx          # Container: FocusTimer + schedule + streak + upcoming
    ├── FocusTimer.tsx          # Timer display, controls, session dots
    ├── TaskModal.tsx           # Add/edit modal with form fields
    ├── TaskRow.tsx             # Single task row: checkbox + priority + title + meta
    ├── VoiceFab.tsx            # Mic FAB + transcript pill + preview card (all-in-one)
    └── views/
        ├── DashboardView.tsx   # Greeting + stats row + today's focus list
        ├── TasksView.tsx       # Filter tabs + category tags + task list
        ├── CalendarView.tsx    # Month grid with task dots + day panel
        └── AnalyticsView.tsx   # Streak grid + category bars + priority chips

fullstack/src/app/api/voice-parse/
└── route.ts                    # POST: {transcript, today} → ParsedTask JSON

fullstack/src/styles/globals.css   # Append .agents-* scoped CSS block
fullstack/__tests__/agents/
├── utils.test.ts               # Streak calc, date helpers
├── useTasks.test.ts            # CRUD logic (mock localStorage)
└── voice-parse.test.ts         # API route (mock Anthropic SDK)
```

---

## Task 1: Types, CSS, and utility helpers

**Files:**
- Create: `fullstack/src/app/agents/types.ts`
- Create: `fullstack/src/app/agents/lib/utils.ts`
- Modify: `fullstack/src/styles/globals.css` (append block at end)
- Create: `fullstack/__tests__/agents/utils.test.ts`

- [ ] **Step 1: Write failing tests for utility helpers**

Create `fullstack/__tests__/agents/utils.test.ts`:

```typescript
import { getToday, getTodayLabel, calcStreak, getDaysRemaining, priorityColor } from '../../src/app/agents/lib/utils'
import type { Task } from '../../src/app/agents/types'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test',
  description: '',
  completed: false,
  priority: 'none',
  category: 'Work',
  dueDate: null,
  createdAt: new Date().toISOString(),
  completedAt: null,
  ...overrides,
})

describe('getToday', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getTodayLabel', () => {
  it('returns time-aware greeting', () => {
    const label = getTodayLabel()
    expect(['Good morning', 'Good afternoon', 'Good evening'].some(g => label.startsWith(g))).toBe(true)
  })
})

describe('calcStreak', () => {
  it('returns 0 for no tasks', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('counts consecutive days with completions', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tasks = [
      makeTask({ completed: true, completedAt: today.toISOString() }),
      makeTask({ completed: true, completedAt: yesterday.toISOString() }),
    ]
    expect(calcStreak(tasks)).toBe(2)
  })

  it('stops at gap day', () => {
    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)
    const tasks = [
      makeTask({ completed: true, completedAt: today.toISOString() }),
      makeTask({ completed: true, completedAt: twoDaysAgo.toISOString() }),
    ]
    expect(calcStreak(tasks)).toBe(1)
  })
})

describe('getDaysRemaining', () => {
  it('returns null for null dueDate', () => {
    expect(getDaysRemaining(null)).toBeNull()
  })

  it('returns 0 for today', () => {
    expect(getDaysRemaining(getToday())).toBe(0)
  })
})

describe('priorityColor', () => {
  it('maps high to red', () => {
    expect(priorityColor('high')).toBe('#ef4444')
  })
  it('maps none to stone', () => {
    expect(priorityColor('none')).toBe('#BEB9A9')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd fullstack && npx jest agents/utils --no-coverage 2>&1 | tail -5
```
Expected: FAIL — `Cannot find module '../../src/app/agents/lib/utils'`

- [ ] **Step 3: Create types.ts**

Create `fullstack/src/app/agents/types.ts`:

```typescript
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
```

- [ ] **Step 4: Create utils.ts**

Create `fullstack/src/app/agents/lib/utils.ts`:

```typescript
import type { Task, Priority } from '../types'

export function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getTodayLabel(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function calcStreak(tasks: Task[]): number {
  const completedDays = new Set(
    tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => t.completedAt!.slice(0, 10))
  )
  let streak = 0
  const cursor = new Date()
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10)
    if (!completedDays.has(dateStr)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function priorityColor(p: Priority): string {
  return { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#BEB9A9' }[p]
}

export function formatDueLabel(dueDate: string | null): string {
  const days = getDaysRemaining(dueDate)
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return dueDate!
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd fullstack && npx jest agents/utils --no-coverage 2>&1 | tail -5
```
Expected: `Tests: 7 passed`

- [ ] **Step 6: Append agents CSS block to globals.css**

Add at the very end of `fullstack/src/styles/globals.css`:

```css
/* ============================================================
   AGENTS — Task Manager (scoped, does not affect Study Hub)
   ============================================================ */
.agents-root {
  --a-espresso: #472D1F;
  --a-stone: #BEB9A9;
  --a-cream: #FFEFB5;
  --a-bg: #FDF8EC;
  --a-white: #ffffff;
  --a-border: rgba(71, 45, 31, 0.15);
  --a-border-hover: rgba(71, 45, 31, 0.35);
  --a-text: #2a1a10;
  --a-muted: #8a7060;
  --a-radius: 10px;
  --a-radius-sm: 6px;
  --a-shadow: 0 2px 12px rgba(71, 45, 31, 0.1);
  --a-shadow-md: 0 4px 24px rgba(71, 45, 31, 0.15);
  --a-transition: 150ms ease;

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--a-bg);
  color: var(--a-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
}

/* Sidebar */
.agents-sidebar {
  width: 62px;
  flex-shrink: 0;
  background: var(--a-espresso);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 4px;
}
.agents-logo {
  color: var(--a-cream);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 12px;
}
.agents-divider { width: 28px; height: 1px; background: rgba(255,239,181,0.15); margin: 4px 0; }
.agents-nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,239,181,0.45);
  font-size: 17px;
  transition: all var(--a-transition);
  position: relative;
}
.agents-nav-icon:hover { background: rgba(255,239,181,0.1); color: var(--a-cream); }
.agents-nav-icon.active { background: rgba(255,239,181,0.18); color: var(--a-cream); }
.agents-nav-icon .tooltip {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--a-espresso);
  color: var(--a-cream);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--a-transition);
  z-index: 100;
  border: 1px solid rgba(255,239,181,0.2);
}
.agents-nav-icon:hover .tooltip { opacity: 1; }
.agents-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--a-cream);
  color: var(--a-espresso);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: auto;
  cursor: pointer;
}

/* Main content area */
.agents-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--a-bg);
}
.agents-main-header {
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--a-border);
  flex-shrink: 0;
}
.agents-greeting { font-size: 22px; font-weight: 700; color: var(--a-espresso); }
.agents-sub { font-size: 12px; color: var(--a-muted); margin-top: 2px; }
.agents-content { flex: 1; overflow-y: auto; padding: 16px 24px; }

/* Stats row */
.agents-stats-row { display: flex; gap: 10px; margin-bottom: 16px; }
.agents-stat {
  flex: 1;
  background: var(--a-white);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius);
  padding: 12px 14px;
}
.agents-stat-val { font-size: 22px; font-weight: 700; color: var(--a-espresso); }
.agents-stat-label { font-size: 10px; color: var(--a-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

/* Filter tabs */
.agents-tabs { display: flex; gap: 4px; align-items: center; margin-bottom: 10px; }
.agents-tab {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid var(--a-border);
  color: var(--a-muted);
  background: transparent;
  transition: all var(--a-transition);
  user-select: none;
}
.agents-tab:hover { border-color: var(--a-border-hover); color: var(--a-text); }
.agents-tab.active { background: var(--a-espresso); color: var(--a-cream); border-color: var(--a-espresso); }
.agents-add-btn {
  margin-left: auto;
  background: var(--a-espresso);
  color: var(--a-cream);
  border: none;
  border-radius: var(--a-radius-sm);
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity var(--a-transition);
}
.agents-add-btn:hover { opacity: 0.85; }

/* Category tags */
.agents-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.agents-tag {
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid var(--a-border);
  color: var(--a-muted);
  background: transparent;
  transition: all var(--a-transition);
  user-select: none;
}
.agents-tag:hover { border-color: var(--a-border-hover); color: var(--a-text); }
.agents-tag.active { background: var(--a-espresso); color: var(--a-cream); border-color: var(--a-espresso); font-weight: 600; }

/* Task rows */
.agents-task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--a-white);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all var(--a-transition);
  position: relative;
}
.agents-task-row:hover {
  border-color: var(--a-border-hover);
  box-shadow: var(--a-shadow);
}
.agents-task-row.done { opacity: 0.5; }
.agents-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--a-stone);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--a-transition);
  cursor: pointer;
}
.agents-check.checked { background: var(--a-espresso); border-color: var(--a-espresso); color: var(--a-cream); font-size: 9px; }
.agents-priority-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.agents-task-title { flex: 1; font-size: 13px; font-weight: 500; color: var(--a-text); }
.agents-task-title.done { text-decoration: line-through; color: var(--a-muted); }
.agents-task-chip { font-size: 10px; padding: 2px 7px; border-radius: 4px; background: rgba(71,45,31,0.07); color: var(--a-muted); }
.agents-task-due { font-size: 11px; color: var(--a-stone); }
.agents-task-actions {
  display: none;
  gap: 4px;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.agents-task-row:hover .agents-task-actions { display: flex; }
.agents-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: none;
  background: rgba(71,45,31,0.07);
  color: var(--a-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all var(--a-transition);
}
.agents-icon-btn:hover { background: rgba(71,45,31,0.15); color: var(--a-text); }
.agents-icon-btn.danger:hover { background: #fee2e2; color: #ef4444; }

/* Modal */
.agents-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(71,45,31,0.25);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: agents-fade-in 0.12s ease;
}
.agents-modal {
  background: var(--a-white);
  border-radius: 14px;
  padding: 24px;
  width: 420px;
  max-width: 90vw;
  box-shadow: var(--a-shadow-md);
  animation: agents-scale-in 0.12s ease;
}
.agents-modal h3 { font-size: 16px; font-weight: 700; color: var(--a-espresso); margin-bottom: 18px; }
.agents-field { margin-bottom: 14px; }
.agents-field label { display: block; font-size: 11px; font-weight: 600; color: var(--a-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.agents-field input, .agents-field textarea, .agents-field select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-sm);
  font-size: 13px;
  color: var(--a-text);
  background: var(--a-bg);
  outline: none;
  font-family: inherit;
  transition: border-color var(--a-transition);
}
.agents-field input:focus, .agents-field textarea:focus, .agents-field select:focus {
  border-color: var(--a-espresso);
}
.agents-field textarea { resize: vertical; min-height: 72px; }
.agents-field-row { display: flex; gap: 10px; }
.agents-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
.agents-btn-secondary {
  padding: 7px 16px;
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-muted);
  font-size: 13px;
  cursor: pointer;
}
.agents-btn-primary {
  padding: 7px 16px;
  border: none;
  border-radius: var(--a-radius-sm);
  background: var(--a-espresso);
  color: var(--a-cream);
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
}

/* Right panel */
.agents-right-panel {
  width: 200px;
  flex-shrink: 0;
  background: var(--a-espresso);
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 18px;
  overflow-y: auto;
}
.agents-panel-title { font-size: 9px; color: rgba(255,239,181,0.45); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
.agents-timer-time { font-size: 34px; font-weight: 700; color: var(--a-cream); letter-spacing: 3px; text-align: center; line-height: 1; }
.agents-timer-mode { font-size: 10px; color: rgba(255,239,181,0.55); text-align: center; margin-top: 3px; }
.agents-timer-progress { background: rgba(255,239,181,0.12); border-radius: 3px; height: 3px; margin-top: 8px; overflow: hidden; }
.agents-timer-fill { background: var(--a-cream); height: 100%; transition: width 1s linear; }
.agents-session-dots { display: flex; gap: 5px; justify-content: center; margin-top: 6px; }
.agents-session-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,239,181,0.15); }
.agents-session-dot.done { background: var(--a-cream); }
.agents-timer-controls { display: flex; gap: 6px; justify-content: center; margin-top: 8px; }
.agents-timer-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,239,181,0.2);
  background: rgba(255,239,181,0.1);
  color: var(--a-cream);
  font-size: 11px;
  cursor: pointer;
  transition: background var(--a-transition);
}
.agents-timer-btn:hover { background: rgba(255,239,181,0.2); }
.agents-timer-btn.primary { background: rgba(255,239,181,0.2); font-weight: 600; }
.agents-schedule-item {
  background: rgba(255,239,181,0.06);
  border-radius: 6px;
  padding: 7px 9px;
  margin-bottom: 5px;
  border-left: 2px solid rgba(255,239,181,0.25);
}
.agents-schedule-title { font-size: 11px; color: var(--a-cream); font-weight: 500; }
.agents-schedule-cat { font-size: 9px; color: rgba(190,185,169,0.7); margin-top: 1px; }
.agents-streak-box { background: rgba(255,239,181,0.1); border-radius: 8px; padding: 8px; display: flex; align-items: center; gap: 10px; }
.agents-streak-num { font-size: 28px; font-weight: 700; color: var(--a-cream); line-height: 1; }
.agents-streak-label { font-size: 9px; color: rgba(255,239,181,0.55); line-height: 1.5; }
.agents-upcoming-card { background: rgba(255,239,181,0.05); border: 1px solid rgba(255,239,181,0.1); border-radius: 8px; padding: 10px; }
.agents-upcoming-title { font-size: 11px; color: var(--a-cream); font-weight: 600; margin-top: 4px; }
.agents-upcoming-due { font-size: 9px; color: var(--a-stone); margin-top: 3px; }

/* Calendar */
.agents-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
.agents-cal-header { text-align: center; font-size: 10px; font-weight: 600; color: var(--a-muted); text-transform: uppercase; padding: 6px 0; }
.agents-cal-cell {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4px;
  cursor: pointer;
  transition: background var(--a-transition);
  font-size: 12px;
  color: var(--a-text);
  min-height: 52px;
}
.agents-cal-cell:hover { background: rgba(71,45,31,0.07); }
.agents-cal-cell.today { background: var(--a-espresso); color: var(--a-cream); border-radius: 8px; }
.agents-cal-cell.other-month { color: var(--a-stone); }
.agents-cal-dots { display: flex; gap: 2px; flex-wrap: wrap; justify-content: center; margin-top: 2px; }
.agents-cal-dot { width: 5px; height: 5px; border-radius: 50%; }

/* Analytics */
.agents-bar-track { background: var(--a-border); border-radius: 3px; height: 8px; overflow: hidden; flex: 1; }
.agents-bar-fill { height: 100%; border-radius: 3px; background: var(--a-espresso); transition: width 0.3s ease; }
.agents-streak-grid { display: flex; gap: 3px; flex-wrap: wrap; }
.agents-streak-cell { width: 14px; height: 14px; border-radius: 3px; background: rgba(71,45,31,0.1); }
.agents-streak-cell.has-completion { background: var(--a-espresso); }

/* Voice FAB */
.agents-voice-fab {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--a-espresso);
  color: var(--a-cream);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: var(--a-shadow-md);
  transition: all var(--a-transition);
  z-index: 50;
}
.agents-voice-fab:hover { transform: scale(1.05); }
.agents-voice-fab.recording { background: #ef4444; animation: agents-pulse 1s infinite; }
.agents-transcript-pill {
  position: absolute;
  bottom: 76px;
  right: 10px;
  background: var(--a-espresso);
  color: var(--a-cream);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  max-width: 240px;
  box-shadow: var(--a-shadow);
  animation: agents-slide-up 0.15s ease;
}
.agents-voice-preview {
  position: absolute;
  bottom: 80px;
  right: 10px;
  background: var(--a-white);
  border: 1px solid var(--a-border);
  border-radius: 14px;
  padding: 16px;
  width: 280px;
  box-shadow: var(--a-shadow-md);
  animation: agents-slide-up 0.15s ease;
  z-index: 60;
}
.agents-voice-preview h4 { font-size: 12px; font-weight: 700; color: var(--a-espresso); margin-bottom: 10px; }
.agents-voice-preview .agents-field { margin-bottom: 8px; }
.agents-voice-actions { display: flex; gap: 6px; margin-top: 10px; }

/* Quick-add bar */
.agents-quick-add { display: flex; gap: 8px; margin-top: 16px; }
.agents-quick-add input {
  flex: 1;
  padding: 9px 14px;
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius);
  font-size: 13px;
  color: var(--a-text);
  background: var(--a-white);
  outline: none;
  font-family: inherit;
}
.agents-quick-add input:focus { border-color: var(--a-espresso); }

/* Animations */
@keyframes agents-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes agents-scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes agents-slide-up { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes agents-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } }
.agents-view-enter { animation: agents-fade-in 0.15s ease; }

/* Responsive */
@media (max-width: 767px) {
  .agents-root { flex-direction: column; }
  .agents-sidebar { width: 100%; height: 56px; flex-direction: row; padding: 0 12px; gap: 0; justify-content: space-around; order: 2; }
  .agents-logo { display: none; }
  .agents-divider { display: none; }
  .agents-nav-icon .tooltip { display: none; }
  .agents-right-panel { display: none; }
  .agents-main { order: 1; }
}
```

- [ ] **Step 7: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/types.ts fullstack/src/app/agents/lib/utils.ts fullstack/src/styles/globals.css fullstack/__tests__/agents/utils.test.ts && git commit -m "feat(agents): add types, CSS tokens, and utility helpers"
```

---

## Task 2: useTasks hook

**Files:**
- Create: `fullstack/src/app/agents/hooks/useTasks.ts`
- Create: `fullstack/__tests__/agents/useTasks.test.ts`

- [ ] **Step 1: Write failing test**

Create `fullstack/__tests__/agents/useTasks.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../../src/app/agents/hooks/useTasks'

// Mock localStorage
const mockStorage: Record<string, string> = {}
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v },
      removeItem: (k: string) => { delete mockStorage[k] },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    },
    writable: true,
  })
  mockStorage['agents_tasks'] = '[]'
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
})
```

- [ ] **Step 2: Check if @testing-library/react is installed**

```bash
cd fullstack && cat package.json | grep testing-library
```
If not present, install it:
```bash
cd fullstack && npm install --save-dev @testing-library/react @testing-library/jest-dom --legacy-peer-deps
```
Then add to `fullstack/jest.config.js` (or create it if missing) the setup file, and add to `package.json` jest config:
```json
"jest": {
  "setupFilesAfterFramework": ["@testing-library/jest-dom"]
}
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
cd fullstack && npx jest agents/useTasks --no-coverage 2>&1 | tail -5
```
Expected: FAIL — `Cannot find module '../../src/app/agents/hooks/useTasks'`

- [ ] **Step 4: Create useTasks.ts**

Create `fullstack/src/app/agents/hooks/useTasks.ts`:

```typescript
'use client'
import { useState, useEffect } from 'react'
import type { Task, Priority, Category } from '../types'

const STORAGE_KEY = 'agents_tasks'

type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTasks(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on every change
  useEffect(() => {
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
```

- [ ] **Step 5: Run test — expect PASS**

```bash
cd fullstack && npx jest agents/useTasks --no-coverage 2>&1 | tail -5
```
Expected: `Tests: 4 passed`

- [ ] **Step 6: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/hooks/useTasks.ts fullstack/__tests__/agents/useTasks.test.ts && git commit -m "feat(agents): add useTasks hook with localStorage persistence"
```

---

## Task 3: useTimer hook

**Files:**
- Create: `fullstack/src/app/agents/hooks/useTimer.ts`

- [ ] **Step 1: Create useTimer.ts**

Create `fullstack/src/app/agents/hooks/useTimer.ts`:

```typescript
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { TimerState } from '../types'

const DURATIONS = { work: 25 * 60, 'short-break': 5 * 60, 'long-break': 15 * 60 }

function nextMode(current: TimerState['mode'], sessions: number): TimerState['mode'] {
  if (current !== 'work') return 'work'
  return sessions % 4 === 0 ? 'long-break' : 'short-break'
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    mode: 'work',
    remaining: DURATIONS.work,
    running: false,
    sessions: 0,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.remaining > 1) return { ...prev, remaining: prev.remaining - 1 }
          // Session complete
          const sessions = prev.mode === 'work' ? prev.sessions + 1 : prev.sessions
          const mode = nextMode(prev.mode, sessions)
          return { mode, remaining: DURATIONS[mode], running: false, sessions }
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state.running])

  const toggle = useCallback(() => setState(p => ({ ...p, running: !p.running })), [])

  const skip = useCallback(() => setState(prev => {
    const sessions = prev.mode === 'work' ? prev.sessions + 1 : prev.sessions
    const mode = nextMode(prev.mode, sessions)
    return { mode, remaining: DURATIONS[mode], running: false, sessions }
  }), [])

  const reset = useCallback(() => setState({
    mode: 'work', remaining: DURATIONS.work, running: false, sessions: 0
  }), [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const progress = 1 - state.remaining / DURATIONS[state.mode]
  const modeLabel = { work: 'Deep Work', 'short-break': 'Short Break', 'long-break': 'Long Break' }[state.mode]

  return { ...state, toggle, skip, reset, formatTime, progress, modeLabel }
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/hooks/useTimer.ts && git commit -m "feat(agents): add useTimer Pomodoro hook"
```

---

## Task 4: Sidebar component

**Files:**
- Create: `fullstack/src/app/agents/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Create `fullstack/src/app/agents/components/Sidebar.tsx`:

```typescript
'use client'
import type { View } from '../types'

interface Props {
  view: View
  onView: (v: View) => void
  userName: string
}

const NAV: { id: View; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'tasks',     icon: '✓', label: 'Tasks' },
  { id: 'calendar',  icon: '⊙', label: 'Calendar' },
  { id: 'analytics', icon: '↗', label: 'Analytics' },
]

export default function Sidebar({ view, onView, userName }: Props) {
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <nav className="agents-sidebar">
      <div className="agents-logo">T</div>
      <div className="agents-divider" />
      {NAV.map(n => (
        <button
          key={n.id}
          className={`agents-nav-icon ${view === n.id ? 'active' : ''}`}
          onClick={() => onView(n.id)}
          title={n.label}
          aria-label={n.label}
        >
          {n.icon}
          <span className="tooltip">{n.label}</span>
        </button>
      ))}
      <div className="agents-divider" />
      <button
        className="agents-nav-icon"
        title="Settings"
        onClick={() => {
          const name = prompt('Your name:', userName)
          if (name?.trim()) localStorage.setItem('agents_username', name.trim())
        }}
      >
        ⚙
        <span className="tooltip">Settings</span>
      </button>
      <div className="agents-avatar">{initials}</div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/Sidebar.tsx && git commit -m "feat(agents): add Sidebar nav component"
```

---

## Task 5: FocusTimer + RightPanel components

**Files:**
- Create: `fullstack/src/app/agents/components/FocusTimer.tsx`
- Create: `fullstack/src/app/agents/components/RightPanel.tsx`

- [ ] **Step 1: Create FocusTimer.tsx**

Create `fullstack/src/app/agents/components/FocusTimer.tsx`:

```typescript
'use client'
import { useTimer } from '../hooks/useTimer'

export default function FocusTimer() {
  const { remaining, running, sessions, mode, toggle, skip, formatTime, progress, modeLabel } = useTimer()

  return (
    <div>
      <div className="agents-panel-title">Focus Flow</div>
      <div className="agents-timer-time">{formatTime(remaining)}</div>
      <div className="agents-timer-mode">{modeLabel} · Session {sessions + 1}</div>
      <div className="agents-timer-progress">
        <div className="agents-timer-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="agents-session-dots">
        {[0,1,2,3].map(i => (
          <div key={i} className={`agents-session-dot ${i < sessions % 4 ? 'done' : ''}`} />
        ))}
      </div>
      <div className="agents-timer-controls">
        <button className={`agents-timer-btn primary`} onClick={toggle}>
          {running ? '⏸' : '▶'}
        </button>
        <button className="agents-timer-btn" onClick={skip}>Skip →</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RightPanel.tsx**

Create `fullstack/src/app/agents/components/RightPanel.tsx`:

```typescript
'use client'
import FocusTimer from './FocusTimer'
import { calcStreak, getDaysRemaining, priorityColor, formatDueLabel, getToday } from '../lib/utils'
import type { Task } from '../types'

interface Props { tasks: Task[] }

export default function RightPanel({ tasks }: Props) {
  const streak = calcStreak(tasks)
  const today = getToday()
  const todayTasks = tasks
    .filter(t => !t.completed && t.dueDate === today)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2, none: 3 }
      return order[a.priority] - order[b.priority]
    })

  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate > today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .at(0) ?? null

  return (
    <aside className="agents-right-panel">
      <FocusTimer />

      <div>
        <div className="agents-panel-title">Today</div>
        {todayTasks.length === 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,239,181,0.35)', fontStyle: 'italic' }}>Nothing due today</div>
        )}
        {todayTasks.slice(0, 4).map(t => (
          <div key={t.id} className="agents-schedule-item">
            <div className="agents-schedule-title">{t.title}</div>
            <div className="agents-schedule-cat">{t.category}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="agents-panel-title">Streak</div>
        <div className="agents-streak-box">
          <div className="agents-streak-num">{streak}</div>
          <div className="agents-streak-label">Consecutive<br />Days</div>
        </div>
      </div>

      {upcoming && (
        <div>
          <div className="agents-panel-title">Upcoming</div>
          <div className="agents-upcoming-card">
            <div className="agents-panel-title" style={{ marginBottom: 0 }}>Due Soon</div>
            <div className="agents-upcoming-title">{upcoming.title}</div>
            <div className="agents-upcoming-due">{formatDueLabel(upcoming.dueDate)}</div>
          </div>
        </div>
      )}
    </aside>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/FocusTimer.tsx fullstack/src/app/agents/components/RightPanel.tsx && git commit -m "feat(agents): add FocusTimer and RightPanel components"
```

---

## Task 6: TaskRow + TaskModal components

**Files:**
- Create: `fullstack/src/app/agents/components/TaskRow.tsx`
- Create: `fullstack/src/app/agents/components/TaskModal.tsx`

- [ ] **Step 1: Create TaskRow.tsx**

Create `fullstack/src/app/agents/components/TaskRow.tsx`:

```typescript
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
```

- [ ] **Step 2: Create TaskModal.tsx**

Create `fullstack/src/app/agents/components/TaskModal.tsx`:

```typescript
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

  // Keep form in sync if task prop changes (e.g. voice pre-fill)
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
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/TaskRow.tsx fullstack/src/app/agents/components/TaskModal.tsx && git commit -m "feat(agents): add TaskRow and TaskModal components"
```

---

## Task 7: DashboardView

**Files:**
- Create: `fullstack/src/app/agents/components/views/DashboardView.tsx`

- [ ] **Step 1: Create DashboardView.tsx**

Create `fullstack/src/app/agents/components/views/DashboardView.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { getTodayLabel, calcStreak, getToday } from '../../lib/utils'
import TaskRow from '../TaskRow'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  userName: string
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onAdd: (title: string) => void
}

export default function DashboardView({ tasks, userName, onToggle, onEdit, onDelete, onAdd }: Props) {
  const [quickTitle, setQuickTitle] = useState('')
  const today = getToday()
  const todayTasks = tasks.filter(t => t.dueDate === today)
  const totalTasks = tasks.length
  const dueTodayCount = todayTasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length
  const completionPct = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100)
  const streak = calcStreak(tasks)

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTitle.trim()) { onAdd(quickTitle.trim()); setQuickTitle('') }
  }

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">{getTodayLabel()}, {userName}.</div>
        <div className="agents-sub">
          You have <strong>{dueTodayCount} focus area{dueTodayCount !== 1 ? 's' : ''}</strong> for today.
        </div>
      </div>
      <div className="agents-content">
        <div className="agents-stats-row">
          <div className="agents-stat">
            <div className="agents-stat-val">{totalTasks}</div>
            <div className="agents-stat-label">Tasks Total</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{dueTodayCount}</div>
            <div className="agents-stat-label">Due Today</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completionPct}%</div>
            <div className="agents-stat-label">Complete</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{streak}🔥</div>
            <div className="agents-stat-label">Streak</div>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--a-espresso)', marginBottom: 10 }}>
          Today's Focus
        </div>
        {todayTasks.length === 0 && (
          <div style={{ color: 'var(--a-muted)', fontSize: 13, marginBottom: 12, fontStyle: 'italic' }}>
            No tasks due today — add one below.
          </div>
        )}
        {todayTasks.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}

        <form className="agents-quick-add" onSubmit={handleQuickAdd}>
          <input
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="Quick add a task for today… (press Enter)"
          />
          <button type="submit" className="agents-btn-primary">Add</button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/views/DashboardView.tsx && git commit -m "feat(agents): add DashboardView with stats and quick-add"
```

---

## Task 8: TasksView

**Files:**
- Create: `fullstack/src/app/agents/components/views/TasksView.tsx`

- [ ] **Step 1: Create TasksView.tsx**

Create `fullstack/src/app/agents/components/views/TasksView.tsx`:

```typescript
'use client'
import { useState } from 'react'
import TaskRow from '../TaskRow'
import { getToday } from '../../lib/utils'
import type { Task, FilterTab, Category } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'priority', label: 'Priority' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
]
const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']

export default function TasksView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const today = getToday()

  const filtered = tasks
    .filter(t => {
      if (filter === 'priority') return ['high', 'medium'].includes(t.priority) && !t.completed
      if (filter === 'scheduled') return !!t.dueDate && !t.completed
      if (filter === 'completed') return t.completed
      return !t.completed // 'all' hides completed
    })
    .filter(t => !activeCategory || t.category === activeCategory)
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2, none: 3 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  const totalVisible = tasks.filter(t => !t.completed).length

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">My Tasks</div>
        <div className="agents-sub">{totalVisible} active task{totalVisible !== 1 ? 's' : ''} across all categories.</div>
      </div>
      <div className="agents-content">
        <div className="agents-tabs">
          {FILTERS.map(f => (
            <button key={f.id} className={`agents-tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
          <button className="agents-add-btn" onClick={onOpenNew}>+ New Task</button>
        </div>

        <div className="agents-tags">
          <button className={`agents-tag ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} className={`agents-tag ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c === activeCategory ? null : c)}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: 'var(--a-muted)', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
            No tasks here. {filter === 'completed' ? 'Complete a task to see it here.' : 'Click "+ New Task" to add one.'}
          </div>
        )}
        {filtered.map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/views/TasksView.tsx && git commit -m "feat(agents): add TasksView with filters and category tags"
```

---

## Task 9: CalendarView

**Files:**
- Create: `fullstack/src/app/agents/components/views/CalendarView.tsx`

- [ ] **Step 1: Create CalendarView.tsx**

Create `fullstack/src/app/agents/components/views/CalendarView.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { priorityColor, getToday } from '../../lib/utils'
import TaskRow from '../TaskRow'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onOpenNew: () => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView({ tasks, onToggle, onEdit, onDelete, onOpenNew }: Props) {
  const today = getToday()
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(today)

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const daysInPrev = new Date(cursor.year, cursor.month, 0).getDate()

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
              const dayTasks = tasksByDate[date] ?? []
              const isToday = date === today
              const isSelected = date === selectedDate
              return (
                <div
                  key={date}
                  className={`agents-cal-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  style={isSelected && !isToday ? { background: 'rgba(71,45,31,0.08)', outline: '2px solid var(--a-espresso)' } : {}}
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
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 10 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {selectedTasks.length === 0 && (
              <div style={{ color: 'var(--a-muted)', fontSize: 12, fontStyle: 'italic' }}>No tasks this day.</div>
            )}
            {selectedTasks.map(t => (
              <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/views/CalendarView.tsx && git commit -m "feat(agents): add CalendarView with month grid and day panel"
```

---

## Task 10: AnalyticsView

**Files:**
- Create: `fullstack/src/app/agents/components/views/AnalyticsView.tsx`

- [ ] **Step 1: Create AnalyticsView.tsx**

Create `fullstack/src/app/agents/components/views/AnalyticsView.tsx`:

```typescript
'use client'
import { calcStreak } from '../../lib/utils'
import type { Task, Category, Priority } from '../../types'

interface Props { tasks: Task[] }

const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']
const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'none']
const PRIORITY_COLORS: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#BEB9A9' }

function getWeekCompletions(tasks: Task[], weeksAgo: number): number {
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - (weeksAgo + 1) * 7)
  const end = new Date(now); end.setDate(now.getDate() - weeksAgo * 7)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d < end
  }).length
}

export default function AnalyticsView({ tasks }: Props) {
  const streak = calcStreak(tasks)
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const thisWeek = getWeekCompletions(tasks, 0)
  const lastWeek = getWeekCompletions(tasks, 1)

  // Last 14 days streak grid
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().slice(0, 10)
    return { dateStr, hasCompletion: tasks.some(t => t.completedAt?.slice(0, 10) === dateStr) }
  })

  // Category breakdown
  const catCounts = CATEGORIES.map(c => ({
    cat: c,
    total: tasks.filter(t => t.category === c).length,
    done: tasks.filter(t => t.category === c && t.completed).length,
  }))
  const maxCat = Math.max(...catCounts.map(c => c.total), 1)

  // Priority breakdown
  const priCounts = PRIORITIES.map(p => ({
    p, count: tasks.filter(t => t.priority === p).length,
  }))

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">Analytics</div>
        <div className="agents-sub">Your productivity at a glance.</div>
      </div>
      <div className="agents-content">
        {/* Top stats */}
        <div className="agents-stats-row">
          <div className="agents-stat">
            <div className="agents-stat-val">{total}</div>
            <div className="agents-stat-label">Total Created</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completed}</div>
            <div className="agents-stat-label">Completed</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completionPct}%</div>
            <div className="agents-stat-label">Rate</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{streak}🔥</div>
            <div className="agents-stat-label">Streak</div>
          </div>
        </div>

        {/* Week comparison */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Completion — This vs Last Week</div>
          {[{ label: 'This Week', val: thisWeek }, { label: 'Last Week', val: lastWeek }].map(({ label, val }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 80, fontSize: 11, color: 'var(--a-muted)' }}>{label}</div>
              <div className="agents-bar-track">
                <div className="agents-bar-fill" style={{ width: `${Math.min((val / Math.max(thisWeek, lastWeek, 1)) * 100, 100)}%` }} />
              </div>
              <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', textAlign: 'right' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Streak grid */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 10 }}>Last 14 Days</div>
          <div className="agents-streak-grid">
            {last14.map(({ dateStr, hasCompletion }) => (
              <div key={dateStr} className={`agents-streak-cell ${hasCompletion ? 'has-completion' : ''}`} title={dateStr} />
            ))}
          </div>
        </div>

        {/* By category */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Tasks by Category</div>
          {catCounts.map(({ cat, total, done }) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 70, fontSize: 11, color: 'var(--a-muted)' }}>{cat}</div>
              <div className="agents-bar-track">
                <div className="agents-bar-fill" style={{ width: `${(total / maxCat) * 100}%`, opacity: 0.4 }} />
                <div className="agents-bar-fill" style={{ width: `${(done / maxCat) * 100}%`, marginTop: -8, position: 'relative' }} />
              </div>
              <div style={{ width: 32, fontSize: 11, color: 'var(--a-muted)', textAlign: 'right' }}>{done}/{total}</div>
            </div>
          ))}
        </div>

        {/* Priority distribution */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Priority Distribution</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {priCounts.map(({ p, count }) => (
              <div key={p} style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[p], margin: '0 auto 4px' }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--a-espresso)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--a-muted)', textTransform: 'capitalize' }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/views/AnalyticsView.tsx && git commit -m "feat(agents): add AnalyticsView with charts and streak grid"
```

---

## Task 11: voice-parse API route

**Files:**
- Create: `fullstack/src/app/api/voice-parse/route.ts`
- Create: `fullstack/__tests__/agents/voice-parse.test.ts`

- [ ] **Step 1: Write failing test**

Create `fullstack/__tests__/agents/voice-parse.test.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({
            title: 'English assignment',
            dueDate: '2026-03-28',
            priority: 'medium',
            category: 'Work',
            confidence: 0.9,
          })}]
        })
      }
    }))
  }
})

describe('voice-parse route logic', () => {
  it('parseTranscript extracts task fields from text', async () => {
    const { parseTranscript } = await import('../../src/app/api/voice-parse/route')
    const result = await parseTranscript('Tomorrow I have an English assignment I need to do', '2026-03-27')
    expect(result.title).toBe('English assignment')
    expect(result.dueDate).toBe('2026-03-28')
    expect(result.category).toBe('Work')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd fullstack && npx jest agents/voice-parse --no-coverage 2>&1 | tail -5
```
Expected: FAIL — module not found

- [ ] **Step 3: Create voice-parse/route.ts**

Create `fullstack/src/app/api/voice-parse/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ParsedTask, Priority, Category } from '@/app/agents/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function parseTranscript(transcript: string, today: string): Promise<ParsedTask> {
  const prompt = `Today's date is ${today}.

A user spoke this task aloud: "${transcript}"

Extract the task details and return ONLY valid JSON matching this shape:
{
  "title": "concise task title (no filler like 'I need to' or 'I have to')",
  "dueDate": "YYYY-MM-DD or null (resolve relative dates: tomorrow, next Monday, etc.)",
  "priority": "high | medium | low | none (infer from urgency words)",
  "category": "Work | Personal | Creative | Health (infer: assignment/meeting/project=Work, gym/doctor=Health, art/design/write=Creative, groceries/family=Personal)",
  "confidence": 0.0-1.0
}

Rules:
- title must be short and actionable (max 8 words)
- dueDate: "tomorrow" → ${new Date(new Date(today).getTime() + 86400000).toISOString().slice(0, 10)}
- "next [weekday]" → compute the date
- no date mentioned → null
- priority: words like "urgent", "important", "need to" → medium; "critical", "ASAP" → high; else none
- Return ONLY the JSON object, no prose.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const parsed = JSON.parse(text.trim()) as ParsedTask
  return parsed
}

export async function POST(req: NextRequest) {
  const { transcript, today } = await req.json() as { transcript: string; today: string }

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured in .env.local' }, { status: 503 })
  }

  try {
    const result = await parseTranscript(transcript, today || new Date().toISOString().slice(0, 10))
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: `Parsing failed: ${String(err)}` }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd fullstack && npx jest agents/voice-parse --no-coverage 2>&1 | tail -5
```
Expected: `Tests: 1 passed`

- [ ] **Step 5: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/api/voice-parse/route.ts fullstack/__tests__/agents/voice-parse.test.ts && git commit -m "feat(agents): add voice-parse API route with Claude haiku NLP"
```

---

## Task 12: useVoice hook

**Files:**
- Create: `fullstack/src/app/agents/hooks/useVoice.ts`

- [ ] **Step 1: Create useVoice.ts**

Create `fullstack/src/app/agents/hooks/useVoice.ts`:

```typescript
'use client'
import { useState, useRef, useCallback } from 'react'
import { getToday } from '../lib/utils'
import type { ParsedTask } from '../types'

type VoiceState = 'idle' | 'recording' | 'processing' | 'preview' | 'error'

export function useVoice() {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedTask | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startRecording = useCallback(() => {
    if (!isSupported) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: any) => r[0].transcript)
        .join('')
      setTranscript(text)
    }

    recognition.onend = async () => {
      const finalTranscript = transcript
      if (!finalTranscript.trim()) { setState('idle'); return }
      setState('processing')
      try {
        const res = await fetch('/api/voice-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: finalTranscript, today: getToday() }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Parse failed')
        }
        const data: ParsedTask = await res.json()
        setParsed(data)
        setState('preview')
      } catch (e) {
        setError(String(e))
        setState('error')
      }
    }

    recognition.onerror = (e: any) => {
      setError(`Mic error: ${e.error}`)
      setState('error')
    }

    recognitionRef.current = recognition
    recognition.start()
    setState('recording')
    setTranscript('')
    setError(null)
  }, [isSupported, transcript])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggleRecording = useCallback(() => {
    if (state === 'recording') stopRecording()
    else startRecording()
  }, [state, startRecording, stopRecording])

  const dismiss = useCallback(() => {
    setState('idle')
    setTranscript('')
    setParsed(null)
    setError(null)
  }, [])

  return { state, transcript, parsed, error, isSupported, toggleRecording, dismiss }
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/hooks/useVoice.ts && git commit -m "feat(agents): add useVoice hook with Web Speech API"
```

---

## Task 13: VoiceFab component

**Files:**
- Create: `fullstack/src/app/agents/components/VoiceFab.tsx`

- [ ] **Step 1: Create VoiceFab.tsx**

Create `fullstack/src/app/agents/components/VoiceFab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useVoice } from '../hooks/useVoice'
import type { ParsedTask, Task, Priority, Category } from '../types'

interface Props {
  onConfirm: (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => void
}

export default function VoiceFab({ onConfirm }: Props) {
  const { state, transcript, parsed, error, isSupported, toggleRecording, dismiss } = useVoice()
  const [editedParsed, setEditedParsed] = useState<ParsedTask | null>(null)

  // Sync edit state when new parsed result arrives
  if (parsed && editedParsed?.title !== parsed.title && state === 'preview') {
    setEditedParsed({ ...parsed })
  }

  if (!isSupported) return null

  const handleConfirm = () => {
    if (!editedParsed) return
    onConfirm({
      title: editedParsed.title,
      description: '',
      priority: editedParsed.priority,
      category: editedParsed.category,
      dueDate: editedParsed.dueDate,
    })
    dismiss()
    setEditedParsed(null)
  }

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 50 }}>
      {/* Transcript pill */}
      {state === 'recording' && transcript && (
        <div className="agents-transcript-pill">🎙 {transcript || 'Listening...'}</div>
      )}
      {state === 'processing' && (
        <div className="agents-transcript-pill">⏳ Parsing task...</div>
      )}
      {state === 'error' && (
        <div className="agents-transcript-pill" style={{ background: '#ef4444' }}>
          ⚠ {error} <button onClick={dismiss} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Preview card */}
      {state === 'preview' && editedParsed && (
        <div className="agents-voice-preview">
          <h4>🎙 Parsed Task — confirm or edit</h4>
          <div className="agents-field">
            <label>Title</label>
            <input value={editedParsed.title} onChange={e => setEditedParsed(p => p ? { ...p, title: e.target.value } : p)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Priority</label>
              <select value={editedParsed.priority} onChange={e => setEditedParsed(p => p ? { ...p, priority: e.target.value as Priority } : p)}>
                {(['high','medium','low','none'] as Priority[]).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Category</label>
              <select value={editedParsed.category} onChange={e => setEditedParsed(p => p ? { ...p, category: e.target.value as Category } : p)}>
                {(['Work','Personal','Creative','Health'] as Category[]).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="agents-field">
            <label>Due Date</label>
            <input type="date" value={editedParsed.dueDate ?? ''} onChange={e => setEditedParsed(p => p ? { ...p, dueDate: e.target.value || null } : p)} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--a-muted)', marginBottom: 8 }}>
            Confidence: {Math.round(editedParsed.confidence * 100)}%
          </div>
          <div className="agents-voice-actions">
            <button className="agents-btn-secondary" onClick={() => { dismiss(); setEditedParsed(null) }}>Cancel</button>
            <button className="agents-btn-primary" onClick={handleConfirm}>Add Task</button>
          </div>
        </div>
      )}

      {/* FAB button */}
      {state !== 'preview' && (
        <button
          className={`agents-voice-fab ${state === 'recording' ? 'recording' : ''}`}
          onClick={toggleRecording}
          title={state === 'recording' ? 'Stop recording' : 'Add task by voice'}
          disabled={state === 'processing'}
        >
          {state === 'processing' ? '⏳' : state === 'recording' ? '⏹' : '🎙'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/components/VoiceFab.tsx && git commit -m "feat(agents): add VoiceFab with transcript pill and preview card"
```

---

## Task 14: Main page.tsx — wire everything together

**Files:**
- Create: `fullstack/src/app/agents/page.tsx`

- [ ] **Step 1: Create page.tsx**

Create `fullstack/src/app/agents/page.tsx`:

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import TaskModal from './components/TaskModal'
import VoiceFab from './components/VoiceFab'
import DashboardView from './components/views/DashboardView'
import TasksView from './components/views/TasksView'
import CalendarView from './components/views/CalendarView'
import AnalyticsView from './components/views/AnalyticsView'
import type { View, Task } from './types'

export default function AgentsPage() {
  const [view, setView] = useState<View>('dashboard')
  const [userName, setUserName] = useState('Alex')
  const [modalTask, setModalTask] = useState<Task | 'new' | null>(null)
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  // Load username from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('agents_username')
    if (stored) setUserName(stored)
  }, [])

  const openNew = () => setModalTask('new')
  const openEdit = (t: Task) => setModalTask(t)
  const closeModal = () => setModalTask(null)

  const handleSave = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    if (modalTask === 'new' || modalTask === null) {
      addTask(data)
    } else {
      updateTask(modalTask.id, data)
    }
  }

  const handleQuickAdd = (title: string) => {
    const today = new Date().toISOString().slice(0, 10)
    addTask({ title, description: '', priority: 'none', category: 'Work', dueDate: today })
  }

  const handleVoiceConfirm = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    addTask(data)
  }

  const props = { tasks, onToggle: toggleComplete, onEdit: openEdit, onDelete: deleteTask }

  return (
    <div className="agents-root">
      <Sidebar view={view} onView={setView} userName={userName} />

      <div className="agents-main" style={{ position: 'relative' }}>
        {view === 'dashboard' && (
          <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />
        )}
        {view === 'tasks' && (
          <TasksView {...props} onOpenNew={openNew} />
        )}
        {view === 'calendar' && (
          <CalendarView {...props} onOpenNew={openNew} />
        )}
        {view === 'analytics' && (
          <AnalyticsView tasks={tasks} />
        )}

        {view !== 'calendar' && (
          <VoiceFab onConfirm={handleVoiceConfirm} />
        )}
      </div>

      <RightPanel tasks={tasks} />

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

- [ ] **Step 2: Start the dev server and verify the page loads**

```bash
cd fullstack && npm run dev
```
Open http://localhost:3001/agents — expect to see the 3-column task manager layout. No console errors.

- [ ] **Step 3: Manual smoke test**

Run through these checks in the browser:

1. Click each sidebar icon — views switch: Dashboard, Tasks, Calendar, Analytics
2. Dashboard shows greeting with time-aware label
3. Click "+ New Task" → modal opens → fill title + category + priority → save → task appears
4. Click checkbox on task → it strikes through and moves to completed state
5. Filter tabs in Tasks view work (Priority hides non-priority, Scheduled shows dated tasks, Completed shows completed)
6. Category tags filter task list correctly
7. Calendar shows month grid; click a date with tasks → right panel shows those tasks
8. Analytics shows streak grid, category bars, priority chips
9. Hover on task row → edit and delete buttons appear
10. Pomodoro timer: click ▶ → counts down; click Skip → advances mode
11. Right panel shows today's tasks, streak count, upcoming task
12. Voice button (🎙) visible → clicking requests mic permission

- [ ] **Step 4: Final commit**

```bash
cd "C:/Claude Code Test 1" && git add fullstack/src/app/agents/ fullstack/src/app/api/voice-parse/ && git commit -m "feat(agents): complete task manager — views, timer, voice input"
```

---

## Post-Build: Set up ANTHROPIC_API_KEY for voice feature

The voice-to-task feature requires a real API key:

1. Get a key from https://console.anthropic.com → API Keys
2. Edit `fullstack/.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...your-real-key...
   ```
3. Restart the dev server (`npm run dev`)
4. Test: click 🎙, say *"Tomorrow I have an English assignment"*, verify it parses and adds to tasks + calendar

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Layout C (sidebar + main + right panel)
- ✅ Dashboard with greeting, stats, today's focus, quick-add
- ✅ Tasks view with filter tabs, category tags, task list, add/edit/delete
- ✅ Calendar view with month grid, day panel, task dots
- ✅ Analytics view with completion stats, streak grid, category bars, priority chips
- ✅ Pomodoro timer with session dots, progress bar, mode progression
- ✅ Right panel: today's tasks, streak, upcoming
- ✅ Voice input: Web Speech API → /api/voice-parse → Claude haiku → preview card → add
- ✅ All palette colors (#472D1F, #BEB9A9, #FFEFB5) used consistently
- ✅ localStorage persistence (tasks + username)
- ✅ Responsive mobile (sidebar → bottom bar, right panel hidden)
- ✅ Animations (fade-in on view switch, pulse on voice recording)

**Type consistency check:**
- `Task`, `Priority`, `Category`, `View`, `FilterTab`, `ParsedTask`, `TimerState` all defined in `types.ts` and used consistently throughout
- `useTasks` returns `NewTask` omit type matching `addTask` signature
- `useTimer` returns `TimerState` fields + helpers — all used in `FocusTimer`
- `parseTranscript` exported from route for test access — matches test import
