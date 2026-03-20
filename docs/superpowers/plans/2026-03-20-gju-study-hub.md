# GJU Study Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-modern local web dashboard that auto-scrapes GJU's Moodle and myGJU portals, aggregates semester 2 courses/resources/assignments, and provides AI-powered notes generation and chat.

**Architecture:** Next.js 14 App Router (`fullstack/` package, port 3001) with Playwright for server-side portal scraping, local JSON file storage, and Claude API for AI features. Credentials stored in `.env.local`. Data cached in `data/subjects.json`. Everything runs locally — Playwright cannot be deployed to cloud.

**Tech Stack:** Next.js 14, Playwright (chromium), @anthropic-ai/sdk, pdf-parse, mammoth, marked (markdown rendering), TypeScript, CSS custom properties (no Tailwind, no UI library)

---

## File Map

| File | Responsibility |
|------|---------------|
| `fullstack/.env.local` | GJU credentials + Claude API key (gitignored) |
| `fullstack/.gitignore` | Exclude data/, .env.local, node_modules |
| `fullstack/src/lib/types.ts` | All shared TypeScript interfaces |
| `fullstack/src/lib/storage.ts` | Read/write JSON data files (data/ directory) |
| `fullstack/src/lib/scraper.ts` | Playwright scraping logic for Moodle + myGJU |
| `fullstack/src/lib/merge.ts` | Merge and deduplicate scraped data from both portals |
| `fullstack/src/styles/globals.css` | Dark theme CSS variables + reset |
| `fullstack/src/app/layout.tsx` | Root layout — metadata, font, global styles |
| `fullstack/src/app/page.tsx` | Dashboard — subject grid, cache-first load, Refresh |
| `fullstack/src/app/subject/[id]/page.tsx` | Subject detail — Resources/Assignments/My Notes tabs |
| `fullstack/src/app/ai/page.tsx` | AI Studio — notes generator + chat |
| `fullstack/src/app/api/scrape/route.ts` | GET (cached) + POST (re-scrape) |
| `fullstack/src/app/api/ai/notes/route.ts` | Download resource, extract text, generate notes/slides via Claude |
| `fullstack/src/app/api/ai/chat/route.ts` | Chat with subject context via Claude |
| `fullstack/src/app/api/notes/route.ts` | Read/write per-subject user notes |
| `fullstack/src/components/NavBar.tsx` | Top nav: title, links, Refresh button, last-updated |
| `fullstack/src/components/SubjectCard.tsx` | Subject grid card with badges + urgency indicator |
| `fullstack/src/components/ResourceList.tsx` | Resource rows with type icons + AI action buttons |
| `fullstack/src/components/AssignmentList.tsx` | Assignment cards with urgency colors |
| `fullstack/src/components/NotesEditor.tsx` | Textarea with autosave + AI fill + markdown preview |
| `fullstack/src/components/AIPanel.tsx` | Notes/Slides/Chat UI with subject+resource selector |
| `fullstack/__tests__/storage.test.ts` | Unit tests for storage read/write functions |
| `fullstack/__tests__/merge.test.ts` | Unit tests for data merge/dedup logic |

---

### Task 1: Project Setup — Dependencies, Gitignore, Env

**Files:**
- Create: `fullstack/.gitignore`
- Create: `fullstack/.env.local`
- Modify: `fullstack/package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd "c:/Claude Code Test 1/fullstack"
npm install playwright @anthropic-ai/sdk pdf-parse mammoth marked --legacy-peer-deps
npm install -D @types/pdf-parse @types/marked jest @types/jest ts-jest --legacy-peer-deps
```

Expected: No errors. Check that `playwright`, `@anthropic-ai/sdk`, `pdf-parse`, `mammoth`, `marked` appear in `package.json` dependencies.
Note: `mammoth` ships its own TypeScript types — no `@types/mammoth` needed.

- [ ] **Step 2: Install Playwright browser**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx playwright install chromium
```

Expected: Chromium downloaded to local playwright cache.

- [ ] **Step 3: Create .gitignore**

Create `fullstack/.gitignore`:
```
node_modules/
.next/
data/
.env.local
*.log
```

- [ ] **Step 4: Create .env.local with credentials**

Create `fullstack/.env.local`:
```
GJU_USERNAME=<your_gju_username>
GJU_PASSWORD=<your_gju_password>
ANTHROPIC_API_KEY=<your_claude_api_key>
```

> **Note:** Replace placeholders with your actual credentials. Get your Claude API key from https://console.anthropic.com

- [ ] **Step 5: Add Jest config to package.json**

Add to `fullstack/package.json` scripts and jest config:
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.ts"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

- [ ] **Step 6: Create data directories**

```bash
mkdir -p "c:/Claude Code Test 1/fullstack/data/notes"
mkdir -p "c:/Claude Code Test 1/fullstack/__tests__"
mkdir -p "c:/Claude Code Test 1/fullstack/src/lib"
mkdir -p "c:/Claude Code Test 1/fullstack/src/styles"
mkdir -p "c:/Claude Code Test 1/fullstack/src/components"
```

- [ ] **Step 7: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/.gitignore fullstack/package.json
git commit -m "chore: setup fullstack deps, gitignore, jest config for GJU Study Hub"
```

---

### Task 2: Types + Storage Layer (with tests)

**Files:**
- Create: `fullstack/src/lib/types.ts`
- Create: `fullstack/src/lib/storage.ts`
- Create: `fullstack/__tests__/storage.test.ts`

- [ ] **Step 1: Write storage tests first**

Create `fullstack/__tests__/storage.test.ts`:
```typescript
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// We'll override DATA_DIR to use a temp directory in tests
let tmpDir: string
let storage: typeof import('../src/lib/storage')

// Single beforeEach — order matters: set env FIRST, then reset modules, then import
beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gju-test-'))
  process.env.DATA_DIR_OVERRIDE = tmpDir
  jest.resetModules()
  storage = await import('../src/lib/storage')
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true })
  delete process.env.DATA_DIR_OVERRIDE
})

describe('storage', () => {
  it('readScrapedData returns null when file does not exist', () => {
    expect(storage.readScrapedData()).toBeNull()
  })

  it('writeScrapedData then readScrapedData round-trips data', () => {
    const data = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. X', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [],
      assignments: [],
      scrapedAt: '2026-03-20T10:00:00Z'
    }
    storage.writeScrapedData(data)
    const result = storage.readScrapedData()
    expect(result).toEqual(data)
  })

  it('readNotes returns null when no notes saved', () => {
    expect(storage.readNotes('cs-310')).toBeNull()
  })

  it('writeNotes then readNotes round-trips content', () => {
    storage.writeNotes('cs-310', '# My Notes\nHello')
    const result = storage.readNotes('cs-310')
    expect(result?.content).toBe('# My Notes\nHello')
    expect(result?.subjectId).toBe('cs-310')
  })

  it('readCookies returns null when no cookies saved', () => {
    expect(storage.readCookies()).toBeNull()
  })

  it('writeCookies then readCookies round-trips', () => {
    const cookies = [{ name: 'MoodleSession', value: 'abc123', domain: 'e-learning.gju.edu.jo' }]
    storage.writeCookies(cookies)
    expect(storage.readCookies()).toEqual(cookies)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/storage.test.ts
```

