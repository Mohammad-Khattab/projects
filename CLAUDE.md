# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory System

At the start of every session, read these files in parallel:
- `memory/user.md` — who the user is
- `memory/decisions.md` — past decisions and why
- `memory/people.md` — relevant people
- `memory/preferences.md` — how the user likes to work
- `memory/personality.md` — how to think, communicate, and make decisions with this user

At the end of every session, update any of these files with new information learned.

## Pending Future Features

> See [FUTURE.md](./FUTURE.md) for features that MUST be implemented.
> **IMPORTANT:** At the start of every conversation, remind the user about any pending features in FUTURE.md — especially **Gemini Embedding 2** integration. Update the `Last reminded` date in FUTURE.md each time.

---

## Repository Structure

This is an **npm workspaces monorepo**. Active packages:

```
projects/
├── fullstack/          # Main Next.js app (port 3001) ← primary codebase
├── portfolio/          # Portfolio Next.js app
├── games/
│   ├── snake-3d/
│   └── snakes-and-ladders/
├── mmkl-snake/         # Node/Express server for MMKL snake game
├── mmkl/               # MMKL preview assets
├── previews/           # HTML exports and screenshots
├── scripts/            # Helper scripts
├── memory/             # Session memory files (read at session start)
├── docs/               # Documentation
├── todos/              # Todo tracking files
├── CLAUDE.md           # This file
└── FUTURE.md           # Planned features
```

---

## Commands

> Always `npm install --legacy-peer-deps` from the root first. **Always use `--legacy-peer-deps`** — no exceptions.

```bash
# From root
npm run dev              # Start fullstack dev server
npm run dev:fullstack    # Next.js → http://localhost:3001
npm run build            # Build fullstack
npm run lint             # Lint fullstack

# From fullstack/
npm run dev              # Next.js dev server (0.0.0.0:3001)
npm run test             # Run Jest tests
npm run build
npm run lint
```

---

## fullstack/ Architecture

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript 5 · Playwright · Anthropic SDK · Google GenAI SDK

### Directory Layout

```
fullstack/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Main dashboard (subjects, resources, assignments)
│   │   ├── layout.tsx              # Root layout
│   │   ├── ai/page.tsx             # AI Studio (notes, slides, chat)
│   │   ├── calendar/page.tsx       # Weekly schedule grid
│   │   ├── subject/[id]/page.tsx   # Subject detail (resources, notes gen)
│   │   ├── agents/                 # Task management sub-app
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── seed/page.tsx
│   │   │   ├── types.ts
│   │   │   ├── components/         # TaskCard, TaskModal, VoiceFab, FocusTimer, Sidebar
│   │   │   │   └── views/          # DashboardView, TasksView, CalendarView, AnalyticsView
│   │   │   ├── hooks/              # useTasks, useVoice, useTimer, useCountUp, useScrollReveal
│   │   │   └── lib/utils.ts
│   │   ├── mmkl/                   # MMKL sub-app
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── scrape/route.ts     # GET cached data / POST scrape Moodle+myGJU
│   │       ├── notes/route.ts      # GET/POST subject notes (file-backed)
│   │       ├── ai/
│   │       │   ├── chat/route.ts   # POST chat / DELETE clear session
│   │       │   └── notes/route.ts  # POST generate notes/slides via Claude
│   │       ├── voice-parse/
│   │       │   ├── route.ts        # POST voice transcript → task extraction
│   │       │   └── parse.ts        # Anthropic Claude Haiku integration
│   │       ├── todos/
│   │       │   ├── route.ts        # GET drain queue / POST append task
│   │       │   └── queue.ts        # File-based task queue
│   │       └── teams-auth/route.ts # GET status / POST auth / DELETE disconnect
│   ├── components/
│   │   ├── study-hub/              # NavBar, SubjectCard, ResourceList, AssignmentList, NotesEditor, AIPanel
│   │   └── mmkl/                   # MmklDashboard, DashboardNav, CategorySection, ProjectCard, etc.
│   ├── lib/
│   │   ├── types.ts                # All shared TypeScript types
│   │   ├── storage.ts              # File-based JSON persistence
│   │   ├── scraper.ts              # Playwright scraper (Moodle + myGJU)
│   │   ├── merge.ts                # Merge scraped data from both sources
│   │   └── claude-daemon.ts        # Module singleton for Claude CLI sessions
│   └── styles/
│       ├── globals.css             # CSS variables, layout, utility classes (31K)
│       └── mmkl.css                # MMKL animations and styles (25K)
├── data/                           # Runtime data (git-ignored)
│   ├── subjects.json               # Cached scrape results
│   ├── pending-tasks.json          # Voice/external task queue
│   ├── cookies.json                # Moodle session cookies
│   ├── teams-cookies.json          # Teams auth cookies
│   └── notes/                      # Per-subject notes files
├── __tests__/                      # Jest tests
│   ├── merge.test.ts
│   ├── scraper.test.ts
│   ├── storage.test.ts
│   └── agents/
│       ├── useTasks.test.ts
│       ├── voice-parse.test.ts
│       ├── utils.test.ts
│       └── todos-queue.test.ts
├── next.config.mjs
├── tsconfig.json                   # Path alias: @/* → src/*
├── jest.setup.ts
└── package.json
```

