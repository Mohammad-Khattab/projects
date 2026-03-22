# Snake Neon Cyberpunk 3D — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `snake/index.html` with a Neon Cyberpunk 3D aesthetic — Three.js WebGL game canvas, animated backgrounds on every screen, and a per-map neon color theme system — without changing any gameplay logic.

**Architecture:** Single `index.html` modified in-place. Three.js r165 loaded from CDN handles the game canvas. All menu screens use CSS neon glassmorphism + canvas-drawn animated perspective grids. A `MAP_THEMES` object drives all color changes via CSS variables and Three.js material updates.

**Tech Stack:** Vanilla JS, CSS, HTML5 Canvas, Three.js r165 (CDN)

---

## Key Facts About the Existing File

- File: `C:\Users\m7md5\Projects\snake\index.html` (~1300 lines)
- Grid: `const GRID = 20` (20×20 cells)
- Views: `view-splash`, `view-home`, `view-map`, `view-level`, `view-game`
- View switching: `showView(name)` function
- Game state: `const state = { ... }` object
- Existing `applyTheme(theme)` sets CSS dark/grey theme — do NOT rename or break it; our new function is named `applyMapTheme(mapId)`
- Existing particles: `MAP_PARTICLE_CONFIG` — keep untouched
- Game loop: `state.tickTimer` (setInterval) + `state.rafId` (requestAnimationFrame for particles)
- Canvas: `<canvas id="game-canvas">` — this gets replaced by Three.js renderer

**Verification method:** No test runner. Each task ends with "open `snake/index.html` in browser, verify X." Use a local server or `file://` URL.

---

## File Changes Overview

| File | Action | What changes |
|---|---|---|
| `C:\Users\m7md5\Projects\snake\index.html` | Modify | Everything below — CSS, HTML, JS |

All changes are in this one file. Tasks below reference line ranges as approximate guides — check actual line numbers before editing.

---

## Task 1: Backup + Add Three.js CDN

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (head section)
- Create: `C:\Users\m7md5\Projects\snake\index.html.bak` (backup)

- [ ] **Step 1: Create backup**

```bash
copy "C:\Users\m7md5\Projects\snake\index.html" "C:\Users\m7md5\Projects\snake\index.html.bak"
```

- [ ] **Step 2: Add Three.js CDN to `<head>`**

Find the `</head>` tag and insert before it:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js"></script>
```

- [ ] **Step 3: Verify Three.js loads**

Open `snake/index.html` in browser. Open DevTools console. Run:
```js
THREE.REVISION
```
Expected: `"165"` (no errors)

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\m7md5\Projects\snake"
git add index.html
git commit -m "chore: add Three.js r165 CDN"
```

---

## Task 2: Map Theme System

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (JS section, after `MAP_PARTICLE_CONFIG`)

- [ ] **Step 1: Add `MAP_THEMES` object and `applyMapTheme()` after the existing `MAP_PARTICLE_CONFIG` block**

```js
// ════════════════════════════════════════════════════
//  NEON MAP THEMES
// ════════════════════════════════════════════════════

const MAP_THEMES = {
  ocean:  { primary:'#00c8ff', secondary:'#0060ff', bg:'#000814', grid:'rgba(0,180,255,0.18)' },
  space:  { primary:'#cc00ff', secondary:'#8800ff', bg:'#04000e', grid:'rgba(140,0,255,0.18)' },
  lava:   { primary:'#ff5500', secondary:'#ff8800', bg:'#0e0000', grid:'rgba(255,60,0,0.18)'  },
  city:   { primary:'#ffee44', secondary:'#ffffff', bg:'#04040c', grid:'rgba(255,220,0,0.16)' },
  desert: { primary:'#ffbb22', secondary:'#ff6600', bg:'#0c0500', grid:'rgba(255,165,0,0.18)' },
  arctic: { primary:'#aaffff', secondary:'#ffffff', bg:'#000a10', grid:'rgba(100,220,255,0.18)'},
  moon:   { primary:'#ccccff', secondary:'#8888cc', bg:'#06060e', grid:'rgba(160,160,220,0.16)'},
  earth:  { primary:'#22ff66', secondary:'#88ff00', bg:'#020800', grid:'rgba(0,255,80,0.18)'  },
  jungle: { primary:'#00ffaa', secondary:'#00cc66', bg:'#020a04', grid:'rgba(0,220,120,0.18)' },
};

// Default theme used before any map is selected
const DEFAULT_THEME = MAP_THEMES.ocean;

function applyMapTheme(mapId) {
  const t = mapId ? (MAP_THEMES[mapId] || DEFAULT_THEME) : DEFAULT_THEME;
  const r = document.documentElement;
  r.style.setProperty('--neon-primary',   t.primary);
  r.style.setProperty('--neon-secondary', t.secondary);
  r.style.setProperty('--neon-bg',        t.bg);
  r.style.setProperty('--neon-grid',      t.grid);
  r.style.setProperty('--neon-glow',      t.primary + '44');  // ~27% alpha hex
  // Update Three.js materials if renderer is active
  if (typeof threeUpdateTheme === 'function') threeUpdateTheme(t);
}
```

- [ ] **Step 2: Call `applyMapTheme` on page load**

At the bottom of the existing `DOMContentLoaded` handler (or wherever initialization happens), add:

```js
applyMapTheme(null); // apply default until map is chosen
```

- [ ] **Step 3: Verify CSS variables are set**

Open `snake/index.html`. In DevTools console:
```js
getComputedStyle(document.documentElement).getPropertyValue('--neon-primary')
```
Expected: `"#00c8ff"` (or with space, `" #00c8ff"`)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add MAP_THEMES and applyMapTheme()"
```

---

## Task 3: Global CSS — Neon Cyberpunk Base Styles

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (`<style>` block)

Replace the existing `:root` block and global base styles with the neon cyberpunk design. Keep all existing gameplay-related CSS (`#view-game`, `.game-hud`, `canvas`) — only replace visual/color properties.

- [ ] **Step 1: Update `:root` CSS variables**

Find and replace the existing `:root { ... }` block:

```css
:root {
  --bg:            #000000;
  --bg-card:       #0a0a14;
  --bg-dim:        #111120;
  --muted:         #30304a;
  --secondary:     #55557a;
  --text:          #c8c8e0;
  --border:        #1a1a2e;
  --radius:        8px;
  /* Neon theme vars — set by applyMapTheme() */
  --neon-primary:  #00c8ff;
  --neon-secondary:#0060ff;
  --neon-bg:       #000814;
  --neon-grid:     rgba(0,180,255,0.18);
  --neon-glow:     rgba(0,200,255,0.27);
  /* Keep legacy vars for compatibility */
  --snake:         #00c864;
  --cyan:          #328cff;
  --green:         #00c864;
  --amber:         #ffc800;
  --red:           #ff5050;
}
```

- [ ] **Step 2: Update `body` styles**

```css
body {
  background: var(--neon-bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background 0.4s ease;
}
```

- [ ] **Step 3: Update `.btn` family**

```css
.btn-primary {
  background: var(--neon-primary);
  color: #000;
  box-shadow: 0 0 16px var(--neon-glow), 0 0 32px var(--neon-glow);
  transition: opacity .15s, transform .1s, box-shadow .2s;
}
.btn-primary:hover {
  opacity: .9;
  box-shadow: 0 0 24px var(--neon-glow), 0 0 48px var(--neon-glow);
}
.btn-secondary {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); }
```

- [ ] **Step 4: Verify page loads with neon styling**

