# Repo Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the monorepo root, remove stale files, and reorganize `fullstack/` components into consistent subfolders.

**Architecture:** Pure file operations + import path updates. No new code is written. The `fullstack/` Next.js app uses `@/*` path aliases pointing to `src/` — all moved component imports need updating from `@/components/X` to `@/components/study-hub/X`.

**Tech Stack:** Next.js 14, TypeScript, npm workspaces

**Spec:** `docs/superpowers/specs/2026-03-24-repo-reorganization-design.md`

> **Rollback note:** All tasks assume a clean git working tree. Destructive operations (deletes, moves) can be undone with `git restore .` and `git clean -fd` before committing. Do not proceed if `git status` shows uncommitted changes.

---

### Task 1: Root-level cleanup

**Files:**
- Delete: `snake-3d-test.html` (root only — the one in `games/snake-3d/` stays)
- Move: `mmkl-snake-home.html` → `mmkl-snake/mmkl-snake-home.html`
- Move: `start-mmkl.bat` → `mmkl-snake/start-mmkl.bat`
- Create dir: `archive/`
- Move: `pdf-extract/` → `archive/pdf-extract/`

- [ ] **Step 1: Delete root-level snake-3d-test.html**

```bash
rm "/c/Claude Code Test 1/snake-3d-test.html"
```

Verify: `ls "/c/Claude Code Test 1/"` — file should not appear.