Expected: Fails with "Cannot find module '../src/lib/storage'"

- [ ] **Step 3: Create types.ts**

Create `fullstack/src/lib/types.ts`:
```typescript
export interface Subject {
  id: string
  name: string
  instructor: string
  source: 'moodle' | 'mygju' | 'both'
  resourceCount: number
  assignmentCount: number
}

export interface Resource {
  id: string
  subjectId: string
  name: string
  type: 'pdf' | 'doc' | 'link' | 'video' | 'file'
  url: string
  uploadedAt?: string
}

export interface Assignment {
  id: string
  subjectId: string
  title: string
  dueDate: string
  description?: string
  submitted: boolean
}

export interface ScrapedData {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
  scrapedAt: string
  stale?: boolean
}

export interface SubjectNotes {
  subjectId: string
  content: string
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

- [ ] **Step 4: Create storage.ts**

Create `fullstack/src/lib/storage.ts`:
```typescript
import * as fs from 'fs'
import * as path from 'path'
import type { ScrapedData, SubjectNotes } from './types'

function getDataDir(): string {
  return process.env.DATA_DIR_OVERRIDE || path.join(process.cwd(), 'data')
}

export function ensureDataDir(): void {
  const dir = getDataDir()
  fs.mkdirSync(path.join(dir, 'notes'), { recursive: true })
}

export function readScrapedData(): ScrapedData | null {
  try {
    const file = path.join(getDataDir(), 'subjects.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as ScrapedData
  } catch {
    return null
  }
}

export function writeScrapedData(data: ScrapedData): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'subjects.json')
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

export function readNotes(subjectId: string): SubjectNotes | null {
  try {
    const file = path.join(getDataDir(), 'notes', `${subjectId}.json`)
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as SubjectNotes
  } catch {
    return null
  }
}

export function writeNotes(subjectId: string, content: string): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'notes', `${subjectId}.json`)
  const data: SubjectNotes = { subjectId, content, updatedAt: new Date().toISOString() }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

export function readCookies(): object[] | null {
  try {
    const file = path.join(getDataDir(), 'cookies.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as object[]
  } catch {
    return null
  }
}

export function writeCookies(cookies: object[]): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'cookies.json')
  fs.writeFileSync(file, JSON.stringify(cookies, null, 2), 'utf-8')
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/storage.test.ts
```

Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/lib/types.ts fullstack/src/lib/storage.ts fullstack/__tests__/storage.test.ts
git commit -m "feat: add types and storage layer with tests"
```

---

### Task 3: Data Merge Logic (with tests)

**Files:**
- Create: `fullstack/src/lib/merge.ts`
- Create: `fullstack/__tests__/merge.test.ts`

- [ ] **Step 1: Write merge tests first**

Create `fullstack/__tests__/merge.test.ts`:
```typescript
import { mergeScrapedData } from '../src/lib/merge'

describe('mergeScrapedData', () => {
  it('combines subjects from both sources', () => {
    const moodle = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [],
      assignments: []
    }
    const mygju = {
      subjects: [{ id: 'math-201', name: 'Math 201', instructor: 'Dr. B', source: 'mygju' as const, resourceCount: 0, assignmentCount: 0 }],
      resources: [],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.subjects).toHaveLength(2)
  })

  it('deduplicates subjects with same name, marks source as both', () => {
    const moodle = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [{ id: 'r1', subjectId: 'cs-310', name: 'Lec1.pdf', type: 'pdf' as const, url: 'http://moodle/r1' }],
      assignments: []
    }
    const mygju = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'mygju' as const, resourceCount: 1, assignmentCount: 0 }],
      resources: [{ id: 'r2', subjectId: 'cs-310', name: 'Lec2.pdf', type: 'pdf' as const, url: 'http://mygju/r2' }],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.subjects).toHaveLength(1)
    expect(result.subjects[0].source).toBe('both')
    expect(result.resources).toHaveLength(2)
  })

  it('combines resources and assignments from both', () => {
    const moodle = {
      subjects: [],
      resources: [{ id: 'r1', subjectId: 's1', name: 'F1', type: 'pdf' as const, url: 'u1' }],
      assignments: [{ id: 'a1', subjectId: 's1', title: 'HW1', dueDate: '2026-04-01', submitted: false }]
    }
    const mygju = {
      subjects: [],
      resources: [{ id: 'r2', subjectId: 's1', name: 'F2', type: 'link' as const, url: 'u2' }],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.resources).toHaveLength(2)
    expect(result.assignments).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/merge.test.ts
```

Expected: Fails with "Cannot find module '../src/lib/merge'"

- [ ] **Step 3: Create merge.ts**

Create `fullstack/src/lib/merge.ts`:
```typescript
import type { Subject, Resource, Assignment, ScrapedData } from './types'

interface PartialScrapeResult {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function mergeScrapedData(
  moodle: PartialScrapeResult,
  mygju: PartialScrapeResult
): Omit<ScrapedData, 'scrapedAt'> {
  const subjectMap = new Map<string, Subject>()

  for (const s of moodle.subjects) {
    const key = slugify(s.name)
    subjectMap.set(key, { ...s, id: key })
  }

  for (const s of mygju.subjects) {
    const key = slugify(s.name)
    if (subjectMap.has(key)) {
      const existing = subjectMap.get(key)!
      subjectMap.set(key, {
        ...existing,
        source: 'both',
        resourceCount: existing.resourceCount + s.resourceCount,
        assignmentCount: existing.assignmentCount + s.assignmentCount
      })
    } else {
      subjectMap.set(key, { ...s, id: key })
    }
  }

  // Remap resource/assignment subjectIds to slugified keys
  const normalizeResources = (items: Resource[], source: string) =>
    items.map(r => ({ ...r, id: `${source}-${r.id}`, subjectId: slugify(r.subjectId) }))

  const normalizeAssignments = (items: Assignment[], source: string) =>
    items.map(a => ({ ...a, id: `${source}-${a.id}`, subjectId: slugify(a.subjectId) }))

  return {
    subjects: Array.from(subjectMap.values()),
    resources: [
      ...normalizeResources(moodle.resources, 'moodle'),
      ...normalizeResources(mygju.resources, 'mygju')
    ],
    assignments: [
      ...normalizeAssignments(moodle.assignments, 'moodle'),
      ...normalizeAssignments(mygju.assignments, 'mygju')
    ]
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/merge.test.ts
```