Open browser. The page background should be very dark blue-black (`#000814`). No layout breaks.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: neon cyberpunk base CSS — root vars and buttons"
```

---

## Task 4: Background Animation System (Shared)

This creates the reusable animated neon background used across all menu screens: a perspective grid + drifting particles + horizon glow.

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS + JS)

- [ ] **Step 1: Add CSS for the shared background layer**

Add to `<style>`:

```css
/* ── NEON ANIMATED BACKGROUND ── */
.neon-bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.neon-bg-layer canvas.grid-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.neon-horizon {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-primary), var(--neon-secondary), var(--neon-primary), transparent);
  box-shadow: 0 0 12px var(--neon-primary), 0 0 32px var(--neon-secondary);
  animation: horizon-sweep 3s ease-in-out infinite alternate;
}
@keyframes horizon-sweep {
  from { opacity: 0.6; transform: scaleX(0.7); }
  to   { opacity: 1.0; transform: scaleX(1.0); }
}
/* Scanlines overlay on all views */
[data-view]::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px,
    transparent 1px, transparent 3px
  );
  pointer-events: none;
  z-index: 999;
}
```

- [ ] **Step 2: Add HTML for the shared background layer**

Find the opening `<body>` tag and add immediately after it:

```html
<!-- Shared neon animated background -->
<div class="neon-bg-layer" id="neon-bg-layer">
  <canvas class="grid-canvas" id="neon-grid-canvas"></canvas>
  <div class="neon-horizon" id="neon-horizon" style="bottom: 35%;"></div>
</div>
```

- [ ] **Step 3: Add the background animation JS**

Add a new JS section labeled `// NEON BACKGROUND ANIMATION`:

```js
// ════════════════════════════════════════════════════
//  NEON BACKGROUND ANIMATION
// ════════════════════════════════════════════════════

const neonBg = {
  canvas: null, ctx: null, raf: null,
  particles: [],
  snake: { segs: [], x: -200, y: 0, speed: 120, segSize: 18, gap: 3, segCount: 8, lastSpawn: 0 },
};

function initNeonBg() {
  neonBg.canvas = document.getElementById('neon-grid-canvas');
  neonBg.ctx    = neonBg.canvas.getContext('2d');
  resizeNeonBg();
  window.addEventListener('resize', resizeNeonBg);
  spawnBgParticles(40);
  resetBgSnake();
  if (!neonBg.raf) neonBg.raf = requestAnimationFrame(tickNeonBg);
}

function resizeNeonBg() {
  neonBg.canvas.width  = window.innerWidth;
  neonBg.canvas.height = window.innerHeight;
  // Reposition horizon
  const h = document.getElementById('neon-horizon');
  if (h) h.style.bottom = Math.floor(window.innerHeight * 0.35) + 'px';
}

function spawnBgParticles(count) {
  for (let i = 0; i < count; i++) {
    neonBg.particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(Math.random() * 0.5 + 0.2),
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

function resetBgSnake() {
  const s = neonBg.snake;
  s.y = window.innerHeight * (0.2 + Math.random() * 0.6);
  s.x = -s.segCount * (s.segSize + s.gap);
  s.segs = [];
  for (let i = 0; i < s.segCount; i++) {
    s.segs.push({ x: s.x - i * (s.segSize + s.gap), y: s.y });
  }
}

function tickNeonBg(ts) {
  neonBg.raf = requestAnimationFrame(tickNeonBg);
  const c = neonBg.canvas, ctx = neonBg.ctx;
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  // 1. Draw perspective grid
  drawPerspectiveGrid(ctx, W, H);

  // 2. Draw particles
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--neon-primary').trim() || '#00c8ff';
  neonBg.particles.forEach(p => {
    p.y -= 0.4;
    p.opacity -= 0.0008;
    if (p.y < 0 || p.opacity <= 0) {
      p.x = Math.random() * W;
      p.y = H;
      p.vy = -(Math.random() * 0.5 + 0.2);
      p.opacity = Math.random() * 0.4 + 0.15;
      p.size = Math.random() * 2 + 1;
    }
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = primary;
    ctx.shadowColor = primary;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 3. Draw CSS background snake (head segment moves, rest follow)
  const s = neonBg.snake;
  const dt = 1 / 60;
  s.x += s.speed * dt;
  // Shift segments: head is segs[0]
  for (let i = s.segCount - 1; i > 0; i--) {
    // Smooth follow with lerp
    s.segs[i].x += (s.segs[i-1].x - s.segs[i].x) * 0.25;
    s.segs[i].y += (s.segs[i-1].y - s.segs[i].y) * 0.25;
  }
  s.segs[0].x = s.x;
  s.segs[0].y = s.y;
  // Draw segments
  s.segs.forEach((seg, i) => {
    const fade = 1 - (i / s.segCount) * 0.7;
    ctx.save();
    ctx.globalAlpha = fade * 0.85;
    ctx.fillStyle = primary;
    ctx.shadowColor = primary;
    ctx.shadowBlur = i === 0 ? 14 : 6;
    const r = 4;
    const x = seg.x, y = seg.y, sz = s.segSize;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + sz - r, y);
    ctx.quadraticCurveTo(x + sz, y, x + sz, y + r);
    ctx.lineTo(x + sz, y + sz - r);
    ctx.quadraticCurveTo(x + sz, y + sz, x + sz - r, y + sz);
    ctx.lineTo(x + r, y + sz);
    ctx.quadraticCurveTo(x, y + sz, x, y + sz - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    // 3D bottom face
    ctx.globalAlpha = fade * 0.4;
    ctx.fillStyle = shiftColorDark(primary);
    ctx.fillRect(x, y + sz, sz, 4);
    ctx.restore();
  });
  // Reset when snake exits right edge
  if (s.x > W + 100) {
    setTimeout(resetBgSnake, 3000);
    s.x = W + 200; // park off screen so it doesn't redraw
  }
}

function drawPerspectiveGrid(ctx, W, H) {
  const horizonY = H * 0.42;
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-grid').trim() || 'rgba(0,180,255,0.18)';
  const cols = 14, rows = 10;

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  // Vertical lines converging to vanishing point (center of horizon)
  const vx = W / 2;
  for (let i = 0; i <= cols; i++) {
    const t = i / cols;
    const bx = W * t;
    ctx.beginPath();
    ctx.moveTo(vx + (bx - vx) * 0.01, horizonY);
    ctx.lineTo(bx, H + 40);
    ctx.stroke();
  }

  // Horizontal lines (perspective spacing)
  for (let i = 0; i <= rows; i++) {
    const t = (i / rows);
    const y = horizonY + (H + 40 - horizonY) * (t * t);
    const spread = 0.01 + t * 0.99;
    const x1 = vx - (W / 2) * spread;
    const x2 = vx + (W / 2) * spread;
    ctx.globalAlpha = 0.3 + t * 0.7;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }
  ctx.restore();
}

// Returns a darker version of a hex color for the "bottom face" of 3D segments
function shiftColorDark(hex) {
  hex = hex.trim().replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = Math.floor(parseInt(hex.slice(0,2),16)*0.35);
  const g = Math.floor(parseInt(hex.slice(2,4),16)*0.35);
  const b = Math.floor(parseInt(hex.slice(4,6),16)*0.35);
  return `rgb(${r},${g},${b})`;
}

function showNeonBg(show) {
  const el = document.getElementById('neon-bg-layer');
  if (el) el.style.display = show ? 'block' : 'none';
}
```

