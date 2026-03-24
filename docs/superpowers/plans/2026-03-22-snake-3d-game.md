# Snake 3D Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional neon-cyberpunk Snake 3D game as a single standalone HTML file (`snake-3d.html`) in the repo root, using Three.js WebGL for 3D rendering, with 9 maps + unique challenges, 20 unlockable skins, a lamp-currency store, and a local friends list.

**Architecture:** Single self-contained HTML file with all CSS/JS inlined. Six view panels (Home, Map Select, Level Select, Game, Store, Friends) controlled by a JS view-router. Three.js loaded from CDN renders the game canvas; all other views are standard DOM. localStorage handles all persistence (coins, skins, friends, scores).

**Tech Stack:** Three.js r128 (CDN), vanilla JS (ES6), HTML5 Canvas (background snake only), CSS3, localStorage

**Reference files:**
- Design source: `snake-preview.html` (maps, skins, challenges already designed — copy draw functions directly)
- Original game: `fullstack/public/from-other-pc/Projects/snake/index.html` (level data, game loop reference)
- Landing page design: provided HTML in brainstorm (exact CSS classes, fonts, colors)

---

## File Structure

```
snake-3d.html          ← single output file (root)
snake-preview.html     ← reference only, not shipped
snake-3d-test.html     ← reference only, not shipped
```

Internal structure of `snake-3d.html`:
```
<head>
  Google Fonts (Space Grotesk, Manrope)
  Tailwind CDN (same config as landing design)
  Three.js CDN
  <style> — all CSS (landing, views, store, friends, HUD)
</head>
<body>
  <!-- VIEW: Home -->
  <!-- VIEW: Map Select -->
  <!-- VIEW: Level Select -->
  <!-- VIEW: Game -->
  <!-- VIEW: Store -->
  <!-- VIEW: Friends -->
  <script>
    // 1. Constants & Config
    // 2. localStorage helpers
    // 3. View router
    // 4. Home background snake (Canvas 2D)
    // 5. Three.js scene (renderer, camera, lights)
    // 6. Map system (9 maps)
    // 7. Skin system (20 skins + trail particles)
    // 8. Food system (3D lamp)
    // 9. Snake engine (movement, collision, growth)
    // 10. Map challenges (9 unique mechanics)
    // 11. HUD + overlays
    // 12. Level system
    // 13. Store panel logic
    // 14. Friends panel logic
    // 15. Game loop (requestAnimationFrame)
    // 16. Input handling
  </script>
</body>
```

---

## Task 1: HTML Skeleton + View Router + Global CSS

**Files:**
- Create: `snake-3d.html`

- [ ] **Step 1.1: Create the file with head section**

Copy the exact `<head>` from the provided landing design HTML — same Tailwind config, same Google Fonts (Space Grotesk, Manrope), same Material Symbols. Add Three.js CDN after Tailwind:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

- [ ] **Step 1.2: Add global CSS + view system**

```css
/* View system */
[data-view] { display: none !important; }
[data-view].active { display: flex !important; }

/* Fullscreen views */
.view-fullscreen {
  position: fixed; inset: 0; z-index: 10;
  flex-direction: column;
  background: #0e0e13;
  overflow-y: auto;
}

/* Slide-in panels (store, friends) */
.panel-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7);
  display: none; align-items: flex-end;
  justify-content: flex-end;
}
.panel-overlay.open { display: flex; }
.panel-drawer {
  width: 420px; height: 100vh;
  background: #0e0e13;
  border-left: 1px solid rgba(72,71,77,0.3);
  display: flex; flex-direction: column;
  overflow: hidden;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.2,0,0,1);
}
.panel-overlay.open .panel-drawer { transform: translateX(0); }
```

- [ ] **Step 1.3: Add 4 main view divs + 2 panel divs**

```html
<body class="bg-background text-on-surface font-body overflow-hidden">

  <!-- HOME VIEW (landing design) -->
  <div id="view-home" data-view class="active view-fullscreen"></div>

  <!-- MAP SELECT VIEW -->
  <div id="view-map" data-view class="view-fullscreen"></div>

  <!-- LEVEL SELECT VIEW -->
  <div id="view-level" data-view class="view-fullscreen"></div>

  <!-- GAME VIEW -->
  <div id="view-game" data-view class="view-fullscreen" style="overflow:hidden"></div>

  <!-- STORE PANEL -->
  <div id="panel-store" class="panel-overlay">
    <div class="panel-drawer" id="store-drawer"></div>
  </div>

  <!-- FRIENDS PANEL -->
  <div id="panel-friends" class="panel-overlay">
    <div class="panel-drawer" id="friends-drawer"></div>
  </div>

  <script>
  // ── VIEW ROUTER ──────────────────────────────────────────────────────────────
  let currentView = 'home';

  function showView(name) {
    document.querySelectorAll('[data-view]').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    currentView = name;
    if (name === 'game') startGame();
    if (name === 'home') startBgSnake();
  }

  function openPanel(name) {
    document.getElementById('panel-' + name).classList.add('open');
  }

  function closePanel(name) {
    document.getElementById('panel-' + name).classList.remove('open');
  }

  // Close panel on backdrop click
  document.querySelectorAll('.panel-overlay').forEach(p => {
    p.addEventListener('click', e => { if(e.target === p) closePanel(p.id.replace('panel-','')); });
  });
  </script>
</body>
```

- [ ] **Step 1.4: Verify**

Open `snake-3d.html` directly in browser. Should show a dark `#0e0e13` background with no errors in console. View router works (test via browser console: `showView('map')`).

- [ ] **Step 1.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: scaffold snake-3d.html with view router and panel system"
```

---

## Task 2: Home View (Landing Page)

**Files:**
- Modify: `snake-3d.html` — `#view-home` content + background snake canvas

- [ ] **Step 2.1: Paste the landing design into `#view-home`**

Copy the full interior HTML from the provided landing design exactly — the `<header>`, `<main>`, `<nav>`, and floating HUD divs. Do NOT copy `<html>`, `<head>`, or `<body>` tags. Paste inside `<div id="view-home">`.

Keep all Tailwind classes, all data-icon attributes, all existing structure. Do not change the design.

- [ ] **Step 2.2: Wire up navigation buttons**

Replace the static image background snake div with a canvas:
```html
<!-- Replace the <img> snake element with: -->
<canvas id="bg-snake-canvas" class="absolute inset-0 w-full h-full pointer-events-none opacity-60"></canvas>
```

Wire the 3 bottom nav buttons and 3 card buttons:
```javascript
// Free Play → map select (free play mode)
document.querySelectorAll('[data-action="free-play"]').forEach(b =>
  b.addEventListener('click', () => { gameMode='free'; showView('map'); })
);

// Levels → map select (levels mode)
document.querySelectorAll('[data-action="levels"]').forEach(b =>
  b.addEventListener('click', () => { gameMode='levels'; showView('map'); })
);

// Themes/Store → store panel
document.querySelectorAll('[data-action="store"]').forEach(b =>
  b.addEventListener('click', () => openPanel('store'))
);

// Friends button
document.querySelectorAll('[data-action="friends"]').forEach(b =>
  b.addEventListener('click', () => openPanel('friends'))
);
```

Add `data-action` attributes to the corresponding buttons in the HTML.

- [ ] **Step 2.3: Background snake — Canvas 2D realistic slither**

The snake should look like a real snake slithering — it follows a smooth curved path that changes direction naturally, rendered with neon glow:

```javascript
function startBgSnake() {
  const canvas = document.getElementById('bg-snake-canvas');
  const ctx = canvas.getContext('2d');

  // Resize canvas to window
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Snake path: array of {x, y} waypoints the head follows
  const PATH_LEN = 80;     // number of segments
  const SEG_DIST = 18;     // pixels between segments
  let path = [];

  // Initialize path in a loose S-curve
  for (let i = 0; i < PATH_LEN; i++) {
    path.push({
      x: canvas.width * 0.5 + Math.sin(i * 0.15) * 200,
      y: canvas.height * 0.3 + i * 12
    });
  }

  // Head target — wanders smoothly using sine waves
  let t = 0;
  let headAngle = 0;
  let angleVel = 0;

  function updateHead() {
    // Smoothly change heading
    angleVel += (Math.random() - 0.5) * 0.04;
    angleVel *= 0.92; // dampen
    headAngle += angleVel;

    // Gentle sine-wave bias to keep it on screen
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = cx - path[0].x, dy = cy - path[0].y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > Math.min(canvas.width, canvas.height) * 0.45) {
      // Steer toward center
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - headAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      headAngle += diff * 0.03;
    }

    const speed = 2.2;
    const newHead = {
      x: path[0].x + Math.cos(headAngle) * speed,
      y: path[0].y + Math.sin(headAngle) * speed
    };
    path.unshift(newHead);
    path.pop();
  }

  function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = path.length - 1; i >= 0; i--) {
      const p = path[i];
      const next = path[i - 1] || p;
      const alpha = 1 - i / PATH_LEN;
      const radius = (1 - i / PATH_LEN) * 14 + 3; // taper from head to tail

      // Glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
      glow.addColorStop(0, `rgba(142,255,113,${alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - radius * 2.5, p.y - radius * 2.5, radius * 5, radius * 5);

      // Body segment
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${i < 3 ? '142,255,113' : '43,232,0'},${alpha * 0.85})`;
      ctx.fill();

      // Shine
      ctx.beginPath();
      ctx.arc(p.x - radius * 0.25, p.y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.3})`;
      ctx.fill();
    }

    // Eyes on head
    const h = path[0], h2 = path[1] || h;
    const eyeAngle = Math.atan2(h.y - h2.y, h.x - h2.x);
    const eyeOff = 5;
    const perpX = Math.cos(eyeAngle + Math.PI/2) * eyeOff;
    const perpY = Math.sin(eyeAngle + Math.PI/2) * eyeOff;
    [[perpX, perpY], [-perpX, -perpY]].forEach(([ox, oy]) => {
      ctx.beginPath(); ctx.arc(h.x + ox, h.y + oy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#000'; ctx.fill();
      ctx.beginPath(); ctx.arc(h.x + ox + 0.5, h.y + oy - 0.5, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#8eff71'; ctx.fill();
    });
  }

  let bgSnakeRAF;
  function bgLoop() {
    updateHead();
    drawSnake();
    t++;
    bgSnakeRAF = requestAnimationFrame(bgLoop);
  }

  if (bgSnakeRAF) cancelAnimationFrame(bgSnakeRAF);
  bgLoop();
}
```

- [ ] **Step 2.4: Verify**

Open file. Home view looks identical to the provided design. Snake slithers smoothly across the background in neon green. Buttons are clickable (store/friends panels slide in; free play / levels navigate to map view placeholder).

- [ ] **Step 2.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: home view with landing design and realistic background snake"
```