Expected: All 3 tests PASS

- [ ] **Step 5: Run all tests**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest
```

Expected: 9 tests pass total

- [ ] **Step 6: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/lib/merge.ts fullstack/__tests__/merge.test.ts
git commit -m "feat: add data merge/dedup logic with tests"
```

---

### Task 4: Playwright Scraper

**Files:**
- Create: `fullstack/src/lib/scraper.ts`

Note: The scraper cannot be unit tested without live university portals. Verification is done by running the actual app. The myGJU JSF selectors **must be discovered at dev time** by running with `headless: false` and calling `await page.pause()` after login to inspect the DOM in the Playwright inspector.

The pure `slugify` utility inside scraper.ts IS testable. Add it to the scraper test before creating the scraper.

- [ ] **Step 1: Write slugify test**

Create `fullstack/__tests__/scraper.test.ts`:
```typescript
// Test only pure utility functions that don't need a browser
// Scraper integration is verified manually by running the app

// We re-export slugify from scraper for testing
// (add `export` to the slugify function in scraper.ts)
import { slugify } from '../src/lib/scraper'

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('CS 310')).toBe('cs-310')
  })
  it('removes special characters', () => {
    expect(slugify('Math & Physics 201!')).toBe('math--physics-201')
  })
  it('handles already-slugified input', () => {
    expect(slugify('data-structures')).toBe('data-structures')
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/scraper.test.ts
```

Expected: Fails with "Cannot find module" or "slugify is not exported"

- [ ] **Step 4: Create scraper.ts**

Create `fullstack/src/lib/scraper.ts`:
```typescript
import { chromium, type Page, type BrowserContext } from 'playwright'
import { readCookies, writeCookies, readScrapedData, writeScrapedData } from './storage'
import { mergeScrapedData } from './merge'
import type { ScrapedData, Subject, Resource, Assignment } from './types'

interface ScrapeResult {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
}

// Exported for testing
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function isLoggedInToMoodle(page: Page): Promise<boolean> {
  return page.url().includes('/my/') || page.url().includes('/dashboard')
}

async function scrapeMoodle(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  await page.goto('https://e-learning.gju.edu.jo/login/index.php', { waitUntil: 'networkidle' })

  if (!(await isLoggedInToMoodle(page))) {
    await page.fill('#username', username)
    await page.fill('#password', password)
    await Promise.all([page.click('#loginbtn'), page.waitForLoadState('networkidle')])
  }

  // Get all enrolled courses
  await page.goto('https://e-learning.gju.edu.jo/my/', { waitUntil: 'networkidle' })

  const courseLinks = await page.$$eval(
    'a[href*="/course/view.php"]',
    (links) => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
  )

  // Deduplicate by href
  const uniqueCourses = [...new Map(courseLinks.map(c => [c.href, c])).values()]

  for (const course of uniqueCourses) {
    const subjectId = slugify(course.text || new URL(course.href).searchParams.get('id') || 'unknown')
    if (!subjectId) continue

    try {
      await page.goto(course.href, { waitUntil: 'networkidle' })

      const courseName = await page.$eval('h1', el => el.textContent?.trim() || '').catch(() => course.text)
      const instructor = await page.$eval('.teacher a', el => el.textContent?.trim() || '').catch(() => '')

      // Collect resource links
      const resourceLinks = await page.$$eval(
        'a[href*="mod/resource"], a[href*="mod/url"], a[href*="mod/folder"]',
        links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
      )

      for (const r of resourceLinks) {
        const url = r.href
        const ext = url.split('.').pop()?.toLowerCase() || ''
        const type = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'doc' : 'file'
        resources.push({
          id: `${subjectId}-${Buffer.from(url).toString('base64').slice(0, 8)}`,
          subjectId,
          name: r.text,
          type,
          url
        })
      }

      // Collect assignment links
      const assignLinks = await page.$$eval(
        'a[href*="mod/assign"]',
        links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
      )

      for (const a of assignLinks) {
        try {
          await page.goto(a.href, { waitUntil: 'networkidle' })
          const title = await page.$eval('h2', el => el.textContent?.trim() || a.text).catch(() => a.text)
          const dueDateText = await page.$eval(
            '.submissionstatustable td:last-child, .generaltable td:last-child',
            el => el.textContent?.trim() || ''
          ).catch(() => '')

          // Parse due date — Moodle shows dates like "Saturday, 5 April 2026, 11:59 PM"
          const dueDate = dueDateText ? new Date(dueDateText).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
          const submitted = await page.$('.submissionstatussubmitted').then(() => true).catch(() => false)

          assignments.push({
            id: `${subjectId}-assign-${assignments.length}`,
            subjectId,
            title,
            dueDate,
            submitted
          })
          await page.goto(course.href, { waitUntil: 'networkidle' })
        } catch {
          // Skip assignment if scraping fails
        }
      }

      subjects.push({
        id: subjectId,
        name: courseName,
        instructor,
        source: 'moodle',
        resourceCount: resourceLinks.length,
        assignmentCount: assignLinks.length
      })
    } catch {
      // Skip course if scraping fails
    }
  }

  return { subjects, resources, assignments }
}

async function scrapeMyGJU(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  try {
    await page.goto('https://mygju.gju.edu.jo/faces/index.xhtml', { waitUntil: 'networkidle' })

    // JSF login — selectors discovered by running headless:false + page.pause() in dev
    // Look for standard input fields
    const usernameField = await page.$('input[type="text"], input[id*="username"], input[id*="user"]')
    const passwordField = await page.$('input[type="password"]')

    if (usernameField && passwordField) {
      await usernameField.fill(username)
      await passwordField.fill(password)
      // Find submit button
      const submitBtn = await page.$('input[type="submit"], button[type="submit"], .login-button')
      if (submitBtn) {
        await Promise.all([
          submitBtn.click(),
          page.waitForLoadState('networkidle').catch(() => {})
        ])
      }
    }

    // Navigate to schedule — look for schedule/courses link in nav
    const scheduleLink = await page.$('a[href*="schedule"], a[href*="Schedule"], a[href*="courses"]')
    if (scheduleLink) {
      await Promise.all([
        scheduleLink.click(),
        page.waitForLoadState('networkidle').catch(() => {})
      ])
    }

    // Extract course rows from schedule table
    // NOTE: These selectors will likely need adjustment after inspecting actual DOM
    const rows = await page.$$('table tr, .schedule-row, .course-row')
    for (const row of rows) {
      const text = await row.textContent()
      if (text && text.trim().length > 3) {
        const name = text.trim().split('\n')[0].trim()
        if (name && name.length > 2) {
          subjects.push({
            id: slugify(name),
            name,
            instructor: '',
            source: 'mygju',
            resourceCount: 0,
            assignmentCount: 0
          })
        }
      }
    }
  } catch {
    // myGJU scraping is best-effort — Moodle is the primary source
    console.warn('myGJU scraping failed, continuing with Moodle data only')
  }

  return { subjects, resources, assignments }
}

export async function scrapeAll(): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true })
  const context: BrowserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })

  // Load saved cookies for session reuse
  const savedCookies = readCookies()
  if (savedCookies && savedCookies.length > 0) {
    try {
      await context.addCookies(savedCookies as Parameters<typeof context.addCookies>[0])
    } catch {
      // Invalid cookies format, ignore
    }
  }

  const page = await context.newPage()

  try {
    const moodle = await scrapeMoodle(page)
    const mygju = await scrapeMyGJU(page)

    // Save cookies for next session
    const cookies = await context.cookies()
    writeCookies(cookies)

    const merged = mergeScrapedData(moodle, mygju)
    const result: ScrapedData = { ...merged, scrapedAt: new Date().toISOString() }
    writeScrapedData(result)
    return result
  } catch (err) {
    const cached = readScrapedData()
    if (cached) return { ...cached, stale: true }
    throw err
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 5: Run scraper test — expect pass**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest __tests__/scraper.test.ts
```