- [ ] **Step 4: Call `initNeonBg()` on DOMContentLoaded**

In the DOMContentLoaded handler, add:

```js
initNeonBg();
```

- [ ] **Step 5: Hide neon bg during game (game has its own Three.js bg)**

In `showView()` function, add:

```js
function showView(name) {
  // ... existing code ...
  showNeonBg(name !== 'game');
}
```

- [ ] **Step 6: Verify in browser**

Open page. You should see:
- A perspective neon grid receding to the horizon
- Small cyan dots drifting upward
- A neon snake crawling from left to right
- A glowing horizon line

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: neon animated background — perspective grid, particles, snake"
```

---

## Task 5: Splash Screen Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS + HTML for `#view-splash`)

- [ ] **Step 1: Replace `#view-splash` CSS**

Find and replace all CSS rules targeting `#view-splash`, `.splash-label`, and related:

```css
/* ── SPLASH ── */
#view-splash {
  position: fixed; inset: 0; z-index: 200;
  align-items: center; justify-content: center; gap: 20px;
  background: transparent;
  transition: opacity 0.45s ease;
  flex-direction: column;
}
#view-splash.fade-out { opacity: 0; pointer-events: none; }

.splash-title-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  position: relative; z-index: 5;
}
.title-logo {
  font-size: clamp(3.5rem, 14vw, 7rem);
  font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--neon-primary);
  text-shadow: 0 0 20px var(--neon-primary), 0 0 60px var(--neon-glow);
  position: relative; z-index: 2;
  animation: neon-pulse 2.5s ease-in-out infinite alternate;
}
@keyframes neon-pulse {
  from { text-shadow: 0 0 20px var(--neon-primary), 0 0 40px var(--neon-glow); }
  to   { text-shadow: 0 0 30px var(--neon-primary), 0 0 80px var(--neon-glow), 0 0 120px var(--neon-glow); }
}
.title-logo::after { display: none; } /* remove old underline */
.splash-label {
  font-size: 12px; font-weight: 700; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--neon-primary);
  opacity: 0.5;
  animation: splash-blink 1.4s ease-in-out infinite;
}
@keyframes splash-blink { 0%,100%{opacity:0.25} 50%{opacity:0.9} }
```

- [ ] **Step 2: Update splash HTML**

Find `<div id="view-splash"` and update its inner structure. Keep the `data-view` attribute and class logic. The existing `#title-snake-canvas` and `#title-wrap` can be removed — the background animation system now handles the snake. Replace the content with:

```html
<div id="view-splash" data-view class="active">
  <div class="splash-title-wrap">
    <div class="title-logo">SNAKE</div>
    <div class="splash-label">tap to begin</div>
  </div>
</div>
```

- [ ] **Step 3: Remove `startTitleSnake` / `stopTitleSnake` calls**

In `showView()`:
- Remove `if (name === 'home') setTimeout(startTitleSnake, 80);`
- Remove `else stopTitleSnake();`

The title snake canvas is gone. The background neon snake runs globally.

- [ ] **Step 4: Verify splash screen**

Reload page. You should see:
- Dark background visible through the transparent splash
- `SNAKE` in large glowing cyan text with pulsing glow
- `TAP TO BEGIN` blinking below
- Perspective grid visible behind the title
- After ~1.7s, auto-transitions to home

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: splash screen — neon title glow, transparent over animated bg"
```

---

## Task 6: Home Screen Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS + HTML for `#view-home`)

- [ ] **Step 1: Replace home CSS**

Find and replace all `#view-home`, `.home-header`, `.home-subtitle`, `.settings-card`, `.setting-row`, `.setting-label`, `.color-picker-row`, `.swatch`, `.theme-toggle`, `.theme-btn`, `.mode-buttons` CSS rules:

```css
/* ── HOME ── */
#view-home {
  align-items: center; justify-content: center;
  padding: 40px 24px; gap: 32px; text-align: center;
  position: relative; z-index: 1;
}
.home-header { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.home-subtitle {
  font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--neon-primary);
  opacity: 0.6;
}
.settings-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 28px 32px;
  width: 100%; max-width: 440px;
  display: flex; flex-direction: column; gap: 24px;
  box-shadow: 0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  position: relative; z-index: 2;
}
/* Neon top-edge accent on settings card */
.settings-card::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--neon-primary), transparent);
  border-radius: 1px;
}
.setting-row { display: flex; flex-direction: column; gap: 10px; }
.setting-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--secondary);
}
.color-picker-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.swatch {
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform .15s, border-color .15s, box-shadow .15s;
  flex-shrink: 0;
}
.swatch:hover { transform: scale(1.2); }
.swatch.active {
  border-color: #fff;
  transform: scale(1.1);
  box-shadow: 0 0 10px currentColor;
}
.swatch-custom {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden;
  cursor: pointer; border: 2px solid var(--border);
  transition: border-color .15s; flex-shrink: 0; position: relative;
}
.swatch-custom:hover { border-color: var(--neon-primary); }
.swatch-custom input[type="color"] {
  position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px);
  border: none; padding: 0; cursor: pointer; opacity: 0;
}
.swatch-custom-bg {
  width: 100%; height: 100%;
  background: conic-gradient(red,yellow,lime,cyan,blue,magenta,red);
  border-radius: 50%; pointer-events: none;
}
.theme-toggle { display: flex; gap: 8px; }
.theme-btn {
  flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--bg-dim); color: var(--secondary);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.theme-btn:hover { color: var(--text); }
.theme-btn.active { border-color: var(--neon-primary); color: var(--neon-primary); box-shadow: 0 0 8px var(--neon-glow); }
.mode-buttons { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 440px; position: relative; z-index: 2; }
```

- [ ] **Step 2: Verify home screen**

Navigate to home (let splash auto-dismiss or click through). You should see:
- Glassmorphic settings card with a neon top edge glow
- Animated background grid + snake visible behind the card
- Color swatches glow on hover
- Active theme button glows in neon primary color

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: home screen — glassmorphic card, neon accents"
```

---

## Task 7: Map Select Screen Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS + HTML + JS for map select)

- [ ] **Step 1: Replace map select CSS**

Find and replace `#view-map`, `.page-header`, `.page-title`, `.page-sub`, `.map-grid`, `.map-card`, `.map-thumb`, `.map-name`, `.map-badge` CSS rules plus all `.map-ocean`, `.map-earth`, etc. theme rules:

```css
/* ── MAP SELECT ── */
#view-map { padding: 32px 24px 48px; align-items: center; gap: 24px; position: relative; z-index: 1; }
.page-header { width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 4px; }
.page-header-row { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 20px; font-weight: 800; color: var(--text); }
.page-sub { font-size: 12px; color: var(--secondary); }

.map-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; width: 100%; max-width: 760px; }

.map-card {
  border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: transform .2s, border-color .2s, box-shadow .2s;
  position: relative;
  transform-style: preserve-3d;
  transform: perspective(600px) rotateX(0deg) rotateY(0deg);
}
.map-card:hover {
  transform: perspective(600px) rotateX(-4deg) rotateY(4deg) translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
/* data-map-id border glow on hover — set via JS on mouseenter */
.map-card.selected { animation: card-pulse 1.5s ease-in-out infinite alternate; }
@keyframes card-pulse {
  from { box-shadow: 0 0 8px var(--card-neon, #00c8ff); }
  to   { box-shadow: 0 0 20px var(--card-neon, #00c8ff), 0 0 40px var(--card-neon, #00c8ff); }
}

.map-thumb { height: 130px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000; }
/* Grid inside each map card thumb */
.map-thumb-grid {
  position: absolute; inset: 0;
  opacity: 1;
}
.map-name {
  font-size: 13px; font-weight: 700; padding: 11px 14px;
  background: #0a0a14; border-top: 1px solid rgba(255,255,255,0.06);
}
.map-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 2px 8px; border-radius: 20px; margin-top: 2px; display: inline-block;
  opacity: 0.7;
}
```