---

## Task 3: Map Select View

**Files:**
- Modify: `snake-3d.html` — `#view-map` content

- [ ] **Step 3.1: Define the 9 maps data array**

```javascript
const MAPS = [
  {
    id: 'ocean',   name: 'Ocean',   borderColor: '#00b4d8',
    vibe: 'Deep Sea · Bioluminescent · Teal Neon',
    challenge: { name: '🌊 Tidal Current', desc: 'A current surges every 8s — pushes your snake 1 cell in its direction.' },
    fogColor: 0x000d1a, fogDensity: 0.04,
    floorColor: 0x002244, gridColor: 0x004488,
    ambientColor: 0x001133, accentLight: 0x00b4d8,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Ocean draw() */ }
  },
  {
    id: 'earth',   name: 'Earth',   borderColor: '#4aff50',
    vibe: 'Terrain · Green Grid · Satellite View',
    challenge: { name: '🌍 Seismic Shift', desc: 'Every 12s earthquake teleports all food instantly.' },
    fogColor: 0x020c02, fogDensity: 0.035,
    floorColor: 0x0a1805, gridColor: 0x1a4a0a,
    ambientColor: 0x051002, accentLight: 0x4aff50,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Earth draw() */ }
  },
  {
    id: 'moon',    name: 'Moon',    borderColor: '#c0c0d0',
    vibe: 'Craters · Silver · Zero-G Neon',
    challenge: { name: '🌕 Low Gravity', desc: 'Snake slides 1 extra cell after turning — plan ahead.' },
    fogColor: 0x08080f, fogDensity: 0.03,
    floorColor: 0x1e1e2e, gridColor: 0x2e2e42,
    ambientColor: 0x0a0a14, accentLight: 0xc0c0d0,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Moon draw() */ }
  },
  {
    id: 'space',   name: 'Space',   borderColor: '#6e6eff',
    vibe: 'Deep Universe · Nebula · Star Field',
    challenge: { name: '🕳️ Black Hole', desc: 'Gravity well pulls snake toward it — closer = stronger pull.' },
    fogColor: 0x000004, fogDensity: 0.025,
    floorColor: 0x05050c, gridColor: 0x10102a,
    ambientColor: 0x020208, accentLight: 0x6e6eff,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Space draw() */ }
  },
  {
    id: 'desert',  name: 'Desert',  borderColor: '#ffaa00',
    vibe: 'Sand Dunes · Amber · Heat Haze',
    challenge: { name: '🏜️ Sandstorm', desc: 'Arena goes dark for 4s every 15s — navigate from memory.' },
    fogColor: 0x0a0400, fogDensity: 0.045,
    floorColor: 0x2a0e00, gridColor: 0x6e2a00,
    ambientColor: 0x080200, accentLight: 0xffaa00,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Desert draw() */ }
  },
  {
    id: 'arctic',  name: 'Arctic',  borderColor: '#80e8ff',
    vibe: 'Ice Fields · Aurora · Frozen Circuit',
    challenge: { name: '❄️ Black Ice', desc: 'Turns register 1 tick late — the faster you go, the worse the slide.' },
    fogColor: 0x00060f, fogDensity: 0.03,
    floorColor: 0x001525, gridColor: 0x003355,
    ambientColor: 0x000408, accentLight: 0x80e8ff,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Arctic draw() */ }
  },
  {
    id: 'lava',    name: 'Lava',    borderColor: '#ff4400',
    vibe: 'Volcanic · Molten Core · Fire Grid',
    challenge: { name: '🌋 Eruption Zones', desc: 'Lava tiles warn then erupt — touch = instant death, cool after 5s.' },
    fogColor: 0x080000, fogDensity: 0.05,
    floorColor: 0x0e0000, gridColor: 0x2a0000,
    ambientColor: 0x050000, accentLight: 0xff4400,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Lava draw() */ }
  },
  {
    id: 'city',    name: 'City',    borderColor: '#c47fff',
    vibe: 'Neon Skyline · Cyber Streets · Rain',
    challenge: { name: '🚗 Neon Traffic', desc: 'Glowing traffic lines sweep the arena — get hit = game over.' },
    fogColor: 0x020008, fogDensity: 0.04,
    floorColor: 0x04000e, gridColor: 0x14003a,
    ambientColor: 0x010004, accentLight: 0xc47fff,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html City draw() */ }
  },
  {
    id: 'jungle',  name: 'Jungle',  borderColor: '#00ff88',
    vibe: 'Dense Canopy · Bio Neon · Overgrowth',
    challenge: { name: '🌿 Creeping Vines', desc: 'Arena shrinks every 20s as vines grow inward — survive the squeeze.' },
    fogColor: 0x000a02, fogDensity: 0.05,
    floorColor: 0x011a05, gridColor: 0x052a0a,
    ambientColor: 0x000502, accentLight: 0x00ff88,
    drawThumb(ctx, w, h) { /* copy from snake-preview.html Jungle draw() */ }
  },
];
```

Note: for each `drawThumb`, copy the corresponding `draw(ctx,w,h)` function body verbatim from `snake-preview.html`.

- [ ] **Step 3.2: Build the map select view HTML**

```javascript
function renderMapSelect() {
  const view = document.getElementById('view-map');
  view.innerHTML = `
    <header class="fixed top-0 w-full flex items-center gap-4 px-6 py-5 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/15">
      <button onclick="showView('home')" class="text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div>
        <div class="text-xs text-primary uppercase tracking-widest font-label">
          ${gameMode === 'free' ? 'Free Play' : 'Campaign'}
        </div>
        <div class="text-xl font-headline font-bold uppercase">Select Map</div>
      </div>
    </header>
    <div class="pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="map-grid"></div>
    </div>
  `;

  const grid = document.getElementById('map-grid');
  MAPS.forEach(map => {
    const card = document.createElement('div');
    card.className = 'rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 hover:-translate-y-1';
    card.style.borderColor = map.borderColor + '44';

    // Canvas thumbnail
    const thumb = document.createElement('canvas');
    thumb.width = 480; thumb.height = 240;
    thumb.style.cssText = 'display:block;width:100%;height:160px;';

    const info = document.createElement('div');
    info.style.cssText = 'padding:14px 16px;background:#0f0f18;';
    info.innerHTML = `
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${map.borderColor}">${map.name}</div>
      <div style="font-size:10px;color:#76747b;margin-top:2px">${map.vibe}</div>
      <div style="margin-top:8px;padding:8px 10px;background:${map.borderColor}0a;border-left:2px solid ${map.borderColor}44;border-radius:4px">
        <div style="font-size:10px;font-weight:700;color:${map.borderColor};letter-spacing:.15em;text-transform:uppercase;margin-bottom:2px">Challenge</div>
        <div style="font-size:11px;font-weight:600;color:${map.borderColor}">${map.challenge.name}</div>
        <div style="font-size:10px;color:#acaab1;margin-top:2px;line-height:1.4">${map.challenge.desc}</div>
      </div>
    `;

    card.appendChild(thumb);
    card.appendChild(info);
    grid.appendChild(card);

    // Draw thumbnail
    const ctx = thumb.getContext('2d');
    map.drawThumb(ctx, 480, 240);

    // Click handler
    card.addEventListener('click', () => {
      selectedMap = map;
      if (gameMode === 'levels') showView('level');
      else { selectedLevel = null; showView('game'); }
    });
  });
}
```

Call `renderMapSelect()` inside `showView()` when switching to 'map'.

- [ ] **Step 3.3: Track selected state**

```javascript
let gameMode = 'free';   // 'free' | 'levels'
let selectedMap = MAPS[0];
let selectedLevel = null;
```

- [ ] **Step 3.4: Verify**

Click Free Play on home → map select shows 9 map cards with correct thumbnails (reused from preview), challenge badges, and border colors. Back button returns to home.

- [ ] **Step 3.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: map select view with 9 maps, thumbnails, and challenge display"
```

---

## Task 4: Level Select View

**Files:**
- Modify: `snake-3d.html` — `#view-level` content

- [ ] **Step 4.1: Define levels data**

20 levels, progressive difficulty. Each level has a target score (lamps to eat), a speed multiplier, and optional constraints:

```javascript
const LEVELS = [
  { num:1,  target:3,  speed:1.0,  label:'Rookie',    speedClass:'speed-slow' },
  { num:2,  target:5,  speed:1.0,  label:'Rookie',    speedClass:'speed-slow' },
  { num:3,  target:7,  speed:1.1,  label:'Trainee',   speedClass:'speed-slow' },
  { num:4,  target:10, speed:1.1,  label:'Trainee',   speedClass:'speed-med' },
  { num:5,  target:12, speed:1.2,  label:'Scout',     speedClass:'speed-med' },
  { num:6,  target:15, speed:1.25, label:'Scout',     speedClass:'speed-med' },
  { num:7,  target:18, speed:1.3,  label:'Agent',     speedClass:'speed-med' },
  { num:8,  target:20, speed:1.35, label:'Agent',     speedClass:'speed-fast' },
  { num:9,  target:22, speed:1.4,  label:'Hunter',    speedClass:'speed-fast' },
  { num:10, target:25, speed:1.45, label:'Hunter',    speedClass:'speed-fast' },
  { num:11, target:28, speed:1.5,  label:'Elite',     speedClass:'speed-fast' },
  { num:12, target:30, speed:1.55, label:'Elite',     speedClass:'speed-fast' },
  { num:13, target:33, speed:1.6,  label:'Phantom',   speedClass:'speed-extreme' },
  { num:14, target:36, speed:1.65, label:'Phantom',   speedClass:'speed-extreme' },
  { num:15, target:40, speed:1.7,  label:'Ghost',     speedClass:'speed-extreme' },
  { num:16, target:44, speed:1.75, label:'Ghost',     speedClass:'speed-extreme' },
  { num:17, target:48, speed:1.8,  label:'Specter',   speedClass:'speed-extreme' },
  { num:18, target:52, speed:1.85, label:'Specter',   speedClass:'speed-extreme' },
  { num:19, target:56, speed:1.9,  label:'Wraith',    speedClass:'speed-max' },
  { num:20, target:60, speed:2.0,  label:'Wraith',    speedClass:'speed-max' },
];
```

- [ ] **Step 4.2: Build level select view**

```javascript
function renderLevelSelect() {
  const highestUnlocked = (Storage.get('level_progress') || 1);
  const view = document.getElementById('view-level');
  view.innerHTML = `
    <header class="fixed top-0 w-full flex items-center gap-4 px-6 py-5 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/15">
      <button onclick="showView('map')" class="text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div>
        <div class="text-xs uppercase tracking-widest font-label" style="color:${selectedMap.borderColor}">${selectedMap.name} — Campaign</div>
        <div class="text-xl font-headline font-bold uppercase">Select Level</div>
      </div>
    </header>
    <div class="pt-24 pb-12 px-6 max-w-lg mx-auto w-full">
      <div class="flex flex-col gap-3" id="level-list"></div>
    </div>
  `;

  const list = document.getElementById('level-list');
  LEVELS.forEach(lvl => {
    const unlocked = lvl.num <= highestUnlocked;
    const card = document.createElement('div');
    card.className = `flex items-center justify-between p-4 rounded-xl border transition-all ${unlocked ? 'cursor-pointer hover:border-primary/40' : 'opacity-40 cursor-not-allowed'}`;
    card.style.cssText = `background:#0f0f18;border-color:rgba(72,71,77,0.25)`;
    card.innerHTML = `
      <div>
        <div class="font-headline font-bold text-base uppercase">Level ${lvl.num} <span style="font-size:11px;color:#76747b;font-weight:400">— ${lvl.label}</span></div>
        <div style="font-size:12px;color:#acaab1;margin-top:2px">Eat ${lvl.target} 🪔 lamps to clear</div>
      </div>
      <div class="flex items-center gap-3">
        ${!unlocked ? '<span class="material-symbols-outlined text-on-surface-variant" style="font-size:18px">lock</span>' : ''}
        <span class="px-3 py-1 rounded-full text-xs font-bold ${speedBadgeClass(lvl.speedClass)}">${lvl.label}</span>
      </div>
    `;
    if (unlocked) {
      card.addEventListener('click', () => {
        selectedLevel = lvl;
        showView('game');
      });
    }
    list.appendChild(card);
  });
}

function speedBadgeClass(sc) {
  const map = {
    'speed-slow': 'bg-primary/15 text-primary',
    'speed-med': 'bg-tertiary/15 text-tertiary',
    'speed-fast': 'bg-amber-400/15 text-amber-400',
    'speed-extreme': 'bg-error/15 text-error',
    'speed-max': 'bg-secondary/15 text-secondary',
  };
  return map[sc] || '';
}
```

- [ ] **Step 4.3: Verify**

From map select (levels mode) → level select shows 20 levels. First level clickable, rest locked initially. Clicking unlocked level transitions to game view placeholder.

- [ ] **Step 4.4: Commit**

```bash
git add snake-3d.html
git commit -m "feat: level select view with 20 levels and lock/unlock system"
```

---

## Task 5: Three.js Scene Setup

**Files:**
- Modify: `snake-3d.html` — Three.js initialization inside `<script>`

- [ ] **Step 5.1: Initialize renderer, camera, scene**

```javascript
// ── THREE.JS SCENE ────────────────────────────────────────────────────────────
let renderer, scene, camera;
let threeInitialized = false;

function initThree() {
  if (threeInitialized) return;

  const gameView = document.getElementById('view-game');
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  gameView.prepend(canvas);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  threeInitialized = true;
}
```

- [ ] **Step 5.2: Apply map environment to scene**

```javascript
const GRID_SIZE = 20;  // 20×20 grid
const CELL = 1;        // 1 unit per cell

function applyMapEnvironment(map) {
  // Clear old scene objects (keep renderer/camera)
  while(scene.children.length > 0) scene.remove(scene.children[0]);

  // Fog
  scene.fog = new THREE.FogExp2(map.fogColor, map.fogDensity);
  scene.background = new THREE.Color(map.fogColor);

  // Ambient light
  scene.add(new THREE.AmbientLight(map.ambientColor, 1.2));

  // Accent point light (map color)
  const accent = new THREE.PointLight(map.accentLight, 3, 50);
  accent.position.set(0, 10, 0);
  scene.add(accent);

  // Secondary fill lights
  const fill1 = new THREE.PointLight(0x334466, 1, 60);
  fill1.position.set(-15, 5, -15);
  scene.add(fill1);
  const fill2 = new THREE.PointLight(0x221133, 0.8, 60);
  fill2.position.set(15, 5, 15);
  scene.add(fill2);

  // Grid floor
  const floorGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
  const floorMat = new THREE.MeshStandardMaterial({
    color: map.floorColor, roughness: 0.9, metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Glowing grid lines
  const gridMat = new THREE.LineBasicMaterial({ color: map.gridColor, transparent: true, opacity: 0.4 });
  const half = GRID_SIZE / 2;
  for (let i = -half; i <= half; i++) {
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-half, 0.01, i), new THREE.Vector3(half, 0.01, i)
    ]);
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, 0.01, -half), new THREE.Vector3(i, 0.01, half)
    ]);
    scene.add(new THREE.Line(hGeo, gridMat));
    scene.add(new THREE.Line(vGeo, gridMat));
  }

  // Arena border walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: map.floorColor, emissive: map.accentLight,
    emissiveIntensity: 0.15, roughness: 0.8, metalness: 0.3
  });
  [-1, 1].forEach(sign => {
    const hw = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE + 0.4, 0.4, 0.2), wallMat);
    hw.position.set(0, 0.2, sign * (half + 0.1));
    scene.add(hw);
    const vw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, GRID_SIZE + 0.4), wallMat);
    vw.position.set(sign * (half + 0.1), 0.2, 0);
    scene.add(vw);
  });

  // Camera position for this map
  setCameraForGame();
}

function setCameraForGame() {
  camera.position.set(0, 18, 16);
  camera.lookAt(0, 0, 0);
}
```

- [ ] **Step 5.3: Verify**

Clicking any map → game view shows a dark 3D scene with a glowing grid floor and border walls. No errors in console.

- [ ] **Step 5.4: Commit**

```bash
git add snake-3d.html
git commit -m "feat: Three.js scene setup with map environment system"
```

---

## Task 6: Snake Engine (Core Game Logic)

**Files:**
- Modify: `snake-3d.html` — snake data model, movement, collision, growth

- [ ] **Step 6.1: Snake state and 3D mesh pool**

```javascript
// ── SNAKE STATE ───────────────────────────────────────────────────────────────
let snake = [];       // [{x, z}] — grid coords
let snakeDir = { x: 1, z: 0 };
let nextDir  = { x: 1, z: 0 };
let snakeMeshes = []; // THREE.Mesh array, parallel to snake[]
let score = 0;
let gameRunning = false;
let gamePaused = false;
let moveTimer = 0;
const BASE_SPEED = 0.2; // seconds per move tick at speed 1.0

// ── SKIN MATERIALS ────────────────────────────────────────────────────────────
function makeSnakeMat(color, emissive, emissiveIntensity = 0.5) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity, roughness: 0.25, metalness: 0.5
  });
}

function getActiveSkin() {
  const id = Storage.get('active_skin') || 'default';
  return SKINS.find(s => s.id === id) || SKINS[0];
}