Expected: All 3 slugify tests PASS

- [ ] **Step 6: Run all tests**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest
```

Expected: 12 tests pass total (6 storage + 3 merge + 3 scraper)

- [ ] **Step 7: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/lib/scraper.ts fullstack/__tests__/scraper.test.ts
git commit -m "feat: add Playwright scraper for Moodle and myGJU"
```

---

### Task 5: API Routes

**Files:**
- Create: `fullstack/src/app/api/scrape/route.ts`
- Create: `fullstack/src/app/api/ai/notes/route.ts`
- Create: `fullstack/src/app/api/ai/chat/route.ts`
- Create: `fullstack/src/app/api/notes/route.ts`

- [ ] **Step 1: Create scrape route (GET + POST)**

Create `fullstack/src/app/api/scrape/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { readScrapedData } from '@/lib/storage'
import { scrapeAll } from '@/lib/scraper'

// Scraping multiple courses can take > 30s — set maxDuration for local dev
// (Has no effect in standard Next.js dev mode, but prevents timeout warnings)
export const maxDuration = 300

export async function GET() {
  const cached = readScrapedData()
  if (cached) {
    return NextResponse.json({ data: cached })
  }
  return NextResponse.json({ data: null, message: 'No cached data — click Refresh to scrape' })
}

export async function POST() {
  try {
    const data = await scrapeAll()
    return NextResponse.json({ data })
  } catch (err) {
    const cached = readScrapedData()
    if (cached) {
      return NextResponse.json({ data: { ...cached, stale: true } })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create notes/slides AI route**

Create `fullstack/src/app/api/ai/notes/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readCookies } from '@/lib/storage'

// Dynamic import to avoid build-time issues with binary modules
async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (ext === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  // For HTML/text files, strip tags
  return buffer.toString('utf-8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

export async function POST(req: NextRequest) {
  const { resourceUrl, resourceName, subjectName, mode } = await req.json() as {
    resourceUrl: string
    resourceName: string
    subjectName: string
    mode: 'notes' | 'slides'
  }

  // Download resource with session cookies
  const cookies = readCookies()
  const cookieHeader = cookies
    ? (cookies as Array<{ name: string; value: string }>).map(c => `${c.name}=${c.value}`).join('; ')
    : ''

  let text = ''
  try {
    const res = await fetch(resourceUrl, {
      headers: { Cookie: cookieHeader }
    })
    if (!res.ok) throw new Error(`Failed to fetch resource: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    text = await extractTextFromBuffer(buffer, resourceName)
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch/extract resource: ${String(err)}` }, { status: 400 })
  }

  // Truncate to 80k chars
  const truncated = text.slice(0, 80000)

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const prompt = mode === 'notes'
    ? `You are an expert study assistant. Based on the following course material from "${subjectName}", generate comprehensive, well-structured study notes.\n\nUse clear ## H2 and ### H3 headings for each topic, bullet points for key concepts, **bold** for definitions, and end with a ## Summary section.\n\nMaterial:\n\n${truncated}`
    : `Generate a slide deck outline for "${subjectName}". Format each slide as:\n\n## Slide N: [Title]\n- bullet point\n- bullet point\n- bullet point\n\nSeparate each slide with ---\n\nStart with a Title Slide and Agenda, then content slides, then a Conclusion slide.\n\nMaterial:\n\n${truncated}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ content })
}
```

- [ ] **Step 3: Create chat AI route**

Create `fullstack/src/app/api/ai/chat/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { messages, subjectName, context } = await req.json() as {
    messages: ChatMessage[]
    subjectName: string
    context?: string
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const systemPrompt = `You are a helpful study assistant for a university student studying "${subjectName}". ${
    context ? `Here is relevant course material context:\n\n${context}` : ''
  }\n\nProvide clear, concise answers. When explaining concepts, use examples. Format your responses with markdown.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  })

  const reply = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ reply })
}
```

- [ ] **Step 4: Create user notes route**

Create `fullstack/src/app/api/notes/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readNotes, writeNotes } from '@/lib/storage'

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId')
  if (!subjectId) return NextResponse.json({ error: 'subjectId required' }, { status: 400 })
  const notes = readNotes(subjectId)
  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const { subjectId, content } = await req.json() as { subjectId: string; content: string }
  if (!subjectId) return NextResponse.json({ error: 'subjectId required' }, { status: 400 })
  writeNotes(subjectId, content)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/app/api/
