# Snake — Neon Cyberpunk 3D Redesign

**Date:** 2026-03-22
**File:** `C:\Users\m7md5\Projects\snake\index.html`
**Scope:** Full UI redesign — all screens. Zero gameplay changes.

---

## Summary

Redesign the standalone snake game from its current flat dark aesthetic into an interactive Neon Cyberpunk 3D experience. The game canvas is replaced with a Three.js WebGL renderer. All menu screens are redesigned with CSS neon glassmorphism, perspective grid floors, and animated backgrounds. Every one of the 9 maps gets its own neon color palette that propagates to the snake, grid, glow, HUD, and food.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Renderer | Three.js r165 (CDN) | True 3D geometry, real lighting, extruded blocks |
| Menu screens | CSS only | No Three.js needed for menus — keeps menus fast |
| Gameplay logic | Untouched | Zero risk to existing functionality |
| Map themes | 9 distinct neon palettes | Each map feels like a different world |
| Animations | Present on every screen | User requirement — nothing static |

---

## Map Color Themes

| Map | Primary | Secondary |
|---|---|---|
| Ocean | `#00c8ff` | `#0060ff` |
| Space | `#cc00ff` | `#8800ff` |
| Lava | `#ff5500` | `#ff8800` |
| City | `#ffee44` | `#ffffff` |
| Desert | `#ffbb22` | `#ff6600` |
| Arctic | `#aaffff` | `#ffffff` |
| Moon | `#ccccff` | `#8888cc` |
| Earth | `#22ff66` | `#88ff00` |
| Jungle | `#00ffaa` | `#00cc66` |

A JS `THEMES` object maps each map ID to `{ primary, secondary, bg, gridColor }`. On map selection, CSS variables are updated and Three.js material emissive/color values are swapped live — no page reload.

---

## Screen Designs

### 1 — Splash Screen

- **Background:** Pure black with a perspective neon grid floor receding to the horizon. Grid color: default cyan (`#00ffe8`).
- **Animation:** Grid lines pulse in brightness. A 3D snake (CSS segments) crawls across the screen from left to right, looping continuously. Floating dot particles drift upward and fade out.
- **Horizon line:** Glowing gradient line (cyan → magenta) with bloom.
- **Title:** `SNAKE` in large bold uppercase, neon cyan text-shadow glow.
- **Subtitle:** `TAP TO BEGIN` blinking at 1.4s ease-in-out, 30% opacity at rest.
- **Transition:** Fade-out with opacity animation on tap/click.

### 2 — Home / Settings

- **Background:** Same perspective grid floor. Animated background snake crawls slowly along the grid.
- **Animated particles:** Small neon dots drift upward slowly and fade.
- **Settings card:** Glassmorphic panel — `rgba(primary, 0.04)` background, `1px solid rgba(primary, 0.2)` border, `box-shadow` bloom in map color. Updates color when map is selected.
- **Snake color swatches:** Each swatch glows in its color on hover/active.
- **Play button:** Neon primary-color button with pulsing bloom animation.
- **Mode buttons (Classic / Time Attack):** Glassmorphic secondary buttons.

### 3 — Map Select

- **Layout:** Responsive grid of 9 map cards.
- **Each card:**
  - Mini neon world preview: perspective grid in map's neon color, horizon glow line, animated mini 3D snake blinking.
  - On hover: CSS 3D tilt (`rotateX` / `rotateY` via mouse position), border glows in map color, lifts `translateY(-4px)`.
  - Map name in map's primary color.
- **Background:** Animated perspective grid (neutral cyan default) with drifting particles.
- **Selected state:** Card border pulses continuously.

### 4 — Level Select

- **Header:** Map badge in top-left showing current map name, styled in map's neon color.
- **Level rows:** Glassmorphic cards. Active/hovered row glows in map's neon color with `box-shadow` bloom.
- **Speed badges:** Keep existing color coding (green=slow, blue=med-slow, amber=medium, orange=med-fast, red=fast).
- **Background:** Subtle animated grid, slower than other screens. Drifting particles.

### 5 — Game Screen (Three.js)

**Camera:**
- `PerspectiveCamera` with `fov: 45`.
- Position: slightly above and angled (~12° pitch, -5° yaw) — not flat top-down.
- Camera micro-shake (0.5s) triggered on food eaten.

**Board:**
- `PlaneGeometry` grid floor with `ShaderMaterial` — glowing grid lines in map's neon color, lines pulse in brightness over a 2s loop.
- Board surrounded by a faint border glow matching map color.

**Snake segments:**
- `BoxGeometry(0.9, 0.9, 0.9)` per segment.
- `MeshStandardMaterial` with `emissive` set to map primary color.
- Emissive intensity fades from head (1.0) to tail (0.2) — creates depth gradient.
- Side faces slightly darker than top — gives extruded 3D look.
- Head segment slightly larger (`0.95`) and brighter.

