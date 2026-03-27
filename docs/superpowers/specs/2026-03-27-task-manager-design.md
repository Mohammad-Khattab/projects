# Task Manager Design Spec
**Date:** 2026-03-27
**Route:** `/agents`
**Stack:** Next.js 14 App Router · TypeScript · localStorage · Web Speech API · Claude API (haiku)

---

## Overview

A productivity-focused task manager built at `/agents` inside the existing fullstack Next.js app. Design fuses 5 reference images (Sanctuary UI + tâche.) using a warm earth-tone palette. Layout C: narrow espresso sidebar + cream main content + espresso right panel.

**Palette:**
- `#472D1F` — Espresso brown (sidebar, right panel, active states, buttons)
- `#BEB9A9` — Warm stone (borders, muted elements, low-priority dots)
- `#FFEFB5` — Butter cream (text-on-dark, highlights, tag accents)
- `#FDF8EC` — Cream white (main background, derived from palette)
- `#FFFFFF` — White (task cards)

---

## Layout

Three-column shell, fixed height:

```
┌──────┬───────────────────────────────┬───────────┐
│ 62px │         flex: 1               │  200px    │
│      │                               │           │
│ Side │       Main Content            │  Right    │
│ bar  │   (scrollable, view-based)    │  Panel    │
│      │                               │ (fixed)   │
└──────┴───────────────────────────────┴───────────┘
```

---

## Sidebar

- Background: `#472D1F`
- Width: 62px, full height, icon-only
- Logo: "T" in `#FFEFB5` at top
- Nav icons (bottom tooltip on hover): Dashboard · Tasks · Calendar · Analytics · Settings
- Active state: `rgba(255,239,181,0.18)` rounded background
- Avatar circle at bottom (initials)

---

## Right Panel

Always visible regardless of active view. Background `#472D1F`.

**Focus Timer (Pomodoro):**
- 25:00 / 5:00 work/break cycle
- Play / Pause / Skip controls
- Progress bar (linear, `#FFEFB5`)
- Session dots (4 dots, completed = filled `#FFEFB5`)
- Mode label: "Deep Work" / "Short Break" / "Long Break"

**Today's Schedule:**
- Tasks with a due date of today, sorted by priority then creation order
- Each item: priority dot + task title + category chip
- No time field — tasks are date-only

**Streak:**
- Consecutive days with at least 1 completed task
- Large number + "Consecutive Days" label

**Upcoming:**
- Next task by due date (after today)
- Title + days-remaining label

---

## Views

### 1. Dashboard View (`/agents` default)

- Greeting: "Good morning/afternoon/evening, Alex." (time-aware)
- Subtext: "You have N focus areas today."
- Stats row: Total tasks · Due today · Completion % · Streak
- Today's Focus: tasks due today, checkable inline
- Quick add input at bottom

### 2. Tasks View

**Filters (tabs):** All · Priority · Scheduled · Completed
**Categories (tags):** Work · Personal · Creative · Health (fixed set)
**Task list items:**
- Checkbox (click to toggle complete)
- Priority dot: red = high, amber = medium, green = low, stone = none
- Task title (strikethrough when done)
- Category chip
- Due date label
- Edit (pencil) on hover, delete (×) on hover

**Add/Edit Modal:**
- Title (required)
- Description (optional, textarea)
- Category (Work / Personal / Creative / Health)
- Priority (High / Medium / Low / None)
- Due date (date picker)
- Save / Cancel

### 3. Calendar View

- Month grid (7 columns)
- Tasks plotted as colored dots on their due date
- Click a date → show tasks for that day in a side panel
- Today highlighted with `#472D1F` background
- Prev/Next month navigation

### 4. Analytics View

- Completion rate (this week vs last week)
- Tasks by category (horizontal bar chart, CSS-only)
- Streak history (last 14 days, dot grid — filled = had completion)
- Priority distribution (pie-like stat chips)
- Total tasks created / completed all-time

---

## Data Model

```typescript
// types.ts
export type Priority = 'high' | 'medium' | 'low' | 'none'
export type Category = 'Work' | 'Personal' | 'Creative' | 'Health'

export interface Task {
  id: string          // crypto.randomUUID()
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate: string | null  // ISO date string 'YYYY-MM-DD'
  createdAt: string       // ISO timestamp
  completedAt: string | null
}

export interface TimerState {
  mode: 'work' | 'short-break' | 'long-break'
  remaining: number   // seconds
  running: boolean
  sessions: number    // completed work sessions
}

export type View = 'dashboard' | 'tasks' | 'calendar' | 'analytics'
export type FilterTab = 'all' | 'priority' | 'scheduled' | 'completed'
```

---

## File Structure