git commit -m "feat: add API routes for scrape, AI notes/chat, user notes"
```

---

### Task 6: Dark Theme CSS + Layout

**Files:**
- Create: `fullstack/src/styles/globals.css`
- Modify: `fullstack/src/app/layout.tsx`

- [ ] **Step 1: Create globals.css**

Create `fullstack/src/styles/globals.css`:
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-primary: #0a0a0f;
  --bg-card: #13131a;
  --bg-card-hover: #1a1a24;
  --bg-input: #0f0f17;
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(99, 102, 241, 0.4);
  --accent-from: #6366f1;
  --accent-to: #8b5cf6;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --alert-urgent: #ef4444;
  --alert-warning: #f59e0b;
  --alert-ok: #22c55e;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

html, body {
  height: 100%;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent-from);
  text-decoration: none;
}

a:hover {
  color: var(--accent-to);
}

/* Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: border-color 0.2s, background 0.2s;
}

.card:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, transform 0.1s;
}

.btn:hover { opacity: 0.9; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-primary {
  background: linear-gradient(135deg, var(--accent-from), var(--accent-to));
  color: #fff;
}

.btn-secondary {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-purple { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.badge-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.badge-red { background: rgba(239, 68, 68, 0.15); color: #f87171; }

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 0%, var(--bg-card-hover) 50%, var(--bg-card) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.tab {
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.tab:hover { color: var(--text-primary); }
.tab.active {
  color: var(--accent-from);
  border-bottom-color: var(--accent-from);
}

/* Input / Textarea */
input, textarea, select {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  padding: 10px 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--accent-from);
}

/* Markdown rendered output */
.markdown h1, .markdown h2, .markdown h3 {
  margin: 1.2em 0 0.4em;
  color: var(--text-primary);
}

.markdown h2 { font-size: 1.25em; color: #a5b4fc; }
.markdown h3 { font-size: 1.1em; color: #c4b5fd; }

.markdown p { margin: 0.5em 0; color: var(--text-secondary); }

.markdown ul, .markdown ol {
  padding-left: 1.4em;
  margin: 0.4em 0;
  color: var(--text-secondary);
}

.markdown li { margin: 0.2em 0; }

.markdown strong { color: var(--text-primary); }

.markdown code {
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5em 0;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent-from);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Layout */
.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.grid-subjects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;
}
```

- [ ] **Step 2: Update layout.tsx**

Rewrite `fullstack/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'GJU Study Hub',
  description: 'Your personal GJU course dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/styles/globals.css fullstack/src/app/layout.tsx
git commit -m "feat: dark theme CSS variables and root layout"
```

---

### Task 7: NavBar Component

**Files:**
- Create: `fullstack/src/components/NavBar.tsx`

- [ ] **Step 1: Create NavBar.tsx**

Create `fullstack/src/components/NavBar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavBarProps {
  scrapedAt?: string
  onRefresh?: () => void
  refreshing?: boolean
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NavBar({ scrapedAt, onRefresh, refreshing }: NavBarProps) {
  const pathname = usePathname()

  return (
    <nav style={{
      background: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>◈</span>
          <Link href="/" style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.01em'
          }}>
            GJU Study Hub
          </Link>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link
            href="/"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: pathname === '/' ? 'var(--accent-from)' : 'var(--text-secondary)',
              background: pathname === '/' ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/ai"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: pathname === '/ai' ? 'var(--accent-from)' : 'var(--text-secondary)',
              background: pathname === '/ai' ? 'rgba(99,102,241,0.1)' : 'transparent',
              transition: 'all 0.15s'
            }}
          >
            AI Studio
          </Link>
        </div>

        {/* Refresh + timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {scrapedAt && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Updated {timeAgo(scrapedAt)}
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={refreshing}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            {refreshing ? <span className="spinner" /> : '↻'} Refresh
          </button>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/components/NavBar.tsx
git commit -m "feat: NavBar with links and refresh button"
```

---

### Task 8: SubjectCard Component

**Files:**
- Create: `fullstack/src/components/SubjectCard.tsx`

- [ ] **Step 1: Create SubjectCard.tsx**

Create `fullstack/src/components/SubjectCard.tsx`:
```tsx
import Link from 'next/link'
import type { Subject, Assignment } from '@/lib/types'

interface SubjectCardProps {
  subject: Subject
  assignments: Assignment[]
}

function getUrgentCount(assignments: Assignment[]): number {
  const now = Date.now()
  const h48 = 48 * 3600 * 1000
  return assignments.filter(a => !a.submitted && new Date(a.dueDate).getTime() - now < h48 && new Date(a.dueDate).getTime() > now).length
}

export default function SubjectCard({ subject, assignments }: SubjectCardProps) {
  const subjectAssignments = assignments.filter(a => a.subjectId === subject.id)
  const urgentCount = getUrgentCount(subjectAssignments)

  return (
    <Link href={`/subject/${subject.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', height: '100%', minHeight: 140 }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
            lineHeight: 1.3
          }}>
            {subject.name}
          </h3>
          {subject.instructor && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subject.instructor}</p>
          )}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-purple">
            📄 {subject.resourceCount} file{subject.resourceCount !== 1 ? 's' : ''}
          </span>
          {subject.assignmentCount > 0 && (
            <span className="badge badge-green">
              ✓ {subject.assignmentCount} task{subject.assignmentCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="badge" style={{
            background: 'rgba(99,102,241,0.08)',
            color: 'var(--text-muted)',
            fontSize: 11
          }}>
            {subject.source}
          </span>
        </div>

        {/* Urgent alert */}
        {urgentCount > 0 && (
          <div className="badge badge-amber" style={{
            display: 'inline-flex',
            animation: 'pulse 2s infinite'
          }}>
            ⚠ {urgentCount} due soon
          </div>
        )}
      </div>
    </Link>
  )
}
```

Add to globals.css (append):
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/components/SubjectCard.tsx fullstack/src/styles/globals.css
git commit -m "feat: SubjectCard component with urgency indicator"
```

---

### Task 9: Dashboard Page

**Files:**
- Rewrite: `fullstack/src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Rewrite `fullstack/src/app/page.tsx`:
```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import SubjectCard from '@/components/SubjectCard'
import type { ScrapedData } from '@/lib/types'

function SkeletonCard() {
  return (
    <div className="card" style={{ height: 140 }}>
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 22, width: 80 }} />
        <div className="skeleton" style={{ height: 22, width: 70 }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<ScrapedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCached = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scrape')
      const json = await res.json()
      setData(json.data)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data)
    } catch (err) {
      setError(`Refresh failed: ${String(err)}`)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadCached() }, [loadCached])

  const dueThisWeek = data?.assignments.filter(a => {
    const due = new Date(a.dueDate).getTime()
    const now = Date.now()
    return !a.submitted && due > now && due - now < 7 * 24 * 3600 * 1000
  }).length ?? 0

  return (
    <>
      <NavBar
        scrapedAt={data?.scrapedAt}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Semester 2 — 2025/2026
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
            {data ? (
              <>
                {data.subjects.length} subjects
                {dueThisWeek > 0 && (
                  <span style={{ color: 'var(--alert-warning)', marginLeft: 12 }}>
                    · {dueThisWeek} assignment{dueThisWeek !== 1 ? 's' : ''} due this week
                  </span>
                )}
                {data.stale && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
                    · (cached — click Refresh to update)
                  </span>
                )}
              </>
            ) : loading ? 'Loading...' : 'No data — click Refresh to scrape your portals'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: '#f87171',
            marginTop: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid-subjects">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data?.subjects.length ? (
            data.subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                assignments={data.assignments}
              />
            ))
          ) : !loading && !error ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>◈</p>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No subjects found</p>
              <p style={{ fontSize: 14 }}>Click <strong>Refresh</strong> to scrape your GJU portals</p>
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Run the dev server to verify dashboard renders**

