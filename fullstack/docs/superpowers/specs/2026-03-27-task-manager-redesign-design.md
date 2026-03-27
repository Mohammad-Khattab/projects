# Task Manager Redesign + Voice Script — Design Spec

**Date:** 2026-03-27

---

## Goals

1. Completely overhaul the `/agents` task manager layout and component design — not just colors, but structure, navigation, and how tasks are displayed.
2. Add a standalone Python script (`scripts/voice_task.py`) that records 5 seconds of audio, transcribes it locally using `faster-whisper`, and POSTs the result to the task manager as a new task.

---

## Section 1 — Layout Architecture

### Shell

The 3-panel shell (sidebar + main + right panel) becomes **2-panel**: collapsible sidebar + full main area. The right panel is removed entirely.

- **Sidebar**: 56px collapsed (icons only), expands to 220px on hover via CSS `width` transition. It overlays the main content (positioned absolute/fixed so it doesn't shift layout). Logo at top, 4 nav items with icon + label, settings + avatar at bottom.
- **Main area**: Takes full remaining width (`calc(100vw - 56px)`, left-padded by 56px). Each view fills this space entirely.
- **Right panel removed**: Its content is redistributed into the Dashboard layout.

---

## Section 2 — Component Changes

### Dashboard View (full redesign)

Layout from top to bottom:

1. **Stats banner** — slim horizontal row: Total Tasks · Due Today · Completed · Streak. Tight, small text, not prominent.
2. **Hero section** — large greeting (`Good morning, Mohamed`) + today's date on the left. Circular SVG progress ring (completion %) on the right.
3. **3-column widget row**:
   - **Left — "Today's Focus"**: filtered task list (tasks due today), each shown as a compact card. Quick-add bar at the bottom.
   - **Center — "Focus Timer"**: the Pomodoro timer widget, moved from the old right panel.
   - **Right — "Streak & Upcoming"**: streak number + consecutive days label, and the next upcoming task card.
4. **Activity section** — last 14 days activity grid + week comparison bar chart, side by side.

### Tasks View

- **Filter tabs** stay at the top (All / Priority / Scheduled / Completed + category tags).
- **Task list** becomes a **2-column card grid** (`display: grid; grid-template-columns: 1fr 1fr`).
- Each `TaskCard` replaces `TaskRow`.

### TaskCard Component (new, replaces TaskRow)

Each card contains:
- **Left edge**: 4px vertical priority stripe (red = high, amber = medium, green = low, gray = none)
- **Top-right**: circular checkbox (click to complete)
- **Title**: bold, truncated to 2 lines
- **Description snippet**: 1 line, muted, truncated with ellipsis
- **Bottom row**: category badge (colored pill) + due date chip + edit/delete buttons (visible on hover only)
- **States**: completed cards get 50% opacity + strikethrough on title; new cards animate in from top; deleting cards slide right and collapse
- **Hover**: lifts with `translateY(-2px)` + indigo glow border

### Sidebar (collapsible)

- Collapsed: 56px wide, shows icon only
- Expanded: 220px wide, shows icon + label side by side
- Expansion triggered by CSS `:hover` on the `<nav>` element
- Active item: left-edge 3px accent bar + `rgba(99,102,241,0.2)` background + `#a5b4fc` text
- All nav items, logo, avatar smoothly transition with the sidebar width

### Calendar View

- Grid structure unchanged.
- Day sidebar panel (right side of calendar) gets the same card treatment as TaskCard for listed tasks.

### Analytics View

- No structural change. Benefits from full width (no right panel).
- Existing scroll reveal + count-up animations remain.

---

## Section 3 — Python Voice Script + API Bridge

### Problem

Tasks are stored in `localStorage` (browser-only). A Python script cannot write directly to it. A server-side bridge is needed.

### New Next.js Endpoints — `/api/todos`

**`POST /api/todos`**
- Body: `{ title: string, priority?: string, category?: string, dueDate?: string | null }`
- Appends the task to a server-side queue file: `fullstack/data/pending-tasks.json`
- Returns: `{ ok: true, id: string }`

**`GET /api/todos`**
- Returns all tasks currently in `pending-tasks.json`
- Clears the file after returning (queue drain)
- Returns: `{ tasks: Task[] }`

### `useTasks` Hook Update

- Polls `GET /api/todos` every 3 seconds
- On any returned tasks: merges them into localStorage state via `addTask`
- Only runs the poll if the page is visible (`document.visibilityState === 'visible'`)

### Python Script — `scripts/voice_task.py`

**Dependencies** (install once):
```
pip install faster-whisper sounddevice scipy numpy
```

**Behavior:**
1. Prints "Recording in 3... 2... 1..."
2. Records 5 seconds of audio via `sounddevice` at 16kHz mono
3. Saves to a temp `.wav` file using `scipy.io.wavfile`
4. Loads `faster-whisper` with model `base` (downloads ~145MB on first run to `~/.cache/huggingface/`)
5. Transcribes the audio
6. Prints the transcript
7. POSTs `{ title: <transcript>, priority: "none", category: "Work", dueDate: null }` to `http://localhost:3001/api/todos`
8. Prints confirmation or error

**Notes:**
- The script sends raw transcript as the task title. User can edit the task in the web app afterward.
- The Next.js dev server must be running on port 3001.
- Model is loaded fresh each run (no daemon). For faster repeated use, the model stays cached on disk.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/app/agents/components/Sidebar.tsx` | Rewrite — collapsible hover behavior |
| `src/app/agents/components/TaskCard.tsx` | Create — replaces TaskRow for grid views |
| `src/app/agents/components/TaskRow.tsx` | Keep — still used in Calendar day panel and RightPanel-replacement widgets |
| `src/app/agents/components/RightPanel.tsx` | Delete |
| `src/app/agents/components/FocusTimer.tsx` | Keep unchanged — just moved into Dashboard layout |
| `src/app/agents/components/views/DashboardView.tsx` | Full rewrite — hero + 3-col widgets + activity |
| `src/app/agents/components/views/TasksView.tsx` | Update — swap TaskRow for TaskCard, 2-col grid |
| `src/app/agents/components/views/CalendarView.tsx` | Minor — use TaskCard in day panel |
| `src/app/agents/components/views/AnalyticsView.tsx` | Minor — no structural change |
| `src/app/agents/page.tsx` | Update — remove RightPanel, adjust layout |
| `src/app/agents/hooks/useTasks.ts` | Update — add polling for `/api/todos` |
| `src/app/api/todos/route.ts` | Create — GET + POST queue endpoint |
| `src/styles/globals.css` | Update — new sidebar, card, hero, widget CSS |
| `fullstack/data/pending-tasks.json` | Create (empty `[]`) — server-side task queue |
| `scripts/voice_task.py` | Create — Python recording + transcription script |

---

## Out of Scope

- No changes to Analytics view structure
- No changes to task data model (`types.ts`)
- No changes to TaskModal
- No changes to VoiceFab (in-browser voice stays as-is)
- No database — queue is a JSON file, tasks still persist in localStorage