function buildSnakeMesh(isHead, skin) {
  const geo = new THREE.BoxGeometry(
    isHead ? 0.84 : 0.74,
    isHead ? 0.72 : 0.58,
    isHead ? 0.84 : 0.74
  );
  const col = new THREE.Color(isHead ? skin.colors[0] : skin.colors[1]);
  const emi = new THREE.Color(isHead ? skin.colors[0] : skin.colors[1]);
  const mat = makeSnakeMat(col, emi, isHead ? 0.6 : 0.35);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function initSnake() {
  // Remove old meshes
  snakeMeshes.forEach(m => scene.remove(m));
  snakeMeshes = [];

  const skin = getActiveSkin();
  snake = [
    { x: 0, z: 0 }, { x: -1, z: 0 }, { x: -2, z: 0 },
    { x: -3, z: 0 }, { x: -4, z: 0 }
  ];
  snakeDir = { x: 1, z: 0 };
  nextDir  = { x: 1, z: 0 };

  snake.forEach((seg, i) => {
    const mesh = buildSnakeMesh(i === 0, skin);
    mesh.position.set(seg.x, i === 0 ? 0.44 : 0.35, seg.z);
    scene.add(mesh);
    snakeMeshes.push(mesh);
  });
}
```

- [ ] **Step 6.2: Movement and collision**

```javascript
const HALF = GRID_SIZE / 2 - 1;

function stepSnake() {
  snakeDir = { ...nextDir };
  const head = snake[0];
  let nx = head.x + snakeDir.x;
  let nz = head.z + snakeDir.z;

  // Wall wrap
  if (nx < -HALF) nx = HALF;
  if (nx >  HALF) nx = -HALF;
  if (nz < -HALF) nz = HALF;
  if (nz >  HALF) nz = -HALF;

  // Self collision
  if (snake.some(s => s.x === nx && s.z === nz)) {
    triggerGameOver();
    return;
  }

  // Vine constraint (jungle challenge)
  if (selectedMap?.id === 'jungle' && vineDepth > 0) {
    const limit = HALF - vineDepth;
    if (Math.abs(nx) > limit || Math.abs(nz) > limit) {
      triggerGameOver();
      return;
    }
  }

  snake.unshift({ x: nx, z: nz });

  // Check food
  if (nx === food.x && nz === food.z) {
    score++;
    earnCoins(1);
    spawnFood();
    updateHUD();
    checkLevelComplete();
    spawnTrailParticle(nx, nz);
  } else {
    snake.pop();
    // Remove tail mesh
    const tail = snakeMeshes.pop();
    scene.remove(tail);
  }

  // Prepend new head mesh
  const skin = getActiveSkin();
  const newHead = buildSnakeMesh(true, skin);
  newHead.position.set(nx, 0.44, nz);
  scene.add(newHead);
  snakeMeshes.unshift(newHead);

  // Update remaining meshes to body material
  snakeMeshes.forEach((m, i) => {
    if (i === 0) return;
    const col = new THREE.Color(getTailColor(skin, i, snake.length));
    m.material.color.set(col);
    m.material.emissive.set(col);
    m.material.emissiveIntensity = Math.max(0.1, 0.35 - i * 0.01);
    m.position.set(snake[i].x, 0.35, snake[i].z);
  });
}

function getTailColor(skin, idx, total) {
  const t = idx / total;
  if (skin.colors.length === 2) return lerpHex(skin.colors[0], skin.colors[1], t);
  if (t < 0.5) return lerpHex(skin.colors[0], skin.colors[1], t * 2);
  return lerpHex(skin.colors[1], skin.colors[skin.colors.length-1], (t-0.5)*2);
}

function lerpHex(a, b, t) {
  const ar=parseInt(a.slice(1,3),16), ag=parseInt(a.slice(3,5),16), ab=parseInt(a.slice(5,7),16);
  const br=parseInt(b.slice(1,3),16), bg=parseInt(b.slice(3,5),16), bb=parseInt(b.slice(5,7),16);
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('');
}
```

- [ ] **Step 6.3: Input handling**

```javascript
// Keyboard
document.addEventListener('keydown', e => {
  if (!gameRunning || gamePaused) return;
  const d = snakeDir;
  switch(e.key) {
    case 'ArrowUp':    case 'w': if (d.z !==  1) nextDir = {x:0,z:-1}; break;
    case 'ArrowDown':  case 's': if (d.z !== -1) nextDir = {x:0,z: 1}; break;
    case 'ArrowLeft':  case 'a': if (d.x !==  1) nextDir = {x:-1,z:0}; break;
    case 'ArrowRight': case 'd': if (d.x !== -1) nextDir = {x: 1,z:0}; break;
    case 'Escape': case 'p':     togglePause(); break;
  }
});

// Mobile D-pad (rendered in HUD — see Task 9)
function handleDpad(dir) {
  const d = snakeDir;
  if (dir==='up'    && d.z !==  1) nextDir = {x:0,z:-1};
  if (dir==='down'  && d.z !== -1) nextDir = {x:0,z: 1};
  if (dir==='left'  && d.x !==  1) nextDir = {x:-1,z:0};
  if (dir==='right' && d.x !== -1) nextDir = {x: 1,z:0};
}

// Touch swipe
let touchStart = null;
document.addEventListener('touchstart', e => { touchStart = e.touches[0]; }, {passive:true});
document.addEventListener('touchend', e => {
  if (!touchStart || !gameRunning || gamePaused) return;
  const dx = e.changedTouches[0].clientX - touchStart.clientX;
  const dz = e.changedTouches[0].clientY - touchStart.clientY;
  if (Math.abs(dx) > Math.abs(dz)) handleDpad(dx > 0 ? 'right' : 'left');
  else handleDpad(dz > 0 ? 'down' : 'up');
}, {passive:true});
```

- [ ] **Step 6.4: Verify**

Snake appears in the 3D scene and moves with arrow keys. It wraps at walls, dies on self-collision. Console logs food eaten events. Coins increase on eat.

- [ ] **Step 6.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: snake engine with 3D mesh pool, movement, collision, and input"
```

---

## Task 7: Food — 3D Lamp Model

**Files:**
- Modify: `snake-3d.html` — food spawning, 3D lamp geometry

- [ ] **Step 7.1: Build the lamp from Three.js primitives**

```javascript
let foodGroup = null;
let food = { x: 5, z: 3 };
let foodLight = null;

function buildLamp() {
  const g = new THREE.Group();

  // Base — flat cylinder
  const baseGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.08, 12);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xc47fff, emissive: 0x8c00e5, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.6 });
  g.add(Object.assign(new THREE.Mesh(baseGeo, baseMat), { position: new THREE.Vector3(0,-0.3,0) }));

  // Stem — thin cylinder
  const stemGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.35, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xd966ff, emissive: 0xaa00dd, emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.7 });
  g.add(Object.assign(new THREE.Mesh(stemGeo, stemMat), { position: new THREE.Vector3(0,-0.1,0) }));

  // Shade — inverted cone
  const shadeGeo = new THREE.ConeGeometry(0.3, 0.4, 12, 1, true);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xff79c6, emissive: 0xcc00ff, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.2, side: THREE.DoubleSide });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(0, 0.18, 0);
  shade.rotation.x = Math.PI; // flip so wide end is down
  g.add(shade);

  // Bulb — small sphere inside shade
  const bulbGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2, roughness: 0, metalness: 0 });
  g.add(Object.assign(new THREE.Mesh(bulbGeo, bulbMat), { position: new THREE.Vector3(0,0.1,0) }));

  // Point light inside lamp
  foodLight = new THREE.PointLight(0xdd88ff, 2.5, 8);
  foodLight.position.set(0, 0.1, 0);
  g.add(foodLight);

  return g;
}

function spawnFood() {
  // Remove old
  if (foodGroup) scene.remove(foodGroup);

  // Find empty cell
  let fx, fz;
  do {
    fx = Math.floor(Math.random() * GRID_SIZE) - HALF;
    fz = Math.floor(Math.random() * GRID_SIZE) - HALF;
  } while (snake.some(s => s.x === fx && s.z === fz));

  food = { x: fx, z: fz };
  foodGroup = buildLamp();
  foodGroup.position.set(fx, 0.4, fz);
  scene.add(foodGroup);
}
```

- [ ] **Step 7.2: Animate the lamp (bob + rotate + pulse)**

In the game loop:
```javascript
function animateFood(dt, time) {
  if (!foodGroup) return;
  foodGroup.position.y = 0.4 + Math.sin(time * 0.003) * 0.12;
  foodGroup.rotation.y += dt * 1.2;
  if (foodLight) {
    foodLight.intensity = 2 + Math.sin(time * 0.005) * 0.8;
  }
}
```

- [ ] **Step 7.3: Verify**

A glowing 3D lamp appears on the grid, bobs up and down, rotates, and emits purple light. Snake eating it increments score. New lamp spawns in a different position.

- [ ] **Step 7.4: Commit**

```bash
git add snake-3d.html
git commit -m "feat: 3D lamp food model with bob/rotate animation and point light"
```

---

## Task 8: Skin System + Trail Particles

**Files:**
- Modify: `snake-3d.html` — SKINS array, trail particle system

- [ ] **Step 8.1: Define SKINS array (20 skins)**

Copy the full `SKINS` array verbatim from `snake-preview.html`, preserving all `id`, `name`, `price`, `trail`, `colors`, `glow` fields. Add a `trailColor` field (hex string) for particle color.

- [ ] **Step 8.2: Trail particle system**

```javascript
let trailParticles = []; // [{mesh, life, maxLife}]

function spawnTrailParticle(x, z) {
  const skin = getActiveSkin();
  if (skin.trail === 'No Trail') return;

  const count = skin.trail === 'Star Nebula' || skin.trail === 'Spectrum Burst' ? 8 : 4;

  for (let i = 0; i < count; i++) {
    const geo = skin.trail === 'Fire Sparks' || skin.trail === 'Lava Drips'
      ? new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4)
      : new THREE.BoxGeometry(0.06, 0.06, 0.06);

    let color = skin.glow;
    if (skin.trail === 'Spectrum Burst') color = `hsl(${Math.random()*360},100%,65%)`;
    if (skin.trail === 'Star Nebula')    color = `hsl(${240+Math.random()*80},80%,70%)`;

    const mat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 1.5, transparent: true, opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      x + (Math.random() - 0.5) * 0.6,
      0.3 + Math.random() * 0.4,
      z + (Math.random() - 0.5) * 0.6
    );
    mesh.userData.vel = new THREE.Vector3(
      (Math.random()-0.5)*0.02,
      0.01 + Math.random()*0.03,
      (Math.random()-0.5)*0.02
    );
    scene.add(mesh);
    trailParticles.push({ mesh, life: 0, maxLife: 0.6 + Math.random() * 0.4 });
  }
}

function updateTrailParticles(dt) {
  trailParticles = trailParticles.filter(p => {
    p.life += dt;
    const t = p.life / p.maxLife;
    p.mesh.position.addScaledVector(p.mesh.userData.vel, 1);
    p.mesh.material.opacity = 1 - t;
    p.mesh.scale.setScalar(1 - t * 0.5);
    if (p.life >= p.maxLife) { scene.remove(p.mesh); return false; }
    return true;
  });
}
```

- [ ] **Step 8.3: Verify**

Equip "Inferno" skin (manually set localStorage `snake3d_active_skin = "inferno"`). Eat food — orange/red particles burst out. Equip "Galaxy" — multi-colored star particles appear.

- [ ] **Step 8.4: Commit**

```bash
git add snake-3d.html
git commit -m "feat: skin system with 20 skins and trail particle effects"
```

---

## Task 9: Map Challenges

**Files:**
- Modify: `snake-3d.html` — challenge state + per-map mechanics

- [ ] **Step 9.1: Challenge state variables**

```javascript
// Challenge state (reset each game)
let challengeTimer = 0;
let challengeActive = false;  // for sandstorm dark mode
let blackHoleMesh = null;
let blackHolePos = { x: 0, z: 0 };
let vineDepth = 0;            // cells consumed from each edge
let vineMeshes = [];
let eruptions = [];           // [{x, z, mesh, timer, state:'warn'|'hot'}]
let trafficLines = [];        // [{mesh, axis, pos, speed, dir}]
let currentDir = null;        // tidal current {x, z} or null
```

- [ ] **Step 9.2: Per-challenge update (called each game tick)**

Implement `updateChallenge(dt, tickCount)` — a switch on `selectedMap.id`:

**Ocean — Tidal Current:**
```javascript
case 'ocean':
  challengeTimer += dt;
  if (challengeTimer >= 8) {
    challengeTimer = 0;
    // Pick random cardinal direction
    const dirs = [{x:1,z:0},{x:-1,z:0},{x:0,z:1},{x:0,z:-1}];
    currentDir = dirs[Math.floor(Math.random()*4)];
    showChallengeBanner('🌊 Current!');
    // Apply push after 0.5s delay
    setTimeout(() => {
      if (!gameRunning) return;
      const h = snake[0];
      const nx = wrap(h.x + currentDir.x);
      const nz = wrap(h.z + currentDir.z);
      if (!snake.some(s=>s.x===nx&&s.z===nz)) {
        forceSnakeStep(currentDir);
      }
    }, 500);
  }
  break;
```

**Earth — Seismic Shift:**
```javascript
case 'earth':
  challengeTimer += dt;
  if (challengeTimer >= 12) {
    challengeTimer = 0;
    shakeCamera(0.4);
    showChallengeBanner('🌍 Earthquake!');
    spawnFood(); // teleport food
  }
  break;
```

**Moon — Low Gravity (handled in stepSnake):**
```javascript
// In stepSnake(), after normal step: if map is moon, queue one extra step in same old dir
case 'moon':
  // Implemented in stepSnake: moonSlideQueued = true after every turn
  break;
```

**Space — Black Hole:**
```javascript
case 'space':
  // Black hole spawns at game start at random position away from snake
  // Each tick: if snake head within 3 cells, apply pull toward black hole
  if (blackHoleMesh) {
    const h = snake[0];
    const dx = blackHolePos.x - h.x, dz = blackHolePos.z - h.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < 3.5 && tickCount % 2 === 0) {
      // Pull: push nextDir toward black hole
      const pdx = Math.abs(dx) > Math.abs(dz) ? Math.sign(dx) : 0;
      const pdz = Math.abs(dz) > Math.abs(dx) ? Math.sign(dz) : 0;
      if (!(pdx === -snakeDir.x && pdz === -snakeDir.z)) {
        nextDir = { x: pdx, z: pdz };
        showChallengeBanner('🕳️ Gravity pull!');
      }
    }
    blackHoleMesh.rotation.y += dt * 2;
  }
  break;
```

**Desert — Sandstorm:**
```javascript
case 'desert':
  challengeTimer += dt;
  if (challengeTimer >= 15) {
    challengeTimer = 0;
    triggerSandstorm(4); // duration seconds
  }
  break;

function triggerSandstorm(duration) {
  showChallengeBanner('🏜️ Sandstorm!');
  scene.fog.density = 0.25;
  setTimeout(() => { if(scene) scene.fog.density = selectedMap.fogDensity; }, duration * 1000);
}
```

**Arctic — Black Ice (handled in stepSnake):**
```javascript
// In stepSnake(): before applying nextDir, delay it by 1 tick if map is arctic
// Store pendingDir and apply it next tick instead of this tick
```

**Lava — Eruption Zones:**
```javascript
case 'lava':
  challengeTimer += dt;
  if (challengeTimer >= 3 && eruptions.length < 4) {
    challengeTimer = 0;
    spawnEruption();
  }
  eruptions.forEach(e => updateEruption(e, dt));
  break;

function spawnEruption() {
  let ex, ez;
  do {
    ex = Math.floor(Math.random() * GRID_SIZE) - HALF;
    ez = Math.floor(Math.random() * GRID_SIZE) - HALF;
  } while(snake.some(s=>s.x===ex&&s.z===ez) || (ex===food.x&&ez===food.z));

  const geo = new THREE.BoxGeometry(0.9, 0.15, 0.9);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.8, transparent: true, opacity: 0.7 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(ex, 0.08, ez);
  scene.add(mesh);
  eruptions.push({ x: ex, z: ez, mesh, timer: 0, state: 'warn' });
}

function updateEruption(e, dt) {
  e.timer += dt;
  if (e.state === 'warn' && e.timer >= 2) {
    e.state = 'hot';
    e.mesh.material.color.set(0xff0000);
    e.mesh.material.emissiveIntensity = 2;
    // Check if snake is on it
    if (snake[0].x === e.x && snake[0].z === e.z) triggerGameOver();
  }
  if (e.state === 'hot' && e.timer >= 5) {
    scene.remove(e.mesh);
    eruptions.splice(eruptions.indexOf(e), 1);
    return;
  }
  // Flash warning
  if (e.state === 'warn') {
    e.mesh.material.opacity = 0.4 + Math.sin(e.timer * 8) * 0.3;
  }
  // Continuous death check while hot
  if (e.state === 'hot' && snake.some(s => s.x === e.x && s.z === e.z)) {
    triggerGameOver();
  }
}
```

**City — Neon Traffic:**
```javascript
case 'city':
  trafficLines.forEach(t => {
    t.pos += t.speed * dt * (1 + score * 0.02);
    if (t.pos > HALF + 1) t.pos = -HALF - 1;
    t.mesh.position[t.axis] = t.pos;
    // Check collision with snake head
    const h = snake[0];
    const onAxis = t.axis === 'x' ? Math.abs(h.z - t.fixedCoord) < 0.7 : Math.abs(h.x - t.fixedCoord) < 0.7;
    const atPos  = t.axis === 'x' ? Math.abs(h.x - t.pos) < 0.7 : Math.abs(h.z - t.pos) < 0.7;
    if (onAxis && atPos) triggerGameOver();
  });
  break;
```

**Jungle — Creeping Vines:**
```javascript
case 'jungle':
  challengeTimer += dt;
  if (challengeTimer >= 20 && vineDepth < HALF - 3) {
    challengeTimer = 0;
    vineDepth++;
    showChallengeBanner('🌿 Vines closing in!');
    drawVines();
  }
  break;

function drawVines() {
  vineMeshes.forEach(m => scene.remove(m));
  vineMeshes = [];
  const limit = HALF - vineDepth + 0.5;
  const mat = new THREE.MeshStandardMaterial({ color: 0x003300, emissive: 0x00ff44, emissiveIntensity: 0.3 });
  // 4 walls of vines
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([nx,nz]) => {
    const pos = (nx !== 0 ? nx : nz) * limit;
    const geo = new THREE.BoxGeometry(
      nz !== 0 ? GRID_SIZE : 1, 1.5, nx !== 0 ? GRID_SIZE : 1
    );
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.position.set(nx*limit, 0.75, nz*limit);
    scene.add(mesh);
    vineMeshes.push(mesh);
  });
}
```

- [ ] **Step 9.3: Init challenges at game start**

```javascript
function initChallenges() {
  challengeTimer = 0; challengeActive = false;
  vineDepth = 0; eruptions = []; trafficLines = [];
  vineMeshes.forEach(m => scene.remove(m)); vineMeshes = [];
  if (blackHoleMesh) { scene.remove(blackHoleMesh); blackHoleMesh = null; }

  switch(selectedMap?.id) {
    case 'space':
      blackHolePos = { x: Math.floor(Math.random()*6)-3, z: Math.floor(Math.random()*6)-3 };
      const bhGeo = new THREE.TorusGeometry(0.6, 0.12, 8, 24);
      const bhMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x6644ff, emissiveIntensity: 2, roughness: 0 });
      blackHoleMesh = new THREE.Mesh(bhGeo, bhMat);
      blackHoleMesh.position.set(blackHolePos.x, 0.5, blackHolePos.z);
      blackHoleMesh.rotation.x = Math.PI / 2;
      scene.add(blackHoleMesh);
      break;

    case 'city':
      // Spawn 3 traffic lines
      for (let i = 0; i < 3; i++) {
        const axis = i % 2 === 0 ? 'x' : 'z';
        const fixedCoord = Math.floor(Math.random()*8) - 4;
        const speed = 3 + i * 1.5;
        const geo = new THREE.BoxGeometry(axis==='x'?0.3:GRID_SIZE, 0.15, axis==='z'?0.3:GRID_SIZE);
        const colors = [0x00e5ff, 0xc47fff, 0xff1a2e];
        const mat = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        if (axis === 'x') mesh.position.set(-HALF, 0.1, fixedCoord);
        else mesh.position.set(fixedCoord, 0.1, -HALF);
        scene.add(mesh);
        trafficLines.push({ mesh, axis, pos: -HALF, fixedCoord, speed, dir: 1 });
      }
      break;
  }
}
```

- [ ] **Step 9.4: Verify each challenge**

Test each map — confirm:
- Ocean: snake gets pushed at 8s intervals
- Earth: food teleports on screen shake
- Moon: snake slides 1 extra cell after turns
- Space: black hole torus visible, pulls snake when near
- Desert: fog thickens to near-black every 15s
- Arctic: turn delay is noticeable at speed
- Lava: warning tiles flash then go hot
- City: traffic lines sweep across; collision kills
- Jungle: vine walls close in every 20s

- [ ] **Step 9.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: all 9 map challenges implemented (tidal, seismic, gravity, black hole, sandstorm, ice, eruptions, traffic, vines)"
```

---

## Task 10: Game HUD + Overlays

**Files:**
- Modify: `snake-3d.html` — HUD HTML overlay on game view

- [ ] **Step 10.1: HUD HTML (overlaid on canvas)**

```html
<!-- Inside #view-game, above canvas -->
<div id="game-hud" style="position:absolute;inset:0;z-index:20;pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;padding:16px">

  <!-- Top bar -->
  <div style="display:flex;justify-content:space-between;align-items:center">
    <button onclick="showView('map')" style="pointer-events:all;background:rgba(0,0,0,0.5);border:1px solid rgba(72,71,77,0.3);border-radius:8px;padding:8px 12px;color:#acaab1;cursor:pointer">
      <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>
    </button>
    <div style="display:flex;gap:20px;align-items:center">
      <div>
        <div style="font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#76747b">SCORE</div>
        <div id="hud-score" style="font-size:22px;font-weight:800;color:#8eff71;font-family:'Space Grotesk'">0</div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#76747b">LAMPS</div>
        <div id="hud-coins" style="font-size:22px;font-weight:800;color:#c47fff;font-family:'Space Grotesk'">0</div>
      </div>
      <div id="hud-level-wrap" style="display:none">
        <div style="font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#76747b">GOAL</div>
        <div id="hud-target" style="font-size:22px;font-weight:800;color:#8ff5ff;font-family:'Space Grotesk'">0</div>
      </div>
    </div>
    <button id="hud-pause" onclick="togglePause()" style="pointer-events:all;background:rgba(0,0,0,0.5);border:1px solid rgba(72,71,77,0.3);border-radius:8px;padding:8px 16px;color:#acaab1;font-size:13px;cursor:pointer">PAUSE</button>
  </div>

  <!-- Challenge banner (center, fades out) -->
  <div id="challenge-banner" style="text-align:center;opacity:0;transition:opacity 0.3s">
    <span id="challenge-banner-text" style="background:rgba(0,0,0,0.8);border:1px solid rgba(142,255,113,0.3);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8eff71"></span>
  </div>

  <!-- Mobile D-pad (bottom center, only on touch) -->
  <div id="dpad" style="display:none;justify-content:center;pointer-events:all">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr 1fr;gap:4px;width:144px">
      <div></div>
      <button class="dpad-btn" onclick="handleDpad('up')">▲</button>
      <div></div>
      <button class="dpad-btn" onclick="handleDpad('left')">◀</button>
      <div></div>
      <button class="dpad-btn" onclick="handleDpad('right')">▶</button>
      <div></div>
      <button class="dpad-btn" onclick="handleDpad('down')">▼</button>
      <div></div>
    </div>
  </div>
</div>

<!-- Pause overlay -->
<div id="overlay-pause" class="hidden" style="position:absolute;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.75)">
  <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px">
    <div style="font-family:'Space Grotesk';font-size:36px;font-weight:900;text-transform:uppercase;color:#f8f5fd">PAUSED</div>
    <button onclick="togglePause()" style="background:#8eff71;color:#064200;padding:12px 32px;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;text-transform:uppercase">RESUME</button>
    <button onclick="showView('map')" style="background:rgba(255,255,255,0.1);color:#acaab1;padding:12px 32px;border:1px solid rgba(72,71,77,0.3);border-radius:8px;font-size:14px;cursor:pointer">QUIT</button>
  </div>
</div>

<!-- Game Over overlay -->
<div id="overlay-gameover" style="position:absolute;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.82)">
  <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px">
    <div style="font-family:'Space Grotesk';font-size:32px;font-weight:900;text-transform:uppercase;color:#ff7351">GAME OVER</div>
    <div id="go-score" style="font-size:56px;font-weight:900;color:#8eff71;font-family:'Space Grotesk'">0</div>
    <div id="go-coins" style="font-size:14px;color:#acaab1">+ <span id="go-coins-val">0</span> 🪔 lamps earned</div>
    <div id="go-record" style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#ffdd00;display:none">NEW RECORD!</div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button onclick="restartGame()" style="background:#8eff71;color:#064200;padding:12px 28px;border:none;border-radius:8px;font-weight:700;cursor:pointer;text-transform:uppercase">RETRY</button>
      <button onclick="showView('map')" style="background:rgba(255,255,255,0.08);color:#acaab1;padding:12px 28px;border:1px solid rgba(72,71,77,0.3);border-radius:8px;cursor:pointer">MAP SELECT</button>
    </div>
  </div>
</div>

<!-- Level Complete overlay -->
<div id="overlay-levelcomplete" style="position:absolute;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.82)">
  <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px">
    <div style="font-family:'Space Grotesk';font-size:32px;font-weight:900;text-transform:uppercase;color:#ffdd00">LEVEL COMPLETE!</div>
    <div id="lc-level" style="font-size:20px;color:#acaab1"></div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button id="lc-next" onclick="nextLevel()" style="background:#8eff71;color:#064200;padding:12px 28px;border:none;border-radius:8px;font-weight:700;cursor:pointer;text-transform:uppercase">NEXT LEVEL</button>
      <button onclick="showView('map')" style="background:rgba(255,255,255,0.08);color:#acaab1;padding:12px 28px;border:1px solid rgba(72,71,77,0.3);border-radius:8px;cursor:pointer">MAP SELECT</button>
    </div>
  </div>
</div>
```

- [ ] **Step 10.2: HUD update functions**

```javascript
function updateHUD() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-coins').textContent = Storage.get('coins') || 0;
  if (selectedLevel) {
    document.getElementById('hud-level-wrap').style.display = '';
    document.getElementById('hud-target').textContent = `${score}/${selectedLevel.target}`;
  }
}