```bash
cd "c:/Claude Code Test 1"
npm run dev:fullstack
```

Open http://localhost:3001 — should see dark dashboard with skeleton loading, then empty state or data.

- [ ] **Step 3: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/app/page.tsx
git commit -m "feat: dashboard page with cache-first load and subject grid"
```

---

### Task 10: ResourceList + AssignmentList Components

**Files:**
- Create: `fullstack/src/components/ResourceList.tsx`
- Create: `fullstack/src/components/AssignmentList.tsx`

- [ ] **Step 1: Create ResourceList.tsx**

Create `fullstack/src/components/ResourceList.tsx`:
```tsx
import type { Resource } from '@/lib/types'

interface ResourceListProps {
  resources: Resource[]
  subjectName: string
  onGenerateNotes: (resource: Resource, mode: 'notes' | 'slides') => void
  generatingId?: string
}

const typeIcon: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  video: '🎥',
  link: '🔗',
  file: '📎'
}

export default function ResourceList({ resources, subjectName, onGenerateNotes, generatingId }: ResourceListProps) {
  if (!resources.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No resources uploaded yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {resources.map(resource => (
        <div
          key={resource.id}
          className="card"
          style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          {/* Icon */}
          <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcon[resource.type] || '📎'}</span>

          {/* Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {resource.name}
            </p>
            {resource.uploadedAt && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(resource.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: '5px 10px', fontSize: 12 }}
            >
              ↗ Open
            </a>
            {(resource.type === 'pdf' || resource.type === 'doc' || resource.type === 'file') && (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => onGenerateNotes(resource, 'notes')}
                  disabled={generatingId === resource.id}
                >
                  {generatingId === resource.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✦'} Notes
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => onGenerateNotes(resource, 'slides')}
                  disabled={generatingId === resource.id}
                >
                  ◫ Slides
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create AssignmentList.tsx**

Create `fullstack/src/components/AssignmentList.tsx`:
```tsx
import type { Assignment } from '@/lib/types'

interface AssignmentListProps {
  assignments: Assignment[]
}

function getUrgency(dueDate: string, submitted: boolean): 'overdue' | 'urgent' | 'soon' | 'ok' | 'done' {
  if (submitted) return 'done'
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) return 'overdue'
  if (diff < 48 * 3600 * 1000) return 'urgent'
  if (diff < 7 * 24 * 3600 * 1000) return 'soon'
  return 'ok'
}

const urgencyStyle: Record<string, { color: string; label: string }> = {
  overdue: { color: 'var(--alert-urgent)', label: 'Overdue' },
  urgent: { color: 'var(--alert-warning)', label: 'Due soon' },
  soon: { color: '#fb923c', label: 'This week' },
  ok: { color: 'var(--alert-ok)', label: '' },
  done: { color: 'var(--text-muted)', label: 'Submitted' }
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  if (!assignments.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No assignments found
      </div>
    )
  }

  const sorted = [...assignments].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(assignment => {
        const urgency = getUrgency(assignment.dueDate, assignment.submitted)
        const { color, label } = urgencyStyle[urgency]

        return (
          <div
            key={assignment.id}
            className="card"
            style={{
              borderLeft: `3px solid ${color}`,
              padding: '14px 18px',
              opacity: urgency === 'done' ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {assignment.title}
                </p>
                {assignment.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {assignment.description.slice(0, 120)}{assignment.description.length > 120 ? '...' : ''}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, color, fontWeight: 500 }}>
                  {label || new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(assignment.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/components/ResourceList.tsx fullstack/src/components/AssignmentList.tsx
git commit -m "feat: ResourceList and AssignmentList components"
```

---

### Task 11: NotesEditor Component

**Files:**
- Create: `fullstack/src/components/NotesEditor.tsx`

- [ ] **Step 1: Create NotesEditor.tsx**

Create `fullstack/src/components/NotesEditor.tsx`:
```tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface NotesEditorProps {
  subjectId: string
  subjectName: string
  resources: Array<{ id: string; name: string; url: string; type: string }>
}

export default function NotesEditor({ subjectId, subjectName, resources }: NotesEditorProps) {
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [preview, setPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  // Load existing notes
  useEffect(() => {
    fetch(`/api/notes?subjectId=${subjectId}`)
      .then(r => r.json())
      .then(json => {
        if (json.notes?.content) setContent(json.notes.content)
      })
      .catch(() => {})
  }, [subjectId])

  const save = useCallback(async (text: string) => {
    setSaveStatus('saving')
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, content: text })
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('unsaved')
    }
  }, [subjectId])

  const handleChange = (value: string) => {
    setContent(value)
    setSaveStatus('unsaved')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(value), 800)
  }

  const generateNotes = async () => {
    const resource = resources.find(r => r.id === selectedResourceId)
    if (!resource) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          resourceName: resource.name,
          subjectName,
          mode: 'notes'
        })
      })
      const json = await res.json()
      if (json.content) {
        const newContent = content ? `${content}\n\n---\n\n${json.content}` : json.content
        setContent(newContent)
        save(newContent)
      }
    } catch {
      alert('Failed to generate notes. Check your Claude API key.')
    } finally {
      setGenerating(false)
    }
  }

  // Use marked library for reliable markdown rendering
  const renderMarkdown = (text: string): string => {
    const { marked } = require('marked')
    return marked.parse(text) as string
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)'
      }}>
        {/* AI generate section */}
        <select
          value={selectedResourceId}
          onChange={e => setSelectedResourceId(e.target.value)}
          style={{ flex: 1, maxWidth: 260 }}
        >
          <option value="">Select resource to generate notes...</option>
          {resources.filter(r => ['pdf', 'doc', 'file'].includes(r.type)).map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          style={{ fontSize: 13, padding: '7px 14px', whiteSpace: 'nowrap' }}
          onClick={generateNotes}
          disabled={!selectedResourceId || generating}
        >
          {generating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '✦'} Generate
        </button>

        <div style={{ flex: 1 }} />

        {/* Preview toggle */}
        <button
          className={`btn ${preview ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: 13, padding: '7px 14px' }}
          onClick={() => setPreview(p => !p)}
        >
          {preview ? '✎ Edit' : '◎ Preview'}
        </button>

        {/* Status + word count */}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {wordCount} words
        </span>
        <span style={{
          fontSize: 12,
          color: saveStatus === 'saved' ? 'var(--alert-ok)' : saveStatus === 'saving' ? 'var(--alert-warning)' : 'var(--text-muted)',
          whiteSpace: 'nowrap'
        }}>
          {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : '● Unsaved'}
        </span>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="card markdown"
          style={{ minHeight: 500, padding: 24 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<p style="color:var(--text-muted)">Nothing to preview yet</p>' }}
        />
      ) : (
        <textarea
          value={content}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Write your notes for ${subjectName} here...\n\nYou can write in Markdown:\n# Heading\n## Subheading\n- bullet point\n**bold text**`}
          style={{
            minHeight: 500,
            resize: 'vertical',
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: 14,
            lineHeight: 1.7,
            padding: 20
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/components/NotesEditor.tsx
git commit -m "feat: NotesEditor with autosave, AI generate, and markdown preview"
```

---

### Task 12: Subject Detail Page

**Files:**
- Create: `fullstack/src/app/subject/[id]/page.tsx`

- [ ] **Step 1: Create subject detail page**

Create `fullstack/src/app/subject/[id]/page.tsx`:
```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ResourceList from '@/components/ResourceList'
import AssignmentList from '@/components/AssignmentList'
import NotesEditor from '@/components/NotesEditor'
import type { ScrapedData, Resource } from '@/lib/types'

type Tab = 'resources' | 'assignments' | 'notes'

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<ScrapedData | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'resources')
  const [generatingId, setGeneratingId] = useState<string | undefined>()
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/scrape').then(r => r.json()).then(json => setData(json.data))
  }, [])

  const subject = data?.subjects.find(s => s.id === id)
  const resources = data?.resources.filter(r => r.subjectId === id) || []
  const assignments = data?.assignments.filter(a => a.subjectId === id) || []

  const handleTab = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`/subject/${id}?tab=${tab}`, { scroll: false })
  }

  const handleGenerateNotes = useCallback(async (resource: Resource, mode: 'notes' | 'slides') => {
    setGeneratingId(resource.id)
    setGeneratedContent(null)
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          resourceName: resource.name,
          subjectName: subject?.name || id,
          mode
        })
      })
      const json = await res.json()
      if (json.content) {
        setGeneratedContent(json.content)
        setActiveTab('notes')
      }
    } catch {
      alert('Failed to generate notes. Check Claude API key.')
    } finally {
      setGeneratingId(undefined)
    }
  }, [subject, id])

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="page-container" style={{ paddingTop: 32 }}>
          <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </main>
      </>
    )
  }

  if (!subject) {
    return (
      <>
        <NavBar />
        <main className="page-container" style={{ paddingTop: 32 }}>
          <p style={{ color: 'var(--text-muted)' }}>Subject not found. <Link href="/">Go back</Link></p>
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar scrapedAt={data.scrapedAt} />
      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Breadcrumb + header */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{subject.name}</h1>
              {subject.instructor && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                  {subject.instructor}
                </p>
              )}
            </div>
            <Link href="/ai" className="btn btn-primary" style={{ fontSize: 13 }}>
              ✦ AI Studio
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => handleTab('resources')}>
            Resources ({resources.length})
          </button>
          <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => handleTab('assignments')}>
            Assignments ({assignments.length})
          </button>
          <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => handleTab('notes')}>
            My Notes
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'resources' && (
          <ResourceList
            resources={resources}
            subjectName={subject.name}
            onGenerateNotes={handleGenerateNotes}
            generatingId={generatingId}
          />
        )}
        {activeTab === 'assignments' && <AssignmentList assignments={assignments} />}
        {activeTab === 'notes' && (
          <NotesEditor
            subjectId={subject.id}
            subjectName={subject.name}
            resources={resources}
          />
        )}

        {/* Generated content overlay */}
        {generatedContent && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24
          }}>
            <div className="card" style={{ maxWidth: 760, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16 }}>Generated Notes</h3>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setGeneratedContent(null)}>✕</button>
              </div>
              <div className="markdown" dangerouslySetInnerHTML={{
                __html: (() => { const { marked } = require('marked'); return marked.parse(generatedContent) })()
              }} />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/app/subject/