- [ ] **Step 2: Add map card JS with tilt + neon grid mini-canvas**

Find the function that renders the map cards (likely `renderMapCards()` or inline in `showView('map')`). Update it to draw a mini perspective grid canvas inside each map thumb and wire up the 3D tilt:

```js
function renderMapCards() {
  const grid = document.querySelector('.map-grid');
  if (!grid) return;
  grid.innerHTML = '';
  MAPS.forEach(map => {
    const t = MAP_THEMES[map.id] || DEFAULT_THEME;
    const card = document.createElement('div');
    card.className = 'map-card' + (state.currentMap === map.id ? ' selected' : '');
    card.style.setProperty('--card-neon', t.primary);
    card.innerHTML = `
      <div class="map-thumb">
        <canvas class="map-thumb-grid" width="200" height="130"></canvas>
        <div class="map-thumb-deco"></div>
      </div>
      <div class="map-info" style="padding:10px 14px 12px; background:#0a0a14; border-top:1px solid rgba(255,255,255,0.06);">
        <div class="map-name" style="padding:0; background:transparent; border:none; color:${t.primary}; font-size:13px; font-weight:700;">${map.name}</div>
      </div>
    `;
    // Draw mini perspective grid on canvas
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    drawMiniMapGrid(ctx, 200, 130, t);
    // 3D tilt on mousemove
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width  - 0.5;
      const my = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-my*8}deg) rotateY(${mx*8}deg) translateY(-4px)`;
      card.style.borderColor = t.primary + '88';
      card.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${t.primary}44`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.borderColor = '';
      card.style.boxShadow = '';
    });
    card.addEventListener('click', () => selectMap(map.id));
    grid.appendChild(card);
  });
}

function drawMiniMapGrid(ctx, W, H, theme) {
  ctx.clearRect(0, 0, W, H);
  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);
  // Perspective grid
  const horizonY = H * 0.45;
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  const vx = W / 2, cols = 8, rows = 6;
  for (let i = 0; i <= cols; i++) {
    const bx = (W * i) / cols;
    ctx.beginPath();
    ctx.moveTo(vx + (bx - vx) * 0.05, horizonY);
    ctx.lineTo(bx, H + 10);
    ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const y = horizonY + (H + 10 - horizonY) * (t * t);
    const spread = 0.05 + t * 0.95;
    ctx.globalAlpha = 0.3 + t * 0.7;
    ctx.beginPath();
    ctx.moveTo(vx - (W/2) * spread, y);
    ctx.lineTo(vx + (W/2) * spread, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Horizon glow
  const grad = ctx.createLinearGradient(0, horizonY, W, horizonY);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, theme.primary);
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(W, horizonY);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Mini snake (3 segments)
  const segY = horizonY - 18;
  for (let i = 0; i < 3; i++) {
    const alpha = 1 - i * 0.25;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 6;
    ctx.fillRect(30 + i * 20, segY, 14, 14);
    // bottom face
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillStyle = shiftColorDark(theme.primary);
    ctx.fillRect(30 + i * 20, segY + 14, 14, 4);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
```

- [ ] **Step 3: Ensure `selectMap(mapId)` calls `applyMapTheme(mapId)`**

Find where map selection is handled and add the theme call:

```js
function selectMap(mapId) {
  state.currentMap = mapId;
  applyMapTheme(mapId);
  // ... existing navigation to level select ...
}
```

- [ ] **Step 4: Verify map select screen**

Navigate to map select. You should see:
- 9 cards each with a neon mini world preview in their unique color
- Hovering a card tilts it in 3D and glows its border
- Clicking a map changes the global CSS color theme (verify with DevTools `--neon-primary` var)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: map select — neon mini worlds, 3D tilt hover, per-map theme"
```

---

## Task 8: Level Select Screen Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS for level select)

- [ ] **Step 1: Replace level select CSS**

Find and replace `#view-level`, `.level-list`, `.level-card`, `.level-info`, `.level-num`, `.level-target`, `.level-speed-badge`, `.speed-*` CSS rules:

```css
/* ── LEVEL SELECT ── */
#view-level { padding: 32px 24px 48px; align-items: center; gap: 24px; position: relative; z-index: 1; }
.level-list { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 480px; }

.level-card {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 16px 22px;
  cursor: pointer;
  transition: border-color .2s, background .15s, box-shadow .2s;
}
.level-card:hover {
  border-color: var(--neon-primary);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 12px var(--neon-glow);
}
.level-card.active-level {
  border-color: var(--neon-primary);
  box-shadow: 0 0 16px var(--neon-glow);
}
.level-info { display: flex; flex-direction: column; gap: 3px; }
.level-num    { font-size: 16px; font-weight: 800; color: var(--neon-primary); text-shadow: 0 0 8px var(--neon-glow); }
.level-target { font-size: 12px; color: var(--secondary); }
.level-speed-badge { padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }

/* Speed badge colors — keep existing */
.speed-slow     { background: rgba(0,200,100,.12);  color: #00c864; }
.speed-med-slow { background: rgba(50,140,255,.12); color: #328cff; }
.speed-medium   { background: rgba(255,200,0,.12);  color: #ffc800; }
.speed-med-fast { background: rgba(255,150,0,.12);  color: #ff9a00; }
.speed-fast     { background: rgba(255,80,80,.12);  color: #ff5050; }
```

- [ ] **Step 2: Add map badge to level select header**

Find the level select page header HTML (`#view-level` content) and add a neon map badge showing the selected map:

```html
<!-- Inside .page-header-row in view-level -->
<div id="level-map-badge" style="
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 20px;
  background: var(--neon-glow);
  color: var(--neon-primary);
  border: 1px solid var(--neon-primary);
  opacity: 0.9;
"></div>
```

In JS, when entering level select, update the badge:

```js
function showLevelSelect(mapId) {
  const badge = document.getElementById('level-map-badge');
  if (badge) badge.textContent = mapId ? mapId.toUpperCase() : '';
  // ... existing level rendering ...
}
```

- [ ] **Step 3: Verify level select**

Navigate through map → level. You should see:
- Map badge in neon primary color at top
- Level rows in glassmorphic style
- Hovering a row glows it in the current map's neon color
- Level number text in neon primary

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: level select — neon glassmorphic rows, map badge"
```

---

## Task 9: Three.js Init — Scene, Camera, Lighting, Board

This is the core Three.js setup. No snake rendering yet — just the board visible in the game view.

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (JS — new `three.js integration` section)

- [ ] **Step 1: Add the Three.js scene setup function**

Add a new JS section `// THREE.JS INTEGRATION` with:

```js
// ════════════════════════════════════════════════════
//  THREE.JS INTEGRATION
// ════════════════════════════════════════════════════

const three = {
  renderer: null, scene: null, camera: null,
  boardMesh: null, gridHelper: null,
  snakeMesh: null, snakeMatrices: null, snakeMaterial: null,
  foodMesh: null, foodLight: null,
  ambientLight: null, dirLight: null,
  particles: [], particlePool: [],
  shakeOffset: { x: 0, y: 0, z: 0 }, shakeEnd: 0,
  raf: null,
  theme: null,
};

const CELL = 1;       // 1 world unit per cell
const HALF = GRID * CELL / 2;  // 10 — half-board offset for centering

function initThree(canvas) {
  if (three.renderer) return; // already initialized

  // Renderer
  three.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  three.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  three.renderer.setClearColor(0x000000, 0);

  // Scene
  three.scene = new THREE.Scene();

  // Camera — fixed, slightly tilted above board center
  three.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  three.camera.position.set(HALF, 18, HALF + 12);
  three.camera.lookAt(HALF, 0, HALF);

  // Lights
  three.ambientLight = new THREE.AmbientLight(0x111122, 0.3);
  three.scene.add(three.ambientLight);

  three.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  three.dirLight.position.set(15, 25, 15);
  three.dirLight.target.position.set(HALF, 0, HALF);
  three.scene.add(three.dirLight);
  three.scene.add(three.dirLight.target);

  // Board plane
  const boardGeo = new THREE.PlaneGeometry(GRID * CELL, GRID * CELL);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x010108,
    roughness: 0.9,
    metalness: 0.1,
  });
  three.boardMesh = new THREE.Mesh(boardGeo, boardMat);
  three.boardMesh.rotation.x = -Math.PI / 2;
  three.boardMesh.position.set(HALF, -0.01, HALF);
  three.scene.add(three.boardMesh);

  // Grid lines using LineSegments
  buildBoardGrid();

  // Snake InstancedMesh (max 400 instances = full 20x20 board)
  const segGeo = new THREE.BoxGeometry(CELL * 0.88, CELL * 0.88, CELL * 0.88);
  three.snakeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00c8ff,
    emissive: new THREE.Color(0x00c8ff),
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.4,
  });
  three.snakeMesh = new THREE.InstancedMesh(segGeo, three.snakeMaterial, 400);
  three.snakeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  three.scene.add(three.snakeMesh);
  // Hide all instances initially
  const dummy = new THREE.Object3D();
  dummy.scale.set(0, 0, 0);
  dummy.updateMatrix();
  for (let i = 0; i < 400; i++) three.snakeMesh.setMatrixAt(i, dummy.matrix);
  three.snakeMesh.instanceMatrix.needsUpdate = true;

  // Food mesh
  const foodGeo = new THREE.IcosahedronGeometry(0.38, 1);
  const foodMat = new THREE.MeshStandardMaterial({
    color: 0xff00c8,
    emissive: new THREE.Color(0xff00c8),
    emissiveIntensity: 1.0,
    roughness: 0.2,
    metalness: 0.5,
  });
  three.foodMesh = new THREE.Mesh(foodGeo, foodMat);
  three.foodMesh.position.set(0, CELL * 0.5, 0);
  three.scene.add(three.foodMesh);

  // PointLight attached near food
  three.foodLight = new THREE.PointLight(0xff00c8, 1.5, 6, 2);
  three.scene.add(three.foodLight);

  // Apply current theme
  const t = MAP_THEMES[state.currentMap] || DEFAULT_THEME;
  three.theme = t;
  threeUpdateTheme(t);

  // Start render loop
  threeRenderLoop();

  // Handle canvas resize
  window.addEventListener('resize', onThreeResize);
}

function buildBoardGrid() {
  // Remove old grid if any
  if (three.gridHelper) { three.scene.remove(three.gridHelper); three.gridHelper.dispose(); }

  const points = [];
  const color = three.theme ? three.theme.primary : '#00c8ff';
  // Vertical lines
  for (let x = 0; x <= GRID; x++) {
    points.push(x * CELL, 0.005, 0);
    points.push(x * CELL, 0.005, GRID * CELL);
  }
  // Horizontal lines
  for (let z = 0; z <= GRID; z++) {
    points.push(0, 0.005, z * CELL);
    points.push(GRID * CELL, 0.005, z * CELL);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.25 });
  three.gridHelper = new THREE.LineSegments(geo, mat);
  three.scene.add(three.gridHelper);
}

function threeUpdateTheme(t) {
  three.theme = t;
  if (!three.scene) return;
  if (three.snakeMaterial) {
    three.snakeMaterial.color.set(t.primary);
    three.snakeMaterial.emissive.set(t.primary);
  }
  if (three.gridHelper) {
    three.gridHelper.material.color.set(t.primary);
  }
  // Food stays magenta/secondary regardless of map
}

function threeRenderLoop() {
  three.raf = requestAnimationFrame(threeRenderLoop);
  const now = performance.now();

  // Food bob + rotation
  if (three.foodMesh) {
    three.foodMesh.rotation.y += 0.02;
    three.foodMesh.rotation.x += 0.01;
    const bobY = Math.sin(now * 0.002) * 0.12;
    three.foodMesh.position.y = CELL * 0.5 + bobY;
    three.foodLight.position.copy(three.foodMesh.position);
  }

  // Camera shake
  if (now < three.shakeEnd) {
    const t = 1 - (three.shakeEnd - now) / 220;
    const ease = 1 - t * t;
    const amp = 0.08 * ease;
    three.camera.position.x = HALF + (Math.random() - 0.5) * amp;
    three.camera.position.z = (HALF + 12) + (Math.random() - 0.5) * amp;
  } else {
    three.camera.position.x = HALF;
    three.camera.position.z = HALF + 12;
  }

  // Tick food particles (burst on eat)
  tickFoodParticles(now);

  if (three.renderer && three.scene && three.camera) {
    three.renderer.render(three.scene, three.camera);
  }
}

function onThreeResize() {
  const canvas = three.renderer ? three.renderer.domElement : null;
  if (!canvas || !three.camera || !three.renderer) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  three.camera.aspect = w / h;
  three.camera.updateProjectionMatrix();
  three.renderer.setSize(w, h);
}

function disposeThree() {
  if (three.raf) { cancelAnimationFrame(three.raf); three.raf = null; }
  window.removeEventListener('resize', onThreeResize);
  if (three.renderer) { three.renderer.dispose(); three.renderer = null; }
  three.scene = three.camera = three.boardMesh = three.gridHelper = null;
  three.snakeMesh = three.snakeMaterial = three.foodMesh = three.foodLight = null;
  three.ambientLight = three.dirLight = null;
}
```

- [ ] **Step 2: Replace the game canvas in HTML**

Find `<canvas id="game-canvas"` and update its CSS to fill its container:

```css
#game-canvas {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 0;
}
```

- [ ] **Step 3: Call `initThree` when game view activates**

In `showView()`, add:

```js
if (name === 'game') {
  const canvas = document.getElementById('game-canvas');
  setTimeout(() => initThree(canvas), 50); // slight delay for layout to settle
}
```

When leaving the game view (navigating to menu), call `disposeThree()`.

- [ ] **Step 4: Verify Three.js board renders**

Start a game. You should see:
- Dark board with glowing neon grid lines
- A bobbing glowing food sphere (magenta)
- Slight camera angle (not flat top-down)
- No snake yet (will be added next task)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: Three.js scene — board, camera, lighting, food mesh"
```

---

## Task 10: Three.js Snake Rendering

Wire the game's snake state into the Three.js InstancedMesh each tick.

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (JS — renderSnake + game loop integration)

- [ ] **Step 1: Add `renderSnake()` function**

```js
function renderSnake(segments) {
  if (!three.snakeMesh) return;
  const dummy = new THREE.Object3D();
  const total = segments.length;

  for (let i = 0; i < 400; i++) {
    if (i < total) {
      const seg = segments[i];
      dummy.position.set(seg.x * CELL + CELL/2, CELL/2, seg.y * CELL + CELL/2);
      // Head slightly larger — scale must be set BEFORE updateMatrix()
      const s = (i === 0) ? 1.06 : 1;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      three.snakeMesh.setMatrixAt(i, dummy.matrix);
    } else {
      // Hide unused instances
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      three.snakeMesh.setMatrixAt(i, dummy.matrix);
    }
  }
  three.snakeMesh.instanceMatrix.needsUpdate = true;
}