```
fullstack/src/app/agents/
├── page.tsx                        # Shell: sidebar + router + right panel
├── types.ts                        # TypeScript interfaces
├── hooks/
│   ├── useTasks.ts                 # CRUD + localStorage persistence
│   ├── useTimer.ts                 # Pomodoro timer (useInterval)
│   └── useVoice.ts                 # Web Speech API wrapper + state
└── components/
    ├── Sidebar.tsx                 # Icon nav
    ├── RightPanel.tsx              # Timer + schedule + streak + upcoming
    ├── FocusTimer.tsx              # Timer display + controls
    ├── TaskModal.tsx               # Add/edit modal
    ├── VoiceFab.tsx                # Floating mic button
    ├── VoiceTranscriptPill.tsx     # Live transcript display
    ├── VoicePreviewCard.tsx        # Parsed task confirmation card
    ├── views/
    │   ├── DashboardView.tsx       # Greeting + stats + today's tasks
    │   ├── TasksView.tsx           # Filter tabs + tags + task list
    │   ├── CalendarView.tsx        # Month grid + day tasks
    │   └── AnalyticsView.tsx       # Charts + streak history
    └── TaskRow.tsx                 # Reusable task list item

fullstack/src/app/api/voice-parse/
└── route.ts                        # POST: transcript → ParsedTask via Claude haiku
```

CSS lives in `fullstack/src/styles/globals.css` — add `.agents-*` scoped classes to avoid conflicts with the existing GJU Study Hub styles.

---

## Interactions & Animations

- View transitions: opacity + translateY fade-in (150ms)
- Task complete: checkbox fills with `#472D1F`, title strikethrough
- Task add: slides in from bottom of list (200ms)
- Task delete: fade + collapse (150ms)
- Modal: backdrop blur + scale-in (120ms)
- Timer tick: second-by-second countdown, progress bar animates
- Hover on task row: subtle shadow lift + show action icons

---

## Persistence

- All tasks stored in `localStorage` under key `agents_tasks`
- Timer state NOT persisted (resets on page reload — intentional)
- User name stored in `localStorage` under key `agents_username` (editable via Settings icon)

---

## Responsive

- Desktop (≥768px): full 3-column layout
- Mobile (<768px): sidebar collapses to bottom tab bar, right panel hidden (timer accessible via fab button)

---

## Voice Task Input

A mic button available from any view that lets the user speak a task naturally and have it auto-parsed into the task form.

### Flow

1. User clicks the **mic button** (floating, bottom-right of main panel)
2. Browser requests mic permission (one-time)
3. **Recording state:** button pulses red, live transcript appears in a floating pill above the button
4. User speaks: *"Tomorrow I have an English assignment I need to do"*
5. User clicks mic again (or pauses ~2s) to stop
6. Transcript sent to **`/api/voice-parse`** route
7. Claude (`claude-haiku-4-5`) extracts structured task fields from the transcript
8. **Preview card** slides up showing the parsed task — user can confirm or edit before saving
9. On confirm → task added to both task list and calendar

### Speech Recognition

Uses the browser's native **Web Speech API** (`webkitSpeechRecognition`) — no API key, real-time, free.
- `lang: 'en-US'`
- `interimResults: true` — shows live transcript while speaking
- Falls back gracefully: if browser doesn't support it, mic button is hidden and a text input is shown instead

### NLP Parsing (`/api/voice-parse`)

POST endpoint that calls Claude `claude-haiku-4-5` with the transcript and today's date. Returns:

```typescript
interface ParsedTask {
  title: string           // "English assignment"
  dueDate: string | null  // "2026-03-28" (resolved from "tomorrow")
  priority: Priority      // inferred from urgency words ("need to", "urgent", "important")
  category: Category      // inferred from keywords ("assignment" → Work, "gym" → Health)
  confidence: number      // 0–1, shown in preview card
}
```

Claude prompt strategy:
- Provide today's date so relative dates ("tomorrow", "next Monday", "in 3 days") resolve correctly
- Ask for JSON output only — no prose
- Map category from keywords: assignment/meeting/project → Work; workout/gym/doctor → Health; art/design/write → Creative; groceries/family/personal → Personal

### UI Components

- `VoiceFab.tsx` — floating mic button, pulse animation while recording
- `VoiceTranscriptPill.tsx` — live transcript display above button
- `VoicePreviewCard.tsx` — parsed task preview with editable fields + Confirm / Cancel

### API Route

`fullstack/src/app/api/voice-parse/route.ts` — POST, calls Claude, returns `ParsedTask` JSON

### Mic Button Placement

Visible in all views except Calendar (where the existing "+ New Task" flow is sufficient). Positioned fixed bottom-right of the main content area, above the right panel boundary.

---

## Out of Scope

- Backend / database (localStorage only)
- Authentication
- Collaboration / sharing
- Push notifications
- Drag-and-drop reordering (can be added later)
