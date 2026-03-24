# MMKL Dashboard — Design Spec
**Date:** 2026-03-21
**Status:** Approved (via visual brainstorming)

---

## Context

The user wants a personal dashboard website that aggregates all their games, websites, and projects in one place. The design must be 3D-immersive and interactive, inspired by **Draftly.space** — dark cinematic aesthetic with grid overlays, smooth 3D animations, and polished typography.

Built in two phases:
1. **Phase 1** — Standalone `mmkl-dashboard.html` (self-contained, no build step)
2. **Phase 2** — Migrate to a Next.js page inside `fullstack/`

---

## Visual Design

### Aesthetic
- Draftly.space style: black background, subtle grid overlay, noise texture, radial glow
- No gradients on text (clean white on dark)
- **Default theme: Bone/Mono** — pure white-on-black, zero color noise
- Theme switcher: live CSS variable swap across 6 total themes — Bone/Mono default + 5 additional (Ice Chrome, Ember, Volt, Crimson, Mint)

### Typography
- **Display / headings:** Syne (weight 700–800) — geometric, editorial, strong
- **Body / descriptions:** DM Sans (weight 300–500) — clean, neutral, readable
- Both loaded from Google Fonts

### Color Themes
| Name       | Accent     | Vibe                    |
|------------|------------|-------------------------|
| Bone       | `#ffffff`  | Monochrome luxury       |
| Ice Chrome | `#00c8ff`  | Cold HUD / cyberpunk    |
| Ember      | `#ff8c1e`  | Warm amber / premium    |
| Volt       | `#b4ff00`  | Acid green / gaming     |
| Crimson    | `#ff3c50`  | Deep red / dramatic     |
| Mint       | `#00ffa0`  | Electric green / Matrix |

---

## Page Structure

### 1. Refresh Loader
- Fullscreen black overlay on every page load
- Animates: MMKL logo pops in → thin progress bar fills → fades out after ~1.6s
- Conveys polish; sets the tone before the start screen

### 2. Start Screen
- Fullscreen black with animated grid, glowing orbs, and radial glow
- Center: eyebrow label → "MMKL" in massive Syne 800 → subtitle → "Enter" CTA button
- Clicking "Enter" fades start screen out, fades dashboard in

### 3. Navigation Bar
- Fixed sticky top bar
- Left: `MMKL` logo (Syne bold)
- Center: nav links — Gaming · Productivity · Tools · Team
- Right: project count pill badge
- Glassmorphic background (blur + dark tint + bottom border)

### 4. Hero Section
- Eyebrow label: "MMKL Dashboard"
- H1: "Everything We've Built." (Syne 800, large)
- Subtitle paragraph

### 5. Project Categories (3 sections)
Each category has a header row (icon + title + count badge + horizontal rule) followed by a card grid.

| Category        | Icon | Projects                          |
|-----------------|------|-----------------------------------|
| Gaming          | 🎮   | XO Game, Snake, Main Lobby        |
| Productivity    | 📚   | GJU Study Hub (featured), MyDash, Frontend Portfolio |
| Tools & Creative| 🛠️  | Boot Animation, Claude Manager, API Server |

**GJU Study Hub** renders as a wide "featured" card spanning 2 columns.

### 6. Project Cards
Each card contains:
- Icon box, type label (eyebrow), title (Syne), description, footer with tag + arrow button
- **3D tilt on hover:** `rotateX` + `rotateY` based on mouse position
- **Scroll reveal:** cards animate up from off-screen as they enter viewport
- Arrow rotates 45° on hover

### 7. Team Section
Grid of 4 team member cards:
- Avatar (emoji in circular icon), name (Syne), role, skill pills
- Placeholder names for teammates 2–4 (user fills in later)
- Same card hover lift as project cards

### 8. Footer
- Logo left, copyright right

### 9. Theme Switcher
- Fixed `◑` button, bottom-right corner
- Click opens floating panel with 6 color swatches
- Selecting a theme instantly swaps all CSS variables (no reload)
- Closes on outside click or after selection