function renderFood(pos) {
  if (!three.foodMesh) return;
  three.foodMesh.position.x = pos.x * CELL + CELL/2;
  three.foodMesh.position.z = pos.y * CELL + CELL/2;
  // Y is handled by bob animation in render loop
}
```

- [ ] **Step 2: Hook into the existing game draw function**

Find the 2D canvas draw function (search for `function draw` or `ctx.fillRect` in the 1280–1420 line range). At the **very top** of that function, add an early return that delegates to Three.js instead:

```js
function draw() {  // (find the actual function name in the file)
  // If Three.js is active, skip ALL 2D canvas drawing and use Three.js instead
  if (three.renderer) {
    renderSnake(state.snake);
    renderFood(state.food);
    return;
  }
  // ... existing 2D canvas drawing code continues unchanged below ...
}
```

This single early-return replaces every per-call `if (use3D)` guard and leaves the entire 2D path untouched as a fallback.

- [ ] **Step 3: Verify snake renders in 3D**

Start a game. You should see:
- Snake as glowing 3D extruded blocks on the board
- Food as a rotating glowing sphere
- Snake moves correctly as you play
- The 2D canvas is no longer visible

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: Three.js snake InstancedMesh rendering"
```

---

## Task 11: Three.js Animations — Eat, Game Over, Level Complete

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (JS)

- [ ] **Step 1: Add camera shake + food particle burst**

```js
function onFoodEaten() {
  // Camera shake
  three.shakeEnd = performance.now() + 220;

  // Particle burst — 12 small spheres scatter from food position
  const fx = three.foodMesh.position.x;
  const fy = three.foodMesh.position.y;
  const fz = three.foodMesh.position.z;
  const pGeo = new THREE.SphereGeometry(0.06, 4, 4);
  const pMat = new THREE.MeshBasicMaterial({ color: 0xff00c8 });
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(pGeo, pMat.clone());
    mesh.position.set(fx, fy, fz);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 4
    );
    three.scene.add(mesh);
    three.particles.push({ mesh, vel, life: 1.0, decay: 1 / (0.4 * 60) });
  }
}

function tickFoodParticles(now) {
  for (let i = three.particles.length - 1; i >= 0; i--) {
    const p = three.particles[i];
    p.life -= p.decay;
    p.vel.y -= 0.05; // gravity
    p.mesh.position.addScaledVector(p.vel, 1/60);
    p.mesh.material.opacity = p.life;
    p.mesh.material.transparent = true;
    p.mesh.scale.setScalar(p.life);
    if (p.life <= 0) {
      three.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      three.particles.splice(i, 1);
    }
  }
}
```

- [ ] **Step 2: Call `onFoodEaten()` from the existing food-eaten handler**

Find where the game handles food being eaten (where `state.score` increases). Add:

```js
if (typeof onFoodEaten === 'function' && three.renderer) onFoodEaten();
```

- [ ] **Step 3: Add `onGameOver()` — explosion animation**

```js
function onGameOver3D() {
  if (!three.snakeMesh || !three.scene) return;
  // Explode segments: spawn individual meshes with random velocities
  const segGeo = new THREE.BoxGeometry(CELL * 0.88, CELL * 0.88, CELL * 0.88);
  state.snake.forEach((seg, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff0050,
      emissive: new THREE.Color(0xff0050),
      emissiveIntensity: 0.8,
    });
    const mesh = new THREE.Mesh(segGeo, mat);
    mesh.position.set(seg.x * CELL + CELL/2, CELL/2, seg.y * CELL + CELL/2);
    three.scene.add(mesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      Math.random() * 4 + 1,
      (Math.random() - 0.5) * 6
    );
    const rot = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );
    three.particles.push({ mesh, vel, rot, life: 1.0, decay: 1 / (0.6 * 60) });
  });
  // Hide instanced snake
  const dummy = new THREE.Object3D();
  dummy.scale.set(0,0,0); dummy.updateMatrix();
  for (let i = 0; i < 400; i++) three.snakeMesh.setMatrixAt(i, dummy.matrix);
  three.snakeMesh.instanceMatrix.needsUpdate = true;
  // Turn grid red
  if (three.gridHelper) three.gridHelper.material.color.set(0xff0050);
}

function onLevelComplete3D() {
  if (!three.scene) return;
  // Segments float up with green color
  const segGeo = new THREE.BoxGeometry(CELL * 0.88, CELL * 0.88, CELL * 0.88);
  const t = MAP_THEMES[state.currentMap] || DEFAULT_THEME;
  state.snake.forEach(seg => {
    const mat = new THREE.MeshStandardMaterial({ color: t.secondary, emissive: new THREE.Color(t.secondary), emissiveIntensity: 1 });
    const mesh = new THREE.Mesh(segGeo, mat);
    mesh.position.set(seg.x * CELL + CELL/2, CELL/2, seg.y * CELL + CELL/2);
    three.scene.add(mesh);
    const vel = new THREE.Vector3((Math.random()-0.5)*0.5, Math.random()*2+1, (Math.random()-0.5)*0.5);
    three.particles.push({ mesh, vel, rot: new THREE.Vector3(0,0.02,0), life: 1.0, decay: 1/(0.8*60) });
  });
  const dummy = new THREE.Object3D();
  dummy.scale.set(0,0,0); dummy.updateMatrix();
  for (let i = 0; i < 400; i++) three.snakeMesh.setMatrixAt(i, dummy.matrix);
  three.snakeMesh.instanceMatrix.needsUpdate = true;
  if (three.gridHelper) three.gridHelper.material.color.set(t.secondary);
}

function resetThree() {
  // Clear explosion particles
  three.particles.forEach(p => {
    three.scene.remove(p.mesh);
    if (p.mesh.geometry) p.mesh.geometry.dispose();
    if (p.mesh.material) p.mesh.material.dispose();
  });
  three.particles = [];
  // Restore grid color
  const t = MAP_THEMES[state.currentMap] || DEFAULT_THEME;
  if (three.gridHelper) three.gridHelper.material.color.set(t.primary);
  // Reset snake mesh
  const dummy = new THREE.Object3D();
  dummy.scale.set(0,0,0); dummy.updateMatrix();
  for (let i = 0; i < 400; i++) three.snakeMesh.setMatrixAt(i, dummy.matrix);
  three.snakeMesh.instanceMatrix.needsUpdate = true;
}
```

- [ ] **Step 4: Update `tickFoodParticles` to handle rotation for explosion pieces**

Update the existing `tickFoodParticles` to apply rotation when `p.rot` exists:

```js
if (p.rot) {
  p.mesh.rotation.x += p.rot.x;
  p.mesh.rotation.y += p.rot.y;
  p.mesh.rotation.z += p.rot.z;
}
```

- [ ] **Step 5: Hook into existing `triggerGameOver()` and level complete**

Find `triggerGameOver()` and add:

```js
if (three.renderer) onGameOver3D();
```