### Key Types (`src/lib/types.ts`)

**Study Hub:**
- `Subject` — id, name, instructor, source (`'moodle'|'mygju'|'both'`), resourceCount, assignmentCount
- `Resource` — id, subjectId, name, type, url, uploadedAt?, chapter?
- `Assignment` — id, subjectId, title, dueDate, description?, submitted
- `ScheduleSlot` — day, startTime, endTime, room
- `CourseSchedule` — courseId, courseName, section, instructor, credits, slots, color
- `ScrapedData` — subjects, resources, assignments, scrapedAt, stale?, schedule?
- `SubjectNotes` — subjectId, content, updatedAt
- `ChatMessage` — role, content

**Agents (task manager):**
- `Task` — id, title, description, completed, priority, category, dueDate, createdAt, completedAt
- `Priority` — `'high'|'medium'|'low'|'none'`
- `Category` — `'Work'|'Personal'|'Creative'|'Health'`
- `ParsedTask` — title, dueDate, priority, category, confidence

### Environment Variables

No `.env.example` exists. Required variables (set in `.env.local`):

| Variable | Used by | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `api/voice-parse/parse.ts` | Claude Haiku for voice task extraction |
| `GJU_USERNAME` | `lib/scraper.ts` | GJU portal login |
| `GJU_PASSWORD` | `lib/scraper.ts` | GJU portal password |
| `DATA_DIR_OVERRIDE` | `lib/storage.ts` | Optional custom data directory |

### External Integrations

| Integration | Library | Purpose |
|---|---|---|
| Anthropic Claude | `@anthropic-ai/sdk` | Voice parse (Haiku), AI notes/chat |
| Google Gemini | `@google/generative-ai` | Installed — Gemini Embedding 2 pending |
| Playwright | `playwright` | Scrape Moodle + myGJU (headless/visible) |
| Web Speech API | Browser native | Voice input in agents app |
| Microsoft Teams | Playwright visible browser | MFA-compatible auth |
| PDF/DOCX parsing | `pdf-parse`, `mammoth` | Extract text from uploaded resources |
| Markdown rendering | `marked` | Render AI-generated notes |

### State Management

- **Client state:** `localStorage` via `useTasks` hook (with polling for external queue)
- **Server state:** File-based JSON via `src/lib/storage.ts`
- **In-memory:** Claude daemon sessions (module-level singleton in `claude-daemon.ts`)

### Data Flow

```
Playwright scraper → data/subjects.json → /api/scrape → React client
Voice input (Web Speech) → /api/voice-parse → Claude Haiku → task extracted
Resource files → pdf-parse/mammoth → /api/ai/notes → Claude → notes/slides
```

### Hardcoded Data (Semester 2 2025/2026)

`src/lib/scraper.ts` has hardcoded:
- Course IDs: ENGL1001, GERL102B2, IE0111, IE0121, IE0141, MATH102, PHYS104, PHYS106
- Weekly schedule with time slots, rooms, instructors, credits, and color codes
- Moodle section-specific course ID mappings

These will need updating each semester.

---

## Conventions

- **Imports:** Use `@/` alias for all internal imports (`@/lib/types`, `@/components/study-hub/NavBar`)
- **API routes:** Next.js Route Handlers in `src/app/api/**/route.ts`
- **Styling:** Custom CSS in `globals.css` / `mmkl.css` — no Tailwind
- **Tests:** Jest + ts-jest, files in `__tests__/`, match `**/__tests__/**/*.test.ts`
- **npm installs:** Always `--legacy-peer-deps` in this monorepo
- **Don't touch what works** — surgical edits only, no refactoring working code

---

## Other Projects

### portfolio/
Next.js 14 + TypeScript. Similar App Router structure. Separate app, not connected to fullstack.

### mmkl-snake/
Node.js + Express server (`server.js`). Uses `db.json` for persistence.

### games/
Static/standalone HTML+JS games (snake-3d, snakes-and-ladders). No build step.