let bannerTimeout;
function showChallengeBanner(text) {
  const el = document.getElementById('challenge-banner');
  document.getElementById('challenge-banner-text').textContent = text;
  el.style.opacity = '1';
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => el.style.opacity = '0', 2500);
}

function togglePause() {
  gamePaused = !gamePaused;
  document.getElementById('overlay-pause').style.display = gamePaused ? 'flex' : 'none';
}

function triggerGameOver() {
  gameRunning = false;
  const best = Storage.get('best_' + selectedMap.id) || 0;
  const isRecord = score > best;
  if (isRecord) Storage.set('best_' + selectedMap.id, score);
  document.getElementById('go-score').textContent = score;
  document.getElementById('go-coins-val').textContent = score;
  document.getElementById('go-record').style.display = isRecord ? '' : 'none';
  document.getElementById('overlay-gameover').style.display = 'flex';
}

function checkLevelComplete() {
  if (!selectedLevel || score < selectedLevel.target) return;
  gameRunning = false;
  const next = LEVELS.find(l => l.num === selectedLevel.num + 1);
  const progress = Storage.get('level_progress') || 1;
  if (selectedLevel.num >= progress) Storage.set('level_progress', selectedLevel.num + 1);
  document.getElementById('lc-level').textContent = `Level ${selectedLevel.num} cleared!`;
  document.getElementById('lc-next').style.display = next ? '' : 'none';
  document.getElementById('overlay-levelcomplete').style.display = 'flex';
}