Find where level-complete is triggered and add:

```js
if (three.renderer) onLevelComplete3D();
```

Find where Retry re-initializes the game and add:

```js
if (three.renderer) resetThree();
```

- [ ] **Step 6: Verify animations**

- Eat food: camera shakes, magenta particles scatter from food position
- Game over: snake explodes into red tumbling blocks, grid turns red
- Level complete: snake floats upward in map's secondary color

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: Three.js animations — eat particles, game-over explosion, level complete"
```

---

## Task 12: Game HUD Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS for `.game-hud`)

- [ ] **Step 1: Replace game HUD CSS**

```css
/* ── GAME HUD ── */
#view-game { align-items: center; padding: 0; position: relative; justify-content: flex-start; }
.game-hud {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px 10px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.7);
  border-bottom: 1px solid var(--neon-primary);
  box-shadow: 0 1px 20px var(--neon-glow);
  position: relative; z-index: 10;
}
.hud-score { display: flex; flex-direction: column; gap: 2px; }
.hud-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: rgba(255,255,255,0.3);
}
.hud-value {
  font-size: 20px; font-weight: 900; color: var(--neon-primary);
  text-shadow: 0 0 12px var(--neon-glow);
  font-family: 'Courier New', monospace;
}
.hud-value.accent { color: var(--neon-primary); }
.hud-value.gold   { color: var(--amber); }
.hud-pause-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; padding: 6px 12px;
  color: rgba(255,255,255,0.5);
  font-size: 12px; cursor: pointer; transition: all .15s;
  font-weight: 600; letter-spacing: 0.05em;
}
.hud-pause-btn:hover {
  border-color: var(--neon-primary);
  color: var(--neon-primary);
  box-shadow: 0 0 8px var(--neon-glow);
}
```

- [ ] **Step 2: Verify HUD**

Start a game. The HUD bar should:
- Have a neon border-bottom in the map's color
- Score/level values in neon monospace font with glow
- Pause button glows on hover in map color

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: game HUD — neon monospace, map-color border"
```

---

## Task 13: Game Over / Level Complete Overlay Redesign

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (CSS + HTML for overlays)

- [ ] **Step 1: Replace game-over/level-complete overlay CSS**

Find all CSS for `.overlay`, `.game-over-*`, `.level-complete-*`, `.result-*` and replace with:

```css
/* ── GAME RESULT OVERLAYS ── */
.game-overlay {
  position: absolute; inset: 0; z-index: 50;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
  background: rgba(0,0,0,0.75);
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s ease;
}
.game-overlay.visible { opacity: 1; pointer-events: all; }

.overlay-title {
  font-size: clamp(2rem, 10vw, 3.5rem);
  font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
  animation: none;
}
.overlay-title.game-over-text {
  color: #ff0050;
  text-shadow: 0 0 20px #ff0050, 0 0 60px rgba(255,0,80,0.4);
}
.overlay-title.level-win-text {
  color: var(--neon-primary);
  text-shadow: 0 0 20px var(--neon-primary), 0 0 60px var(--neon-glow);
}
.overlay-title.slam-in {
  animation: title-slam 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes title-slam {
  from { transform: scale(1.5); opacity: 0; }
  to   { transform: scale(1.0); opacity: 1; }
}
.overlay-score-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.overlay-score-value {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 900; color: #fff;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 16px rgba(255,255,255,0.3);
}
.overlay-buttons {
  display: flex; gap: 10px; margin-top: 8px;
  opacity: 0; animation: fade-in-up 0.3s 0.8s ease forwards;
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Update the overlay HTML structure**

Find the game-over/result overlay HTML and standardize it to use the new classes. It should contain:

```html
<div class="game-overlay" id="game-overlay">
  <div class="overlay-title" id="overlay-title"></div>
  <div class="overlay-score-label">Final Score</div>
  <div class="overlay-score-value" id="overlay-score">0000</div>
  <div class="overlay-buttons" id="overlay-buttons">
    <!-- Retry / Next / Menu buttons injected by JS -->
  </div>
</div>
```

- [ ] **Step 3: Update JS to show overlay**

Find `triggerGameOver()` and the level-complete handler. Update them to use the new overlay:

```js
function showGameOverlay(type) {
  const overlay  = document.getElementById('game-overlay');
  const titleEl  = document.getElementById('overlay-title');
  const scoreEl  = document.getElementById('overlay-score');
  const btnsEl   = document.getElementById('overlay-buttons');
  if (!overlay) return;

  titleEl.className = 'overlay-title ' + (type === 'win' ? 'level-win-text' : 'game-over-text');
  titleEl.textContent = type === 'win' ? 'LEVEL COMPLETE' : 'GAME OVER';

  // Animate score counting up
  const targetScore = state.score;
  let displayed = 0;
  scoreEl.textContent = '0000';
  const scoreInterval = setInterval(() => {
    displayed = Math.min(displayed + Math.ceil(targetScore / 30), targetScore);
    scoreEl.textContent = String(displayed).padStart(4, '0');
    if (displayed >= targetScore) clearInterval(scoreInterval);
  }, 30);

  // Buttons appear after 0.8s
  btnsEl.innerHTML = '';
  btnsEl.style.animation = 'none';
  setTimeout(() => {
    btnsEl.style.animation = '';
    if (type === 'win') {
      btnsEl.innerHTML = `<button class="btn btn-primary btn-lg" onclick="nextLevel()">Next Level</button>
        <button class="btn btn-ghost" onclick="goHome()">Menu</button>`;
    } else {
      btnsEl.innerHTML = `<button class="btn btn-primary btn-lg" onclick="retryLevel()">Retry</button>
        <button class="btn btn-ghost" onclick="goHome()">Menu</button>`;
    }
  }, 800);

  // Show overlay with delay for explosion to start first
  setTimeout(() => {
    overlay.classList.add('visible');
    titleEl.classList.add('slam-in');
  }, 300);
}
```

- [ ] **Step 4: Wire `retryLevel()` and `goHome()` to Three.js lifecycle**

```js
function retryLevel() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.remove('visible');
  if (three.renderer) resetThree();
  // ... existing retry logic (restart game loop) ...
}

function goHome() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.remove('visible');
  // Dispose Three.js after transition
  setTimeout(() => {
    if (three.renderer) disposeThree();
    showView('home');
    showNeonBg(true);
  }, 400);
}
```

- [ ] **Step 5: Verify overlays**

- Game over: title slams in, score counts up, buttons fade in at 0.8s
- Level complete: same flow with "LEVEL COMPLETE" in map color

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: game-over/level-complete overlays — slam animation, score counter"
```

---

## Task 14: Map-Specific Background Extras

