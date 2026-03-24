# Repo Reorganization Design

**Date:** 2026-03-24
**Status:** Approved

## Goal

Reorganize `C:\Claude Code Test 1` so related files are grouped into clear folders, loose files are cleaned up, and internal `fullstack/` structure is consistent across both sub-apps.

## Constraints

- `mmkl/` and `mmkl-snake/` stay as separate top-level folders (they are separate websites)
- No renaming of `fullstack/`
- `pdf-extract/` archived (not deleted) — may be needed later

---

## Section 1 — Root Level Changes

| Action | File/Folder |
|--------|-------------|
| DELETE | `snake-3d-test.html` *(root-level copy — separate from `games/snake-3d/snake-3d-test.html` which is kept)* |
| MOVE → `mmkl-snake/` (root of folder) | `mmkl-snake-home.html` |
| MOVE → `mmkl-snake/` | `start-mmkl.bat` |
| MOVE → `archive/` (root-level) | `pdf-extract/` |
| UNCHANGED | `CLAUDE.md`, `FUTURE.md`, `package.json`, `package-lock.json`, `mmkl/`, `mmkl-snake/`, `games/`, `fullstack/`, `docs/` |

**Resulting root:**
```
archive/
  pdf-extract/
docs/
fullstack/
games/
mmkl/
mmkl-snake/
node_modules/
CLAUDE.md
FUTURE.md
package.json
package-lock.json
```

---

## Section 2 — games/snake-3d/ Cleanup

Delete all PNG and preview image files (screenshots, previews, version comparison images). These are not part of the game itself.

**Note:** There are two files named `snake-3d-test.html` in the repo — one at the root (deleted in Section 1) and one inside `games/snake-3d/` (kept here). These are independent files with different fates.

**Deleted:**
- `preview-maps.png`, `preview-maps-2.png`, `preview-skins.png`
- `snake3d-game.png`, `snake3d-home.png`, `snake3d-mapselect.png`
- `snake-3d-preview.png`, `snake3d-store.png`
- `snake-bg-live.png`, `snake-bg-preview.png`, `snake-bg-preview2.png`
- `snake-preview-maps.png`, `snake-preview-top.png`
- `v2-challenges.png`, `v2-maps1.png`, `v2-maps2.png`, `v2-maps3.png`
- `v2-maps-final.png`, `v2-maps-row1.png`, `v2-maps-row2.png`, `v2-maps-top.png`
- `v2-skins.png`, `v2-skins2.png`, `v3-maps-fixed.png`

**Kept:**
- `snake-3d.html` — the actual game
- `snake-3d-test.html` — dev reference (this is the `games/snake-3d/` copy, not the root-level one)
- `snake-bg-preview.html` — background preview page
- `snake-preview.html` — preview page

---

## Section 3 — fullstack/ Internal Cleanup

### 3a. Group Study Hub components into subfolder

Move flat components (all belonging to GJU Study Hub) from `src/components/` into `src/components/study-hub/`. This mirrors the existing `src/components/mmkl/` pattern.

**Moved to `src/components/study-hub/`:**
- `AIPanel.tsx`
- `AssignmentList.tsx`
- `NavBar.tsx`
- `NotesEditor.tsx`
- `ResourceList.tsx`
- `SubjectCard.tsx`

All import paths in consuming files will be updated.

### 3b. Delete unused API stub

Delete `src/app/api/hello/route.ts` — this is an unused Next.js template stub with no consumers.

### 3c. Archive transfer folder

Move `fullstack/public/from-other-pc/` → root-level `archive/from-other-pc/`. This was a one-time file transfer from another PC and is not part of the app. Moving it out of `public/` intentionally removes it from the Next.js static asset tree (it was never meant to be a served asset).

---

## Affected Import Files

Files that import from components being moved to `study-hub/` — all paths must be updated from `@/components/X` to `@/components/study-hub/X`:

| File | Components imported |
|------|---------------------|
| `src/app/page.tsx` | `NavBar`, `SubjectCard`, `ResourceList` (verify) |
| `src/app/subject/[id]/page.tsx` | `NavBar`, `NotesEditor`, `AIPanel` (verify) |
| `src/app/ai/page.tsx` | `NavBar`, `AIPanel` |
| `src/app/calendar/page.tsx` | `NavBar` |

`src/app/layout.tsx` has no component imports from `src/components/` — no update needed.

---

## Success Criteria

- Root has no loose HTML or script files
- All PNG previews removed from `games/snake-3d/`
- `mmkl-snake/` contains `mmkl-snake-home.html` and `start-mmkl.bat` at its root
- `archive/` at root level holds `pdf-extract/` and `from-other-pc/`
- `fullstack/src/components/` has two clear subfolders: `study-hub/` and `mmkl/`
- No broken imports — all `@/components/X` paths updated to `@/components/study-hub/X`
- `fullstack/public/from-other-pc/` no longer exists