function nextLevel() {
  selectedLevel = LEVELS.find(l => l.num === selectedLevel.num + 1);
  if (selectedLevel) restartGame();
  else showView('map');
}
```

- [ ] **Step 10.3: Show D-pad on touch devices**

```javascript
if ('ontouchstart' in window) {
  document.getElementById('dpad').style.display = 'flex';
}
```

CSS for `.dpad-btn`:
```css
.dpad-btn {
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(72,71,77,0.4);
  border-radius: 8px;
  color: rgba(248,245,253,0.6);
  font-size: 16px;
  cursor: pointer;
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.1s;
}
.dpad-btn:active { background: rgba(142,255,113,0.2); color: #8eff71; }
```

- [ ] **Step 10.4: Verify**

Score increments when eating. Pause button works. Game over overlay shows score + retry. Level complete shows when target reached. D-pad visible on mobile.

- [ ] **Step 10.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: game HUD with score, coins, pause, game over, and level complete overlays"
```

---

## Task 11: localStorage + Coin System

**Files:**
- Modify: `snake-3d.html` — Storage helper, coin earning, persistence

- [ ] **Step 11.1: Storage helper**

```javascript
const Storage = {
  prefix: 'snake3d_',
  get(key)      { try { return JSON.parse(localStorage.getItem(this.prefix+key)); } catch { return null; } },
  set(key, val) { localStorage.setItem(this.prefix+key, JSON.stringify(val)); },
  del(key)      { localStorage.removeItem(this.prefix+key); }
};
```

Keys used:
- `coins` — total lamps earned (integer)
- `unlocked` — array of skin IDs (e.g. `["default","phantom"]`)
- `active_skin` — currently equipped skin ID
- `friends` — `[{name, score, skinId, addedAt}]`
- `best_{mapId}` — high score per map
- `level_progress` — highest unlocked level number

- [ ] **Step 11.2: Coin functions**

```javascript
function earnCoins(n) {
  const cur = Storage.get('coins') || 0;
  Storage.set('coins', cur + n);
  updateHUD();
}

function spendCoins(n) {
  const cur = Storage.get('coins') || 0;
  if (cur < n) return false;
  Storage.set('coins', cur - n);
  return true;
}

function unlockSkin(id) {
  const arr = Storage.get('unlocked') || ['default'];
  if (!arr.includes(id)) arr.push(id);
  Storage.set('unlocked', arr);
}

function equipSkin(id) {
  Storage.set('active_skin', id);
}

function isSkinUnlocked(id) {
  const arr = Storage.get('unlocked') || ['default'];
  return arr.includes(id);
}
```

- [ ] **Step 11.3: Initialize defaults on first load**

```javascript
function initStorage() {
  if (Storage.get('unlocked') === null) Storage.set('unlocked', ['default']);
  if (Storage.get('active_skin') === null) Storage.set('active_skin', 'default');
  if (Storage.get('coins') === null) Storage.set('coins', 0);
  if (Storage.get('level_progress') === null) Storage.set('level_progress', 1);
  if (Storage.get('friends') === null) Storage.set('friends', []);
}
initStorage();
```

- [ ] **Step 11.4: Verify**

Play a game, eat 5 lamps. Reload page — coins persist. Check localStorage in DevTools.

- [ ] **Step 11.5: Commit**

```bash
git add snake-3d.html
git commit -m "feat: localStorage persistence for coins, skins, friends, and progress"
```

---

## Task 12: Store Panel

**Files:**
- Modify: `snake-3d.html` — `#store-drawer` content

- [ ] **Step 12.1: Render store panel**

```javascript
function renderStore() {
  const coins = Storage.get('coins') || 0;
  const activeSkin = Storage.get('active_skin') || 'default';
  const drawer = document.getElementById('store-drawer');
  drawer.innerHTML = `
    <div style="padding:24px;border-bottom:1px solid rgba(72,71,77,0.3);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;letter-spacing:.2em;color:#8eff71;text-transform:uppercase">Skin Shop</div>
        <div style="font-size:22px;font-weight:900;font-family:'Space Grotesk';text-transform:uppercase">Store</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:20px;font-weight:700;color:#c47fff">🪔 ${coins}</div>
        <button onclick="closePanel('store')" style="background:none;border:none;color:#76747b;cursor:pointer;font-size:20px">✕</button>
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px" id="store-skin-list"></div>
  `;

  const list = document.getElementById('store-skin-list');
  SKINS.forEach(skin => {
    const unlocked = isSkinUnlocked(skin.id);
    const equipped = skin.id === activeSkin;
    const canAfford = (Storage.get('coins') || 0) >= skin.price;

    const row = document.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;border:1px solid ${unlocked ? skin.glow+'33' : 'rgba(72,71,77,0.2)'};background:${equipped ? skin.glow+'11' : '#0f0f18'};cursor:${unlocked||canAfford?'pointer':'default'}`;

    // Skin color preview strip
    const strip = document.createElement('div');
    strip.style.cssText = `width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,${skin.colors.join(',')});flex-shrink:0;box-shadow:0 0 12px ${skin.glow}55`;
    row.appendChild(strip);

    // Info
    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';
    info.innerHTML = `
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${skin.glow}">${skin.name}</div>
      <div style="font-size:10px;color:#76747b;margin-top:1px">${skin.trail}</div>
    `;
    row.appendChild(info);

    // Action button
    const btn = document.createElement('button');
    btn.style.cssText = `border:none;border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;flex-shrink:0`;
    if (equipped) {
      btn.textContent = 'EQUIPPED';
      btn.style.cssText += `background:${skin.glow}22;color:${skin.glow};border:1px solid ${skin.glow}44;`;
    } else if (unlocked) {
      btn.textContent = 'EQUIP';
      btn.style.cssText += `background:${skin.glow};color:#000;`;
      btn.onclick = () => { equipSkin(skin.id); renderStore(); };
    } else if (skin.price === 0) {
      // Already unlocked by default
      btn.textContent = 'EQUIP';
      btn.style.cssText += `background:${skin.glow};color:#000;`;
      btn.onclick = () => { unlockSkin(skin.id); equipSkin(skin.id); renderStore(); };
    } else {
      btn.textContent = `🪔 ${skin.price}`;
      btn.style.cssText += canAfford
        ? `background:rgba(255,255,255,0.1);color:#f8f5fd;border:1px solid rgba(72,71,77,0.4);`
        : `background:rgba(255,255,255,0.04);color:#76747b;cursor:not-allowed;border:1px solid rgba(72,71,77,0.2);`;
      if (canAfford) {
        btn.onclick = () => {
          if (spendCoins(skin.price)) { unlockSkin(skin.id); equipSkin(skin.id); renderStore(); }
        };
      }
    }
    row.appendChild(btn);
    list.appendChild(row);
  });
}
```

Call `renderStore()` inside `openPanel('store')`.

- [ ] **Step 12.2: Verify**

Open store → 20 skins listed. Default is equipped. Earn coins by playing, then buy a skin. Equip it — snake changes color in next game. Can't buy if insufficient coins (button grayed out).

- [ ] **Step 12.3: Commit**

```bash
git add snake-3d.html
git commit -m "feat: store panel with 20 skins, coin purchase, and equip system"
```

---

## Task 13: Friends Panel

**Files:**
- Modify: `snake-3d.html` — `#friends-drawer` content