git commit -m "feat: subject detail page with resources/assignments/notes tabs"
```

---

### Task 13: AIPanel Component + AI Studio Page

**Files:**
- Create: `fullstack/src/components/AIPanel.tsx`
- Create: `fullstack/src/app/ai/page.tsx`

- [ ] **Step 1: Create AIPanel.tsx**

Create `fullstack/src/components/AIPanel.tsx`:
```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import type { Subject, Resource, ChatMessage } from '@/lib/types'

interface AIPanelProps {
  subjects: Subject[]
  resources: Resource[]
}

type Mode = 'notes' | 'slides' | 'chat'

export default function AIPanel({ subjects, resources }: AIPanelProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [mode, setMode] = useState<Mode>('notes')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const subject = subjects.find(s => s.id === selectedSubjectId)
  const subjectResources = resources.filter(r => r.subjectId === selectedSubjectId)
  const resource = subjectResources.find(r => r.id === selectedResourceId)

  // Load chat history from localStorage
  useEffect(() => {
    if (!selectedSubjectId) return
    const stored = localStorage.getItem(`chat-${selectedSubjectId}`)
    if (stored) {
      try { setMessages(JSON.parse(stored)) } catch {}
    } else {
      setMessages([])
    }
  }, [selectedSubjectId])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generate = async () => {
    if (!resource || !subject) return
    setLoading(true)
    setOutput('')
    setError('')
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          resourceName: resource.name,
          subjectName: subject.name,
          mode
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setOutput(json.content)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || !subject) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setChatInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, subjectName: subject.name })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const assistantMsg: ChatMessage = { role: 'assistant', content: json.reply }
      const updated = [...newMessages, assistantMsg]
      setMessages(updated)
      localStorage.setItem(`chat-${selectedSubjectId}`, JSON.stringify(updated))
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const renderMarkdown = (text: string): string => {
    const { marked } = require('marked')
    return marked.parse(text) as string
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {/* Left panel — selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>SUBJECT</label>
          <select value={selectedSubjectId} onChange={e => { setSelectedSubjectId(e.target.value); setSelectedResourceId(''); setOutput(''); setMessages([]) }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedSubjectId && (
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>RESOURCE (for notes/slides)</label>
            <select value={selectedResourceId} onChange={e => setSelectedResourceId(e.target.value)}>
              <option value="">Select resource...</option>
              {subjectResources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}

        {/* Mode selector */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>MODE</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['notes', 'slides', 'chat'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`btn ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
              >
                {m === 'notes' ? '✦ Notes' : m === 'slides' ? '◫ Slides' : '💬 Chat'}
              </button>
            ))}
          </div>
        </div>

        {mode !== 'chat' && selectedResourceId && (
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <span className="spinner" /> : '▶'} Generate {mode}
          </button>
        )}

        {output && mode !== 'chat' && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              navigator.clipboard.writeText(output)
            }}
          >
            ⎘ Copy
          </button>
        )}
      </div>

      {/* Right panel — output */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mode === 'chat' ? (
          <>
            {/* Chat messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                  {selectedSubjectId ? 'Ask anything about this subject...' : 'Select a subject to start chatting'}
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, var(--accent-from), var(--accent-to))'
                      : 'var(--bg-card-hover)',
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    fontSize: 14,
                    lineHeight: 1.6
                  }}>
                    {msg.role === 'assistant'
                      ? <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      : msg.content
                    }
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: '12px 12px 12px 4px', border: '1px solid var(--border)' }}>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 10
            }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Ask about this subject... (Enter to send)"
                disabled={!selectedSubjectId || loading}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendChat}
                disabled={!chatInput.trim() || !selectedSubjectId || loading}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          // Notes / Slides output
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ width: 24, height: 24 }} />
                <span>Generating {mode}...</span>
              </div>
            ) : error ? (
              <div style={{ color: '#f87171', fontSize: 14 }}>{error}</div>
            ) : output ? (
              <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                {selectedSubjectId && selectedResourceId
                  ? `Click "Generate ${mode}" to start`
                  : 'Select a subject and resource, then click Generate'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create AI Studio page**

Create `fullstack/src/app/ai/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import AIPanel from '@/components/AIPanel'
import type { ScrapedData } from '@/lib/types'

export default function AIStudioPage() {
  const [data, setData] = useState<ScrapedData | null>(null)

  useEffect(() => {
    fetch('/api/scrape').then(r => r.json()).then(json => setData(json.data))
  }, [])

  return (
    <>
      <NavBar scrapedAt={data?.scrapedAt} />
      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>✦ AI Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Generate study notes, slide decks, or chat with your course materials
          </p>
        </div>
        <AIPanel
          subjects={data?.subjects || []}
          resources={data?.resources || []}
        />
      </main>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/components/AIPanel.tsx fullstack/src/app/ai/
git commit -m "feat: AIPanel and AI Studio page with notes/slides/chat"
```

---

### Task 14: End-to-End Verification

- [ ] **Step 1: Run all tests**

```bash
cd "c:/Claude Code Test 1/fullstack"
npx jest
```

Expected: All tests pass

- [ ] **Step 2: Start the dev server**

```bash
cd "c:/Claude Code Test 1"
npm run dev:fullstack
```

- [ ] **Step 3: Verify dashboard**

Open http://localhost:3001
- Should show dark background with NavBar
- Should show "No subjects found — click Refresh to scrape" empty state
- Click "Refresh" — should show spinner, then either subjects or error

- [ ] **Step 4: Add your Claude API key**

Edit `fullstack/.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```
Restart the dev server after editing.

- [ ] **Step 5: Verify AI Studio**

Open http://localhost:3001/ai
- Select a subject + resource
- Click "Generate notes" — should return formatted markdown
- Switch to Chat — type a question — should respond

- [ ] **Step 6: Verify notes persist**

Open a subject → My Notes tab → type something → blur → refresh page → notes should still be there

- [ ] **Step 7: Verify gitignore**

```bash
cd "c:/Claude Code Test 1/fullstack"
git status
```

Confirm `.env.local` and `data/` do NOT appear in the output.

- [ ] **Step 8: Final commit**

```bash
cd "c:/Claude Code Test 1"
git add fullstack/src/ fullstack/__tests__/ fullstack/package.json fullstack/.gitignore fullstack/next.config.ts
git commit -m "feat: complete GJU Study Hub — scraping, AI notes/chat, subject dashboard"
```

---

## Notes on myGJU Debugging

If the myGJU scraper returns no subjects, you need to inspect the actual DOM:

1. Temporarily change `scraper.ts` line: `headless: true` → `headless: false`
2. Call `await page.pause()` right after the myGJU login step
3. Run a test scrape (click Refresh in the app or call POST /api/scrape)
4. The Playwright inspector will open — use it to find the correct selectors
5. Update the selectors in `scrapeMyGJU()` accordingly
6. Switch back to `headless: true`