- [ ] **Step 2: Move mmkl-snake-home.html into mmkl-snake/**

```bash
mv "/c/Claude Code Test 1/mmkl-snake-home.html" "/c/Claude Code Test 1/mmkl-snake/mmkl-snake-home.html"
```

- [ ] **Step 3: Move start-mmkl.bat into mmkl-snake/**

```bash
mv "/c/Claude Code Test 1/start-mmkl.bat" "/c/Claude Code Test 1/mmkl-snake/start-mmkl.bat"
```

- [ ] **Step 4: Create archive/ and move pdf-extract/**

```bash
mkdir -p "/c/Claude Code Test 1/archive"
mv "/c/Claude Code Test 1/pdf-extract" "/c/Claude Code Test 1/archive/pdf-extract"
```

- [ ] **Step 5: Verify root is clean**

```bash
ls "/c/Claude Code Test 1/"
```

Expected output contains only: `archive/`, `docs/`, `fullstack/`, `games/`, `mmkl/`, `mmkl-snake/`, `node_modules/`, `CLAUDE.md`, `FUTURE.md`, `package.json`, `package-lock.json` (and `.git`, `.claude`, etc.)

- [ ] **Step 6: Commit**

```bash
cd "/c/Claude Code Test 1"
git add -A
git commit -m "chore: clean up root — archive pdf-extract, move mmkl-snake files, delete stale html"
```

---

### Task 2: Delete PNG preview files from games/snake-3d/

**Files:**
- Delete: 25 PNG files in `games/snake-3d/`

- [ ] **Step 1: Delete all PNG files**

```bash
rm "/c/Claude Code Test 1/games/snake-3d/"*.png
```

- [ ] **Step 2: Verify only HTML files remain**

```bash
ls "/c/Claude Code Test 1/games/snake-3d/"
```

Expected: `snake-3d.html`, `snake-3d-test.html`, `snake-bg-preview.html`, `snake-preview.html`

- [ ] **Step 3: Commit**

```bash
cd "/c/Claude Code Test 1"
git add -A
git commit -m "chore: remove snake-3d preview screenshots"
```

---

### Task 3: Archive fullstack/public/from-other-pc/

**Files:**
- Move: `fullstack/public/from-other-pc/` → `archive/from-other-pc/`

- [ ] **Step 1: Ensure archive/ exists and move the folder**

```bash
mkdir -p "/c/Claude Code Test 1/archive"
mv "/c/Claude Code Test 1/fullstack/public/from-other-pc" "/c/Claude Code Test 1/archive/from-other-pc"
```

- [ ] **Step 2: Verify it's gone from public/**

```bash
ls "/c/Claude Code Test 1/fullstack/public/"
```

Expected: `from-other-pc` should NOT appear.

- [ ] **Step 3: Commit**

```bash
cd "/c/Claude Code Test 1"
git add -A
git commit -m "chore: archive from-other-pc transfer folder out of Next.js public/"
```

---

### Task 4: Delete unused api/hello stub

**Files:**
- Delete: `fullstack/src/app/api/hello/route.ts`
- Delete: `fullstack/src/app/api/hello/` (directory)

- [ ] **Step 1: Verify no consumers**

```bash
grep -r "api/hello" "/c/Claude Code Test 1/fullstack/src/"
```

Expected: no output (no consumers).

- [ ] **Step 2: Delete the stub**

```bash
rm -rf "/c/Claude Code Test 1/fullstack/src/app/api/hello"
```

- [ ] **Step 3: Commit**

```bash
cd "/c/Claude Code Test 1"
git add -A
git commit -m "chore: remove unused api/hello Next.js template stub"
```

---

### Task 5: Create study-hub/ subfolder and move components

**Files:**
- Create dir: `fullstack/src/components/study-hub/`
- Move: `AIPanel.tsx`, `AssignmentList.tsx`, `NavBar.tsx`, `NotesEditor.tsx`, `ResourceList.tsx`, `SubjectCard.tsx`

- [ ] **Step 1: Verify all 6 components exist before moving**

```bash
ls "/c/Claude Code Test 1/fullstack/src/components/"
```

Expected to include: `AIPanel.tsx`, `AssignmentList.tsx`, `NavBar.tsx`, `NotesEditor.tsx`, `ResourceList.tsx`, `SubjectCard.tsx`. If any are missing, stop and investigate before proceeding.

- [ ] **Step 2: Create the subfolder**

```bash
mkdir -p "/c/Claude Code Test 1/fullstack/src/components/study-hub"
```

- [ ] **Step 3: Move all Study Hub components**

```bash
mv "/c/Claude Code Test 1/fullstack/src/components/AIPanel.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
mv "/c/Claude Code Test 1/fullstack/src/components/AssignmentList.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
mv "/c/Claude Code Test 1/fullstack/src/components/NavBar.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
mv "/c/Claude Code Test 1/fullstack/src/components/NotesEditor.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
mv "/c/Claude Code Test 1/fullstack/src/components/ResourceList.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
mv "/c/Claude Code Test 1/fullstack/src/components/SubjectCard.tsx" "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
```

- [ ] **Step 4: Verify study-hub/ contains all 6 files**

```bash
ls "/c/Claude Code Test 1/fullstack/src/components/study-hub/"
```

Expected exactly: `AIPanel.tsx`, `AssignmentList.tsx`, `NavBar.tsx`, `NotesEditor.tsx`, `ResourceList.tsx`, `SubjectCard.tsx`

- [ ] **Step 5: Verify components/ root now has only two subfolders**

```bash
ls "/c/Claude Code Test 1/fullstack/src/components/"
```

Expected: `mmkl/`, `study-hub/` only.

---

### Task 6: Update all import paths

**Files:**
- Modify: `fullstack/src/app/page.tsx`
- Modify: `fullstack/src/app/subject/[id]/page.tsx`
- Modify: `fullstack/src/app/ai/page.tsx`
- Modify: `fullstack/src/app/calendar/page.tsx`

- [ ] **Step 1: Scan for ALL consumers of the moved components across the entire src/ tree**

```bash
grep -rn "from '@/components/\(NavBar\|AIPanel\|SubjectCard\|ResourceList\|AssignmentList\|NotesEditor\)'" "/c/Claude Code Test 1/fullstack/src/"
```

Review the output. Every file listed here must be updated. If any file outside the 4 listed pages appears, update it too before committing.

- [ ] **Step 2: Update page.tsx**

In `src/app/page.tsx`, change:
```ts
// BEFORE
import NavBar from '@/components/NavBar'
import SubjectCard from '@/components/SubjectCard'

// AFTER
import NavBar from '@/components/study-hub/NavBar'
import SubjectCard from '@/components/study-hub/SubjectCard'
```

- [ ] **Step 3: Update subject/[id]/page.tsx**

In `src/app/subject/[id]/page.tsx`, change:
```ts
// BEFORE
import NavBar from '@/components/NavBar'
import ResourceList from '@/components/ResourceList'
import AssignmentList from '@/components/AssignmentList'
import NotesEditor from '@/components/NotesEditor'

// AFTER
import NavBar from '@/components/study-hub/NavBar'
import ResourceList from '@/components/study-hub/ResourceList'
import AssignmentList from '@/components/study-hub/AssignmentList'
import NotesEditor from '@/components/study-hub/NotesEditor'
```

- [ ] **Step 4: Update ai/page.tsx**

In `src/app/ai/page.tsx`, change:
```ts
// BEFORE
import NavBar from '@/components/NavBar'
import AIPanel from '@/components/AIPanel'

// AFTER
import NavBar from '@/components/study-hub/NavBar'
import AIPanel from '@/components/study-hub/AIPanel'
```

- [ ] **Step 5: Update calendar/page.tsx**

In `src/app/calendar/page.tsx`, change:
```ts
// BEFORE
import NavBar from '@/components/NavBar'

// AFTER
import NavBar from '@/components/study-hub/NavBar'
```

- [ ] **Step 6: Verify no broken imports remain**

```bash
grep -r "from '@/components/NavBar'\|from '@/components/AIPanel'\|from '@/components/SubjectCard'\|from '@/components/ResourceList'\|from '@/components/AssignmentList'\|from '@/components/NotesEditor'" "/c/Claude Code Test 1/fullstack/src/"
```

Expected: no output.

- [ ] **Step 7: Run the TypeScript compiler to catch any remaining issues**

```bash
cd "/c/Claude Code Test 1/fullstack"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd "/c/Claude Code Test 1"
git add -A
git commit -m "refactor: move study-hub components into src/components/study-hub/ subfolder"
```

---

### Task 7: Final verification

- [ ] **Step 1: Check root is clean**

```bash
ls "/c/Claude Code Test 1/" | grep -v node_modules | grep -v "\.git"
```

Expected directories/files: `archive`, `docs`, `fullstack`, `games`, `mmkl`, `mmkl-snake`, `CLAUDE.md`, `FUTURE.md`, `package.json`, `package-lock.json`

- [ ] **Step 2: Check mmkl-snake/ has its files**

```bash
ls "/c/Claude Code Test 1/mmkl-snake/"
```

Expected to include: `mmkl-snake-home.html`, `start-mmkl.bat`, `server.js`, `db.json`, `public/`, `package.json`

- [ ] **Step 3: Check archive/ contents**

```bash
ls "/c/Claude Code Test 1/archive/"
```

Expected: `from-other-pc/`, `pdf-extract/`

- [ ] **Step 4: Check components/ structure**

```bash
ls "/c/Claude Code Test 1/fullstack/src/components/"
```

Expected: `mmkl/`, `study-hub/`

- [ ] **Step 5: Build the Next.js app to confirm nothing is broken**

```bash
cd "/c/Claude Code Test 1/fullstack"
npm run build
```

Expected: successful build, no errors.