**Food:**
- `IcosahedronGeometry(0.5, 1)` — multifaceted sphere.
- `MeshStandardMaterial` with full emissive (magenta/secondary color).
- `PointLight` attached to food position, casts colored light on nearby snake segments.
- Slow rotation animation + gentle bob (sine wave on Y axis).
- On eaten: particle burst (12 small `SphereGeometry` fragments scatter and fade over 0.4s).

**Lighting:**
- `AmbientLight` (intensity 0.3, color `#111122`).
- `DirectionalLight` (intensity 0.8, white, position `(15, 25, 15)`, target board center `(10, 0, 10)`) — angled from top-right to give visible top and side faces on snake segments.
- `PointLight` from food (intensity 1.5, map secondary color, distance 6, decay 2).

**HUD (CSS overlay):**
- Top bar: Score / Level / Target — glassmorphic strip, monospace font, values in map neon color.
- Pause button: neon ghost button top-right.

**Background animations:**
- Stars or particles visible behind/around the board for Space map.
- Faint neon fog glow at board edges.

### 6 — Game Over / Level Complete

**Game Over:**
- Three.js: all snake segments animate outward with randomized velocity + rotation (simulated physics over 0.6s), then fade out.
- Grid floor turns red (`#ff0050`) with slow pulse.
- CSS overlay: `GAME OVER` slams in with scale animation (1.4 → 1.0), neon red glow.
- Final score counter animates up from 0.
- Retry / Menu buttons appear after 0.8s delay.

**Level Complete:**
- Snake segments float upward and sparkle.
- Grid turns map secondary color, pulses.
- `LEVEL COMPLETE` in neon green/map color.
- Sparks/confetti particles rain upward.

---

## Background Animations (All Screens)

Every screen must have at least one of the following active at all times:

1. **Perspective grid** — neon grid lines receding to horizon, lines pulsing in brightness (2s ease-in-out loop).
2. **Horizon glow** — animated gradient line (primary → secondary) sweeping or pulsing.
3. **Drifting particles** — small dots (2–4px) moving upward at varying speeds, fading out at top, respawning at bottom.
4. **Background snake** — on Splash and Home, a looping animated snake crawls slowly across the grid.
5. **Map-specific extras** — Space: twinkling stars. Lava: slow upward heat shimmer. Arctic: slow horizontal drift. City: blinking window lights.

---

## Architecture

### File structure
Single `index.html` file. No build step. All changes contained within.