Add the 4 special background effects for Space, Lava, Arctic, and City maps.

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html` (JS + CSS)

- [ ] **Step 1: Add Space — twinkling stars**

```js
function addSpaceStars() {
  removeMapExtras();
  const container = document.createElement('div');
  container.id = 'map-extra-stars';
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    const size = Math.random() < 0.3 ? 2 : 1;
    star.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(255,255,255,${0.4 + Math.random()*0.6});
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation: star-twinkle ${2 + Math.random()*2}s ease-in-out infinite alternate;
      animation-delay:${Math.random()*3}s;
    `;
    container.appendChild(star);
  }
  document.body.appendChild(container);
}
```

Add to CSS:
```css
@keyframes star-twinkle { from{opacity:0.2} to{opacity:1} }
```

- [ ] **Step 2: Add Lava — sine-wave shimmer canvas**

```js
function addLavaShimmer() {
  removeMapExtras();
  const canvas = document.createElement('canvas');
  canvas.id = 'map-extra-lava';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;width:100%;height:100%;opacity:0.3;';
  document.body.appendChild(canvas);
  function resizeLava() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeLava();
  window.addEventListener('resize', resizeLava);
  let t = 0;
  function drawLava() {
    if (!document.getElementById('map-extra-lava')) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,80,20,0.6)';
    ctx.lineWidth = 1.5;
    const lines = 8;
    for (let l = 0; l < lines; l++) {
      const baseY = H * (l / lines + 0.05);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = baseY + Math.sin((x / W) * Math.PI * 4 + t + l * 0.5) * (H * 0.015);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    t += 0.02;
    requestAnimationFrame(drawLava);
  }
  drawLava();
}
```

- [ ] **Step 3: Add Arctic — grid drift**

Arctic scrolls the grid by tracking a canvas-space offset inside the background draw function. Do NOT use CSS `transform` on the grid canvas — the canvas redraws every frame so a CSS transform only shifts the element visually while content stays put, creating a seam.

Add a `neonBg.arcticDrift` offset and apply it inside `drawPerspectiveGrid`:

```js
// In the neonBg object, add:
arcticDriftX: 0,
arcticActive: false,

function addArcticDrift() {
  removeMapExtras();
  neonBg.arcticActive = true;
  neonBg.arcticDriftX = 0;
}

// In tickNeonBg, before calling drawPerspectiveGrid, add:
if (neonBg.arcticActive) neonBg.arcticDriftX = (neonBg.arcticDriftX + 0.12) % 48;

// In drawPerspectiveGrid, apply the offset to all x-coordinates:
// Add at top of the function:
const driftX = neonBg.arcticDriftX || 0;
// Then offset every x coordinate used in vertical lines and horizontal endpoints by -driftX:
// e.g.  ctx.lineTo(bx - driftX, H + 40)  and  ctx.lineTo(x1 - driftX, y) etc.
// Wrap the ctx in a save/restore with ctx.translate(-driftX, 0) for simplicity:
ctx.save();
ctx.translate(-driftX, 0);
// ... existing grid draw code ...
ctx.restore();
```

Also clear the flag in `removeMapExtras()`:
```js
neonBg.arcticActive = false;
neonBg.arcticDriftX = 0;
```

- [ ] **Step 4: Add City — blinking window lights**

```js
function addCityWindows() {
  removeMapExtras();
  const container = document.createElement('div');
  container.id = 'map-extra-city';
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
  const colors = ['rgba(255,220,80,0.7)', 'rgba(200,200,255,0.6)', 'rgba(255,255,200,0.5)'];
  for (let i = 0; i < 20; i++) {
    const w = document.createElement('div');
    const col = colors[Math.floor(Math.random()*colors.length)];
    const delay = Math.random() * 3;
    const dur   = 1 + Math.random() * 2;
    w.style.cssText = `
      position:absolute;
      width:${3+Math.random()*4}px; height:${4+Math.random()*6}px;
      background:${col};
      left:${Math.random()*95}%; top:${20+Math.random()*70}%;
      animation: window-blink ${dur}s ease-in-out infinite alternate;
      animation-delay:${delay}s;
    `;
    container.appendChild(w);
  }
  document.body.appendChild(container);
}
```

Add CSS:
```css
@keyframes window-blink { from{opacity:0.2} to{opacity:1} }
```

- [ ] **Step 5: Add `removeMapExtras()` cleanup function**

```js
function removeMapExtras() {
  ['map-extra-stars','map-extra-lava','map-extra-city'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  // Remove arctic drift animation
  const gc = document.getElementById('neon-grid-canvas');
  if (gc) gc.style.animation = '';
}
```

- [ ] **Step 6: Call the right extra from `selectMap()`**

```js
function selectMap(mapId) {
  state.currentMap = mapId;
  applyMapTheme(mapId);
  removeMapExtras();
  if (mapId === 'space')  addSpaceStars();
  if (mapId === 'lava')   addLavaShimmer();
  if (mapId === 'arctic') addArcticDrift();
  if (mapId === 'city')   addCityWindows();
  // ... existing navigation to level select ...
}
```

Also call `removeMapExtras()` in `disposeThree()` / when leaving game view.

- [ ] **Step 7: Verify**

Select each of the 4 special maps and navigate to the level select / home screen:
- Space: 150 twinkling stars visible in background
- Lava: wavy horizontal shimmer lines drifting behind grid
- Arctic: grid slowly panning horizontally
- City: small blinking window lights scattered in background

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: map-specific backgrounds — space stars, lava shimmer, arctic drift, city windows"
```

---

## Task 15: Integration, Mobile Verification, Final Cleanup

**Files:**
- Modify: `C:\Users\m7md5\Projects\snake\index.html`

- [ ] **Step 1: Verify touch controls work with Three.js canvas**

Open the game on mobile or use Chrome DevTools device emulation. Play using swipe/touch. If touch controls are broken:

Find all `addEventListener('touchstart'` / `touchmove` / `touchend` and ensure they are bound to `document` rather than the old `<canvas>` element. Change any canvas-bound touch listeners to `document`.

- [ ] **Step 2: Verify all 9 maps load and play correctly**

Test each map:
- Select map → theme color updates on all screens
- Start game → Three.js board color matches map theme
- Eat food → camera shake + particles fire
- Complete level → level complete animation plays
- Game over → explosion animation plays, retry works

- [ ] **Step 3: Verify back navigation**

- Game → Menu: Three.js disposes cleanly (no WebGL memory leak)
- Menu → Map → Level → Game: theme persists correctly
- Refresh page: `applyMapTheme(null)` sets default cyan theme
- **Pause menu "Menu" button**: ensure it also calls `goHome()` (same path as the overlay buttons) so `disposeThree()` + `removeMapExtras()` always run. Check the pause menu handler and add the call if missing.

- [ ] **Step 4: Check console for errors**

Open DevTools. Play through a full game. There should be zero errors and zero "WebGL warning" messages.

- [ ] **Step 5: Remove backup file if everything works**

```bash
del "C:\Users\m7md5\Projects\snake\index.html.bak"
```

- [ ] **Step 6: Final commit**

```bash
git add index.html
git commit -m "feat: snake neon cyberpunk 3D redesign — complete

Three.js WebGL game canvas, per-map neon themes, animated backgrounds
on all screens, CSS glassmorphic menus, 3D snake InstancedMesh,
explosion/particle animations. Zero gameplay changes."
```

---

## Quick Reference

| Function | Purpose |
|---|---|
| `applyMapTheme(mapId)` | Updates CSS vars + Three.js materials for the selected map |
| `initThree(canvas)` | Set up Three.js scene, called when game view activates |
| `renderSnake(segments)` | Update InstancedMesh from game state |
| `renderFood(pos)` | Update food mesh position |
| `onFoodEaten()` | Camera shake + particle burst |
| `onGameOver3D()` | Explode snake segments, turn grid red |
| `onLevelComplete3D()` | Float segments up, shift grid color |
| `resetThree()` | Clear animations, restore state for Retry |
| `disposeThree()` | Full WebGL cleanup on menu navigation |
| `initNeonBg()` | Start shared bg animation (grid, particles, snake) |
| `showNeonBg(bool)` | Show/hide shared bg (hidden during game) |
| `removeMapExtras()` | Remove Space/Lava/Arctic/City special bg layers |