---

## Interactions

| Interaction         | Behavior                                              |
|---------------------|-------------------------------------------------------|
| Page load           | Refresh loader animates, then fades to start screen  |
| Enter button        | Fades start screen → reveals dashboard               |
| Card hover          | 3D tilt + lift + glow shadow                         |
| Card arrow hover    | Rotates 45°, color changes to accent                 |
| Scroll into view    | Cards animate up (IntersectionObserver)              |
| Theme button click  | Opens panel with 6 color options                     |
| Theme selection     | Live CSS var swap, panel closes                      |

---

## Phase 1 — Standalone HTML

**Output file:** `mmkl-dashboard.html` in the repo root
**Constraints:**
- Zero dependencies, zero build step
- Google Fonts loaded via `<link>` tags
- All CSS in `<style>`, all JS in `<script>`
- No framework — vanilla HTML/CSS/JS only
- Must work by opening directly in any browser

---

## Phase 2 — Next.js Migration (future)

After Phase 1 is complete and validated, migrate to:
- `fullstack/src/app/dashboard/page.tsx` — main page component
- `fullstack/src/components/mmkl/` — split into React components:
  - `StartScreen.tsx`, `RefreshLoader.tsx`, `NavBar.tsx`, `ProjectCard.tsx`, `TeamCard.tsx`, `ThemeSwitcher.tsx`
- Google Fonts loaded via `next/font/google`
- CSS variables for theming (same approach, in `globals.css`)
- Data for projects/team members in a `data/mmkl.ts` config file

---

## Naming Note

The name for this dashboard is **MMKL** (as confirmed by the user in this brainstorm). The memory file `project_mkll_design.md` refers to a separate, older dashboard redesign concept (MKLL) with a different visual design (crimson gradient, macOS mockup). These are two distinct projects — do not merge or conflate them.

---

## Card Interactions

- **Clicking a card** navigates to the project. The entire card surface is the click target.
- **Phase 1 (standalone HTML):** Cards link to `#` placeholder by default. User fills in relative paths or URLs to actual project files (e.g., `from-other-pc/xo-game.html`) after build.
- **Phase 2 (Next.js):** Card hrefs stored in `data/mmkl.ts` config, opened with `target="_blank"` for external URLs or `router.push` for internal routes.
- **Nav links** scroll to section anchors: `#gaming`, `#productivity`, `#tools`, `#team`
- **Start screen** shows on every page load (no sessionStorage skip — intentionally cinematic)
- **Featured card** (GJU Study Hub): wider (2-col span), side-by-side layout with emoji viz block on the left and content on the right. Same card hover behavior.

---

## Content — Projects

```
Gaming:
  - XO Game         (HTML · Playable)     href: "#" (fill with path to xo-game.html)
  - Snake           (HTML · Playable)     href: "#" (fill with path to snake)
  - Main Lobby      (HTML · Launcher)     href: "#" (fill with path to main lobby)

Productivity:
  - GJU Study Hub   (Next.js + AI · Live App) [featured]  href: "http://localhost:3001"
  - MyDash          (HTML · Personal)          href: "#" (fill with path to dashboard.html)
  - Frontend Portfolio (React + Vite · Portfolio)  href: "http://localhost:3000"

Tools & Creative:
  - Boot Animation  (HTML · Creative)   href: "#" (fill with path to boot-animation.html)
  - Claude Manager  (HTML · AI Tool)    href: "#" (fill with path to claude-manager.html)
  - API Server      (Express · Backend) href: "http://localhost:4000/health"
```

---

## Content — Team

```
Mohammed    — Lead Developer  (Next.js, React, AI)
Teammate 2  — UI / Design     (Figma, CSS, 3D)
Teammate 3  — Games           (Canvas, JS, Physics)
Teammate 4  — Backend / Infra (Express, API, DevOps)
```
*(Team names/roles to be updated by user)*