### New dependencies
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js"></script>
```
One CDN import added to `<head>`. Requires internet connection to load.

### Board dimensions and Three.js world units
The game grid is **20×20 cells** (`const GRID = 20`). In Three.js:
- Each cell = **1 world unit**.
- Board spans `(0,0)` to `(20,20)` in XZ space, centered at `(10,0,10)`.
- Camera target: board center `(10,0,10)`.
- Camera position: `(10, 18, 22)` — above and behind center, looking down at ~12° pitch.
- `PerspectiveCamera` fov `45`. Near `0.1`, far `100`.
- The full 20×20 board must be visible without clipping. Verify on init.

### Camera
- **Fixed** — does not follow the snake head. Always frames the full board.
- **Micro-shake on food eaten:** amplitude `0.08` world units, duration `220ms`, ease-out sine, then returns to resting position. Applied as a position offset, not a rotation.
- No other camera movement during gameplay.

### Theme system

CSS variables updated by `applyTheme`:

| Variable | Usage |
|---|---|
| `--neon-primary` | Snake head glow, HUD values, active borders |
| `--neon-secondary` | Food color, horizon line secondary, particle trails |
| `--neon-bg` | Screen background color |
| `--neon-grid` | Grid line color (rgba with alpha) |
| `--neon-glow` | Box-shadow glow color (same as primary, ~30% alpha) |

Three.js objects updated by `applyTheme`:
- Board grid shader uniform `uGridColor`
- All snake segment `MeshStandardMaterial.emissive`
- Food `MeshStandardMaterial.color` and `MeshStandardMaterial.emissive`
- Food `PointLight.color`

```js
const THEMES = {
  ocean:  { primary: '#00c8ff', secondary: '#0060ff', bg: '#000814', grid: 'rgba(0,180,255,0.18)' },
  space:  { primary: '#cc00ff', secondary: '#8800ff', bg: '#04000e', grid: 'rgba(140,0,255,0.18)' },
  lava:   { primary: '#ff5500', secondary: '#ff8800', bg: '#0e0000', grid: 'rgba(255,60,0,0.18)'  },
  city:   { primary: '#ffee44', secondary: '#ffffff', bg: '#04040c', grid: 'rgba(255,220,0,0.16)' },
  desert: { primary: '#ffbb22', secondary: '#ff6600', bg: '#0c0500', grid: 'rgba(255,165,0,0.18)' },
  arctic: { primary: '#aaffff', secondary: '#ffffff', bg: '#000a10', grid: 'rgba(100,220,255,0.18)'},
  moon:   { primary: '#ccccff', secondary: '#8888cc', bg: '#06060e', grid: 'rgba(160,160,220,0.16)'},
  earth:  { primary: '#22ff66', secondary: '#88ff00', bg: '#020800', grid: 'rgba(0,255,80,0.18)'  },
  jungle: { primary: '#00ffaa', secondary: '#00cc66', bg: '#020a04', grid: 'rgba(0,220,120,0.18)' },
};
```

### Three.js integration
- `initThree(canvas)` — sets up scene, camera, renderer, lighting, board. Called when game view activates.
- `renderSnake(segments)` — called each game tick. Uses **`InstancedMesh`** (single draw call) for all snake segments. Updates instance matrices from game state array. Max 400 instances (20×20 board).
- `renderFood(pos)` — updates food mesh and `PointLight` position.
- `resetThree()` — resets snake instances, food, score counter, particle state. Called on Retry without tearing down the WebGL context.
- `onFoodEaten()` — triggers camera shake + 12-particle burst (small `SphereGeometry`, scatter + fade over 400ms).
- `onGameOver()` — triggers segment explosion: each instance gets randomized velocity + rotation, animates over 600ms, then fades. Grid color shifts to red. Does NOT dispose Three.js.
- `onLevelComplete()` — segments float upward + sparkle, grid shifts to secondary color.
- `disposeThree()` — called after CSS fade-out completes when navigating to menu. Cleans up WebGL context.

### Game Over / Level Complete screen lifecycle
- Three.js canvas **stays visible** behind the CSS overlay for both Game Over and Level Complete.
- CSS overlay fades in on top with `opacity` transition (0.3s).
- **Retry:** call `resetThree()`, hide overlay, resume game loop. No dispose/reinit.
- **Menu:** hide overlay, trigger CSS fade-out (0.4s), then call `disposeThree()` in the `transitionend` callback.

### Mobile / performance
- Snake rendered with `InstancedMesh` — one draw call regardless of snake length.
- Max snake length on a 20×20 board = 400. `InstancedMesh` initialized with 400 instances.
- Tail segments beyond the visible snake length have `instanceMatrix` scale set to 0 (hidden).
- `PointLight` decay is set — does not affect the full scene, only nearby segments.
- Existing touch event listeners are bound to `document` (not the old canvas) — verify they still fire correctly with the new Three.js `renderer.domElement` in the DOM. If any touch listeners were bound to the old `<canvas>` element, rebind them to `document` or the new canvas.

### CSS background snakes (Splash + Home)
- **Segment count:** 8 segments.
- **Path:** enters from the left edge at a random Y between 20%–80% of screen height, travels horizontally right, exits right edge. Loops: after exiting, resets to left edge with a new random Y and 3s delay.
- **Animation:** each segment is a `<div>` with CSS `box-shadow` glow. Positioned with JS `requestAnimationFrame`, moving at 120px/s.
- **Color:** always map's `--neon-primary` color (updates when theme changes).
- **Segment size:** each segment `<div>` is 18×18px with `border-radius: 4px`. Inter-segment gap: 3px. At 120px/s the train appears connected.

### Map switching
Map is selected once before a game starts. `applyTheme()` is not called mid-game. The Lava canvas shimmer and other map-specific layers are set up once when the game view is entered and torn down with `disposeThree()`. No mid-session map switching is supported.

### Map-specific background extras
- **Space:** 150 `<div>` star dots (1–2px, random positions), opacity animated `0.2→1→0.2` over 2–4s with staggered `animation-delay`. Stars are fixed in place.
- **Lava:** a `<canvas>` layer beneath the grid draws slow vertical wavy distortion lines using sine waves, amber/red color, 0.3 opacity. Redrawn each frame.
- **Arctic:** the perspective grid has a slow horizontal scroll (`background-position-x` animates +1px every 2 frames), giving a drifting ice-sheet feel.
- **City:** 20 small `<div>` window rectangles placed at random positions in the grid background, opacity toggles between 0.2 and 0.8 every 1–3s (staggered). Amber/white colors.
- **Moon, Earth, Desert, Jungle, Ocean:** drifting particles only — intentional. No extra background layer needed for these maps.

### What is NOT changed
- All game loop logic (`setInterval` / `requestAnimationFrame` tick)
- Snake movement, direction, collision detection
- Scoring formula
- Level configurations (target scores, speeds)
- Map wall definitions
- All localStorage save/load logic
- Mobile touch controls

---

## Constraints

- Must remain a single `.html` file.
- Three.js loaded via CDN only (no bundling).
- All existing game functionality preserved exactly.
- Must work on mobile (touch controls unchanged, verified post-canvas swap).
- No other external dependencies beyond Three.js.