- [ ] **Step 13.1: Render friends panel**

```javascript
function renderFriends() {
  const friends = (Storage.get('friends') || []).sort((a,b) => b.score - a.score);
  const myBest = Math.max(...Object.keys(localStorage)
    .filter(k => k.startsWith('snake3d_best_'))
    .map(k => JSON.parse(localStorage[k]) || 0), 0);

  const drawer = document.getElementById('friends-drawer');
  drawer.innerHTML = `
    <div style="padding:24px;border-bottom:1px solid rgba(72,71,77,0.3);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;letter-spacing:.2em;color:#8eff71;text-transform:uppercase">Social</div>
        <div style="font-size:22px;font-weight:900;font-family:'Space Grotesk';text-transform:uppercase">Friends</div>
      </div>
      <button onclick="closePanel('friends')" style="background:none;border:none;color:#76747b;cursor:pointer;font-size:20px">✕</button>
    </div>

    <!-- Add friend form -->
    <div style="padding:16px;border-bottom:1px solid rgba(72,71,77,0.2)">
      <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#76747b;margin-bottom:8px">Add Friend</div>
      <div style="display:flex;gap:8px">
        <input id="friend-name" placeholder="Friend's name" style="flex:1;background:#1f1f26;border:1px solid rgba(72,71,77,0.4);border-radius:8px;padding:8px 12px;color:#f8f5fd;font-size:13px;outline:none"/>
        <input id="friend-score" placeholder="Best score" type="number" style="width:80px;background:#1f1f26;border:1px solid rgba(72,71,77,0.4);border-radius:8px;padding:8px 12px;color:#f8f5fd;font-size:13px;outline:none"/>
        <button onclick="addFriend()" style="background:#8eff71;color:#064200;border:none;border-radius:8px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer">ADD</button>
      </div>
    </div>

    <!-- Leaderboard -->
    <div style="flex:1;overflow-y:auto;padding:12px" id="friends-list"></div>
  `;

  const list = document.getElementById('friends-list');

  // My entry first
  const myEntry = document.createElement('div');
  myEntry.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:rgba(142,255,113,0.07);border:1px solid rgba(142,255,113,0.2);margin-bottom:8px';
  myEntry.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;background:#8eff7122;display:flex;align-items:center;justify-content:center;font-size:16px">👤</div>
    <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#8eff71">You</div><div style="font-size:11px;color:#76747b">Personal best</div></div>
    <div style="font-size:16px;font-weight:700;color:#8eff71">🪔 ${myBest}</div>
  `;
  list.appendChild(myEntry);

  if (friends.length === 0) {
    list.innerHTML += `<div style="text-align:center;color:#76747b;font-size:13px;padding:24px">No friends yet — add one above!</div>`;
    return;
  }

  friends.forEach((f, i) => {
    const skin = SKINS.find(s => s.id === f.skinId) || SKINS[0];
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:#0f0f18;border:1px solid rgba(72,71,77,0.2);margin-bottom:8px';
    row.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:#76747b;width:20px;text-align:center">#${i+1}</div>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${skin.colors.join(',')});box-shadow:0 0 8px ${skin.glow}44;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:#f8f5fd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
        <div style="font-size:10px;color:#76747b">${skin.name} skin</div>
      </div>
      <div style="font-size:16px;font-weight:700;color:#c47fff">🪔 ${f.score}</div>
      <button onclick="removeFriend(${i})" style="background:none;border:none;color:#76747b;cursor:pointer;font-size:14px;padding:4px" title="Remove">✕</button>
    `;
    list.appendChild(row);
  });
}

function addFriend() {
  const name = document.getElementById('friend-name').value.trim();
  const score = parseInt(document.getElementById('friend-score').value) || 0;
  if (!name) return;
  const friends = Storage.get('friends') || [];
  friends.push({ name, score, skinId: 'default', addedAt: Date.now() });
  Storage.set('friends', friends);
  renderFriends();
}

function removeFriend(idx) {
  const friends = Storage.get('friends') || [];
  friends.splice(idx, 1);
  Storage.set('friends', friends);
  renderFriends();
}
```

- [ ] **Step 13.2: Verify**

Open friends panel → shows "You" with personal best. Add a friend with name + score → appears in sorted leaderboard. Remove friend → gone. Persists after reload.

- [ ] **Step 13.3: Commit**

```bash
git add snake-3d.html
git commit -m "feat: friends panel with local leaderboard, add/remove, and skin display"
```

---

## Task 14: Game Loop + Camera + Polish

**Files:**
- Modify: `snake-3d.html` — main `requestAnimationFrame` loop, camera orbit, polish

- [ ] **Step 14.1: Main game loop**

```javascript
let gameRAF;
let lastTime = 0;
let tickCount = 0;
let arcticPendingDir = null;
let moonSlideQueued = false;

function startGame() {
  initThree();
  applyMapEnvironment(selectedMap);
  initSnake();
  initChallenges();
  spawnFood();
  score = 0;
  moveTimer = 0;
  tickCount = 0;
  gameRunning = true;
  gamePaused = false;

  // Hide all overlays
  ['pause','gameover','levelcomplete'].forEach(id =>
    document.getElementById('overlay-' + id.replace('gameover','game-over').replace('levelcomplete','level-complete') || 'overlay-' + id).style.display = 'none'
  );

  updateHUD();
  if (gameRAF) cancelAnimationFrame(gameRAF);
  lastTime = 0;
  gameRAF = requestAnimationFrame(gameLoop);
}

function restartGame() {
  document.getElementById('overlay-gameover').style.display = 'none';
  document.getElementById('overlay-levelcomplete').style.display = 'none';
  startGame();
}

function gameLoop(time) {
  if (currentView !== 'game') return;
  gameRAF = requestAnimationFrame(gameLoop);

  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  if (gamePaused || !gameRunning) {
    renderer.render(scene, camera);
    return;
  }

  // Move tick
  const speed = selectedLevel ? BASE_SPEED / selectedLevel.speed : BASE_SPEED;
  moveTimer += dt;
  if (moveTimer >= speed) {
    moveTimer = 0;
    tickCount++;

    // Arctic black ice: delay turn by 1 tick
    if (selectedMap?.id === 'arctic') {
      if (arcticPendingDir) {
        snakeDir = arcticPendingDir;
        arcticPendingDir = null;
      } else if (nextDir.x !== snakeDir.x || nextDir.z !== snakeDir.z) {
        arcticPendingDir = { ...nextDir };
        // Skip applying the turn this tick
      }
    }

    stepSnake();

    // Moon: slide 1 extra step in old direction
    if (selectedMap?.id === 'moon' && moonSlideQueued) {
      moonSlideQueued = false;
      stepSnake();
    }
    if (selectedMap?.id === 'moon') moonSlideQueued = true;

    updateChallenge(speed, tickCount);
  }

  // Animate food lamp
  animateFood(dt, time);

  // Update trail particles
  updateTrailParticles(dt);

  // Gentle camera orbit (free play only, not levels)
  if (!selectedLevel) {
    const camAngle = time * 0.00008;
    camera.position.x = Math.sin(camAngle) * 18;
    camera.position.z = Math.cos(camAngle) * 16;
    camera.position.y = 17 + Math.sin(camAngle * 0.5) * 2;
    camera.lookAt(0, 0, 0);
  }

  // Head glow light tracks snake head
  const headGlow = scene.children.find(c => c.isPointLight && c !== foodLight && c.intensity > 2);
  if (headGlow && snake.length > 0) {
    const skin = getActiveSkin();
    headGlow.color.set(skin.glow);
    headGlow.position.set(snake[0].x, 5, snake[0].z);
  }

  renderer.render(scene, camera);
}
```

- [ ] **Step 14.2: Camera shake helper (used by Earth challenge)**

```javascript
function shakeCamera(duration) {
  const origPos = camera.position.clone();
  const startTime = performance.now();
  function shake() {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) { camera.position.copy(origPos); return; }
    const intensity = (1 - elapsed / duration) * 0.3;
    camera.position.x = origPos.x + (Math.random()-0.5) * intensity;
    camera.position.y = origPos.y + (Math.random()-0.5) * intensity;
    requestAnimationFrame(shake);
  }
  shake();
}
```

- [ ] **Step 14.3: Head glow point light (added during scene init)**

In `applyMapEnvironment()`, add a head-tracking light:
```javascript
const headLight = new THREE.PointLight(0x8eff71, 3, 15);
headLight.position.set(0, 5, 0);
scene.add(headLight);
```

- [ ] **Step 14.4: Stat bar on home page**

Wire the "Best Length", "Global Rank" etc. stats in the home view to real localStorage data:
```javascript
function updateHomeStats() {
  const allBests = MAPS.map(m => Storage.get('best_' + m.id) || 0);
  const myBest = Math.max(...allBests, 0);
  document.getElementById('stat-best-length').textContent = myBest;
  document.getElementById('stat-coins').textContent = Storage.get('coins') || 0;
}
```

Add `id="stat-best-length"` and `id="stat-coins"` to the relevant spans in the home view HUD. Call `updateHomeStats()` inside `showView('home')`.

- [ ] **Step 14.5: Final integration check**

- [ ] Full game loop: home → free play → ocean map → game starts → eat lamps → coins earn → game over → retry
- [ ] Full levels loop: home → levels → moon → level 1 → eat 3 lamps → level complete → level 2 unlocked
- [ ] Store: earn 25 coins → buy Ocean skin → equip → snake turns teal in next game
- [ ] Friends: add friend → appears in leaderboard → remove → gone
- [ ] All 9 map challenges fire correctly
- [ ] Snake skin trail particles appear on eat
- [ ] D-pad visible on mobile

- [ ] **Step 14.6: Commit**

```bash
git add snake-3d.html
git commit -m "feat: complete game loop, camera, head glow, challenge integration, and polish"
```

---

## Task 15: Final Cleanup

**Files:**
- Modify: `snake-3d.html`
- Delete: `snake-3d-test.html`, `snake-preview.html` (or keep as reference — don't ship)

- [ ] **Step 15.1: Remove test/preview files from git tracking**

```bash
git rm snake-3d-test.html snake-preview.html
```

- [ ] **Step 15.2: Verify file opens with zero console errors**

Open `snake-3d.html` in browser. Console must show 0 errors. Test on Chrome and Firefox.

- [ ] **Step 15.3: Add link in MMKL dashboard**

In `mmkl-dashboard.html`, update the Snake card href from `#` to `./snake-3d.html`.

- [ ] **Step 15.4: Final commit**

```bash
git add -A
git commit -m "feat: Snake 3D complete — standalone game with 9 maps, 20 skins, store, and friends"
```

---

## Summary

| Task | What ships |
|------|-----------|
| 1 | HTML skeleton + view router |
| 2 | Home view + realistic background snake |
| 3 | Map select view (9 maps + thumbnails + challenges) |
| 4 | Level select (20 levels, lock/unlock) |
| 5 | Three.js scene + map environments |
| 6 | Snake engine (movement, collision, mesh pool) |
| 7 | 3D lamp food + bob/pulse animation |
| 8 | 20 skins + trail particles |
| 9 | All 9 map challenges |
| 10 | HUD + pause + game over + level complete |
| 11 | localStorage (coins, skins, friends, progress) |
| 12 | Store panel (buy/equip skins) |
| 13 | Friends panel (add/remove/leaderboard) |
| 14 | Game loop + camera orbit + polish |
| 15 | Cleanup + MMKL link |
