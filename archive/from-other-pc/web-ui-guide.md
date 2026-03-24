# Adam's Web UI Style Guide

> **Purpose:** Definitive reference for any AI agent building web UIs, dashboards, phone-compatible apps, notes systems, or interactive web tools for Adam. Covers conventions, patterns, preferences, and bug avoidance. All patterns are extracted from production code across all 4 dashboards (NTS Web, PAI Daemon, Phone Control, Task Analytics) and reflect Adam's established preferences. NTS Web is the **final authority** — its patterns overrule all contradictions from other dashboards.

---

## 1. Hard Rules (Non-Negotiable)

These override everything else. Break any of these and the output is rejected.

| Rule | Detail |
|------|--------|
| **No browser dialogs** | Never use `alert()`, `confirm()`, or `prompt()`. Use custom in-page modals (`showConfirm()`, `showPrompt()`). |
| **Relative time only** | All timestamps: `"5s ago"`, `"3m ago"`, `"2h ago"`, `"1d ago"`, `"resets in 3h 24m"`. Never absolute dates/times in UI. |
| **12-hour clock** | When absolute time is unavoidable (e.g., timer endpoints, alarm times, scheduling): `"ends 2:30 PM"`. Never 24-hour format. |
| **Dual storage units** | Always show both: `916 GB (853 GiB)`. Base-10 first, base-2 in parentheses. Applies to all sizes (KB/KiB through TB/TiB). Integer for large values, 1 decimal for small. |
| **No emojis** | Never use emojis in code, UI text, or file output unless Adam explicitly asks. |
| **Dark theme default** | Pure black background (`#000000`) by default. NAVEX supports a light theme toggle in Settings (stored in `localStorage` as `navex_theme`). Other dashboards remain dark-only. |
| **Vanilla JS only** | No React, Vue, Angular, or any frontend framework. Plain JavaScript + DOM. |
| **Canvas 2D for charts** | No Chart.js, D3, or charting libraries. Use `<canvas>` with the 2D rendering context. |
| **No frameworks for CSS** | No Tailwind, Bootstrap, or CSS frameworks. Hand-written CSS with custom properties. |
| **Circular logos** | App icons/logos must be circular, not square. |
| **No syntax highlighting** | Code/log blocks use plain monospace, no color coding. |

---

## 2. Color Palette

### Primary Palette (Canonical — pure black base)

```css
:root {
    --bg: #000000;          /* Page background — pure black */
    --bg-card: #141414;     /* Card/panel backgrounds */
    --bg-dim: #28282d;      /* Borders, disabled, scrollbar thumb */
    --grid-line: #1e1e23;   /* Table grid lines */
    --muted: #50505a;       /* Headers, inactive text, version labels */
    --secondary: #78788a;   /* Dimmed labels, secondary info */
    --text: #b4b4b4;        /* Primary text (light gray, NOT white) */
    --cyan: #328cff;        /* Accent, links, active elements */
    --green: #00c864;       /* Success, active, running */
    --amber: #ffc800;       /* Warnings, paused state */
    --red: #ff5050;         /* Errors, alerts, delete */
    --row-hover: #0f0f12;   /* Table row hover */
    --row-select: #0f1e28;  /* Table row selected */
    --border: #28282d;      /* General borders (same as --bg-dim) */
    --font: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Cascadia Code', 'Fira Code', 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
}
```

### Alternative Palette (GitHub Dark — blue-gray base)

For projects that want a slightly warmer feel:

```css
--bg: #0d1117;           /* Dark blue-gray */
--bg-card: #161b22;      /* Card background */
--border: #30363d;       /* Borders */
--muted: #7d8590;        /* Muted text */
--text: #c9d1d9;         /* Primary text */
--cyan: #58a6ff;         /* Accent */
--green: #3fb950;        /* Success */
--amber: #d29922;        /* Warning */
--red: #da3633;          /* Error */
--purple: #d2a8ff;       /* Time/duration metrics */
```

### Semantic Color Usage

| Meaning | Color | When to use |
|---------|-------|-------------|
| Accent / Active / Links | Cyan | Active tabs, clickable text, primary actions |
| Success / Running / Confirm | Green | Active status, start buttons, success feedback |
| Warning / Paused / Caution | Amber | Warning states, pause buttons, medium severity |
| Error / Delete / Critical | Red | Error messages, delete buttons, stop actions |
| Inactive / Disabled / Subtle | Muted | Disabled controls, placeholder text, closed status |
| Labels / Descriptions | Secondary | Field labels, metadata, timestamps |

### Claude Model Colors

When displaying Claude model data, use these fixed color mappings:

```javascript
const modelColors = {
    'opus':   { r: 50, g: 140, b: 255 },  // Cyan
    'sonnet': { r: 0, g: 200, b: 100 },    // Green
    'haiku':  { r: 255, g: 200, b: 0 },    // Amber
};
// Fill: rgba with ~0.235 opacity. Stroke: solid rgb, lineWidth: 1.5.
// Display model names lowercase: "opus", "sonnet", "haiku" (not full model IDs).

// CSS classes for colored model names in tables/lists:
// .model-opus   { color: var(--cyan); }   // Blue
// .model-sonnet { color: var(--green); }  // Green
// .model-haiku  { color: var(--amber); }  // Amber
```

### Progress Bar Color Thresholds

```
Usage bars:     cyan <70% -> amber 70-90% -> red >90%
Temperature:    green < threshold*0.85 -> amber < threshold -> red >= threshold
Storage:        cyan <10% -> green 10-25% -> amber 25-50% -> red >50%
Drive bars:     green <75% -> amber 75-90% -> red >90%
```

### Common RGBA Values

Reusable transparency patterns (derive from the palette colors):

```css
/* Interactive state backgrounds */
rgba(50,140,255,0.08)    /* Cyan tint — active tab, active pill, selected state */
rgba(50,140,255,0.03)    /* Cyan ultra-light — blockquote bg, subtle highlight */
rgba(50,140,255,0.15)    /* Cyan medium — badge/pill bg */
rgba(50,140,255,0.3)     /* Cyan strong — ::selection background */
rgba(0,200,100,0.1)      /* Green tint — start button hover */
rgba(0,200,100,0.12)     /* Green — copied row feedback */
rgba(0,200,100,0.15)     /* Green — active/success badge bg */
rgba(0,200,100,0.2)      /* Green — inline code copied */
rgba(255,200,0,0.1)      /* Amber tint — pause button hover */
rgba(255,200,0,0.15)     /* Amber — warning badge bg */
rgba(255,80,80,0.1)      /* Red tint — stop/delete button hover */
rgba(255,80,80,0.15)     /* Red — error badge bg, deleted row bg */
rgba(120,120,138,0.15)   /* Muted — neutral button hover, closed badge bg */
rgba(0,0,0,0.7)          /* Black — modal overlay bg */
rgba(0,0,0,0.92)         /* Black — restart/loading overlay bg (darker) */
rgba(0,0,0,0.5)          /* Black — box shadows */
rgba(20,20,20,0.3)       /* Dark — alternating table row, table header bg */
```

### Z-Index Layering System

Every project should follow this z-index scale:

```
z-index:     1    Sticky table headers
z-index:     2    Sticky filter/header bars within tabs
z-index:    10    Chart tooltips
z-index:    20    Filter popovers, preset panels
z-index:    50    Column visibility dropdowns
z-index:   100    Dropdown menus, detail modals, custom selects
z-index:   200    Context menus (above dropdowns)
z-index:  9999    Full-screen overlays, warning banners, mobile bottom nav
z-index: 10000    Mobile navigation menus, overflow menus
z-index: 99999    Loading/reconnection overlay (highest — blocks everything)
```

### Border-Radius Scale

```
3px   Progress bars, skeleton bars, temp bars, small badges
4px   Buttons, inputs, scrollbar thumb, most controls
6px   Cards, dropdowns, context menus, modals
8px   Large modals, mobile menus, rename dialogs
16px  Filter pills, popover trigger buttons (lozenge/pill shape)
50%   Status dots, circular icons, spinners
```

### Box Shadow Patterns

```css
/* Dropdown menus + context menus */
box-shadow: 0 4px 12px rgba(0,0,0,0.5);
/* Modal overlays */
box-shadow: 0 2px 8px rgba(0,0,0,0.5);
/* Mobile bottom nav (inverted shadow) */
box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
/* Alert/warning banner (color-tinted) */
box-shadow: 0 2px 12px rgba(255, 80, 80, 0.5);
```

### Transition Timing Scale

```css
transition: all 0.1s;        /* Subtle: opacity reveals, micro-hover effects */
transition: all 0.15s;       /* Default: button hover, focus, color/border changes */
transition: max-height 0.2s; /* Collapse/expand sections */
transition: width 0.3s;      /* Progress bars, width-based animations */
```

### Opacity Hierarchy

```
1.0   Active, visible, interactive (default)
0.9   Slightly muted (warning pulse states)
0.7   De-emphasized icons, secondary elements
0.6   Deleted/deleting row state
0.5   Disabled interactive elements, context menu disabled items
0.4   Disabled buttons, inactive icon buttons
0.3   Disconnected status, fully muted
0     Hidden (hover-reveal elements like copy buttons)
```

### Standard Animations

```css
/* Blinking status dot (connected state only — disconnected gets animation:none) */
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* Loading/refresh spinners */
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* Alert banner pulse */
@keyframes warning-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }

/* Skeleton loader shimmer (translating gradient, not background-position) */
@keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

/* Pull-to-refresh spinner */
@keyframes ptr-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* Staged action button pulse (confirmation window) */
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
```

---

## 3. Typography

```css
/* Primary font stack */
font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;

/* Base size */
font-size: 13px;

/* Scale */
/* 9-10px:  Chart labels, axis labels, fine print */
/* 11px:    Section labels, form labels (uppercase + letter-spacing) */
/* 12px:    Tab buttons, table body, button text, filter inputs */
/* 13px:    Base body text (default) */
/* 14px:    Header title, section titles (font-weight: 600) */
/* 18px:    Modal titles, login title, major headings */
```

### Label Convention

Section headers and form labels use uppercase with letter-spacing:

```css
.label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted);
    margin-bottom: 4px;
}
```

### Monospace Usage

Use monospace for: UUIDs, session IDs, log output, code blocks, file paths, technical identifiers.

```css
.mono {
    font-family: 'Cascadia Code', 'Fira Code', 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
}
```

### Numeric Alignment

```css
/* Use tabular-nums for aligned number columns (stat values, tables, counters) */
.stat-value { font-variant-numeric: tabular-nums; }
```

### Text Handling Patterns

```css
/* Single-line ellipsis — for text that should truncate with "..." */
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Code/rule display — preserve formatting */
.pre-wrap { white-space: pre-wrap; line-height: 1.6; }

/* Long outputs — break at any character to prevent overflow */
.payload { white-space: pre-wrap; word-break: break-all; }

/* Metadata — prefer word boundaries, break words only if needed */
.detail-value { word-break: break-word; }
```

---

## 4. Layout Architecture

### Page Structure

```
#app (flex column, height: 100svh)
+-- .header (fixed top, flex row, border-bottom)
|   +-- .header-title (clickable — navigates to Home tab)
|   |   +-- img.header-logo (circular, 28-36px, border-radius: 50%)
|   |   +-- span (app name, 14px, font-weight: 600)
|   |   +-- span.version (12px, muted)
|   +-- .tab-bar (horizontal tab buttons)
|   +-- .header-right (status dot, connection info, logout)
+-- .tab-content (flex: 1, overflow: hidden, position: relative)
|   +-- .tab-panel[data-tab] (position: absolute, inset: 0, overflow-y: auto)
|   |   +-- .card (bg-card, border, border-radius: 6px, padding: 14px)
+-- .mobile-nav (mobile bottom nav, desktop hidden)
```

### HTML Head (Required Meta Tags)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="icon" type="image/png" href="/static/favicon.png">
<link rel="stylesheet" href="/static/css/style.css?v={{ version }}&t={{ build_ts }}">
```

`viewport-fit=cover` enables `env(safe-area-inset-*)` for notch/home-bar handling on iOS.

### Key CSS

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    overflow: hidden;
    overscroll-behavior-y: contain;  /* Prevent browser pull-to-refresh */
}

#app {
    display: flex;
    flex-direction: column;
    height: 100svh;  /* svh, not vh — accounts for mobile browser chrome */
}

::selection { background: rgba(50,140,255,0.3); color: #fff; }

.tab-content { flex: 1; overflow: hidden; position: relative; }
.tab-panel {
    display: none; position: absolute; inset: 0;
    overflow-y: auto; padding: 16px;
}
.tab-panel.active { display: flex; flex-direction: column; overflow-y: auto; }
.tab-panel.active > * { flex-shrink: 0; }

/* Loading guard — disable interaction while skeletons are showing */
.tab-panel.loading .filter-bar,
.tab-panel.loading .data-table,
.tab-panel.loading .card { pointer-events: none; user-select: none; }
```

### Scrollbar Styling

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--bg-dim); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--muted); }
```

### Spacing Scale

Use multiples of 4: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.

- Card padding: `14px`
- Card gap/margin: `12px`
- Header padding: `8px 16px`
- Button padding: `6px 16px`
- Input padding: `5px 8px` or `8px 12px`
- Grid gaps: `8px` to `12px`
- Gap within a card (label to field): `4px`

### Grid Patterns

```css
/* Auto-fit responsive grid (stat boxes, card grids) */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  /* desktop */
grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));  /* mobile */

/* Settings layout — two-column */
.settings-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
.settings-row { grid-template-columns: 200px 1fr; gap: 8px 16px; align-items: center; }
```

### Initialization Flow

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI setup (tabs, collapsible sections, filter bars)
    initTabs();
    initCollapse();
    // 2. Per-feature init (each tab's listeners, filter UI, sort handlers)
    initSessionsUI();
    initSettingsUI();
    // 3. Mobile-specific (pull-to-refresh, bottom nav, long-press handlers)
    initPullToRefresh();
    initMobileNav();
    // 4. Data connection (last — UI must be ready before data arrives)
    initWSConnection();
});
```

Each `init*()` function sets up listeners and default state for one feature. Order matters — UI first, data last.

**Common init functions** (from NTS Web):
- `initTabs()` — tab switching, URL routing, popstate handling
- `initCollapse()` — collapsible sections with localStorage persistence
- `initSessionsUI()` — sort headers, pill groups, search, popovers, presets, bulk delete, select all
- `initContextMenu()` — right-click handlers, context menu item click listeners
- `initRenameDialog()` — rename modal buttons and keyboard handlers
- `initColResize(table)` — column resize handles + localStorage persistence
- `initNoSleep()` — preset wiring, custom presets, hidden presets, time boxes, Until picker
- `initSettingsUI()` — save/load settings, sensor toggles, per-sensor thresholds
- `initLogout()` — logout button handler
- `initLogs()` — refresh/load-more buttons, log filter input
- `initNotes()` — refresh button for markdown notes
- `initSectionFilters()` — debounced filter inputs for process/container/workflow sections
- `initStorage()` — rescan button
- `initPullToRefresh()` — touch event handlers for PTR
- `initMobileNav()` — bottom nav, overflow menu, slide-in menu
- `initWSConnection()` — WebSocket connect (LAST — after all UI is ready)

**Error isolation** — wrap each init in try/catch so one failure doesn't crash the rest:
```javascript
inits.forEach(fn => { try { fn(); } catch (e) { console.error(`Init ${fn.name} failed:`, e); } });
```

---

## 5. Components

### 5.1 Buttons

```css
.btn {
    padding: 6px 16px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    font-family: var(--font);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}
.btn:hover:not(:disabled) { background: rgba(120,120,138,0.15); color: #fff; }
.btn:disabled { color: var(--muted); border-color: var(--bg-dim); cursor: default; }
```

**Outline variants** (default — border + text color, transparent bg):
```css
.btn-start { color: var(--green); border-color: var(--green); }
.btn-stop  { color: var(--red);   border-color: var(--red);   }
.btn-pause { color: var(--amber); border-color: var(--amber); }
/* Hover: add rgba fill matching the color */
```

**Filled variants** (for dangerous/warning actions — solid bg):
```css
.btn-danger { background: var(--red); color: #fff; border: 1px solid var(--red); }
.btn-warn   { background: var(--amber); color: #fff; border: 1px solid var(--amber); }
```

**Staged action button** (pulsing during confirmation window):
```css
.btn-staged { border-color: var(--amber)!important; color: var(--amber)!important; animation: pulse 0.8s infinite; }
```

**Additional variants:**
```css
.btn-display { color: var(--cyan); border-color: var(--cyan); }  /* Toggle display */
.btn-cancel { color: var(--text); border-color: var(--secondary); }  /* Neutral cancel */
.btn-logout { color: var(--secondary); border-color: var(--border); padding: 4px 10px; font-size: 11px; }
.btn-logout:hover { color: var(--red); border-color: var(--red); }
.btn-new { color: var(--green); border: 1px solid rgba(0,200,100,0.3); background: rgba(0,200,100,0.1); }
.btn-delete-bulk { color: var(--red); border-color: var(--red); font-size: 11px; }
.btn-kill { border: 1px solid rgba(255,50,50,0.3); opacity: 0.5; }  /* Semi-opaque until hover */
.btn-kill:hover { opacity: 1; background: rgba(255,50,50,0.15); }
```

Mobile button minimum height: `36-44px` for touch targets.

### 5.2 Tabs

```css
.tab-btn {
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}
.tab-btn:hover { color: var(--text); border-color: var(--muted); }
.tab-btn.active {
    color: var(--cyan);
    border-color: var(--cyan);
    background: rgba(50,140,255,0.08);
}
```

**Implementation:**
- `data-tab` attribute on buttons maps to tab panels
- URL hash tracks active tab (`#tab-name`) for browser back/forward via `popstate`
- On tab switch: push to `history.pushState`, render active panel immediately

### 5.3 Cards

```css
.card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px;
    margin-bottom: 12px;
}
.card-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted);
    margin-bottom: 8px;
}
```

### 5.4 Data Tables

```css
.data-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;  /* desktop: fixed, mobile: auto */
}
.data-table th {
    position: sticky; top: 0;
    background: var(--bg-card);
    color: var(--muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    z-index: 1;
    user-select: none;
}
.data-table td {
    padding: 5px 8px;
    font-size: 12px;
    border-bottom: 1px solid var(--grid-line);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.data-table tr:hover { background: var(--row-hover); }
.data-table tr.selected { background: var(--row-select); }
/* Selected takes precedence over hover */
```

**Standard table features:**
- **Sorting**: Click header to sort (asc/desc toggle), arrow indicator `▲`/`▼`
- **Multi-sort**: Click adds column, right-click removes
- **Column resize**: Drag handle between headers (desktop only), widths persist in localStorage
- **Checkboxes**: Multi-select with Select All, bulk action buttons appear when rows selected
- **Context menu**: Right-click row for actions
- **Detail view**: Double-click row opens detail modal
- **Mobile**: horizontal scroll with `overflow-x: auto; -webkit-overflow-scrolling: touch;`
- **Data attributes**: `data-sort` on headers (sort key), `data-key` on rows (unique ID)
- **Alternating rows** (optional): `tr:nth-child(even) td { background: rgba(20,20,20,0.3); }`

**Column visibility toggle:**
```css
/* Hide columns dynamically via CSS classes */
.hide-col-3 td:nth-child(3), .hide-col-3 th:nth-child(3) { display: none; }
```

### 5.5 Filter Bar

```css
.filter-bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
```

**Components:**
- **Pill buttons**: Multi-select horizontal pills. Active = cyan border + bg. Built via factory function.
- **Search input**: With `x` clear button. Debounced 150ms.
- **Popover filters**: Button toggles dropdown for numeric range (min/max) with Apply/Clear.
- **Presets**: Save/load/delete named filter states. Auto-apply toggle. Stored server-side.
- **Footer**: "Showing X of Y" count.
- **Empty state**: Centered "No items match your filters" + cyan "Clear filters" button.
- **Persistence**: Clean start on every page refresh (no auto-restore). Support named presets saved server-side.
- **Filter counts in pills**: Each pill shows match count, e.g., "Active (12)" — update on every data push.

**Popover filters** (for numeric range filters like "Msgs ≥" and "Size KB ≥"):
```javascript
function initFilterPopover(btnId, popoverId, inputId, clearId, applyId, filterKey, labelPrefix) {
    // Click trigger toggles popover, closes others first
    // Enter → apply, Escape → close, click outside → close
    // Active state: btn text changes to include value ("Msgs ≥ 50"), gets .active class
    // Clear: resets value, removes .active, closes popover
}
```

**Pill group factory** — replaces dropdown selects with horizontal pill buttons:
```javascript
function createPillGroup(container, options, onChange) {
    // options: [{value, label}, ...]
    // Renders .filter-pill buttons in a .filter-pill-group container
    // Each pill shows label + <span class="pill-count"></span> for dynamic counts
    // Click toggles .active class, calls onChange(selectedValues[])
    // Returns: { getSelected, setSelected, updateCounts(countMap), clearAll, clearVisual }
    //   - clearAll: removes .active + calls onChange([])
    //   - clearVisual: removes .active WITHOUT calling onChange (for preset restoration)
}
```

**Search input wrapper** — adds a clear "×" button inside any search input:
```javascript
function wrapSearchInput(input) {
    // Wraps input in .filter-search-wrap (or .section-filter-wrap for section filters)
    // Adds .filter-clear-btn button with "×" text
    // Toggles .has-value on wrapper and .filter-active on input when non-empty
    // Click clear → empties input, fires 'input' event, re-focuses
    // Returns: { clear() }
}
```

**Filter highlight** — toggles cyan border on active filter controls:
```javascript
function updateFilterHighlight(el, defaultVal) {
    // Adds/removes .filter-active class based on whether value !== defaultVal
    // Works with inputs, selects, numbers (parsed via parseInt)
}
```

**Preset system:**
```javascript
// FilterPresets object — stores presets server-side via Prefs.getSub/setSub:
const FilterPresets = {
    getAll(tab) { return Prefs.getSub('presets', tab, {}); },
    save(tab, name, filters) { /* Prefs.setSub('presets', tab, {...all, [name]: filters}) */ },
    load(tab, name) { return this.getAll(tab)[name] || null; },
    delete(tab, name) { /* remove key, Prefs.setSub */ },
    getNames(tab) { return Object.keys(this.getAll(tab)); },
};

// renderPresetsUI — renders a "Presets" trigger button + popover panel:
function renderPresetsUI(container, tab, getFilters, applyFilters, opts) {
    // opts: { getColumns, applyColumns, onReset }
    // Trigger button: shows "Presets" or "Presets: <name>" when autoloaded
    //   .has-autoload class when an autoload preset is set
    // Panel contents:
    //   - Title: "Presets"
    //   - Preset list: each row has [A] toggle (autoload), name, [×] delete
    //     - Click row → loadPreset(name) + close panel
    //     - Click [A] → toggle autoload (Prefs.getSub('autoloadPreset', tab))
    //     - Click [×] → delete preset, clear autoload if matching
    //   - Save button: prompts name via showPrompt(), saves current filters
    //   - Reset button: clears all filters via opts.onReset(), doesn't delete presets
    // Auto-apply: on init, if autoloadPreset is set, loads it after 0ms setTimeout
    // Returns: { deactivate() } — call when filters are manually changed to clear active indicator
}
```

```css
.filter-pill {
    padding: 4px 12px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: transparent;
    color: var(--secondary);
    font-size: 11px;
    cursor: pointer;
}
.filter-pill.active { color: var(--cyan); border-color: var(--cyan); background: rgba(50,140,255,0.08); }
```

### 5.6 Modals / Dialogs

```css
.modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);  /* No blur, no gradient — pure semi-transparent black */
    z-index: 100;
    justify-content: center;
    align-items: center;
}
.modal-overlay.active { display: flex; }
.modal-box {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    width: 400px;
    max-width: 90vw;
    max-height: 90svh;
    overflow-y: auto;
}
.modal-box.destructive { border-color: var(--red); }  /* Red border for destructive modals */
.modal-header { user-select: none; }
```

**Behavior:**
- Click overlay background to close (check `e.target === modal`, not children)
- `Escape` closes modals (cascade: inner detail first, then outer)
- `Enter` submits prompt modals
- Copy button on dialogs with long messages (>30 chars) — clipboard icon, shows "Copied" for 2s
- Cancel button hidden for `green` and `neutral` btnStyle (info/success dialogs)
- OK button class varies: `btn-stop` (default/delete), `btn-start` (green), `btn-cancel` (neutral)
- Event listener cleanup: all handlers removed in `cleanup()` function to prevent leaks

**Implementation — include in every project:**

```javascript
function showConfirm(title, message, btnText = 'OK', btnStyle = 'neutral') {
    return new Promise(resolve => {
        const overlay = $('#confirmModal');
        $('#confirmTitle').textContent = title;
        $('#confirmMessage').textContent = message;
        const btn = $('#confirmBtn');
        btn.textContent = btnText;
        btn.className = 'btn ' + (btnStyle === 'red' ? 'btn-stop' : btnStyle === 'green' ? 'btn-start' : '');
        btn.onclick = () => { overlay.classList.remove('active'); resolve(true); };
        const cancel = $('#confirmCancel');
        cancel.onclick = () => { overlay.classList.remove('active'); resolve(false); };
        overlay.onclick = e => { if (e.target === overlay) { overlay.classList.remove('active'); resolve(false); } };
        overlay.classList.add('active');
    });
}

function showPrompt(title, placeholder = '') {
    return new Promise(resolve => {
        const overlay = $('#promptModal');
        $('#promptTitle').textContent = title;
        const input = $('#promptInput');
        input.value = '';
        input.placeholder = placeholder;
        const submit = () => { overlay.classList.remove('active'); resolve(input.value || null); };
        const cancel = () => { overlay.classList.remove('active'); resolve(null); };
        $('#promptBtn').onclick = submit;
        $('#promptCancel').onclick = cancel;
        input.onkeydown = e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel(); };
        overlay.onclick = e => { if (e.target === overlay) cancel(); };
        overlay.classList.add('active');
        input.focus();
    });
}
```

Required HTML (add to index.html):
```html
<div class="modal-overlay" id="confirmModal">
    <div class="modal-box">
        <div class="modal-title" id="confirmTitle"></div>
        <div id="confirmMessage" style="margin-bottom:16px;color:var(--secondary)"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn" id="confirmCancel">Cancel</button>
            <button class="btn" id="confirmBtn">OK</button>
        </div>
    </div>
</div>
<div class="modal-overlay" id="promptModal">
    <div class="modal-box">
        <div class="modal-title" id="promptTitle"></div>
        <input id="promptInput" style="width:100%;margin-bottom:16px">
        <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn" id="promptCancel">Cancel</button>
            <button class="btn btn-start" id="promptBtn">OK</button>
        </div>
    </div>
</div>
```

**Mobile modal**: fullscreen (`width: 100%; height: 100svh; position: fixed;`).

### 5.7 Inputs

```css
input, select {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    padding: 8px 12px;
}
input:focus, select:focus { outline: none; border-color: var(--cyan); }
input:disabled { color: var(--muted); border-color: var(--bg-dim); }
input[type="checkbox"] { accent-color: var(--cyan); }

/* Remove number input spinners */
input[type="number"] { -moz-appearance: textfield; }
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
```

**Dark theme for native date/time inputs:**
```css
input[type="time"], input[type="date"] { color-scheme: dark; }
input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
```

**Custom select dropdown** (not native `<select>`):
```html
<div class="custom-select">
    <div class="custom-select-trigger">Selected text<span class="chevron"></span></div>
    <div class="custom-select-options">
        <div class="custom-select-option" data-value="id1">Option 1</div>
    </div>
</div>
```
Click trigger toggles options. Click outside closes.

```css
/* Down-arrow via CSS border trick */
.custom-select-trigger::after {
    content: ''; position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    border: 4px solid transparent; border-top-color: var(--muted); pointer-events: none;
}
.custom-select.open .custom-select-trigger::after {
    border-top-color: transparent; border-bottom-color: var(--muted); transform: translateY(-75%);
}
```

### 5.8 Progress Bars

```css
.progress-bar { height: 18px; background: var(--bg-dim); border-radius: 3px; overflow: hidden; }
.progress-fill {
    height: 100%; border-radius: 3px;
    display: flex; align-items: center; padding: 0 8px;
    font-size: 10px;
    transition: width 0.3s ease;
}
/* Color classes: .cyan, .green, .amber, .red — based on threshold */
```

### 5.8b Live Progress Bars with Overrun Detection

For tasks or operations with time thresholds — bars change color as they approach limits:

```css
.progress-bar { width: 100%; height: 8px; background: var(--bg-dim); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s linear, background 0.3s; }
.progress-fill.ok { background: var(--green); }       /* <70% */
.progress-fill.warn { background: var(--amber); }     /* 70-90% */
.progress-fill.danger { background: var(--red); }     /* 90-100% */
.progress-fill.overrun { background: var(--red); animation: pulse-red 1.5s ease-in-out infinite; }  /* >100% */
```

**Client-side elapsed updates:** Use `setInterval(1000)` to update elapsed timers locally between WS pushes. Store `data-start` timestamp on each card, calculate elapsed = `now - start`. WS corrects drift every 5s with authoritative elapsed value.

**Threshold classes** (Task Analytics pattern):
| Size | Threshold |
|------|-----------|
| S | 15 minutes |
| M | 45 minutes |
| L | 2 hours |

### 5.9 Status Indicators

```css
.status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    animation: blink 2s infinite;  /* Connected only */
}
.status-dot.disconnected { background: var(--muted); animation: none; }
.status-dot.error { background: var(--red); }
```

### 5.10 Collapsible Sections

```css
.section-header {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; padding: 8px; user-select: none;
}
.section-body { transition: max-height 0.2s; overflow: hidden; }
.section-body.collapsed { max-height: 0 !important; }
```

- Arrow: `>` collapsed, `v` expanded
- Use `data-section="id"` attribute on header
- State persisted in localStorage as `collapse_<section-id>`
- Default: expanded. No TTL.
- Use `scrollHeight` for smooth expand: `body.style.maxHeight = body.scrollHeight + 'px'` before toggling `.collapsed`

### 5.11 Context Menu

```css
.context-menu {
    position: fixed; z-index: 200;
    min-width: 140px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 6px; padding: 4px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.context-menu-item { padding: 6px 14px; font-size: 12px; cursor: pointer; }
.context-menu-item:hover { background: var(--row-hover); }
.context-menu-item.danger { color: var(--red); }
.context-menu-item.disabled { color: var(--muted); pointer-events: none; opacity: 0.5; }
```

Position at click coords. Flip if overflows viewport. Close on outside click or `Escape`.

```javascript
function showContextMenu(menu, x, y) {
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    // Flip if overflows viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';
    // Close on next click anywhere or Escape
    const close = () => { menu.style.display = 'none'; document.removeEventListener('click', close); };
    setTimeout(() => document.addEventListener('click', close), 0);
}
```

### 5.12 Skeleton Loading

```css
/* Solid base with ::after shimmer overlay (NOT background-gradient animation) */
.skeleton {
    position: relative;
    overflow: hidden;
    background: var(--bg-dim);
    border-radius: 4px;
}
.skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    animation: shimmer 1.5s infinite;
}

/* Size variants */
.skeleton-bar   { height: 18px; margin-bottom: 10px; }
.skeleton-row   { height: 28px; margin-bottom: 4px; }
.skeleton-text  { height: 12px; width: 60%; margin-bottom: 8px; }
.skeleton-block { height: 80px; margin-bottom: 10px; }
.skeleton-hidden { display: none; }
```

- Per-component or per-tab (not global)
- Show immediately on view change, hide when data arrives
- `hideSkeleton(id)` implementation:
  1. Hides the skeleton element (`display: none`)
  2. Un-hides sibling elements that were hidden while skeleton was visible (finds all siblings with `display:none` style, shows them)
  3. Removes `.loading` class from the closest parent `.tab-panel` — this re-enables `pointer-events` and `user-select` on the tab's content

### 5.13 Copy Feedback

Green flash on copy — NOT toast notifications. Duration varies:

| Context | Duration | Visual |
|---------|----------|--------|
| IDs / short text | 600ms | Text color -> green |
| Code block copy button | 3s | Button text "Copied" |
| Inline code | - | Background -> `rgba(0,200,100,0.2)` + green text |
| Table row | - | Row background -> `rgba(0,200,100,0.12)` |

```css
.copied { color: var(--green) !important; transition: color 0.3s; }
```

### 5.14 Status Color Utilities

```css
/* Status text colors */
.status-active, .status-ok, .status-running { color: var(--green); font-weight: 600; }
.status-closed, .status-inactive { color: var(--secondary); }
.status-error { color: var(--red); }
.status-warning { color: var(--amber); }

/* Generic text color utilities */
.text-cyan { color: var(--cyan); }
.text-green { color: var(--green); }
.text-amber { color: var(--amber); }
.text-red { color: var(--red); }
.text-muted { color: var(--muted); }
.text-secondary { color: var(--secondary); }

/* Disabled state patterns */
/* Pattern 1: Border + text muting (form buttons) */
.btn:disabled { color: var(--muted); border-color: var(--bg-dim); cursor: default; }
/* Pattern 2: Opacity reduction (icon buttons) */
.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
/* Pattern 3: Full block (context menu items, non-interactive) */
.disabled { pointer-events: none; opacity: 0.5; color: var(--muted); }
```

### 5.15 Copy Button (Hover-Reveal)

```css
/* Hidden by default, appears on parent hover */
.copy-btn {
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 10px;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--secondary);
}
.container:hover .copy-btn { opacity: 1; }
.copy-btn:hover { background: var(--cyan); color: #fff; border-color: var(--cyan); }
.copy-btn.copied { background: var(--green); color: #fff; border-color: var(--green); opacity: 1; }
```

### 5.16 Badges & Status Pills

```css
.badge-active { background: rgba(0,200,100,0.15); color: var(--green); }
.badge-closed { background: rgba(120,120,138,0.15); color: var(--secondary); }
.badge-warning { background: rgba(255,200,0,0.15); color: var(--amber); }
.badge-error { background: rgba(255,80,80,0.15); color: var(--red); }
.badge-info { background: rgba(50,140,255,0.15); color: var(--cyan); }
```

### 5.17 Scrollable Containers

```css
.scroll-box { max-height: 320px; overflow-y: auto; }
.scroll-box thead { position: sticky; top: 0; }
.table-scroll-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
```

### 5.18 Loading / Reconnection Overlay

```css
.loading-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    z-index: 99999;
    display: flex; justify-content: center; align-items: center;
    user-select: none;
}
/* Toggle interaction blocking with pointer-events */
.overlay.hidden { opacity: 0; pointer-events: none; }
.overlay.visible { opacity: 1; pointer-events: all; }
```

### 5.19 Expandable Tree

For hierarchical data (file systems, nested categories):

```
.tree-row (click arrow to expand)
+-- .tree-arrow (> or v)
+-- .tree-icon
+-- .tree-name (click to copy path)
+-- .tree-meta (size, percentage, etc.)
+-- .tree-children.expanded
    +-- nested .tree-row items
```

Depth tracking for indentation (padding-left per level). Expansion can trigger async data fetch.

### 5.20 Detail Modal (Split Layout)

For item detail views (sessions, tasks, etc.) — larger modal with two-column layout:

```css
.modal { width: 90%; max-width: 950px; max-height: 80svh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.modal-header .title { font-size: 14px; font-weight: 600; }
.modal-close { width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 4px; }
.modal-close:hover { border-color: var(--red); color: var(--red); }
.modal-meta { display: flex; gap: 16px; font-size: 11px; color: var(--secondary); padding: 8px 16px; border-bottom: 1px solid var(--grid-line); }
.modal-split { display: flex; flex: 1; overflow: hidden; }
.modal-actions { flex: 1; overflow-y: auto; border-right: 1px solid var(--grid-line); }
.modal-messages { width: 340px; overflow-y: auto; padding: 12px; }
```

Mobile: `.modal-split` flips to `flex-direction: column`. Modal becomes fullscreen.

Supports "Load More" pagination within the modal for long action lists.

### 5.20b Slide-in Detail Panel

Alternative to modal for detail views — panel slides in from the right while the list remains visible behind an overlay. Use when the user needs to see both the list and detail simultaneously.

```css
.detail-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 200;
    transition: opacity 0.2s;
}
.detail-panel {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 55%;                          /* Desktop */
    background: var(--bg);
    border-left: 1px solid var(--border);
    z-index: 201;
    overflow-y: auto;
    padding: 16px;
    transform: translateX(100%);
    transition: transform 0.25s ease;
}
.detail-panel.visible { transform: translateX(0); }
```

**Responsive widths:** 55% desktop, 80% tablet (`max-width: 900px`), 100% mobile (`max-width: 768px`).

**Open/close pattern:**
```javascript
function openDetail(id) {
    overlay.classList.remove('hidden'); overlay.classList.add('visible');
    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('visible'));
}
function closeDetail() {
    panel.classList.remove('visible');
    setTimeout(() => { overlay.classList.add('hidden'); panel.classList.add('hidden'); }, 250);
}
```

**Escape cascade:** Close modals first, then detail panel.

### 5.21 Rename Dialog

Inline rename within a row or as a prompt:
```javascript
const newName = await showPrompt('Rename', 'Enter new name');
if (!newName) return;
await fetch(`/api/items/${id}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newName }),
});
item.title = newName;  // Optimistic update
render();
```

### 5.22 Home Page / Dashboard Landing

```
.home-hero (centered, padded)
+-- .home-icon (circular logo, 36x36)
+-- .home-title (24px, cyan, bold)
+-- .home-version (12px, muted)
+-- .home-desc (13px, secondary, max-width 600px)

.home-cards (grid auto-fit minmax(200px, 1fr))
+-- .home-feature (card with icon + title + description)

.home-status-grid (grid auto-fit minmax(120px, 1fr))
+-- .home-stat (bg, border, centered, with colored value)
```

### 5.23 Logs Viewer

Two styles available — use **Style B (Structured)** for new projects. Style A exists in NTS Web but is being phased out.

#### Style A: Plain Text (NTS Web legacy)

```css
.log-viewer {
    max-height: 800px; overflow-y: auto;
    font-family: monospace; font-size: 11px;
    color: var(--secondary); background: var(--bg);
    border: 1px solid var(--border); border-radius: 6px;
    padding: 12px;
}
.log-line { white-space: pre-wrap; word-break: break-all; }
.log-line.error { color: var(--red); }
.log-line.warning { color: var(--amber); }
.log-line.info { color: var(--text); }
```

#### Style B: Structured Entries (Preferred — used in Phone Control)

Each log entry is a distinct row with colored left border, relative timestamp, level badge, and message. Much more scannable than plain text.

```css
.log-list { display: flex; flex-direction: column; gap: 2px; }
.log-entry {
    display: flex; align-items: baseline; gap: 10px;
    padding: 8px 12px; background: var(--bg-card); border-radius: 4px;
    font-size: 12px; font-family: 'Menlo', 'Consolas', monospace;
    border-left: 3px solid var(--border);
}
.log-entry.log-info    { border-left-color: var(--cyan); }
.log-entry.log-warning { border-left-color: var(--amber); }
.log-entry.log-error   { border-left-color: var(--red); }
.log-time  { color: var(--muted); min-width: 60px; flex-shrink: 0; font-size: 11px; }
.log-level { font-size: 10px; font-weight: 600; text-transform: uppercase;
             letter-spacing: 0.5px; min-width: 52px; flex-shrink: 0; }
.log-info .log-level    { color: var(--cyan); }
.log-warning .log-level { color: var(--amber); }
.log-error .log-level   { color: var(--red); }
.log-msg { color: var(--text); word-break: break-word; }
```

**Backend pattern:**
```python
import re
_LOG_RE = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\d{3} \[(\w+)\] (.+)$")

@app.get("/api/logs")
async def get_logs(lines: int = 200):
    lines = min(lines, 1000)
    log_file = LOGS_DIR / f"app-{datetime.now():%Y-%m-%d}.log"
    if not log_file.exists(): return {"logs": []}
    raw = log_file.read_text().strip().splitlines()
    entries = [{"ts": m.group(1), "level": m.group(2), "message": m.group(3)}
               for line in raw if (m := _LOG_RE.match(line))]
    entries.reverse()
    return {"logs": entries[:lines]}
```

**Frontend pattern:**
```javascript
function fetchLogs() {
    api('GET', '/api/logs?lines=200').then(res => {
        if (!res?.logs?.length) { list.innerHTML = '<div class="empty-state">No logs</div>'; return; }
        list.innerHTML = res.logs.map(entry => {
            const lvl = entry.level.toLowerCase();
            const cls = lvl === 'error' ? 'log-error' : lvl === 'warning' ? 'log-warning' : 'log-info';
            const age = relativeTime(new Date(entry.ts.replace(' ', 'T')).getTime() / 1000);
            return `<div class="log-entry ${cls}">
                <span class="log-time">${age}</span>
                <span class="log-level">${entry.level}</span>
                <span class="log-msg">${escHtml(entry.message)}</span>
            </div>`;
        }).join('');
    });
}
```

**Key features:**
- Colored left border per level (3px solid) — most visually distinctive element
- Relative timestamps via `relativeTime()` ("5s ago", "3m ago")
- Monospace font for entire entry
- 2px gap between entries (tight but readable)
- Auto-refresh on interval (10s) when logs view is active
- Newest entries first

**Both styles share:**
- Refresh button to reload
- "Load More" for older entries (Style A: offset tracking, Style B: increase `?lines=N`)
- Color coding: ERROR=red, WARNING=amber, INFO=cyan/text
- Search filter with clear button

### 5.24 Settings Form Layout

```css
.settings-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.settings-grid { display: grid; grid-template-columns: 200px 1fr; gap: 8px 16px; align-items: center; }
.settings-label { font-size: 12px; color: var(--secondary); }
.settings-input { max-width: 200px; }
.settings-hint { width: 14px; height: 14px; border: 1px solid var(--secondary); border-radius: 50%; font-size: 9px; font-weight: bold; text-align: center; cursor: help; }
```

Mobile: `.settings-columns` collapses to single column at 900px.

### 5.25 Sensor/Toggle Controls

```css
.sensor-toggle {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; color: var(--secondary);
    background: var(--bg-dim); padding: 3px 8px; border-radius: 4px; cursor: pointer;
}
.sensor-toggle.off { opacity: 0.4; }
```

Checkbox with `accent-color: var(--cyan)` for boolean toggles.

### 5.26 Refresh Countdown Timer

Display "updates in Xs" in the header next to status indicator:

```javascript
function updateCountdown(nextPushTime) {
    const remaining = Math.max(0, Math.ceil((nextPushTime - Date.now()) / 1000));
    countdownEl.textContent = `${remaining}s`;
}
```

### 5.27 Header Stats

Inline stat boxes in the header showing key metrics:

```css
.stat-box { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--border); border-radius: 4px; padding: 2px 8px; font-size: 11px; }
.stat-label { color: var(--muted); text-transform: uppercase; }
.stat-value { color: var(--cyan); font-variant-numeric: tabular-nums; }
```

### 5.28 Restart Overlay

Distinct from the WS reconnection overlay (5.18) — shown when server is deliberately restarting:

```css
.restart-overlay {
    display: none; position: fixed; inset: 0; z-index: 99999;
    background: rgba(0,0,0,0.92);  /* Darker than modal overlay */
    justify-content: center; align-items: center;
}
.restart-overlay.active { display: flex; }
.restart-spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--bg-dim);
    border-top-color: var(--cyan);  /* Spinner via border-top technique */
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
.restart-text { font-size: 18px; font-weight: 600; color: var(--text); }
.restart-sub { font-size: 12px; color: var(--muted); }
```

### 5.29 Pagination Bar

```css
.pagination-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; font-size: 11px; }
.pagination-controls { display: flex; align-items: center; gap: 8px; }
.pagination-btn { font-size: 11px; padding: 3px 10px; color: var(--cyan); border-color: var(--border); }
.pagination-btn:disabled { color: var(--muted); border-color: var(--bg-dim); }
.pagination-page { font-size: 11px; color: var(--text); min-width: 50px; text-align: center; }
```

### 5.30 Warning Banners

Full-width banner at top for critical alerts:
```css
.warning-banner {
    z-index: 9999;
    box-shadow: 0 2px 12px rgba(255,80,80,0.5);
    animation: warning-pulse 1s infinite;
}
```

**Overrun/alert banner variant** (Task Analytics): Red pulsing banner for task overrun alerts. Uses `@keyframes pulse-red` with box-shadow pulsing. Hidden by default (`hidden` class), shown when alerts are active.

```css
.overrun-banner {
    background: rgba(255,80,80,0.1);
    border: 1px solid var(--red);
    border-radius: 6px;
    padding: 10px 16px;
    margin-bottom: 12px;
    color: var(--red);
    font-weight: 600;
    font-size: 12px;
    animation: pulse-red 2s ease-in-out infinite;
}
@keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,80,80,0.4); }
    50% { box-shadow: 0 0 12px 4px rgba(255,80,80,0.4); }
}
```

### 5.31 Task Feed (Scrolling Event Log)

Live scrolling log of recent events, color-coded by status. Auto-scrolls. Caps at 20-30 entries.

```css
.task-feed {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    max-height: 300px;
    overflow-y: auto;
    font-family: var(--font-mono);
    font-size: 11px;
}
.task-feed-entry { padding: 3px 0; border-bottom: 1px solid var(--grid-line); }
.task-feed-entry:last-child { border-bottom: none; }
```

Each entry shows: relative time, task ID, subject, status arrow. Color = status color from `CHART.status` map. Sort by `updated_at` descending.

---

## 6. Interaction Patterns

### 6.1 Click Behaviors

| Action | Desktop | Mobile |
|--------|---------|--------|
| Select row | Checkbox click | Checkbox click |
| View detail | Double-click row | Double-tap row |
| Context menu | Right-click | Long-press (500ms) |
| Sort column | Click header | Click header |
| Remove sort | Right-click header | Long-press header |
| Copy text | Click copyable element | Tap copyable element |
| Expand/collapse | Click section header | Click section header |

### 6.2 Destructive Actions

**Always require confirmation. Never one-click delete.**

```javascript
const ok = await showConfirm('Delete Item', `Delete "${title}"?`, 'Delete');
if (!ok) return;
```

- Server restart: double-click with 3-second timeout, button text changes during confirmation window
- Bulk operations: show count in confirmation ("Delete 5 items?")

### 6.3 Staged Actions (Two-Stage Confirmation Without Modal)

For less-critical but irreversible actions:

```javascript
// First click: change button text + add pulsing animation
btn.textContent = 'Click again to confirm';
btn.classList.add('btn-staged');
setTimeout(() => { btn.textContent = original; btn.classList.remove('btn-staged'); }, 4000);
// Second click within 4s: execute
```

### 6.4 Optimistic Updates

Flag items immediately on action, then reconcile on next data push:

```javascript
state._deleted[id] = { ts: Date.now(), status: 'pending' };
render();  // Shows item in red immediately
// Rows stay flagged 30s, removed on next push. Error shows tooltip.
```

### 6.5 Copy to Clipboard

```javascript
function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    // Fallback for HTTP contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
}
```

### 6.6 Browser Tab Title for Alerts

When a critical threshold is exceeded (e.g., temperature warning), update `document.title`:
```javascript
document.title = '!! WARNING !! App Name';
// Reset when condition clears
```

### 6.7 Keyboard Shortcuts

- `Escape`: Close modals (cascade: inner first, then outer on next press)
- `Enter`: Submit dialogs/forms
- Browser back/forward: Navigate tabs via `popstate` + URL pathname

### 6.8 URL Routing

Use `history.pushState` with pathname (not hash): `/${tab}`. On load, read `location.pathname` first, fall back to `location.hash`:
```javascript
const path = location.pathname.replace(/^\//, '');
const hash = location.hash.replace('#', '');
const initTab = path || hash || 'home';
```

### 6.9 Form Submission Pattern

```javascript
async function saveSettings(formEl) {
    const data = {};
    formEl.querySelectorAll('input, select').forEach(el => {
        data[el.name] = el.type === 'checkbox' ? el.checked :
                        el.type === 'number' ? Number(el.value) : el.value;
    });
    const btn = formEl.querySelector('.btn-save');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        const resp = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(5000),
        });
        if (!resp.ok) throw new Error(await resp.text());
        btn.textContent = 'Saved';
        btn.classList.add('btn-start');
        setTimeout(() => { btn.textContent = 'Save'; btn.classList.remove('btn-start'); btn.disabled = false; }, 2000);
    } catch (e) {
        btn.textContent = 'Error';
        btn.classList.add('btn-stop');
        setTimeout(() => { btn.textContent = 'Save'; btn.classList.remove('btn-stop'); btn.disabled = false; }, 3000);
        await showConfirm('Save Error', e.message, 'OK', 'neutral');
    }
}
```

Validate on submit only. Show green "Saved" or red "Error" feedback on the button.

### 6.10 Non-Selectable Elements

Apply `user-select: none` to: table headers, section headers, pagination buttons, modal headers, loading overlays.

---

## 7. Data Architecture

### 7.1 WebSocket Push Model

Server pushes data on interval (default 2s), NOT client polling:

```javascript
const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${location.host}/ws`);
```

**Push cycle** (server-side):
- Every 2s (configurable): push quick data (processes, containers, status) + temps
- Every Nth cycle (configurable, default 6): push full data (sessions, stats, usage, pricing)
- Pre-warm full data cache on startup in background

**Message types — server to client:**
```
{ type: "full",        data: {...} }    // Full dataset (sessions, stats, models, usage, pricing)
{ type: "quick",       data: {...} }    // Lightweight update (processes, containers, workflows)
{ type: "temps",       data: {...} }    // Temperature readings
{ type: "nosleep",     data: {...} }    // No-sleep agent status
{ type: "pong",        ts: 123456 }     // Latency response
{ type: "sessions_page", sessions, sessions_total, filter_counts }  // Paginated session list
{ type: "task_page",   session_id, data: {tasks} }  // Task data for a session
{ type: "storage_scan_entry", scan_id, entry }  // Streaming dir entry
{ type: "storage_scan_files", scan_id, files }  // Batch of file entries
{ type: "storage_scan_done",  scan_id, total }  // Scan complete
{ type: "storage_scan_error", scan_id, error }  // Scan error
{ type: "detail",      uuid, actions }  // Session/item detail response
{ type: "action_detail", data: {...} }  // Full action parameters + output
```

**Message types — client to server:**
```
{ type: "ping" }                                          // Latency measurement
{ type: "session_detail", uuid, offset: 0, count: 30 }   // Request item detail (paginated)
{ type: "action_detail", uuid, tool_id }                  // Request full action data
{ type: "session_page", page, page_size, sort_cols, filters }  // Paginated session request
{ type: "task_page", session_id }                              // Request tasks for session
{ type: "storage_scan", path, scan_id }                        // Start streaming scan
{ type: "storage_scan_cancel", scan_id }                       // Cancel streaming scan
```

**Ping/pong latency measurement:**
```javascript
function measureLatency() {
    const start = Date.now();
    ws.send(JSON.stringify({ type: 'ping' }));
    // On pong: latency = Date.now() - start; display as "Xms" in header
}
```

**Push message metadata:** Every server push includes a `fetch_ms` field showing how long the server took to gather data. Display in the header for transparency.

**Initial stale cache push:** On WS connect, push any cached data younger than 10x TTL immediately (before the loop starts) so the UI renders instantly.

**Client sends session pagination state on connect** — `session_page` is sent in `onopen` so the server knows the current view immediately.

### 7.2 State Management

Single global `state` object — no stores, no observables, no reducers:

```javascript
const state = {
    activeTab: 'home',
    ws: null,
    wsConnected: false,
    // Data from server (populated by WS messages)
    sessions: [],
    processes: null,
    containers: null,
    workflows: null,
    temps: null,
    usage: null,
    stats: null,
    models: null,
    noSleep: null,
    settings: {},
    // UI state
    filters: {},           // Active filter values per tab
    sortCols: [{col: 'last_ts', asc: false}],  // Multi-sort: array of {col, asc} objects
    selectedRows: new Set(),
    currentDetail: null,   // Currently viewed item in detail modal
    page: 0,
    pageSize: 50,
    // Tracking
    lastRender: {},        // Per-tab last render timestamp
    _deleted: {},          // Optimistic deletes
    pcOnline: false,       // Whether remote PC is reachable
    clientIsPc: false,     // Whether browsing from the PC itself (bypass online check)
};
```

**Rules:**
- Mutate `state` directly (no immutability required for vanilla JS)
- After mutation, call the relevant `render*()` function
- Never store DOM references in state — only data

### 7.3 Per-Tab Render Throttling

Only the active tab renders immediately. Background tabs render on configurable intervals:

```javascript
function shouldRenderTab(tab) {
    if (tab === state.activeTab) return true;
    const interval = getTabInterval(tab) || 3000;
    if (Date.now() - lastRender[tab] < interval) return false;
    lastRender[tab] = Date.now();
    return true;
}
```

On tab switch, force immediate render (bypass throttling). Use `requestAnimationFrame` for chart re-renders.

### 7.4 Caching Strategy

```
Client-side:
  localStorage    Data cache with TTL validation, feature state, column widths, collapsed sections
  state object    In-memory working data, refreshed on each WS push

Server-side:
  Full data       30s TTL (configurable via settings.cacheMaxAge)
  Quick data      3s TTL
  Temps           2s TTL
  Item detail     No cache (always fresh)
  Expensive scans 5min TTL (e.g., disk usage)
```

**localStorage cache with TTL:**
```javascript
const Cache = {
    get(key, maxAgeMs = 600000) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > maxAgeMs) { localStorage.removeItem(key); return null; }
            return data;
        } catch { return null; }
    },
    set(key, data) { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); },
    clear(key) { localStorage.removeItem(key); },
};
```

**Pre-warm on startup**: Backend pre-warms expensive caches in background on start so first request is fast.

Use `AbortController` for cancellable fetches. Use `AbortSignal.timeout()` for request timeouts:

```javascript
const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });  // 5s timeout
```

### 7.5 DOM Diffing (Manual)

For frequently updating lists (processes, containers, etc.), diff by unique key:

```javascript
const existing = {};
rows.forEach(tr => { existing[tr.dataset.key] = tr; });
const seen = new Set();
data.forEach(item => {
    seen.add(item.key);
    let tr = existing[item.key];
    if (tr) {
        // Update cells in-place (only if value changed)
        if (cell.textContent !== item.value) cell.textContent = item.value;
    } else {
        tr = createRow(item);
        tbody.appendChild(tr);
    }
});
rows.forEach(tr => { if (!seen.has(tr.dataset.key)) tr.remove(); });
```

### 7.6 Server-Side Preferences

```javascript
const Prefs = {
    _data: {}, _dirty: {}, _loaded: false,
    DEBOUNCE_MS: 2000,
    async load() { /* GET /api/preferences */ },
    get(key, fallback) { return this._data[key] ?? fallback; },
    set(key, value) { this._data[key] = value; this._dirty[key] = value; this._scheduleSave(); },
    // Nested key accessors (e.g., for presets stored as objects)
    getSub(key, subKey, fallback) {
        const obj = this._data[key];
        return (obj && typeof obj === 'object') ? (obj[subKey] ?? fallback) : fallback;
    },
    setSub(key, subKey, value) {
        if (!this._data[key] || typeof this._data[key] !== 'object') this._data[key] = {};
        this._data[key][subKey] = value;
        this._dirty[key] = this._data[key];
        this._scheduleSave();
    },
    _flush() { /* POST /api/preferences with dirty keys */ },
    _migrate() { /* One-time: migrate matching keys from localStorage to server-side prefs */ },
};
// Flush on page close
window.addEventListener('beforeunload', () => {
    navigator.sendBeacon('/api/preferences', new Blob([JSON.stringify(Prefs._dirty)]));
});
```

### 7.7 WebSocket Reconnection

When WS disconnects after being connected:
1. Show overlay: "Reconnecting..."
2. Poll `/api/ping` every 1s (up to 60s)
3. Show countdown: "Waiting for server... (Ns)"
4. On success: `window.location.reload()`

### 7.8 Pagination Pattern

For large datasets, use server-side pagination:

```javascript
// Client sends page request
ws.send(JSON.stringify({ type: 'page', page: 1, page_size: 50, sort: [...], filters: {...} }));

// Server responds with page + total count
// { type: 'page_response', items: [...], total: 500, page: 1, page_size: 50 }

// "Load more" pattern for detail views:
let offset = 0;
function loadMore() {
    offset += 30;
    ws.send(JSON.stringify({ type: 'detail', id, offset, count: 30 }));
}
```

Footer shows: "Showing 1-50 of 500". Buttons: Previous / Next (or "Load more" for append-style).

### 7.9 Streaming for Expensive Operations

For operations that take >1s, stream results via WebSocket line-by-line:

```
Client sends: {"type": "scan", "path": "/data", "scan_id": "scan_123"}
Server sends per-item: {"type": "scan_entry", "scan_id": "...", "entry": {...}}
Server sends done: {"type": "scan_done", "scan_id": "...", "total": ...}
Client can cancel: {"type": "scan_cancel", "scan_id": "..."}
```

Backend kills subprocess on cancel. All entries appear in real-time as they compute.

### 7.10 Server Health Auto-Reload

After the backend restarts (deploy, crash), auto-detect and reload:

```javascript
// Two separate polling functions:

// 1. pollAndReload() — called when WS detects a server restart
//    Shows restart overlay immediately, polls /api/ping every 1s (max 30 attempts)
//    On success: window.location.reload()
//    On max attempts: hides overlay, falls back to normal WS reconnect

// 2. pollForRestart() — called when user triggers explicit restart
//    Shows restart overlay with countdown: "Waiting for server... (Ns)"
//    Polls /api/ping every 1s (max 60 attempts)
//    On success: window.location.reload()
//    On max attempts: shows "Server did not respond. Try refreshing manually."

async function pollForRestart() {
    let attempts = 0;
    const interval = setInterval(async () => {
        attempts++;
        sub.textContent = `Waiting for server... (${attempts}s)`;
        try {
            const resp = await fetch('/api/ping', { signal: AbortSignal.timeout(2000) });
            if (resp.ok) { clearInterval(interval); window.location.reload(); }
        } catch { /* keep polling */ }
        if (attempts >= 60) { clearInterval(interval); sub.textContent = 'Try refreshing manually.'; }
    }, 1000);
}
```

### 7.11 Error Handling

```javascript
// Fetch errors: show via showConfirm(), never silently fail
try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
    return await resp.json();
} catch (e) {
    if (e.name === 'AbortError') return null;  // Timeout — silent
    await showConfirm('Error', e.message, 'OK', 'neutral');
    return null;
}

// WS errors: increment fail count, show overlay after 2+ consecutive failures
// Reset fail count on success
```

### 7.12 Fail Count Tracking

```javascript
let failCount = 0;
// On fetch/WS success: failCount = 0; hideOverlay();
// On fetch/WS failure: failCount++; if (failCount >= 2) showOverlay();
```

---

## 8. Mobile Design

### 8.1 Detection

```javascript
const isMobile = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 0;
```

### 8.2 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">
```

### 8.3 Navigation

- **Desktop**: Horizontal tab bar in header
- **Mobile**: Bottom nav bar (56px height) with 4-5 main tabs + "More" overflow menu
- **Full menu**: Slide-in overlay (260px width, translateX animation, 0.2s) with all tabs

```css
.mobile-bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 56px; z-index: 9999;
    display: flex; justify-content: space-around; align-items: center;
    background: var(--bg-card); border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
.mnav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 48px; font-size: 10px; color: var(--muted); }
.mnav-btn.active { color: var(--cyan); }
.mnav-btn svg { width: 20px; height: 20px; }

/* Overflow menu (slides up from bottom nav) */
.mnav-overflow { position: fixed; bottom: calc(56px + env(safe-area-inset-bottom)); right: 8px; z-index: 10000; }

/* Full slide-in menu */
.mobile-menu { position: fixed; top: 0; left: 0; width: 260px; height: 100svh; z-index: 10000; background: var(--bg-card); transform: translateX(-100%); transition: transform 0.2s; }
.mobile-menu.active { transform: translateX(0); }
.mmenu-item { padding: 12px 16px; min-height: 44px; border-left: 3px solid transparent; }
.mmenu-item.active { color: var(--cyan); border-left-color: var(--cyan); background: rgba(50,140,255,0.08); }
```

### 8.4 Pull-to-Refresh

Custom implementation (NOT browser native):

```javascript
const PTR_THRESHOLD = 110;
const PTR_MAX = 120;
const PTR_RESISTANCE = 0.4;  // Only 40% of finger distance translates to pull
let ptrStartY = 0, ptrActive = false, lastReload = 0;

el.addEventListener('touchstart', e => {
    if (document.scrollingElement.scrollTop <= 0) {
        ptrStartY = e.touches[0].clientY;
        ptrActive = true;
    }
}, { passive: true });

el.addEventListener('touchmove', e => {
    if (!ptrActive) return;
    const dy = e.touches[0].clientY - ptrStartY;  // Raw finger distance (pixels)
    const distance = Math.min(PTR_MAX, dy * PTR_RESISTANCE);  // Apply resistance
    if (distance > 0) {
        indicator.style.height = distance + 'px';
        indicator.textContent = distance >= PTR_THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
    }
}, { passive: true });

el.addEventListener('touchend', () => {
    if (!ptrActive) return;
    ptrActive = false;
    const h = parseInt(indicator.style.height);
    if (h >= PTR_THRESHOLD && Date.now() - lastReload > 2000) {
        indicator.textContent = 'Refreshing...';
        lastReload = Date.now();
        window.location.reload();
    }
    indicator.style.height = '0';
});
```

### 8.5 Mobile Table

```css
@media (max-width: 768px) {
    .data-table { table-layout: auto; }
    .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
```

Double-tap any row opens fullscreen detail modal showing all column values as vertical label:value pairs.

```css
.mobile-detail-fullscreen { width: 100vw; height: 100svh; display: flex; flex-direction: column; }
.mobile-detail-header { display: flex; justify-content: space-between; padding: 12px 16px; }
.mobile-detail-title { font-size: 14px; font-weight: bold; color: var(--cyan); }
.mobile-detail-body { flex: 1; overflow-y: auto; padding: 16px; }
.md-section { margin-bottom: 16px; }
.md-section .label { font-size: 10px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.md-section .value { font-size: 13px; color: var(--text); }
```

### 8.6 Mobile Rules

- Cards: full-bleed (no side borders/radius)
- Modals: fullscreen
- Touch targets: minimum 40px (36-44px range), 4-8px spacing between targets
- Filters: collapse behind toggle button
- Fewer columns with shorter names
- Reduced font sizes

### 8.7 Long-Press Context Menu

```javascript
function setupLongPress(el, callback, threshold = 500) {
    let timer, sx, sy;
    el.addEventListener('touchstart', e => {
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
        timer = setTimeout(() => callback(sx, sy, e), threshold);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientX-sx) > 10 || Math.abs(e.touches[0].clientY-sy) > 10)
            clearTimeout(timer);
    }, { passive: true });
    el.addEventListener('touchend', () => clearTimeout(timer));
}
```

### 8.8 Double-Tap Detection

```javascript
function setupDoubleTap(el, callback, threshold = 300) {
    let lastTap = 0;
    el.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTap < threshold) {
            e.preventDefault();
            callback(e);
        }
        lastTap = now;
    });
}
// Usage: setupDoubleTap(row, () => openDetailModal(row.dataset.key));
```

### 8.9 Safe Area Handling

```css
.mobile-nav { padding-bottom: env(safe-area-inset-bottom, 0px); }
.tab-content { padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)); }
```

### 8.10 Breakpoints

```
768px  — Primary mobile/desktop switch
900px  — Intermediate (optional, for some table/grid layouts)
```

---

## 9. Chart Conventions

### 9.1 Step Interpolation

All line/area charts use **step interpolation** — flat bars with vertical jumps. Never diagonal slopes.

```javascript
for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i-1].y);  // horizontal step
    ctx.lineTo(pts[i].x, pts[i].y);     // vertical step
}
```

### 9.2 "Now" Marker

- Dashed vertical line at current time: `5px dash, 5px gap`, 1px cyan
- Label "Now" centered below, 9px font
- NOT a data point (doesn't compress intervals)
- Non-interactive

### 9.3 Crosshair + Tooltip

- Crosshair: vertical line following mouse freely (not snapped)
- Tooltip: positioned left or right based on available space, at cursor Y
- Max-width: 200-250px. Shows timestamp + per-series breakdown.
- Desktop: `mousemove`/`mouseleave`. Mobile: `touchstart`/`touchmove`, hides 2s after `touchend`.
- Store chart state on canvas element (`canvas._chartState`)

### 9.4 Stacking Order

Smallest series at bottom, largest on top.

### 9.5 Dynamic Bucketing

Merge data into larger buckets for long time spans:
```
>1 year: weekly | >3 months: 3-day | >1 month: daily | >2 weeks: 12h
>7 days: 6h | >4 days: 4h | >2 days: 2h | <=2 days: hourly
```

### 9.6 Chart Styling

```javascript
// Fill: rgba with ~0.235 opacity. Stroke: solid rgb, lineWidth: 1.5
// Title: above chart, 14px, muted color
// Axis labels: 10px monospace, secondary color
// X-axis dates: "20/Feb", "1/Mar"
// Legend: right side (top-right on mobile)
```

### 9.7 Gantt Chart (Duration Bars)

Left-aligned horizontal bars in Canvas 2D. Width = duration relative to longest task. Task ID labels on left, duration text on right.

```javascript
// Layout: each task gets a row (14px height, 2px gap)
// Pad left 34px for "#ID" labels, right for duration labels
// Bar width = (task_duration / max_duration) * available_width
// Color = CHART.status[task.status]
// Duration = updated_at - created_at (or from status_history if available)
// Dynamic canvas height = pad.top + tasks.length * (rowH + gap) + pad.bottom
```

Use `roundRect()` for bars with 2px corner radius. Reserve ~50px on the right for duration text labels.

### 9.8 Dependency Graph (Node-Link)

Canvas 2D node-link diagram showing task dependencies. Circles = tasks (colored by status), arrows = `blocked_by` relationships.

```javascript
// Layout: left-to-right topological sort
// 1. Build incoming edge count per task
// 2. BFS from roots (no incoming edges) → assign columns
// 3. Distribute tasks vertically within each column
// Node radius: 14px, filled with status color
// Label: "#ID" in bold 9px, centered on node
// Arrows: line from source circle edge to target circle edge
//   Arrow head: 6px triangle at target end
//   Color: var(--bg-dim) (#28282d)
// Empty state: "No dependencies" centered text
```

---

## 10. Backend Architecture

### 10.1 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI (Python 3.12) |
| ASGI | uvicorn (single worker) |
| WebSocket | wsproto |
| Templates | Jinja2 |
| Container | Docker via CasaOS |
| Auth | Token cookie (HTTP-only, 7-day expiry) |

### 10.2 Authentication

```python
# auth.json: {"username": "admin", "password_hash": "sha256:..."}
# sessions.json: {"token": expiry_timestamp, ...}  — token maps to Unix expiry float
# Cookie: project_token, HttpOnly, SameSite=Lax, 7-day expiry (configurable), Path: /
# Domain: .ntsserver.christmas (cross-subdomain shared auth)
# Shared auth files: /DATA/AppData/nts-web/auth.json + sessions.json
# On load: prune expired sessions — AUTH_SESSIONS = {k: v for k, v in data.items() if v > now}
```

Public routes: `/login`, `/api/login`, `/static/*`, `/favicon.ico`. All others require valid cookie.

### 10.2b Security Headers (MANDATORY)

Every FastAPI app must include these security headers via middleware. Phone Control implements this; NTS Web and Task Analytics currently lack it (known gap to fix during mega-merge).

```python
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "connect-src 'self' ws: wss:; "
        "img-src 'self' data:; "
        "font-src 'self'"
    )
    return response
```

### 10.2c Login Rate Limiting

Brute-force protection for the login endpoint. Phone Control implements this; other dashboards should too.

```python
_login_attempts = {}  # ip -> [timestamps]
LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 300  # 5 minutes

@app.post("/api/login")
async def login(request: Request):
    ip = _get_client_ip(request)
    now = time.time()
    attempts = _login_attempts.get(ip, [])
    attempts = [t for t in attempts if now - t < LOGIN_WINDOW_SECONDS]
    if len(attempts) >= LOGIN_MAX_ATTEMPTS:
        return JSONResponse({"error": "Too many attempts. Try again later."}, 429)
    _login_attempts[ip] = attempts
    # ... validate credentials ...
    if invalid:
        _login_attempts[ip].append(now)
        return JSONResponse({"error": "Invalid credentials"}, 401)
    # Clear attempts on success
    _login_attempts.pop(ip, None)
    # ... set cookie, return ok ...
```

### 10.2d Machine-to-Machine Auth

For endpoints called by automation (Tasker, n8n webhooks) rather than browsers, use Bearer token auth:

```python
M2M_TOKEN = os.environ.get("M2M_TOKEN", "")

def _check_m2m_auth(request: Request) -> bool:
    auth = request.headers.get("authorization", "")
    return auth == f"Bearer {M2M_TOKEN}" and M2M_TOKEN != ""
```

Used by: Phone Control notification endpoint (Tasker sends notifications with Bearer token).

### 10.3 API Convention

```
GET    /api/health        Health check (returns {status, version, timestamp})
GET    /api/ping          Latency (returns {pong: timestamp})
GET    /api/data          Main data fetch (cached)
POST   /api/action        Actions (body: JSON)
DELETE /api/action        Stop/cancel actions
POST   /api/preferences   Save preferences (deep-merge for dict values)
GET    /api/preferences   Load preferences
WS     /ws                Real-time push + bidirectional commands
```

**Two separate config systems:**
- `settings.json` — server/operational settings (thresholds, SSH targets, cache TTLs, Telegram, intervals). Merged with `DEFAULT_SETTINGS` on load. Changed via Settings tab.
- `preferences.json` — UI state (column widths, sort presets, page size, collapsed sections). Deep-merged on save (dict values merge, others overwrite). Changed automatically by client.

**Response format:** Use `{"ok": true}` for action responses. Include error details as `{"ok": false, "error": "message"}`.

### 10.4 Deployment

```bash
# MUST use --force-recreate, NOT docker restart
docker compose -f /var/lib/casaos/apps/<project>/docker-compose.yml up -d --force-recreate
```

### 10.5 Backend Skeleton (Getting Started)

Minimal FastAPI app with auth + WS + Jinja2:

```python
# app.py
import asyncio, json, hashlib, secrets, time
from pathlib import Path
from fastapi import FastAPI, Request, WebSocket, Response
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

VERSION = "1.00"
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

AUTH_FILE = Path("auth.json")      # {"username":"admin","password_hash":"sha256:..."}
SESSIONS_FILE = Path("sessions.json")  # {"token": {"user":"admin","created":...}}

def check_token(request: Request) -> bool:
    token = request.cookies.get("nts_token")
    if not token: return False
    sessions = json.loads(SESSIONS_FILE.read_text()) if SESSIONS_FILE.exists() else {}
    return token in sessions

@app.get("/")
async def index(request: Request):
    if not check_token(request): return RedirectResponse("/login")
    return templates.TemplateResponse("index.html", {"request": request, "version": VERSION, "build_ts": int(time.time())})

@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/api/login")
async def login(request: Request):
    data = await request.json()
    auth = json.loads(AUTH_FILE.read_text())
    pw_hash = "sha256:" + hashlib.sha256(data["password"].encode()).hexdigest()
    if data["username"] != auth["username"] or pw_hash != auth["password_hash"]:
        return JSONResponse({"error": "Invalid credentials"}, 401)
    token = secrets.token_hex(32)
    sessions = json.loads(SESSIONS_FILE.read_text()) if SESSIONS_FILE.exists() else {}
    sessions[token] = {"user": data["username"], "created": time.time()}
    SESSIONS_FILE.write_text(json.dumps(sessions))
    resp = JSONResponse({"ok": True})
    resp.set_cookie("nts_token", token, httponly=True, samesite="lax", max_age=7*86400, path="/", domain=".ntsserver.christmas")
    return resp

@app.get("/api/ping")
async def ping(): return {"pong": time.time()}

# WebSocket with push loop
_clients = {}
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    wid = id(ws)
    _clients[wid] = ws
    try:
        # Start push loop
        async def push_loop():
            while True:
                data = get_current_data()  # Your data collection
                await ws.send_json(data)
                await asyncio.sleep(2)
        push_task = asyncio.create_task(push_loop())
        # Handle incoming messages
        while True:
            msg = await ws.receive_json()
            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong", "ts": time.time()})
            # Handle other message types...
    except Exception:
        pass
    finally:
        push_task.cancel()
        _clients.pop(wid, None)
```

```dockerfile
# Dockerfile — see Section 10.8 for the full Dockerfile with system dependencies
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY templates/ templates/
COPY static/ static/
EXPOSE 7777
CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7777", "--ws", "wsproto", "--log-level", "info"]
```

```
# requirements.txt
fastapi==0.115.0
uvicorn==0.30.0
wsproto==1.2.0
jinja2==3.1.4
```

### 10.6 Logging

Use named loggers per module (e.g., `app`, `api`, `websocket`, `data`, `ssh`).

```python
from logging.handlers import RotatingFileHandler
# File named by date, rotated by size (not time-based)
handler = RotatingFileHandler(f"logs/app-{date}.log", maxBytes=5*1024*1024, backupCount=5)
# Console: INFO level. File: DEBUG level (separate levels per handler)
# Format: "YYYY-MM-DD HH:MM:SS.mmm  LEVEL  logger  message" (3-digit ms)
```

Cleanup: delete `.log*` files older than 7 days on startup.

**HTTP middleware:** Two middleware layers in order — auth first, then request logging:
```python
@app.middleware("http")
async def log_requests(request, call_next):
    start = time.time()
    log_api.info(f"-> {request.method} {request.url.path}")
    response = await call_next(request)
    elapsed = (time.time() - start) * 1000
    log_api.info(f"<- {request.method} {request.url.path} [{response.status_code}] {elapsed:.1f}ms")
    return response
```

Auth middleware returns 401 JSON for `/api/*` paths, 302 redirect for page routes.

### 10.7 Docker Bind Mounts

```yaml
volumes:
    - /DATA/AppData/<project>/logs:/app/logs           # Persistent logs
    - /DATA/AppData/<project>/settings.json:/app/settings.json  # Persistent settings
    - /DATA/AppData/<project>/auth.json:/app/auth.json         # Shared auth
    - /DATA/AppData/<project>/sessions.json:/app/sessions.json # Shared sessions (required for cross-restart auth)
    - /home/nothingitis/.ssh:/root/.ssh:ro              # SSH keys (if SSH needed)
    - /home/nothingitis/.claude:/home/nothingitis/.claude:ro  # Claude data (if needed)
network_mode: bridge
restart: unless-stopped
```

### 10.8 CasaOS App Setup (Full Guide)

CasaOS manages Docker containers as "apps" via extended `docker-compose.yml` metadata. Here's the complete pattern for turning a web dashboard into a CasaOS app.

**Directory structure:**
```
/var/lib/casaos/apps/<project-name>/
    docker-compose.yml          # CasaOS-extended compose file (THE app definition)

/DATA/AppData/<project-name>/   # Persistent data (bind-mounted into container)
    logs/                       # Application logs
    settings.json               # User settings
    auth.json                   # Shared auth (symlink or bind mount from nts-web)
    sessions.json               # Shared session tokens
    preferences.json            # UI preferences

<project-source>/               # Source code (where you develop)
    app.py
    Dockerfile
    requirements.txt
    static/
    templates/
```

**Step 1: Dockerfile** — install system deps + Python packages:

```dockerfile
FROM python:3.12-slim

# System packages needed by your app
RUN apt-get update && apt-get install -y --no-install-recommends \
    lm-sensors \        # Temperature monitoring (if needed)
    openssh-client \    # SSH to remote machines (if needed)
    bash coreutils procps curl \
    && rm -rf /var/lib/apt/lists/*

# Docker CLI only — for container monitoring via docker.sock (if needed)
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.5.1.tgz | \
    tar xz --strip-components=1 -C /usr/local/bin docker/docker

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY templates/ templates/
COPY static/ static/

EXPOSE 7777

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7777", "--ws", "wsproto", "--log-level", "info"]
```

**Step 2: Build the Docker image locally:**
```bash
cd /DATA/AppData/<project-name>
docker build -t <project-name>:latest .
```

**Step 3: docker-compose.yml** — the CasaOS app definition:

```yaml
name: <project-name>
services:
    <project-name>:
        cpu_shares: 50               # CPU priority (10=low, 50=normal, 90=high)
        command: []
        container_name: <project-name>
        deploy:
            resources:
                limits:
                    memory: "536870912"   # 512 MB in bytes (adjust per app)
        environment:
            TZ: Europe/London
            HOST_ROOT: /host             # If scanning host filesystem from container
        hostname: <project-name>
        image: <project-name>:latest     # Local image from docker build
        labels:
            icon: http://192.168.1.137:<port>/static/icon.png
        networks:
            default: null
        ports:
            - mode: ingress
              target: <port>             # Container port
              published: "<port>"        # Host port (same number)
              protocol: tcp
        restart: unless-stopped

        # ── Volumes: persistent data + host access ──
        volumes:
            # App logs (writable)
            - type: bind
              source: /DATA/AppData/<project-name>/logs
              target: /app/logs
              bind:
                create_host_path: true
            # Settings (writable)
            - type: bind
              source: /DATA/AppData/<project-name>/settings.json
              target: /app/settings.json
            # Shared auth (from NTS Web — cross-subdomain SSO)
            - type: bind
              source: /DATA/AppData/nts-web/auth.json
              target: /app/auth.json
              read_only: true
            - type: bind
              source: /DATA/AppData/nts-web/sessions.json
              target: /app/sessions.json
              bind:
                create_host_path: true
            # SSH keys (if SSH needed)
            - type: bind
              source: /home/nothingitis/.ssh
              target: /root/.ssh
              read_only: true

        # ── Optional: privileged access ──
        # privileged: true             # Only if you need lm-sensors / host PID access
        # pid: host                    # Only if you need to see host processes

        # ── CasaOS per-service metadata ──
        x-casaos:
            envs:
                - container: TZ
                  description:
                    en_us: Timezone
            ports:
                - container: "<port>"
                  description:
                    en_us: <Project Name> HTTP port
            volumes:
                - container: /app/logs
                  description:
                    en_us: Application logs
                - container: /app/settings.json
                  description:
                    en_us: Settings file
                - container: /app/auth.json
                  description:
                    en_us: Authentication file (shared)
                - container: /app/sessions.json
                  description:
                    en_us: Session tokens file (shared)

networks:
    default:
        name: <project-name>_default

# ── CasaOS top-level app metadata ──
x-casaos:
    architectures:
        - amd64
    author: nothingitis
    category: Utilities
    description:
        en_us: "<One-paragraph description of what this app does>"
    developer: nothingitis
    hostname: ""
    icon: http://192.168.1.137:<port>/static/icon.png
    index: /                         # URL path for the main page
    is_uncontrolled: false
    main: <project-name>             # Must match service name above
    port_map: "<port>"               # Port shown in CasaOS UI
    scheme: http                     # http or https
    store_app_id: <project-name>     # Unique app ID
    tagline:
        en_us: "<Short one-line description>"
    thumbnail: ""
    title:
        custom: ""
        en_us: "<Display Name>"
```

**Step 4: Deploy the app:**
```bash
# First time — CasaOS discovers it automatically from /var/lib/casaos/apps/
# Subsequent deploys after code changes:
cd /DATA/AppData/<project-name>
docker build -t <project-name>:latest .
docker compose -f /var/lib/casaos/apps/<project-name>/docker-compose.yml up -d --force-recreate
```

**Key CasaOS fields explained:**

| Field | Purpose |
|-------|---------|
| `store_app_id` | Unique identifier — matches the directory name in `/var/lib/casaos/apps/` |
| `main` | Which service is the "primary" one (for multi-container apps) |
| `port_map` | Port CasaOS displays in its dashboard — must match the published port |
| `icon` | URL to app icon — served from the app itself (`/static/icon.png`) |
| `index` | URL path for the "Open" button in CasaOS (usually `/`) |
| `scheme` | `http` or `https` — protocol for the "Open" link |
| `category` | CasaOS app category: `Utilities`, `Network`, `Media`, etc. |
| `is_uncontrolled` | `false` = CasaOS manages start/stop. `true` = CasaOS doesn't touch it |
| `cpu_shares` | Docker CPU shares: 10 (low), 50 (normal), 90 (high) |
| `deploy.resources.limits.memory` | Memory limit in bytes. Common: 512MB=536870912, 1GB=1073741824, 4GB=4294967296 |

**Memory limit reference (bytes):**
```
64 MB  = 67108864      (lightweight daemon)
128 MB = 134217728     (proxy, simple service)
256 MB = 268435456     (small web app)
512 MB = 536870912     (medium web app — good default)
1 GB   = 1073741824    (heavy web app)
4 GB   = 4294967296    (data-heavy app with caches)
```

**Common volume patterns:**

| Need | Source | Target | Mode |
|------|--------|--------|------|
| Persistent logs | `/DATA/AppData/<app>/logs` | `/app/logs` | writable, create_host_path |
| Settings file | `/DATA/AppData/<app>/settings.json` | `/app/settings.json` | writable |
| Shared auth | `/DATA/AppData/nts-web/auth.json` | `/app/auth.json` | read_only OR writable |
| Session tokens | `/DATA/AppData/nts-web/sessions.json` | `/app/sessions.json` | writable (create_host_path) |
| SSH keys | `/home/nothingitis/.ssh` | `/root/.ssh` | read_only |
| Claude data | `/home/nothingitis/.claude` | `/home/nothingitis/.claude` | read_only or writable |
| Host filesystem | `/` | `/host` | read_only (needs HOST_ROOT env) |
| Docker socket | `/var/run/docker.sock` | `/var/run/docker.sock` | read_only |

**Optional: Privileged mode** — only use when you need:
- `privileged: true` — for `lm-sensors` (hardware temp monitoring), raw device access
- `pid: host` — to see host processes (for process monitoring)
- Docker socket mount — for container management/monitoring

**Icon requirements:**
- Circular (as per Hard Rules)
- Served from the app itself at `/static/icon.png`
- Referenced via `http://192.168.1.137:<port>/static/icon.png` (local IP, not domain)
- Add `?v=2` cache buster if updating the icon

**Common pitfalls (IMPORTANT — read before deploying):**

1. **NEVER use `docker run` for CasaOS apps.** Manual `docker run` creates containers outside CasaOS management — CasaOS can't see, stop, restart, or manage them. Always use `docker compose -f /var/lib/casaos/apps/<project>/docker-compose.yml up -d --force-recreate`. If a manual container already exists, `docker stop <name> && docker rm <name>` first.

2. **`Path.home()` resolves to `/root/` inside Docker**, not `/home/nothingitis/`. If your app uses `Path.home()` or `os.path.expanduser("~")` to find files at `~/.claude/` or similar, it will look in `/root/` instead. Fix: use an environment variable (e.g., `TASKS_DIR`, `DATA_DIR`) and set it in the compose file. Example:
   ```yaml
   environment:
       TASKS_DIR: /home/nothingitis/.claude/task-sessions
   ```
   ```python
   TASKS_DIR = Path(os.environ.get("TASKS_DIR", str(Path.home() / ".claude/task-sessions")))
   ```

3. **Auth file paths must match between app code and compose volumes.** If the app code reads `AUTH_FILE` and `SESSIONS_FILE` env vars, the compose file must set them AND mount the files at those exact paths. Mismatches cause silent 401 errors.

4. **After code changes, always rebuild the image before redeploying.** The compose file references the local image tag — if you edit source files but skip `docker build`, the container still runs the old code:
   ```bash
   cd /DATA/AppData/<project-name>
   docker build -t <project-name>:latest .
   docker compose -f /var/lib/casaos/apps/<project-name>/docker-compose.yml up -d --force-recreate
   ```

**Nginx Proxy Manager setup (for public access):**
After the CasaOS app is running, add a proxy host in NPM:
- Domain: `<app>.ntsserver.christmas`
- Forward to: `192.168.1.137:<port>`
- SSL: Let's Encrypt certificate
- Force SSL: yes

### 10.8b Atomic File Writes with fsync

For JSON files that act as persistent state (alarms, notifications, settings), use atomic writes to prevent corruption on crash:

```python
import os, json, tempfile

def _save_json(path: Path, data: dict):
    """Write JSON atomically — fsync ensures data hits disk."""
    tmp = path.with_suffix('.tmp')
    with open(tmp, 'w') as f:
        json.dump(data, f, indent=2)
        f.flush()
        os.fsync(f.fileno())
    tmp.rename(path)  # Atomic on POSIX
```

Used by: Phone Control (alarms, notification rules). Prevents half-written JSON if container crashes mid-write.

### 10.9 Data Collection Pattern

For shell-based data gathering (external scripts that produce JSON):

```python
import subprocess, json

async def run_gather(mode: str, *args, timeout=30) -> dict:
    cmd = ["/path/to/gather-data.sh", mode] + list(args)
    proc = await asyncio.create_subprocess_exec(*cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=timeout)
    return json.loads(stdout)
```

Modes: `full` (everything, slow), `quick` (lightweight, fast), `detail <id>` (single item).

### 10.10 Cache Dedup Lock Pattern

Prevent thundering herd when cache expires with concurrent requests:

```python
_full_lock = asyncio.Lock()
async def get_full_data(force=False):
    if not force and _cache["full_data"] and (now - _cache["full_ts"]) < TTL:
        return _cache["full_data"]
    if _full_lock.locked() and _cache["full_data"]:
        return _cache["full_data"]  # Return stale rather than wait
    async with _full_lock:
        # Double-check after acquiring lock
        if not force and _cache["full_data"] and (now - _cache["full_ts"]) < TTL:
            return _cache["full_data"]
        return await _do_full_fetch()
```

**Tiered cache warm on startup:** Fast data first (quick + temps), then slow data in background (full + storage).

**Background cache refresh:** Perpetual `asyncio.create_task` loop refreshing full data independently of WS pushes.

**File watcher cache invalidation** (Task Analytics pattern): Background asyncio task checking directory `mtime` every 3s. On change: invalidate all caches, broadcast `full_update` to all WS clients. Lightweight alternative to inotify — no system dependencies needed.

```python
async def _file_watcher():
    last_mtime = 0
    while True:
        await asyncio.sleep(3)
        try:
            mtime = TASKS_DIR.stat().st_mtime
            if mtime != last_mtime:
                last_mtime = mtime
                _invalidate_all_caches()
                await _broadcast({"type": "full_update"})
        except Exception:
            pass
```

### 10.11 Parallel WebSocket Streams

The WS push loop is NOT a single loop with a counter. Run independent stream coroutines via `asyncio.gather()`:

```python
await asyncio.gather(
    temps_stream(ws, ws_lock),    # Every 2s
    quick_stream(ws, ws_lock),    # Every 2s
    full_stream(ws, ws_lock),     # Every 30s (configurable)
    task_stream(ws, ws_lock),     # Every 1s (when tasks tab active)
)
```

Each stream has its own sleep interval. All sends go through `_ws_send(ws, data, ws_lock)` to prevent interleaving.

### 10.11b WebSocket Broadcast on Mutation

Alternative to the push-loop pattern — broadcast fresh data immediately when state changes (instead of waiting for next push cycle):

```python
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
    async def broadcast(self, data: dict):
        for ws in self.active:
            try: await ws.send_json(data)
            except: pass

manager = ConnectionManager()

# After any mutation (create, update, delete):
@app.post("/api/alarms")
async def create_alarm(request: Request):
    # ... validate and save ...
    await manager.broadcast({"type": "alarms", "data": _get_all_alarms()})
    return {"ok": True}
```

Used by: Phone Control (alarm/timer/volume changes trigger immediate broadcast). Best for apps where mutations are infrequent but should be instantly visible. NTS Web uses the push-loop pattern instead (best for frequently-changing server metrics).

**WS lock sharing:** The `ws_lock` is created in `websocket_endpoint` and stored in `_ws_client_state[wid]["ws_lock"]` so both the push loop and scan tasks (e.g., `_stream_scan_directory`) can share it. Never create the lock inside a coroutine — it must be accessible to all tasks for the same client.

**Per-client state tracking:**
```python
_ws_client_state = {}  # wid -> { ws, ws_lock, scans: {scan_id: task}, ... }
# On disconnect (finally block): cancel all scan tasks, pop client state
```

### 10.12 Client IP & PC Detection

```python
def _get_client_ip(request):
    # Check proxy headers first (for requests through Nginx Proxy Manager):
    # 1. x-forwarded-for: take first IP in comma-separated list
    # 2. x-real-ip: direct header
    # 3. Fall back to request.client.host
    return ip

def _client_is_pc(request):
    # Returns True if client IP matches the Windows PC IP (192.168.1.97)
    # Sent in WS push data so frontend can bypass pcOnline guard rails
```

### 10.13 HOST_ROOT Environment Variable

Docker containers can't access host paths directly. `HOST_ROOT` maps container paths to host paths:

```python
HOST_ROOT = os.environ.get("HOST_ROOT", "")
# In Docker: HOST_ROOT="" (paths inside container are absolute)
# Bare metal: paths are already host paths
# Used for: session file access, log file paths, gather-data.sh invocations
```

### 10.14 Sensor Name Mappings

Hardware sensor names are cryptic. Map them to friendly display names:

```python
SENSOR_SECTION_NAMES = {
    'k10temp': 'Processor', 'nvme': 'NVMe SSD',
    'it8689': 'Motherboard', 'amdgpu': 'GPU', ...
}
SENSOR_READING_NAMES = {
    'Tctl': 'CPU Package', 'Tdie': 'CPU Die',
    'Composite': 'Drive Temp', 'Sensor 1': 'Chipset', ...
}
# Default sensor skip list: sensors hidden by default in the UI
# Users can toggle visibility via sensor toggle controls in Settings
```

### 10.15 Closed Session Token Cache

Active session tokens are computed from live JSONL on each full fetch. Closed sessions are cached since they don't change:

```python
_closed_token_cache = {}  # { uuid: { in, out, cache_read, cache_write } }

def _compute_tokens_from_jsonl(path):
    # Parses JSONL file line-by-line for "usage" entries
    # Sums input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
    # Result cached in _closed_token_cache[uuid]

def _enrich_tokens(sessions, tokens_data):
    # For active sessions: use tokens from gather-data.sh
    # For closed sessions: check cache first, compute from JSONL if missing
```

### 10.16 Usage Alert Per-Percent Tracking

Alerts fire once per percentage point to avoid spam:

```python
_usage_alert_fired = {}  # { "five_hour_90": timestamp, ... }
# Key format: "{metric}_{percent_int}"
# TTL: 7 days (weekly reset for weekly metrics)
# On each push: check if utilization crossed a threshold, skip if already fired at that %
```

### 10.17 PC Warning Popup

Critical alerts can show a popup on the Windows PC via `schtasks`:

```python
def _send_pc_warning(title, message):
    # Creates a scheduled task that runs a VBS script showing a MsgBox
    # VBS script path on PC: C:\Users\jwjnt\OneDrive\Desktop\nothingitis-server\show-warning.vbs
    # schtasks /Create /SC ONCE /ST <now+1min> /TN "NTSWarning" /TR "wscript ..."
    # schtasks /Run /TN "NTSWarning"
    # schtasks /Delete /TN "NTSWarning" /F
```

### 10.17b Pending Command Deduplication

When queueing commands for external devices (phones, PCs), deduplicate to prevent flooding:

```python
_pending_commands = {}  # key -> {"value": ..., "ts": timestamp}
COMMAND_TTL = 30       # seconds before stale command is cleared
COMMAND_COOLDOWN = 2   # seconds between identical commands

def queue_command(key: str, value: dict) -> bool:
    """Queue a command, returning False if duplicate within cooldown."""
    now = time.time()
    existing = _pending_commands.get(key)
    if existing and now - existing["ts"] < COMMAND_COOLDOWN:
        return False  # Too soon, skip
    _pending_commands[key] = {"value": value, "ts": now}
    return True

# Cleanup stale commands periodically
def _prune_pending():
    now = time.time()
    for k in list(_pending_commands):
        if now - _pending_commands[k]["ts"] > COMMAND_TTL:
            del _pending_commands[k]
```

Used by: Phone Control (volume/DND commands have 30s TTL, 2s cooldown between same command).

### 10.17c Adaptive Risk Scoring & Baselines

For tasks/operations with time limits, use statistical baselines from historical data instead of fixed thresholds:

```python
def _find_adaptive_baseline(task, completed_tasks):
    """Two-tier baseline: similar tasks p75 (preferred) → global size fallback."""
    # Tier 1: Find completed tasks with similar words + domain tags (overlap scoring)
    subject_words = _tokenize(task["subject"])  # Remove stopwords
    candidates = []
    for ct in completed_tasks:
        ct_words = _tokenize(ct["subject"])
        word_overlap = len(subject_words & ct_words) / max(len(subject_words | ct_words), 1)
        tag_overlap = len(set(task.get("tags", [])) & set(ct.get("tags", [])))
        if word_overlap > 0.3 or tag_overlap > 0:
            candidates.append((ct, word_overlap + tag_overlap * 0.5))

    if len(candidates) >= 3:
        durations = sorted(c[0]["duration"] for c in candidates)
        p75 = durations[int(len(durations) * 0.75)]
        return p75, "similar"  # confidence: similar

    # Tier 2: Global size fallback (all completed tasks of same size)
    size_tasks = [ct for ct in completed_tasks if ct.get("size") == task.get("size")]
    if size_tasks:
        durations = sorted(ct["duration"] for ct in size_tasks)
        p75 = durations[int(len(durations) * 0.75)]
        return p75, "global"  # confidence: global

    # Tier 3: Fixed fallback
    FIXED = {"S": 900, "M": 2700, "L": 7200}  # seconds
    return FIXED.get(task.get("size", "M"), 2700), "fixed"

def _compute_risk_score(task, baseline, elapsed):
    """Risk score 0-100, weighted: time 60%, rework 25%, deps 15%."""
    time_risk = min(100, (elapsed / baseline) * 100) * 0.6
    rework_risk = (25 if task.get("rework_count", 0) > 0 else 0) * 0.25
    dep_risk = (15 if task.get("blocked_by") else 0) * 0.15
    return min(100, time_risk + rework_risk + dep_risk)
```

Used by: Task Analytics (`/api/live/risk` endpoint, overrun detection in WS live updates, MCP `task_overrun_check`).

### 10.17d Background Orphan Cleanup

Long-running apps accumulate stale data. Use a periodic background task:

```python
async def _orphan_cleanup():
    """Remove stale temporary data every 5 minutes."""
    while True:
        await asyncio.sleep(300)
        try:
            # Example: remove expired session tokens, stale scan states, etc.
            now = time.time()
            for key in list(_temp_data):
                if now - _temp_data[key]["ts"] > 3600:  # 1 hour TTL
                    del _temp_data[key]
        except Exception:
            pass

# Start in app startup:
@app.on_event("startup")
async def startup():
    asyncio.create_task(_orphan_cleanup())
```

Used by: Task Analytics (orphan file cleanup), NTS Web (session token pruning).

### 10.17e Full Stream 5-Minute Alignment

For expensive data that doesn't need sub-minute freshness, align pushes to clean clock boundaries:

```python
async def full_stream():
    while True:
        try:
            data = await get_full_data()
            await _ws_send(ws, {"type": "full", **data}, ws_lock)
        except Exception:
            pass
        # Align to :00, :05, :10, :15, :20, ... boundaries
        now = time.time()
        secs_into_5min = now % 300
        wait = 300 - secs_into_5min
        if wait < 5:
            wait += 300  # Too close to boundary, skip to next
        await asyncio.sleep(wait)
```

Used by: NTS Web full_stream (usage/stats/pricing data). During active simulation mode, overrides to 2s interval.

### 10.17f Compaction-Aware Elapsed Time

Claude Code sessions can undergo context compaction, which creates gaps in task timing. When calculating elapsed time for in-progress tasks, subtract compaction time:

```python
def _compaction_aware_elapsed(task, session_meta):
    """Calculate elapsed time minus compaction gaps."""
    elapsed = time.time() - task["started_at"]
    compaction_time = session_meta.get("total_compaction_seconds", 0)
    return max(0, elapsed - compaction_time)
```

Used by: Task Analytics (accurate overrun detection that doesn't penalize for compaction pauses).

### 10.18 Storage Blocked Paths

Certain filesystem paths are blocked from scanning:

```python
STORAGE_BLOCKED_PATHS = ['/proc', '/sys', '/dev', '/run', '/var/lib/docker']
# Validated with os.path.realpath() to prevent symlink traversal
# Also blocks '..' in path components
```

### 10.19 Public Paths

Routes that don't require authentication:

```python
PUBLIC_PATHS = {'/login', '/api/login', '/api/nosleep/ping', '/favicon.ico'}
# Plus: all /static/* paths (checked via .startswith)
# /api/nosleep/ping: allows the nosleep agent to heartbeat without auth
```

### 10.20 Input Validation

Validate all user-provided values that go into commands or filesystem operations:

```python
# UUID format
if not re.match(r'^[a-f0-9\-]{36}$', uuid): return 400
# Path traversal — resolve and block
real = os.path.realpath(path)
if '..' in path or real.startswith(blocked_path): return 403
# Model name whitelist
if model and not re.match(r'^claude-[\w.-]+$', model): model = None
# PID verification — confirm process identity before kill
comm = subprocess.check_output(['ps', '-p', str(pid), '-o', 'comm='])
```

Return 504 on `asyncio.TimeoutError` (not 500) to distinguish timeout from error.

### 10.21 Single Worker Requirement

In-memory session storage + WebSocket connection manager requires `workers=1` in uvicorn. Do NOT use multiple workers — sessions and state are not shared across processes.

### 10.22 Per-Client WebSocket State

For features like server-side pagination, filtering, and sorting, maintain per-client state keyed by `id(ws)`:

```python
_ws_client_state: dict[int, dict] = {}

def _default_client_state() -> dict:
    return {"page": 1, "page_size": 25, "sort_col": "last_active", "sort_asc": False,
            "filter_status": "", "filter_model": "", "filter_search": "",
            "sort_cols": [], "scans": {}, "client_is_pc": False}

# On connect:
wid = id(ws)
ws_lock = asyncio.Lock()
cs = _default_client_state()
cs["ws_lock"] = ws_lock
cs["client_is_pc"] = _client_is_pc(ws)
_ws_client_state[wid] = cs

# On disconnect: clean up
_ws_client_state.pop(wid, None)
```

**Key behaviors (NTS Web):**
- Clients send `session_page` messages to update their filter/sort/pagination state
- Server applies state when slicing data for each push cycle
- Each client has its own `asyncio.Lock` for thread-safe WS writes
- Active storage scans tracked per-client in `scans` dict, cancelled on disconnect
- Multi-column sort via `sort_cols` list with `functools.cmp_to_key`

### 10.23 Thread-Safe WS Send

When multiple coroutines push to the same WebSocket (push loop + scan stream + message responses), use a per-client lock:

```python
async def _ws_send(ws: WebSocket, data: dict, ws_lock: asyncio.Lock):
    async with ws_lock:
        await ws.send_json(data)
```

All background streams and on-demand responses must use this helper, not `ws.send_json()` directly.

### 10.24 Tiered Cache Pre-Warming

On startup, warm caches in two tiers so the UI has data immediately:

```python
async def _prewarm_cache():
    # Tier 1: fast data first (~5s) — processes, temps
    await asyncio.gather(get_quick_data(), get_temps_data(), return_exceptions=True)
    # Tier 2: slow data (~60s) — full sessions, storage scan
    await asyncio.gather(get_full_data(force=True), _run_storage_scan(), return_exceptions=True)
    # Tier 3: start background refresh loop
    asyncio.create_task(_background_cache_loop())
```

Also send cached data immediately on WS connect (if <10× TTL old) for fast initial load.

### 10.25 Background Cache Refresh Loop

Keep caches warm between WS push cycles with a dedicated background loop:

```python
async def _background_cache_loop():
    while True:
        await asyncio.sleep(FULL_CACHE_TTL())
        await get_full_data(force=True)
```

### 10.26 Graceful Shutdown Cleanup

Release external resources (No Sleep agent, SSH connections, pending timers) on shutdown:

```python
@app.on_event("shutdown")
async def shutdown():
    if nosleep_state["active"]:
        await _nosleep_release()
```

### 10.27 Log Cleanup on Startup

Delete log files older than 7 days on startup to prevent disk bloat:

```python
def _cleanup_old_logs():
    cutoff = time.time() - 7 * 86400
    for f in LOG_DIR.glob("nts-web-*.log*"):
        if f.stat().st_mtime < cutoff:
            f.unlink()
```

### 10.28 Reverse Geocoding Pattern (Phone Control)

For location-based features, use cached reverse geocoding with movement threshold:

- **Haversine distance** calculation to detect movement
- **150m movement threshold** — only re-geocode if device moved >150m
- **5-minute TTL** on cached results
- **1-second rate limit** between geocode requests
- Data source: local cities JSON, not external API

### 10.29 NAVEX Forwarding via UNIX Socket (Phone Control → PAI)

Phone Control forwards NAVEX commands to PAI Daemon via blocking UNIX socket with half-close:

```python
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.connect("/DATA/AppData/pai/pai-daemon.sock")
sock.sendall(json.dumps(payload).encode())
sock.shutdown(socket.SHUT_WR)  # half-close: signal end of request
response = b""
while chunk := sock.recv(4096):
    response += chunk
```

### 10.30 Dynamic Stream Intervals from Settings

WS push intervals derive from per-tab settings, using `min()` of all tabs sharing a stream:

```python
_tab_stream_map = {
    "temps": ["tabIntervalNosleep", "tabIntervalTemps"],
    "quick": ["tabIntervalHome", "tabIntervalSessions", "tabIntervalProcesses"],
    "full": ["tabIntervalUsage", "tabIntervalStorage"],
    "tasks": ["tabIntervalTasks"],
}
interval = min(settings.get(t, default) for t in tabs) / 1000  # ms → seconds
```

This ensures the fastest-requested tab drives the stream cadence.

### 10.31 Disconnect Detection Pattern

For long-running WS push loops, detect disconnects by catching exceptions with string matching:

```python
except Exception as e:
    if "disconnect" in str(e).lower() or "closed" in str(e).lower():
        break
    log.error(f"Stream error: {e}")
```

**Note:** This is fragile — prefer catching specific exception types (`WebSocketDisconnect`, `ConnectionClosedError`) when possible.

### 10.32 Task Analytics Patterns

Patterns unique to Task Analytics that should be adopted in the mega-merge:

- **Orphan detection**: Skip sessions whose transcript path no longer exists on disk
- **Title persistence**: Write `cached_title` back to `.meta.json` to avoid re-computing
- **ISO week formatting**: Use `%G-W%V` for week grouping (ISO 8601 week numbers)
- **Failure suggestions with thresholds**: Domain ≥40% failure rate with ≥2 failures; size ≥30% with ≥3 total tasks
- **WS timeout-as-tick**: Use `asyncio.wait_for(receive(), timeout=interval)` — timeout triggers push, message triggers immediate response
- **Live risk 30s cache TTL**: Separate from main data cache, hardcoded
- **3 named loggers**: `app`, `api`, `ws` (vs NTS Web's 6)

---

## 11. Helper Function Library

Include these in every project:

```javascript
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function relativeTime(ts) {
    if (!ts) return '-';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 0) return 'just now';           // Future timestamps (clock skew)
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });  // >30d: "1 Feb"
}

function copyText(text) { /* See Section 6.5 */ }

// Format bytes — base-2 only (for internal use)
function formatBytes(bytes) {
    if (bytes == null || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KiB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MiB`;
    return `${(bytes / 1073741824).toFixed(2)} GiB`;
}

// Format bytes — DUAL UNITS (required for all user-facing storage displays)
// Returns: "916 GB (853 GiB)" — base-10 first, base-2 in parentheses
function formatBytesDual(bytes) {
    if (bytes == null || isNaN(bytes)) return '0 B';
    if (bytes < 1000) return `${bytes} B`;
    const gb10 = bytes / 1e9, gb2 = bytes / 1073741824;
    if (bytes < 1e6) return `${(bytes/1e3).toFixed(1)} KB (${(bytes/1024).toFixed(1)} KiB)`;
    if (bytes < 1e9) return `${(bytes/1e6).toFixed(1)} MB (${(bytes/1048576).toFixed(1)} MiB)`;
    return `${gb10 < 100 ? gb10.toFixed(1) : Math.round(gb10)} GB (${gb2 < 100 ? gb2.toFixed(1) : Math.round(gb2)} GiB)`;
}

function formatTokens(n) {
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n.toString();
}

function formatMs(ms) {
    if (!ms || ms <= 0) return '';
    const s = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
    if (d > 0) return `${d}d ${h%24}h`;
    if (h > 0) return `${h}h ${m%60}m`;
    if (m > 0) return `${m}m ${s%60}s`;
    return `${s}s`;
}

function formatMsFull(ms) {
    // Full countdown: "D:HH:MM:SS" or "HH:MM:SS"
    const pad = n => String(n).padStart(2, '0');
    const s = Math.floor(ms/1000)%60, m = Math.floor(ms/60000)%60;
    const h = Math.floor(ms/3600000)%24, d = Math.floor(ms/86400000);
    if (d > 0) return `${d}:${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function debounced(fn, ms = 150) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function formatCost(usd) {
    if (usd == null || isNaN(usd)) return '$0.00';
    return '$' + usd.toFixed(usd < 1 ? 4 : 2);
}

function formatModel(name) {
    // For display text: "claude-opus-4-6" -> "Opus 4.6"
    if (!name) return '';
    return name.replace(/^claude-/, '').replace(/-(\d+)-(\d+)$/, ' $1.$2')
        .replace(/^./, c => c.toUpperCase());
}

// For table cells with colored model names:
function formatModelHtml(model) {
    // Strips "claude-" prefix and date suffix (e.g., "-20250401")
    // Wraps in <span class="model-opus|model-sonnet|model-haiku">
    const short = model.replace('claude-', '').replace(/-2025\d{4}/, '');
    return `<span class="${getModelClass(model)}">${short}</span>`;
}

function getModelClass(model) {
    if (model.includes('opus')) return 'model-opus';
    if (model.includes('sonnet')) return 'model-sonnet';
    if (model.includes('haiku')) return 'model-haiku';
    return '';
}

function num(n) {
    // Thousands separator: 1234567 -> "1,234,567"
    if (n == null) return '-';
    return Number(n).toLocaleString('en-GB');
}

// Compact duration (for table cells): "5s" / "3m" / "2h" / "1d"
function ago(seconds) {
    if (!seconds) return '--';
    if (seconds < 60) return seconds + 's ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

// Milliseconds for response time: "450ms" / "1.2s"
function ms(v) {
    if (!v) return '--';
    if (v < 1000) return v + 'ms';
    return (v / 1000).toFixed(1) + 's';
}
```

**Factory functions (all documented in Section 5.5):**
- `createPillGroup(container, options, onChange)` → `{getSelected, setSelected, updateCounts, clearAll, clearVisual}`
- `renderPresetsUI(container, tab, getFilters, applyFilters, opts)` → `{deactivate}`
- `wrapSearchInput(input)` → `{clear}`
- `updateFilterHighlight(el, defaultVal)` — toggles `.filter-active` class
- `updateSortArrows(tableSelector, sortCols, colAttr)` — adds `▲`/`▼` span + `.sort-asc`/`.sort-desc` class
- `renderFilterFooter(container, showing, total)` — "Showing X of Y" or "N items"
- `renderEmptyState(tbody, colspan, clearCallback)` — "No items match" + "Clear filters" button

**Section filters** — quick-filter inputs within collapsible sections (processes, containers, workflows):
```javascript
function initSectionFilters() {
    // Wraps each section filter input with wrapSearchInput()
    // Binds debounced(150ms) 'input' listener to re-render the section
    // Example: filterProcs → renderProcesses, filterContainers → renderContainers
}
```

**Column resize persistence:**
```javascript
const _COL_WIDTHS_KEY = 'nts_col_widths';
// Stored as: { tableId: { colIndex: widthPx, ... }, ... }
// _loadColWidths() / _saveColWidths(tableId, widths) / _getColWidths(tableId)

function initColResize(table) {
    // Adds .col-resize-handle div to each <th>
    // Restores saved widths from localStorage
    // Mousedown on handle: starts drag tracking (_colResizeDrag state)
    // Drag adjusts current column AND next sibling inversely (keeps total width stable)
    // Minimum width: 30px per column
    // Mouseup: saves all column widths, adds .active class to handle during drag
}
```

---

## 12. Feature-Specific Patterns

### 12.1 No Sleep Preset System

Presets control the duration for the No Sleep feature (keeping a remote PC awake).

**Built-in presets:** Fixed durations (5m, 30m, 1h, 8h, 24h, Unlimited/7 days). Each is a `.preset-btn` with `data-ms` attribute.

**Custom presets:** Users can save custom durations:
```javascript
// "+" button saves current duration to Prefs
Prefs.get('nosleepCustomPresets', [])  // Array of ms values, sorted ascending
// Rendered in #nosleepCustomPresets container with .preset-custom class
// Right-click any custom preset → showConfirm delete → remove from array
```

**Hidden built-in presets:** Right-click a built-in preset to hide it:
```javascript
Prefs.get('nosleepHiddenPresets', [])  // Array of ms values to hide
// _applyHiddenPresets() on init: hides matching buttons via display:none
// To restore: clear the array in Prefs
```

**Preset button wiring (`_wirePresetBtn`):**
- Click: sets `state.nosleepSelectedMs`, clears Until target, deactivates all other presets, updates d/h/m/s boxes
- Right-click: delete (custom) or hide (built-in). Except: `.unlimited` and `.preset-add` buttons are exempt from right-click delete.

**"Until" time picker:**
```javascript
// When user sets a time:
const target = new Date(); target.setHours(h, m, 0, 0);
if (target <= now) target.setDate(target.getDate() + 1);  // Next day if already past
state._nosleepUntilTarget = target.getTime();
// Entering Until clears d/h/m/s boxes; entering d/h/m/s clears Until

// At start time: recalculate duration from now to avoid drift
if (state._nosleepUntilTarget) {
    ms = Math.max(0, state._nosleepUntilTarget - Date.now());
}
```

**Duration cap:** Custom presets capped at 604800000ms (7 days = Unlimited). d/h/m/s boxes also enforce this cap on input.

**Duration display helper:**
```javascript
function _formatPresetLabel(ms) {
    // Returns compact: "1d 2h 30m" or "45s" — skips zero components
}
```

### 12.2 PC Reachability Guard Rails

Remote PC features (No Sleep, Session Resume) require the PC to be online.

```javascript
state.pcOnline = false;   // Updated by server push (TCP connect + nosleep ping check)
state.clientIsPc = false; // True when browsing from the PC itself (bypass online check)

// Guard pattern — used before No Sleep start and Session Resume:
if (!state.pcOnline && !state.clientIsPc) {
    addNoSleepEvent('PC is offline — cannot start');
    return;
}
// Or for sessions:
await showConfirm('PC Offline', 'Cannot resume session — Windows PC is not reachable.', 'OK', 'neutral');
```

Backend: `_client_is_pc()` checks if request IP matches the PC's IP. Sent to client in WS data so the UI can bypass the guard.

### 12.3 Chart Tooltip & Crosshair

Applies to any Canvas 2D chart with mouse/touch interaction.

**Chart state storage:** After rendering, save state on the canvas element:
```javascript
canvas._chartState = { allKeys, buckets, modelList, getModelColor, padL, plotW, plotH, nPts, xAt, maxVal, bucketSize };
```

**Crosshair:** Separate DOM `<div>` element (not canvas-drawn):
```css
/* Created dynamically, appended to canvas parent */
display: none; position: absolute; top: 0; bottom: 0; width: 1px;
background: rgba(180,180,180,0.35); pointer-events: none; z-index: 1;
```
Follows mouse position freely (NOT snapped to data points). Only the tooltip data snaps to nearest bucket.

**Tooltip:** DOM `<div class="chart-tooltip">`, positioned dynamically:
- Left or right of cursor based on available space (flip at `tipX + tipW + 10 > rect.width`)
- Fixed at `top: 4px` within the chart parent
- Content: time label (cyan, bold), per-series breakdown (colored dots), total with separator line
- Last bucket shows "Now" instead of time

**Event binding:**
- Desktop: `mousemove` → show, `mouseleave` on canvas AND parent → hide. Document-level `mousemove` fallback hides if cursor leaves chart area.
- Mobile: `touchstart`/`touchmove` with `{ passive: false }` → show, `touchend` → hide after 2s timeout.

**"Now" marker:**
```javascript
ctx.strokeStyle = 'rgba(180,180,180,0.3)';  // NOT cyan — subtle gray
ctx.setLineDash([3, 3]);  // Shorter than documented in guide
```

**X-axis labels — 12h format:**
```javascript
// Narrow (<500px): "3p", "12a"
// Wide: "3:00 PM", "12:00 AM"
const hh12 = hh24 === 0 ? 12 : hh24 > 12 ? hh24 - 12 : hh24;
const ampm = hh24 < 12 ? 'a' : 'p';  // narrow
```

**Chart countdown** (next 5-minute data boundary):
```javascript
setInterval(() => {
    const secsLeft = 300 - (Date.now() / 1000 % 300);
    // Display: "updates in Xm Xs" or "updates in Xs"
}, 1000);
```

**Legend:** Bottom-left of chart. 8×8 color squares + model short name, spaced dynamically.

### 12.4 Session Management Details

**Optimistic delete tracking:**
```javascript
state._deletedSessions = {};  // { uuid: { ts, status: 'pending'|'error', error? } }
// 'pending': row shown in red immediately
// 'error': row stays red with error tooltip, auto-removed after 30s or next WS push
```

**Bulk delete flow:**
1. Collect `[...state.selectedSessions]`
2. Show `showConfirm('Delete Sessions', 'Delete N session(s)?...')`
3. Flag all as pending, clear selection, re-render
4. POST `/api/sessions/delete` with `{ uuids: [...] }`
5. Server returns `{ results: { uuid: 'deleted' | 'error message' } }` — per-UUID status
6. If partial errors: flag errored UUIDs, show summary dialog with success count + error list

**Select All:** Syncs with `state.selectedSessions` Set. `updateSelectAll()` checks if all visible checkboxes are checked.

**Sort header interactions:**
- Click: add column to `sortCols[]` or toggle existing direction
- Right-click / long-press: remove column from sort AND clear corresponding filter (status pills, model pills, or search)

**Context menu actions:** Resume (PC online check), Rename (opens rename dialog), Delete (single session).

**Rename dialog:** Custom modal (not `showPrompt`). `#renameModal` with `#renameInput`. Enter submits, Escape cancels, overlay click cancels. Auto-focuses input with 50ms delay.

### 12.5 Storage Tab Details

**Storage state:**
```javascript
const _storageState = {
    data: null,              // API response
    expandedPaths: new Set(), // Currently expanded directory paths
    collapsedDrives: new Set(['/', '/DATA']),  // Drives start collapsed
    loading: false,
    abortControllers: [],    // HTTP request AbortControllers
    activeScans: {},         // scanId -> { path, node, childrenDiv, entries, depth, parentSize }
    _scanCounter: 0,         // Auto-incrementing scan ID suffix
};
```

**Streaming scan flow:**
1. User clicks directory → `streamSubdir(path, node, childrenDiv, depth, parentSize)`
2. Generates `scan_${Date.now()}_${++counter}` scan ID
3. Stores scan state in `_storageState.activeScans[scanId]`
4. Shows "Scanning..." placeholder in childrenDiv
5. Sends `{ type: 'storage_scan', path, scan_id }` via WS
6. `handleStorageScanEntry()`: removes placeholder, appends entry via `renderStorageNode()`, accumulates in `scan.entries[]`
7. `handleStorageScanFiles()`: appends file entries batch
8. `handleStorageScanDone()`: sorts `entries[]` by size descending, clears childrenDiv, re-renders all sorted. Caches as `node._children`.
9. `handleStorageScanError()`: shows red error message

**Cancellation:** `cancelStorageScan(scanId)` → delete from activeScans + send WS cancel message.
**Tab switch:** `cancelStorageLoads()` aborts all HTTP requests AND cancels all active streaming scans.

**Right-click to copy path:** On any storage row, right-click copies the full path (`node.path`) with green flash on `.storage-name`.

**Drive collapse/expand:** Each drive header is clickable. Arrow toggles `▶`/`▼`. Tree div toggles `display: none`. Tracked in `_storageState.collapsedDrives`.

**Storage-specific helpers:**
```javascript
function storageBarColor(pct) {  // cyan <10, green 10-25, amber 25-50, red >50 }
function driveBarColor(pct) {    // green <75, amber 75-90, red >90 }
function formatBytes(bytes) {    // Base-2: "1.5 KB", "2.30 GB" (storage-local, not dual-unit) }
```

### 12.6 Home Page Status

Dynamic status grid populated by `renderHomeStatus()`:

```javascript
function setHomeStat(statId, value, className) {
    // Finds #statId .home-stat-value, sets textContent and optional color class
    // className: 'cyan', 'green', 'amber', 'red', '' (default text color)
}

// Data sources:
// Sessions: state.sessionsTotal (from server pagination), state.sessions
// Active sessions: filter by status === 'active'
// Containers: state.containers.length
// Workflows: state.workflows.length
// CPU temp: find max across all sections/readings, color by threshold
// No Sleep: "ACTIVE" (green) / "PAUSED" (amber) / "IDLE" (default)
// Messages: state.sessionsOverview.total_messages
// Total Cost: calculated from modelUsage × pricing × exchange_rate + extra_usage credits
```

### 12.8 Tasks Tab Loading

Tasks tab loads task session data with a dual strategy:
1. **Initial load:** REST API `GET /api/tasks` for immediate data (WS full_stream can take ~80s on first load)
2. **Live updates:** WS `task_stream` pushes updates every 1s when the tasks tab is active
3. **Session selector:** Dropdown to pick a task session, sends `{ type: 'task_page', session_id }` via WS

### 12.9 Server-Side Session Pagination

Sessions use server-side pagination via WebSocket:

```javascript
function sendSessionPage() {
    // Sends current page state to server via WS
    ws.send(JSON.stringify({
        type: 'session_page',
        page: state.currentPage,
        page_size: state.pageSize,
        sort_cols: state.sortCols,
        filters: state.filters  // { status, model, search, msg_min, size_min }
    }));
}
// Called on: tab switch, sort change, filter change, page change, WS connect
// Server responds with { type: 'sessions_page', sessions, sessions_total, filter_counts }
// filter_counts: { active: N, closed: N, opus: N, sonnet: N, haiku: N } — for pill count updates
```

### 12.10 Mobile Responsive Phases

The `@media (max-width: 768px)` block applies changes in 8 phases:

1. **Table overflow** — `table-layout: auto`, horizontal scroll wrapper
2. **Card layout** — full-bleed cards (no side borders/radius), reduced padding
3. **Hover → visible on touch** — copy buttons and hover-reveal elements always visible or tap-triggered
4. **Typography & touch targets** — reduced font sizes, minimum 40px touch targets
5. **PC-only hidden** — `.pc-only { display: none }` (features requiring PC connection)
6. **Filter bars** — collapse behind toggle buttons, reduced gap
7. **Bottom nav** — fixed bottom navigation with `.mnav-btn` buttons, overflow menu
8. **Detail fullscreen** — modals become fullscreen (`width: 100vw; height: 100svh`)

### 12.11 Multi-Session Live Monitoring

When multiple sessions may be active simultaneously (e.g., main agent + subagents), the Live tab should show ALL active sessions, not just the latest.

**Backend:** Scan all session files for tasks with `in_progress` status. Group by session. Return `active_sessions[]` with per-session tasks, plus `all_in_progress[]` and `all_overruns[]` aggregated across sessions.

**Frontend layout:**
- Session headers: each active session gets a header row with session ID/title, model badge, CWD, started time
- Task cards: show session label pill when `sessions.length > 1`
- Task feed: combined across all sessions, sorted by `updated_at`. When multiple sessions, prefix each entry with `[session_title]`
- Overrun banner: aggregated across all sessions

**Session label pill:**
```html
<span class="tag-pill">${sessionTitle}</span>
```

---

## 13. Project Conventions

### 13.1 File Structure

```
project/
+-- app.py               # FastAPI backend (routes, WS, auth)
+-- Dockerfile           # Python 3.12 slim
+-- docker-compose.yml   # CasaOS compose
+-- requirements.txt     # Pinned versions
+-- settings.json        # User settings
+-- auth.json            # Shared login creds
+-- CLAUDE.md            # Project docs
+-- static/
|   +-- css/style.css    # All styles, one file
|   +-- js/app.js        # All JS, one file
|   +-- favicon.ico
+-- templates/
    +-- index.html       # Main page (Jinja2)
    +-- login.html       # Login page
```

### 13.2 Versioning

Every deployment bumps by at least `+0.01`. Format: `MAJOR.MINOR`.
Update in: `CLAUDE.md`, `app.py` (VERSION), `index.html` (About).

### 13.3 Cache Busting

```html
<link rel="stylesheet" href="/static/css/style.css?v={{ version }}&t={{ build_ts }}">
<script src="/static/js/app.js?v={{ version }}&t={{ build_ts }}"></script>
```

### 13.4 Login Page

Standalone (no header/tabs). Centered card on black. **Inline all CSS** in `<style>` tag (no external stylesheet link).
- Width: 340px, padding: 32px
- Title: cyan, 18px, centered
- Labels: uppercase, 11px
- Button: full-width, transparent bg, cyan border
- Error: red, 12px, centered, hidden by default
- Focus: `border-color: var(--cyan)`, no outline
- Validate on submit only (not on change)

### 13.5 Claude Code Session Titles

When building dashboards that display Claude Code sessions, extract the session title from the JSONL transcript:

```python
# Backend: extract custom-title from Claude Code transcript
def get_session_title(transcript_path: str) -> str:
    """Read Claude Code JSONL transcript and find the custom-title entry."""
    title = ""
    try:
        with open(transcript_path) as f:
            for line in f:
                if '"custom-title"' in line:
                    d = json.loads(line)
                    if d.get("type") == "custom-title":
                        ct = d.get("customTitle", "")
                        if ct:
                            title = ct
    except Exception:
        pass
    return title  # fallback: use session ID or filename stem
```

The `.meta.json` sidecar file (next to the task session JSON) links the task session ID back to Claude Code's internal session ID and transcript path:
```json
{
    "claude_session_id": "abc123-...",
    "transcript_path": "/home/user/.claude/projects/.../session.jsonl",
    "model": "claude-opus-4-6",
    "start_time": "2026-02-27T01:00:00Z"
}
```

**Display rules:**
- Show the custom title if available, fall back to session ID
- Title is editable — provide a rename API (`POST /api/sessions/{uuid}/rename` with `{"title": "..."}`)
- Right-click context menu or double-click to rename
- Cache titles in memory (they rarely change) to avoid re-parsing JSONL on every request

### 13.6 Markdown Rendering

Use `marked.js`. Read-only viewer. Scrollable container.
- Headings, bold, italic, code, links, tables, lists (NOT images)
- Auto-generate TOC from H2/H3 headers with clickable scroll-to links
- Code copy buttons on `<code>` blocks (hover-reveal, position: absolute top-right)
- Inline code copy on click
- Table row copy on click (format as tab-separated values)
- Section copy button (copies heading + all content until next heading)
- Blockquote: 3px cyan left border, `rgba(50,140,255,0.03)` background
- Currency: 4 decimal places (`$0.0000`)

**TOC sidebar** — sticky, 200-220px width:
- Builds from h1/h2/h3 headings in rendered markdown
- Each heading gets an auto-generated ID: `notes-sec-{index}`
- h3 items are indented and prefixed with tree-branch characters:
  - `├── ` (U+251C U+2500 U+2500) if another h3 follows before the next h2
  - `└── ` (U+2514 U+2500 U+2500) if last h3 before next h2
  - Rendered in monospace `11px`, `var(--muted)` color
- Click handler: `scrollIntoView({ behavior: 'smooth', block: 'start' })` within the notes card
- Active section highlighting: scroll listener on `.notes-card`, checks `getBoundingClientRect().top <= 160` for each heading, highlights the TOC link with `.active` class (cyan text + rgba bg)

**Five types of copy buttons** — all added by `addCodeCopyButtons(container)`:

1. **Code block copy** — wraps each `<pre>` in `.code-block-wrap`, adds `.code-copy-btn` (position: absolute top-right). Icon: clipboard emoji → checkmark on copy. 3s reset.
2. **Inline code copy** — every `<code>` not inside `<pre>` gets `cursor: pointer` + `title="Click to copy"`. On click: adds `.code-copied` class (green bg), 3s reset.
3. **Table copy** — wraps each `<table>` in `.table-copy-wrap`, adds `.table-copy-btn`. Copies all rows as tab-separated values. Icon: "📋 Copy table" → checkmark. 3s reset.
4. **Row copy** — each `<tbody tr>` gets a `.row-copy-btn` in the last `<td>` (position: relative). Copies row cells as tab-separated. Also adds `.row-copied` class to `<tr>` for green row flash. 3s reset.
5. **Section copy** — each `<h2>` gets a `.section-copy-btn` appended. Copies heading text + all sibling content until next `<h1>`/`<h2>`. Icon: "📋 Copy section" → checkmark. 3s reset.

### 13.7 Task Status Display

When displaying task/job statuses:

```css
/* Status badges — rgba bg with matching text */
.task-status { padding: 2px 8px; border-radius: 10px; font-size: 10px; text-transform: uppercase; font-weight: 600; }
.task-status-pending    { background: rgba(120,120,138,0.15); color: var(--secondary); }
.task-status-in_progress { background: rgba(50,140,255,0.15); color: var(--cyan); }
.task-status-blocked    { background: rgba(255,200,0,0.15);   color: var(--amber); }
.task-status-completed  { background: rgba(0,200,100,0.15);   color: var(--green); }
.task-status-cancelled  { background: rgba(255,80,80,0.15);   color: var(--red); }
.task-status-deferred   { background: rgba(120,120,138,0.15); color: var(--secondary); }

/* Size badges */
.task-size { font-size: 10px; font-weight: 700; }
.task-size-S { color: var(--green); }
.task-size-M { color: var(--amber); }
.task-size-L { color: var(--red); }

/* Metadata pills (auto-extracted tags) */
.task-pill { padding: 2px 7px; font-size: 10px; border-radius: 3px; }
.task-pill-domain  { background: rgba(50,140,255,0.15); color: var(--cyan); }
.task-pill-subagent { background: rgba(180,80,255,0.15); color: #d2a8ff; }
.task-pill-ref     { background: rgba(255,200,0,0.15);   color: var(--amber); }
.task-pill-file    { background: rgba(80,80,90,0.3);     color: var(--secondary); }
.task-pill-blocked { background: rgba(255,200,0,0.15);  color: var(--amber); }
.task-pill-blocks  { background: rgba(50,140,255,0.1);  color: var(--muted); }

/* Task details box (expanded view within task list) */
.task-details-box { background: var(--bg); border: 1px solid var(--grid-line); border-radius: 4px; padding: 8px 12px; margin: 4px 0; }
.task-desc { white-space: pre-wrap; word-break: break-word; font-size: 12px; color: var(--secondary); line-height: 1.5; }
.task-pills { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }

/* Column visibility toggle (hide/show columns via CSS class on table) */
/* .hide-col-N td:nth-child(N), .hide-col-N th:nth-child(N) { display: none; } */

/* Mobile task detail: fullscreen viewer */
/* Uses .mobile-detail-fullscreen pattern from Section 8.5 */
```

### 13.7b Notification Forwarding Pattern (Phone Control v2.28)

For apps that receive push notifications from external devices (phones, IoT). The notification pipeline has 6 stages:

**Stage 1 — Pre-filter bypass:**
```python
if body.get("filtered", False):
    return {"success": True, "action": "filtered"}
```
n8n can pre-filter before sending; `filtered: true` skips all processing.

**Stage 2 — Android group key stripping:**
```python
# Strip Android notification group keys: "0|com.sec.android.daemonapp|g:Aggregate_..."
if title and re.match(r'^\d+\|[\w.]+\|', title): title = ""
if text and re.match(r'^\d+\|[\w.]+\|', text): text = ""
# Also filter raw/junk titles: "540592676::SUMMARY::wx"
if title and re.match(r'^\d+::', title):
    return {"success": True, "action": "filtered"}
# Drop if both empty after stripping
if not title and not text:
    return {"success": True, "action": "filtered"}
```

**Stage 3 — 10-second deduplication:**
```python
for recent in reversed(notifs[-20:]):
    if now - recent.get("received_at", 0) > 10: break
    if same_package_title_text: return {"success": True, "action": "deduped"}
```

**Stage 4 — Store notification** (with new `subtext` field):
```python
notif = {"package": pkg, "title": title, "text": text, "subtext": body.get("subtext", ""), "received_at": now, ...}
```

**Stage 5 — Rule engine (allow → block evaluation):**
```python
allow_matched = _match_rules(notif, allow_rules)
if allow_matched:
    block_matched = _match_rules(notif, block_rules)
    if block_matched:
        notif["blocked"] = True; rule["block_count"] += 1
        return {"success": True, "action": "blocked"}
    else:
        _forward_to_navex(notif)  # via pai_send.send_to_navex() (fire-and-forget)
        notif["forwarded"] = True; rule["forward_count"] += 1
        return {"success": True, "action": "forwarded"}
return {"success": True, "action": "stored"}  # no matching allow rule
```

**Stage 6 — Broadcast to WS clients.**

**Wildcard pattern system** (`_pattern_to_regex()`):
- `*` → `.*` (match anything)
- `#` → `\d+` (match digits)
- `\#` → literal `#`
- Two match modes: `"contains"` (regex.search) and `"full"` (regex.fullmatch)

**Rule matching** (`_match_rules()`):
- AND logic: all non-empty filter fields must match
- `ntext` = `text + " " + subtext` — subtext included in text matching
- Returns list of ALL matching rules (not just first)

**Three rule types:**
- `whitelist` (allow) — forward matching notifications to NAVEX
- `block` — suppress matching notifications (stored but not forwarded)
- `hide` — frontend-only display filter (not applied during processing, only filters Recent list in UI)

**Rule creation validation (block rules):**
- Must specify a package
- Must have at least one non-wildcard filter (no `title:* text:*` block rules)
- Must have a parent allow rule for the same package
- Coverage check: block patterns must be covered by an existing allow pattern
- Error codes: `missing_package`, `empty_block`, `no_allow_rule`
- Duplicate detection via `_rules_match()` (409 on duplicate)

**Rule deletion cascade:**
- Deleting an allow rule cascade-deletes orphaned block rules for the same package
- If other allow rules remain, only specifically orphaned blocks are deleted
- Response includes `cascade_deleted: [rule_ids]`

**Rule loading migration** (`_load_rules()`):
- Strips deprecated `title_excludes`/`text_excludes` fields
- Backfills `match_mode: "contains"` for old rules
- Normalizes empty filters to `"*"`
- Sorts: whitelist (0) → block (1) → hide (2), then by priority within each type

**NAVEX forwarding refactored:**
- Old: inline blocking UNIX socket to `/DATA/AppData/pai/pai-daemon.sock`
- New: `from pai_send import send_to_navex` — shared sender library, fire-and-forget via `action: "queue"`
- `pai_send.py` mounted into Docker container as read-only volume

**Per-rule counters:** `forward_count`, `block_count`, `hide_count` — incremented on each match.

**New endpoint:** `GET /api/notifications?since=<unix_ts>` — returns only notifications with `received_at >= since`, newest-first, capped at 30.

**New page route:** `GET /notifications` — passes `active_tab: "notifications"` to template for direct URL navigation.

Used by: Phone Control v2.28 (Tasker forwards Android notifications to server, which routes to NAVEX/n8n).

### 13.7b2 Phone Control Backend Reference (v2.28)

**Configuration & Constants:**
```python
VERSION = "2.28"
APP_DIR = Path(__file__).parent
AUTH_FILE = Path("/DATA/AppData/nts-web/auth.json")          # Shared with NTS Web
SESSIONS_FILE = Path("/DATA/AppData/nts-web/sessions.json")  # Shared with NTS Web
ALARMS_FILE = Path("/home/nothingitis/mcp-servers/phone-control/alarms.json")  # Shared with MCP
NOTIFICATIONS_FILE = Path("/home/nothingitis/mcp-servers/phone-control/notifications.json")
NOTIF_RULES_FILE = Path("/home/nothingitis/mcp-servers/phone-control/notification-rules.json")
NOTIFICATIONS_MAX_BYTES = 5 * 1024 * 1024  # 5 MB cap
N8N_QUEUE_URL = "https://n8n.ntsserver.christmas/webhook/phone-sync"
N8N_TOKEN = "58b1a5fcd30970520968fde87596986b69bd76ecb9428de91f39f2f9e6f1eaf0"  # Hardcoded
AUTH_SESSION_TTL = 86400 * 7  # 7 days
```

**Logging:** RotatingFileHandler, max 5 MB, 3 backup files. Format: `%(asctime)s [%(levelname)s] %(message)s`. Daily log files.

**Login rate limiting:** 5 attempts per 5-minute window per IP. Returns 429.

**Security middleware on ALL responses:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src ws: wss:; frame-ancestors 'none'`

**File I/O safety:** All saves use `f.flush()` + `os.fsync(f.fileno())`. Docker bind mounts don't support atomic file replacement.

**Reverse geocoding:** Nominatim OSM API. Cache: 150m threshold + 300s TTL. Rate limit: max 1 call/second. Haversine distance (Earth radius: 6,371,000m).

**Pending command dedup:** Volume and DND commands tracked separately. 30s TTL for confirmation from phone. 2s cooldown after confirmation before accepting next command. Returns 409 if command already pending.

**WebSocket:** Auth via cookie (`ws.cookies["nts_token"]`). Close code 1008 on auth fail. Messages: `ping`→`pong`, `get_alarms`→alarm list. Server broadcasts alarm/notification events.

**Complete HTTP API:**

| Method | Path | Auth | Purpose | Codes |
|--------|------|------|---------|-------|
| GET | `/login` | - | Login page, redirects if auth'd | 302 |
| POST | `/api/login` | - | JSON login, sets `nts_token` cookie | 200/401/429 |
| POST | `/api/logout` | Session | Clear session | 200 |
| GET | `/`, `/alarms`, `/timers`, `/controls`, `/logs`, `/notifications` | Session | HTML pages with `active_tab` | 200 |
| GET | `/api/health` | - | Health check | 200 |
| GET | `/api/logs?lines=200` | Session | Parse log file (capped 1000) | 200 |
| GET | `/api/alarms` | Session | List + auto-disable expired | 200 |
| POST | `/api/alarms` | Session | Create alarm + queue to n8n | 200/400/409 |
| DELETE | `/api/alarms/{id}` | Session | Delete + queue to n8n | 200/404 |
| PUT | `/api/alarms/{id}/toggle` | Session | Toggle enabled + sync to n8n | 200/404 |
| POST | `/api/timers` | Session | Create timer + queue to n8n | 200/400 |
| GET | `/api/phone-status` | Session | Status + geocode + pending cmd check | 200/503 |
| POST | `/api/volume` | Session | Set volume (0-15) + dedup | 200/400/409 |
| POST | `/api/dnd` | Session | Toggle DND + dedup | 200/400/409 |
| POST | `/api/notifications/incoming` | Bearer | Notification pipeline (6 stages) | 200/401 |
| GET | `/api/notifications?since=TS` | Session | Last 30, newest first | 200 |
| DELETE | `/api/notifications/{id}` | Session | Delete single notification | 200/404 |
| DELETE | `/api/notifications` | Session | Delete all notifications | 200 |
| GET | `/api/notification-rules` | Session | List rules | 200 |
| POST | `/api/notification-rules` | Session | Create rule + validation | 200/400/409 |
| DELETE | `/api/notification-rules/{id}` | Session | Delete + cascade orphaned blocks | 200/404 |
| PUT | `/api/notification-rules/{id}/toggle` | Session | Toggle rule enabled | 200/404 |
| PUT | `/api/notification-rules/reorder` | Session | Set priorities per type | 200 |
| WS | `/ws` | Cookie | Real-time alarm/notif broadcasts | 1008 |

**Alarm creation fields:**
- Required: `hour` (0-23), `minutes` (0-59), `message` (string)
- Optional: `date` (YYYY-MM-DD, specific), `days` (list, recurring) — mutually exclusive
- Optional: `start_date`, `end_date`, `snooze_interval` (default 5), `snooze_count` (default 3, 0=off), `volume` (0-15, default 15), `vibrate` (default true), `vibrate_pattern` (short/medium/long), `gradual_volume` (default false)

**Key magic numbers:** 10s dedup window, 20 recent notifs checked, 30 returned in list, 200 default log lines (max 1000), 30s phone reachable threshold, 10s n8n timeout, 5s geocode timeout.

### 13.7d Shared Sender Library (`pai_send.py`)

All services that forward messages to NAVEX use a shared sender module at `/home/nothingitis/pai-daemon/pai_send.py`:

```python
def send_to_navex(message: str, chat_id: str = "") -> dict:
    """Fire-and-forget via PAI daemon socket. Returns {"ok": True, "queued": True}."""
    # Uses action: "queue" (not "message") — daemon ACKs immediately
    # 2 retries with 2s delay, 10s timeout
    # Sync version for non-async callers

async def send_to_navex_async(message: str, chat_id: str = "") -> dict:
    """Async version using asyncio.open_unix_connection."""
```

**Who uses what:**
| Sender | Version | Purpose |
|--------|---------|---------|
| Email Tagger daemon | async | `[EMAIL SUMMARY]` forwarding |
| Reminder Poller | sync | `[SELF-REMINDER]` forwarding |
| Phone Control | sync (Docker mount) | `[PHONE NOTIFICATION]` forwarding |
| Discord Bot | sync (blocking, `action: "message"`) | Interactive — needs response text |
| n8n (Telegram) | n8n webhook | Interactive — needs response text |

**Fire-and-forget senders** use `action: "queue"` — get immediate ACK, don't wait for Claude response.
**Interactive senders** use `action: "message"` — block until Claude responds (for showing reply in channel).

### 13.7c Version Watcher with Approval Flow

For daemon processes that manage files which external agents might modify:

```python
async def _version_watcher():
    """Poll files for changes, auto-revert unauthorized modifications."""
    last_hashes = {}
    while True:
        await asyncio.sleep(30)
        for path in WATCHED_FILES:
            current_hash = hashlib.sha256(path.read_bytes()).hexdigest()
            if path.name not in last_hashes:
                last_hashes[path.name] = current_hash
                continue
            if current_hash != last_hashes[path.name]:
                # Change detected — check if pre-approved
                if _is_approved(path):
                    last_hashes[path.name] = current_hash
                else:
                    # Auto-revert and send approval request via Telegram/n8n webhook
                    _revert_file(path, last_hashes[path.name])
                    await _send_approval_request(path, current_hash)
```

Used by: PAI Daemon (monitors Claude agent files, auto-reverts unauthorized changes, sends approval requests via n8n webhook).

**Dual-platform alerts (March 2026 update):** Safety alerts are now sent to **both Telegram AND Discord** simultaneously. Each alert stores both `telegram_msg_id` and `discord_msg_id` in `_pending_version_approvals`. When a user clicks Approve/Reject on either platform, buttons are removed from **both** platforms. Two dedicated helper functions handle cleanup:
- `_remove_buttons_telegram(message_id)` — POSTs `type: "remove_buttons"` to `CALLBACK_URL` (n8n webhook)
- `_remove_buttons_discord(message_id)` — POSTs `type: "remove_buttons"` to `DISCORD_CALLBACK_URL` (port 7892)

**HTTP approval endpoint:** `POST /api/versions/approve` accepts `{"id": ver_id, "approved": true/false}` for REST-based approvals (not just button callbacks).

**Email Tagger version buttons:** PAI Daemon intercepts `etver_approve_`/`etver_reject_` button responses and forwards them to the Email Tagger daemon's Unix socket (`/tmp/email-tagger-daemon.sock`) via `asyncio.open_unix_connection`. The ET daemon handles its own approval logic — PAI just relays.

### 13.8 Daemon Dashboard Pattern

For lightweight daemon status dashboards (embedded HTML in Python daemon):
- Use the **GitHub Dark palette** (Section 2 alternative palette) instead of pure black
- Inline all CSS/JS in the HTML template (no external files)
- Auto-refresh interval: 5 seconds via `setInterval(refreshAll, 5000)`
- Status badges: Connected (green), Processing (amber), Disconnected (red)
- Stats grid: `auto-fit minmax(200px, 1fr)` desktop, `minmax(130px, 1fr)` mobile
- Recent messages table: #, Source, Time, Processing, E2E, Cost, In, Out, Len
- Purple (`#d2a8ff`) for time/response metrics

**March 2026 updates — PAI Daemon dashboard now includes:**
- **Title: "PAI Daemons" (plural)** — subtitle: "Persistent Claude sessions for NAVEX + Email Tagger"
- **Email Tagger tab fully wired** — identical 14-card stats grid (Uptime, Messages, Total Cost, Input/Output Tokens, Avg Response, Last Response, Last Message, Model, Session ID, Reconnects, Errors, CPU, Memory), plus Learning System controls (rules generation, corrections, reset buttons)
- **`refreshAll()` calls 7 functions** every 5s: `refreshPAI()`, `refreshTasks()`, `refreshET()`, `refreshLearning()`, `refreshActions()`, `refreshVersions()`, `refreshMemory()` — **Note:** all tabs refresh on every tick regardless of which is active (including Neo4j queries via `refreshMemory()`)
- **Stop ↔ Start button toggle** — when daemon is disconnected, Stop button changes text to "Start" and calls `POST /api/start` (new endpoint, uses same `call_later(0.5)` deferred pattern)
- **`stagedAction()` two-click confirm** — replaces `confirm()` dialogs. First click: button turns yellow/pulsing (`.btn-staged` CSS class), text changes to confirm prompt, 4s auto-revert timer. Second click within 4s: executes action. Used on all destructive buttons.
- **Connection state guards** — `_paiConnected` / `_etConnected` track each daemon's state. `hasSession(prefix)` checks before allowing actions. `daemonAction()` has `isStart` guard that bypasses session check for `/api/start` and uses "Starting..." badge text.
- **Reconnecting overlay** — fullscreen overlay appears after 2+ consecutive poll failures (`failCount >= 2`). Hidden on successful refresh. CSS: `.overlay.visible` with spinner animation.
- **Full mobile responsive** — `@media(max-width:768px)` block: reduced padding (12px), grid min-width 130px, touch targets 44px, fullscreen modals, horizontal table scroll
- **Pull-to-refresh** — `touchstart`/`touchmove`/`touchend` listeners, 110px threshold, spinner indicator, `window.location.reload()` after 400ms animation
- **Double-tap row detail** — `dblclick` on any `tbody tr` opens fullscreen modal with label/value pairs from all columns
- **ET Learning reset buttons use `ondblclick`** (not `stagedAction()`) — different confirmation pattern
- **Favicon `?v=3` cache-buster**
- **`/logo-small.png` static asset** served without auth alongside `/logo.png`

**New `/api/start` endpoint:**
```python
elif path == "/api/start" and method == "POST":
    if daemon._connected:
        body = json.dumps({"ok": False, "error": "Already connected"}).encode("utf-8")
    else:
        asyncio.get_event_loop().call_later(0.5, lambda: asyncio.ensure_future(daemon.start()))
        body = json.dumps({"ok": True, "action": "start", "scheduled": True}).encode("utf-8")
```

### 13.9 Column Resize & Persistence

```javascript
// Mouse drag on column separator
th.addEventListener('mousedown', e => {
    const startX = e.clientX;
    const startWidth = th.offsetWidth;
    const onMove = e => {
        const newWidth = Math.max(40, startWidth + e.clientX - startX);
        th.style.width = newWidth + 'px';
    };
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        saveColumnWidths();  // Persist to localStorage
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
});
```

Minimum width: 40px. Restore from localStorage on page load.

### 13.10 Cleanup on Unload

```javascript
window.addEventListener('beforeunload', () => {
    // Flush unsaved preferences via sendBeacon (reliable on page close)
    if (Object.keys(Prefs._dirty).length > 0) {
        navigator.sendBeacon('/api/preferences', new Blob([JSON.stringify(Prefs._dirty)], { type: 'application/json' }));
    }
    // Close WebSocket cleanly
    if (state.ws) state.ws.close();
});
```

### 13.11 UNIX Socket + HTTP Dual Server

For daemon processes that serve both a local CLI client and a web dashboard:

```python
async def main():
    # UNIX socket server — for local CLI tools (pai-ctl, et-ctl)
    socket_server = await asyncio.start_unix_server(
        handle_socket_client, SOCKET_PATH
    )
    os.chmod(SOCKET_PATH, 0o666)  # 666 for Docker/n8n access (not 660)

    # HTTP server — for web dashboard and API
    config = uvicorn.Config("app:app", host="0.0.0.0", port=7888)
    http_server = uvicorn.Server(config)

    # Run both concurrently
    await asyncio.gather(
        socket_server.serve_forever(),
        http_server.serve(),
    )
```

Used by: PAI Daemon (UNIX socket for `pai-ctl` CLI + HTTP for dashboard/API at port 7888).

**Socket permissions:** `0o666` (not `0o660`) — needed because Docker containers (n8n) access the socket from different users.

**Socket actions** (JSON `{"action": "..."}` protocol):
- `"status"` — returns daemon status dict
- `"message"` — send message with batching, blocks until Claude responds. Special intercepts:
  - `[BUTTON RESPONSE]` + `etver_approve_`/`etver_reject_` → forwards to ET daemon socket
  - `[BUTTON RESPONSE]` + `ver_approve_`/`ver_reject_` → handles version approval inline
- `"queue"` — fire-and-forget queueing, returns `{"ok": true, "queued": true}` immediately
- `"restart"` — restarts Claude session
- `"shutdown"` — sets `_shutdown_event`, exits handler

**Socket read:** 5s timeout, reads until EOF (sender must `shutdown(SHUT_WR)` or close).

### 13.11b PAI Daemon Constants & Configuration

Key constants in `daemon.py` (important for NAVEX integration):

```python
# Buffer limits
MAX_BUFFER = 10 * 1024 * 1024     # 10MB max response buffer
MAX_READ = 1 * 1024 * 1024        # 1MB max incoming socket message
CONNECT_TIMEOUT = 120              # Socket connect timeout (seconds)

# Session identity
SESSION_DISPLAY_NAME = "NAVEX-Telegram"  # Name in Claude session history
NAVEX_SESSION_FILE = Path("/tmp/navex-cc-session")  # Current session UUID

# Typing indicator (hook-based)
TYPING_PID_FILE = Path("/tmp/navex-typing.pid")

# Watchdog intervals
WATCHDOG_INTERVAL = 30             # Check every 30s
COMPACTION_TIMEOUT = 300           # 5 min max for compaction
STUCK_QUEUE_TIMEOUT = 60           # Queue non-empty without processing
STUCK_PROCESSING_TIMEOUT = 600     # 10 min max lock held

# External services
NEO4J_URL = "http://192.168.1.137:7474/db/neo4j/tx/commit"
NEO4J_AUTH = "Basic bmVvNGo6YWRhbW5lbzRq"  # base64 neo4j:adamneo4j
WARNING_WEBHOOK = "http://localhost:5678/webhook/system-warning"
CALLBACK_URL = "http://localhost:5678/webhook/pai-callback"
DISCORD_CALLBACK_URL = "http://localhost:7892/webhook/pai-discord-callback"
ADAM_CHAT_ID = "8585067857"

# Auth (shared with NTS Web)
AUTH_FILE = Path("/DATA/AppData/nts-web/auth.json")
SESSIONS_FILE = Path("/DATA/AppData/nts-web/sessions.json")
AUTH_SESSION_TTL = 86400 * 7       # 7 days
```

### 13.11c PAI Daemon State Machine

Hierarchical state computation (priority order, first match wins):
```
1. compacting  — _compacting = True (flag file detected)
2. disconnected — not _connected
3. processing  — _send_lock.locked()
4. typing      — _is_typing_active() (PID file check, signal 0)
5. queued      — len(_pending_batch) > 0
6. idle        — default
```

### 13.11d PAI Daemon Background Tasks

5 concurrent background tasks run alongside the main socket/HTTP servers:

| Task | Interval | Purpose |
|------|----------|---------|
| Auto-reconnect | 30s | Polls disconnected state, calls `daemon.start()` |
| Version watcher | 30s | Scans tracked files for changes, reverts unauthorized, sends dual alerts |
| Daemon watchdog | 30s | 3 alarm types: compaction timeout (restart), stuck queue (force-process then restart), stuck processing (restart) |
| Compaction monitor | 2s | Polls flag file `/tmp/navex-compaction-pending-{session_id}`, updates `_compacting` state |
| Message processing | on-demand | `_process_batch()` triggered by incoming messages |

**Watchdog escalation:**
- Stuck queue >60s → force-trigger `_process_batch()`
- Stuck queue >120s → `os.execv()` restart
- Compaction >300s → cleanup flag + `os.execv()` restart
- Processing >600s without compaction → `os.execv()` restart

### 13.11e PAI Daemon HTTP API Reference

**Public endpoints (no auth):**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/login` | Login form POST, redirects if already authenticated |
| POST | `/api/login` | JSON `{username, password}`, sets `nts_token` cookie (HttpOnly, SameSite=Lax) |
| POST | `/api/kill-typing` | Kill typing indicator loop, returns `{"killed": 0\|1}` |
| GET | `/favicon.ico`, `/logo.png`, `/logo-small.png` | Static assets (CasaOS requires unauthenticated) |

**Protected endpoints (require `nts_token`):**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/stats` | Daemon status (polled every 5s by dashboard) |
| GET | `/api/tasks` | Latest task session for current Claude session |
| POST | `/api/start` | Start daemon if disconnected (0.5s deferred via `call_later`) |
| POST | `/api/stop` | Stop daemon (0.5s deferred) |
| POST | `/api/restart` | Restart Claude session |
| POST | `/api/delete-session` | Delete session files and start fresh |
| GET | `/api/receipts?days=N` | Action receipts (default 1 day, max 30) |
| GET | `/api/versions?file=KEY&limit=N` | Version history |
| GET | `/api/versions/<key>/<v1>/<v2>/diff` | Unified diff between versions |
| GET | `/api/versions/<key>/<v>/content` | Raw file content at version |
| POST | `/api/versions/revert` | `{file_key, version_num}` to revert |
| GET | `/api/versions/files` | List tracked files with current version info |
| POST | `/api/versions/approve` | `{id, approved: bool}` for dual-safety approval |
| ANY | `/et/*` | HTTP proxy to Email Tagger daemon on `127.0.0.1:7889` (strips `/et` prefix) |

**Memory Graph endpoints (Neo4j):**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/memory/stats` | Entity/fact/relationship counts + embedding coverage % |
| GET | `/api/memory/entities` | All Memory entities ordered by active fact count |
| GET | `/api/memory/entity/<name>` | Entity details + facts + history + relationships |
| GET | `/api/memory/search?q=QUERY` | Semantic search on memory graph |

**Neo4j integration:** Uses `_neo4j_query(cypher, params)` — synchronous HTTP POST to Neo4j transactional endpoint with 10s timeout. Logs warnings on errors but continues gracefully.

### 13.11f PAI Daemon Message Batching Details

```python
# Batch item structure
{
    "message": str,              # The message text
    "chat_id": str,              # Telegram chat ID for routing
    "telegram_ts": float|None,   # Send timestamp for e2e timing
    "telegram_message_id": int|None,  # For reply threading
    "future": Future|None,       # None = fire-and-forget
    "queued_at": float,          # time.time() when queued
}
```

**Batching rules in `_process_batch()`:**
- **Single message:** sent directly with its original `chat_id` and `telegram_ts`
- **Multiple messages:** combined with `"[Message N of M]\n{message}"` prefix per item
  - Uses **latest** `chat_id` for combined request
  - Uses **earliest** `telegram_ts` for e2e timing
  - Replies to **last (most recent)** message in batch
- All messages in batch get same response
- Items with `future=None` (fire-and-forget) skip `set_result`/`set_exception`

### 13.11g PAI Daemon Imports & Modules

External modules imported by daemon.py:
- **`claude_agent_sdk`** — `ClaudeAgent`, `ClaudeAgentOptions`, `ProcessError`, `CLIConnectionError`
- **`claude_agent_sdk._internal.message_parser`** — `parse_message`, `MessageParseError` (low-level, skips unknown message types like `rate_limit_event`)
- **`context_bundle`** — `build_context_bundle` (cognitive context injection)
- **`receipt`** — `log_receipt`, `read_receipts`, `cleanup_old_receipts` (action receipts)
- **`versioning`** — `scan_all as version_scan_all`, `get_versions`, `get_version_content`, `revert_to`, `compare_versions`, `TRACKED_FILES`

### 13.11h PAI Daemon Receipt Logging

Each processed message creates an action receipt:
```python
{
    "type": "message",
    "agent": "personal-ai",
    "action": "process_message",
    "input_summary": str,        # First 200 chars of input
    "output_summary": str,       # First 200 chars of response
    "success": bool,
    "chat_id": str,
    "msg_num": int,
    "cost_usd": float,
    "elapsed_ms": int,
    "meta": {
        "input_tokens": int,
        "output_tokens": int,
        "turns": int,
    }
}
```
Failures log receipt with `success=False` + `error` field. Old receipts cleaned up on startup (>30 days).

### 13.11i PAI Daemon Process Stats

`_get_process_stats()` reads `/proc` for daemon + Claude subprocess metrics:
- **CPU:** sum `utime` + `stime` across process tree, converted via clock ticks (Hz). Only recalculates if >0.5s since last call.
- **Memory:** sum `VmRSS` from `/proc/[pid]/status` for all children. Returns in bytes + display format (KB/MB).
- **Child discovery:** walks `/proc/[pid]/task/*/children` AND scans PPID for completeness.

### 13.11j PAI Daemon Auth System

- `_verify_auth(token)` — checks `_auth_sessions` dict, reloads from disk on every call (sync point with NTS Web). Deletes expired tokens (>7 days).
- `_hash_password(password)` — SHA256 hash.
- `_parse_cookies(cookie_header)` — splits `"; "` separated cookies into dict.
- HTTP headers extracted: `Cookie:`, `Content-Length:`, `Host:`. Content-Length defaults to 0 if missing. POST body read with 5s timeout.

### 13.11k PAI Daemon Typing Indicator

Typing is **hook-managed**, not daemon-managed:
- The `UserPromptSubmit` hook (`navex-typing.sh`) starts a typing loop
- Daemon only provides: `kill_all_typing()` (kills via PID file) and "locked" status for hook to poll
- `_is_typing_active()` checks PID existence with `os.kill(pid, 0)` (signal 0 = existence check)
- `kill_all_typing()` returns 1 if killed, 0 if already dead

### 13.11l PAI Daemon Session Management

- `_find_session_jsonl(session_uuid)` — searches all project dirs for `.jsonl` transcript
- `_delete_session_files(session_uuid)` — deletes JSONL transcript AND task session `.json` + `.meta.json`
- `_rename_session(session_uuid, title)` — appends `{"type": "custom-title", "customTitle": str, "sessionId": str}` to JSONL on startup
- `_load_agent_prompt()` — loads `personal-ai/agent.md`, strips YAML frontmatter between `---` markers
- `_build_options(resume_id=None)` — returns `ClaudeAgentOptions` with `preset="claude_code"`, `permission_mode="bypassPermissions"`, `effort="low"`, agent prompt appended, stderr logger

### 13.11m PAI Daemon Dashboard Tab Bar

5 tabs: **PAI Daemon | Email Tagger | Actions | Versions | Memory**

Dashboard HTML uses `data-tab` attribute for tab switching. All tabs hidden by CSS `display:none` except active.

**Status badge animations:**
- `badge-compact` — pulsing animation for "Compacting"
- `badge-busy` — solid for "Processing"
- `badge-warn` — solid for "Queued (stuck?)"

**Task status sort order** (line ~1614 in inline JS):
```javascript
statusOrder = {in_progress: 0, blocked: 1, pending: 2, deferred: 3, completed: 4, cancelled: 5}
```

### 13.11n PAI Daemon Startup Sequence

1. Clean up old receipts (>30 days)
2. Start daemon (connect to Claude via Agent SDK)
3. Create UNIX socket server (`chmod 0o666` for Docker/n8n access)
4. Start HTTP dashboard server (`0.0.0.0:7888`)
5. Set up signal handlers (`SIGTERM`, `SIGINT`)
6. Create 4 background tasks: auto-reconnect (30s), version watcher (30s), daemon watchdog (30s), compaction monitor (2s)
7. Wait for `stop_event`

**Graceful shutdown:** Cancels reconnect_task, version_task, watchdog_task, compaction_task. Stops daemon. Unlinks socket file.

### 13.11o PAI Daemon Error Handling

- **`ProcessError`**: logs exit code, marks disconnected, increments `error_count`, logs receipt
- **`CLIConnectionError`**: same handling as ProcessError
- **`MessageParseError`**: skipped with `debug` log (handles unknown types like `rate_limit_event`)
- **Socket read timeout**: 5s, returns `{"ok": false, "error": "timeout"}`
- **HTTP proxy errors**: returns 502 Bad Gateway with `{"error": "Email Tagger unreachable"}`
- **Neo4j query errors**: logged as warning, returns empty results (doesn't crash)
- **Context bundle failure**: logged as warning, message processing continues without bundle

### 13.12 Context Bundle Injection (PAI Daemon)

Before every user message is sent to Claude, PAI Daemon prepends a "cognitive context bundle" — structured context built by the `context_bundle` module (`from context_bundle import build_context_bundle`).

```python
_skip_context = any(message.lstrip().startswith(tag) for tag in (
    "[SELF-REMINDER]", "[SYSTEM]", "[NEW EMAIL]", "[EMAIL SUMMARY]",
))
if not _skip_context:
    try:
        message = build_context_bundle(message) + message
    except Exception as _ctx_err:
        log.warning("[msg#%d] Context bundle failed: %s", msg_num, _ctx_err)
```

**Skip tags:** System/internal messages with these 4 prefixes bypass context injection: `[SELF-REMINDER]`, `[SYSTEM]`, `[NEW EMAIL]`, `[EMAIL SUMMARY]`.

### 13.13 Fire-and-Forget Message Queue (PAI Daemon)

For non-interactive senders (email summaries, reminders, phone notifications), PAI Daemon has a `queue_message()` method and `"queue"` socket action:

```python
def queue_message(self, message: str, chat_id: str = "") -> None:
    """Queue a message for processing without waiting for response (fire-and-forget)."""
    self._pending_batch.append({
        "message": message, "chat_id": chat_id,
        "telegram_ts": None, "telegram_message_id": None,
        "future": None,  # No future = no one waits for response
        "queued_at": time.time(),
    })
```

Socket action `"queue"` returns `{"ok": True, "queued": True}` immediately without waiting for Claude's response. Batch items include `queued_at` timestamp for diagnostics.

### 13.14 Claude Agent SDK Configuration (PAI Daemon)

Full `ClaudeAgentOptions` configuration from `_build_options()`:
```python
ClaudeAgentOptions(
    preset="claude_code",              # Uses claude_code preset
    permission_mode="bypassPermissions",  # No permission prompts
    disallowed_tools=["EnterPlanMode", "ExitPlanMode", "AskUserQuestion"],
    effort="low",                      # Low reasoning effort (fast responses)
    # Agent prompt from personal-ai/agent.md appended to system prompt
    # Stderr logger configured for debugging
)
```
This prevents the personal-ai agent from entering plan mode or asking interactive questions mid-session.

**Message parsing:** Uses low-level `receive_messages()` iteration with `parse_message()` from `claude_agent_sdk._internal.message_parser`. Unknown message types (e.g., `rate_limit_event`) are caught via `MessageParseError` and logged at `debug` level — doesn't crash the processing loop.

`send_batched()` now accepts 4 parameters: `message`, `chat_id`, `telegram_ts`, `telegram_message_id` (for reply threading).

---

## 13b. Cross-Dashboard Contradictions & Known Gaps

These inconsistencies were found during the 4-dashboard audit. NTS Web is the **authority** — its patterns overrule all others.

### Contradictions (NTS Web wins)

| Issue | PAI Daemon | NTS Web (Authority) | Action |
|-------|-----------|---------------------|--------|
| Background color | `#0d1117` (GitHub Dark) | `#000000` (pure black) | PAI should migrate to pure black when merged |
| Font stack order | `-apple-system` first | `'Segoe UI'` first | PAI should adopt NTS Web order |
| CSS custom properties | Hardcoded hex everywhere | CSS `--var` custom properties | PAI should adopt CSS vars |
| Browser dialogs | Uses `alert()` and `confirm()` | Custom `showConfirm()`/`showPrompt()` | PAI must replace all browser dialogs |
| Font units | `rem` | `px` | PAI should use `px` |
| Card border-radius | `8px` | `6px` | Standardize to `6px` |
| Modal border-radius | `10px` | `8px` | Standardize to `8px` |
| Data refresh | HTTP polling (5s `setInterval`) | WebSocket push | PAI should move to WS push |
| HTML structure | Inline HTML blob in Python | Separate Jinja2 templates + static files | PAI should separate during merge |
| CORS policy | `Access-Control-Allow-Origin: *` on ALL APIs | No CORS headers (same-origin only) | PAI must restrict CORS to same-origin or specific origins |
| URL-decoding | Only on 2 endpoints (entity/search) | Handled by FastAPI/Starlette automatically | PAI should decode consistently or let framework handle |
| Login cookie Domain flag | Missing `Domain` flag entirely | Sets `.ntsserver.christmas` | PAI must set `Domain=.ntsserver.christmas` for shared auth |
| Login cookie Secure flag | Missing | Missing | Both should set `Secure` when behind HTTPS proxy |
| Inline imports | `import urllib.parse` repeated inline at 2+ locations | All imports at top of file | PAI should consolidate imports |
| Auth session file writes | `write_text()` without fsync | Atomic file writes with fsync | PAI should use atomic writes |
| Entity search | Bidirectional CONTAINS (fuzzy, false positives) | N/A | Should use exact match or prefix-only |
| Auth check pattern | Reload before creating token | NTS Web: reload on miss; TA: reload every check | Standardize to NTS Web's load-on-miss |
| WS close code | N/A (no WS) | 1008 (standard) | PC: 1008; TA: 4001 (custom). Standardize to 1008 |
| Log rotation | None (raw asyncio) | RotatingFileHandler with size-based rotation | All apps should use rotation |

### Security Gaps (to fix in mega-merge)

| Gap | PAI Daemon | Phone Control | Task Analytics | NTS Web |
|-----|-----------|--------------|----------------|---------|
| Security headers (CSP, etc.) | NO | YES | NO | NO |
| Login rate limiting | NO | YES (5/5min) | NO | NO |
| HttpOnly cookie | YES (but missing Domain+Secure) | YES (`httponly=True, samesite="lax"`) | YES | YES |
| Input sanitization | No URL-decoding on most routes | Alarm validation | N/A | UUID/path/model regex validation |
| Session file fsync | NO (`write_text()`) | Partial (sessions: no; alarms/rules: yes) | N/A | YES (atomic writes) |
| Hardcoded secrets | N/A | N8N_TOKEN in source | N/A | n8n API key JWT + Telegram bot token in defaults |
| Logout cookie cleanup | N/A | Double delete (no domain + with domain) | N/A | Standard single delete |
| CORS | `*` on all APIs | Not set (same-origin) | Not set (same-origin) | Not set (same-origin) |

### Known Bugs

| Dashboard | Bug | Location |
|-----------|-----|----------|
| NTS Web | Health endpoint returns hardcoded `"version": "2.5"` instead of `VERSION` constant ("4.03") | `app.py` line ~1434 |
| NTS Web | Usage simulation references `alerted_keys` but actual dict key is `alerted_pcts` — would crash on sim start | `app.py` line ~1989 |
| NTS Web | `format_size()` uses 1024 base but labels as KB/MB/GB (not KiB/MiB/GiB) — violates dual-unit preference | `app.py` ~line 2370 |
| NTS Web | Unused `import glob` inside `_cleanup_old_logs()` (uses `Path.glob()` not `glob` module) | `app.py` line ~3111 |
| NTS Web | Default auth username is "nothingitis" but CLAUDE.md documents "admin" | `app.py` `_setup_auth_if_needed()` |
| Phone Control | `_save_sessions()` uses `write_text()` without fsync but alarm/notification/rules saves DO use fsync | `app.py` session save path |
| Phone Control | N8N_TOKEN hardcoded in source code | `app.py` top-level constant |
| Phone Control | Notification storage 5MB cap trims with O(n*m) re-serialization on every incoming notification | `app.py` notification handler |
| Phone Control | GET `/api/alarms` has side-effect: auto-disables expired alarms on read | `app.py` alarm endpoint |
| PAI Daemon | (FIXED Mar 2026) `alert()`/`confirm()` replaced with `stagedAction()` two-click confirm pattern | `daemon.py` inline HTML |
| PAI Daemon | Version approval `revert_to()` writes without fsync | `daemon.py` version watcher |
| PAI Daemon | No race condition protection on session file writes | `daemon.py` session management |
| PAI Daemon | `watchdog_task` cancelled but never awaited in cleanup (reconnect_task, version_task, compaction_task are all awaited) | `daemon.py` main() cleanup |
| PAI Daemon | `refreshMemory()` queries Neo4j every 5s regardless of active tab — unnecessary I/O when user is on a different tab | `daemon.py` inline JS `refreshAll()` |
| PAI Daemon | Stale comment "Send Telegram alert" on `_send_safety_alert` which now sends to both Telegram AND Discord | `daemon.py` version watcher |
| PAI Daemon | Versions tab initial value hardcodes "14" for Tracked Files count (should be 0 or computed) | `daemon.py` inline HTML |
| PAI Daemon | ET reset buttons use `ondblclick` while other destructive buttons use `stagedAction()` — inconsistent confirmation patterns | `daemon.py` inline HTML |
| PAI Daemon | Neo4j credentials hardcoded as base64 `Basic bmVvNGo6YWRhbW5lbzRq` (neo4j:adamneo4j) — should be in config/env | `daemon.py` constant `NEO4J_AUTH` |
| PAI Daemon | `_verify_auth()` reloads `sessions.json` from disk on EVERY request — same unnecessary I/O as Task Analytics | `daemon.py` auth system |
| PAI Daemon | CORS `Access-Control-Allow-Origin: *` on ALL API responses — should restrict to same-origin or specific origins | `daemon.py` HTTP handler |
| Task Analytics | Auth reloads from disk on EVERY request (vs Phone Control's load-on-miss, NTS Web's reload-on-miss) — unnecessary I/O | `app.py` auth check |
| Task Analytics | WS close code 4001 (custom) instead of standard 1008 | `app.py` WS endpoint |
| Phone Control | (FIXED v2.20) `init()` didn't call tab-specific data loaders — direct navigation to `/notifications` or `/logs` showed infinite skeletons because `fetchNotifRules()`/`fetchLogs()` only ran via `switchTab()` click handler | `app.js` `init()` |

---

## 14. Bug Avoidance & Common Pitfalls

### 14.1 DOM & Rendering

- **Never use `innerHTML` with user data** — always `textContent` or `escHtml()` to prevent XSS
- **Check for null before DOM access** — `querySelector` returns null if element doesn't exist
- **Don't rebuild entire lists** on every update — use DOM diffing (Section 7.5) for frequently-updating data
- **Use `requestAnimationFrame`** for chart re-renders on tab switch, not immediate draws
- **Guard against double-renders** — use `_loaded` flags to prevent duplicate initialization
- **`init()` must call tab-specific data loaders** — when the server pre-sets the active tab via HTML template (e.g., `{% if active_tab == 'notifications' %} active{% endif %}`), `switchTab()` never fires on page load. The `init()` function must check `state.activeTab` and call the same data-fetching functions that `switchTab()` would. Otherwise, direct navigation to a non-default tab shows infinite skeletons.

### 14.2 WebSocket

- **Always handle WS close/error** — show reconnection overlay, poll `/api/ping`
- **Parse JSON in try/catch** — malformed messages shouldn't crash the app
- **Don't send on closed socket** — check `ws.readyState === WebSocket.OPEN` before `send()`
- **Cancel active scans/requests on disconnect** — clean up AbortControllers and streaming state
- **Use `ws_lock` on server** — prevent interleaving when multiple async tasks send to same client

### 14.3 State Management

- **Don't mutate state during render** — update state first, then call render
- **Guard against race conditions** — use `_pending` flags when async actions can overlap (e.g., start/stop buttons)
- **Optimistic UI needs rollback** — if an action fails, revert the UI state and show the error
- **Clear stale caches on reconnect** — don't show 10-minute-old data after a WS reconnect

### 14.4 Mobile

- **Test on actual phone** — `window.matchMedia` in desktop DevTools doesn't catch all mobile quirks
- **`100svh` not `100vh`** — `vh` doesn't account for mobile browser chrome (URL bar, nav bar)
- **`passive: true` on touch listeners** — prevents "violation" warnings and improves scroll performance
- **Disable browser pull-to-refresh** — `overscroll-behavior-y: contain` on body, implement custom PTR
- **Safe areas** — use `env(safe-area-inset-bottom)` for bottom nav on notched devices
- **Tap delay** — modern browsers don't have 300ms tap delay if viewport meta is set correctly

### 14.5 CSS

- **Don't use `!important` unless overriding inline styles** — specificity issues compound over time
- **`table-layout: fixed`** on desktop, `auto` on mobile — fixed prevents column width flickering
- **`overflow: hidden` on collapsed sections** — prevents content leaking during animation
- **`pointer-events: none/all`** on overlays — block interaction when showing overlays
- **Test scrollbar styling** — Firefox uses different scrollbar pseudo-elements than WebKit

### 14.6 Data Formatting

- **Never show raw timestamps** — always `relativeTime()`. This is a hard rule.
- **Null/undefined checks** in formatters — `formatBytes(null)` should return `'0 B'`, not crash
- **Token counts** — use `formatTokens()` for abbreviation, not raw numbers
- **Durations** — use `formatMs()` for compact, `formatMsFull()` for countdowns

### 14.7 Authentication

- **HttpOnly cookies only** — never expose tokens to JavaScript. Always set `samesite="lax"`.
- **Check auth on every route** — not just pages, also API endpoints and WS connections
- **Shared auth files** — all dashboards on `.ntsserver.christmas` share `auth.json` + `sessions.json`
- **Session cleanup** — expire sessions after 7 days

### 14.8 Deployment

- **Always `--force-recreate`** — `docker restart` doesn't pick up image changes
- **Pin dependency versions** — `requirements.txt` should have exact versions
- **Cache bust static files** — use `?v=VERSION&t=BUILD_TS` query params
- **Test on mobile after deploy** — mobile often catches issues desktop doesn't

---

## 15. Checklist for New Web UI Projects

Before shipping any new web UI, verify:

**Hard Rules:**
- [ ] Pure black background (`#000000`), no light mode
- [ ] All timestamps use `relativeTime()` — no absolute dates
- [ ] 12-hour format for any unavoidable absolute times
- [ ] No `alert()`, `confirm()`, or `prompt()` — custom modals only
- [ ] Storage sizes show both GB and GiB
- [ ] Vanilla JS + Canvas 2D — no frameworks or chart libraries
- [ ] No emojis anywhere
- [ ] Circular logo/icon

**Visual:**
- [ ] CSS custom properties from the palette
- [ ] Z-index follows the layering system
- [ ] Box shadows use documented patterns
- [ ] `font-variant-numeric: tabular-nums` on number columns
- [ ] `user-select: none` on headers, buttons, overlays
- [ ] `::selection` styled (rgba cyan)
- [ ] Scrollbar styled (dark theme)

**Mobile:**
- [ ] Mobile-responsive at 768px breakpoint
- [ ] Touch targets >= 40px with 4-8px spacing
- [ ] Safe area handling (`env(safe-area-inset-bottom)`)
- [ ] Pull-to-refresh (custom, not browser native)
- [ ] Double-tap row for detail
- [ ] Long-press for context menu
- [ ] Bottom nav with overflow menu
- [ ] Mobile detail fullscreen modal
- [ ] Filters collapse behind toggle

**Interaction:**
- [ ] Destructive actions require confirmation
- [ ] Copy feedback (green flash)
- [ ] Keyboard: Escape closes modals, Enter submits
- [ ] URL pathname routing tracks active tab
- [ ] WS reconnection with overlay + auto-reload
- [ ] Column resize with localStorage persistence
- [ ] Context menu positioned at click coords
- [ ] Staged actions for less-critical irreversible operations

**Data:**
- [ ] Filter bar with pills, search, presets, count, empty state
- [ ] Skeleton loading states
- [ ] WebSocket for real-time data, REST for actions
- [ ] DOM diffing for live-updating lists
- [ ] Server-side preferences with debounced save + beforeunload beacon
- [ ] Per-tab render throttling
- [ ] AbortController for cancellable fetches
- [ ] Fail count tracking with overlay after 2+ failures

**Security:**
- [ ] Security headers middleware (CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
- [ ] Login rate limiting (5 attempts / 5 minutes per IP)
- [ ] HttpOnly + SameSite=Lax + Domain=`.ntsserver.christmas` + Secure on all auth cookies
- [ ] Input validation on all user-provided paths, UUIDs, model names
- [ ] M2M Bearer token auth for automation endpoints (if applicable)
- [ ] Atomic file writes with fsync for persistent state
- [ ] No hardcoded secrets (API keys, tokens) in source — use env vars or config files
- [ ] No CORS `*` — same-origin or explicit allowed origins only
- [ ] Session file writes use fsync consistently (not just some paths)
- [ ] Standard WS close codes (1008 for policy violation, not custom 4001)

**Infrastructure:**
- [ ] Shared auth cookie on `.ntsserver.christmas` with Domain + Secure flags
- [ ] Docker + CasaOS with `--force-recreate`
- [ ] Version bumped on every deploy
- [ ] Cache busting on static files
- [ ] Single worker for in-memory state
- [ ] Named loggers with size-based rotation
- [ ] HTML head: viewport-fit=cover, theme-color, apple-mobile-web-app
- [ ] Initialization flow: UI first, data connection last
- [ ] Init error isolation (try/catch per init function)
- [ ] `--ws wsproto` in uvicorn CMD
- [ ] Tab loading guard (`.tab-panel.loading` disables interaction)
- [ ] `color-scheme: dark` on native date/time inputs
- [ ] Login page: inline CSS, no external stylesheet
- [ ] Health endpoint uses VERSION constant (not hardcoded)
- [ ] Log cleanup on startup (delete files >7 days old)
- [ ] Tiered cache pre-warming (fast data first, slow data second)
- [ ] Per-client WS state with thread-safe send (asyncio.Lock per client)
- [ ] Graceful shutdown releases external resources
- [ ] Background cache refresh loop
- [ ] Cached data sent immediately on WS connect for fast initial load
- [ ] Auth check pattern: load-on-miss (not reload-every-request)
- [ ] All imports at top of file (no inline imports except stdlib in closures)

---

## 16. NAVEX Website — Design Specification

> **Name:** NAVEX (**N**TS + **A**PAAV + E**X**tended)
> **Purpose:** Unified dashboard combining all 4 existing dashboards (NTS Web, PAI Daemon, Phone Control, Task Analytics) into a single app with consistent design, shared component system, and rewritten frontend using the same backend logic/APIs.
> **Status:** Design phase (Mar 3, 2026)
> **Original dashboards stay running independently** — NAVEX does NOT replace them. It connects to the same backends and stays indirectly in sync.

### 16.1 Core Architecture Principle

**Rewrite frontend, keep identical backend logic.** Every page calls the same APIs, uses the same agents, same polling, same WebSocket streams as the original dashboards. The NAVEX frontend is a completely new design but the behavior is indirectly synced with the originals — e.g., start a No Sleep session on NTS Web, the NAVEX dashboard shows the same countdown via the same backend state.

**Why:** Existing dashboards stay running independently. Other AI developers can modify the original pages, then changes are transferred to NAVEX with the unified design. No single point of failure.

**Documentation requirement:** Every step, feature, and change must be documented thoroughly. This enables other developers to understand the mapping between original dashboard features and NAVEX implementations.

**Developer handoff workflow:** Adam works with multiple AI developers on different dashboards. The workflow is:
1. Another AI developer makes changes to an original dashboard (e.g., adds a feature to Phone Control)
2. Adam reviews and approves the change on the original dashboard
3. Adam asks us (Claude Code) to transfer the feature to NAVEX with the unified design
4. Since NAVEX uses the same backend logic/APIs, the transfer is a frontend-only task
5. This means NAVEX must never depend on custom backend changes — it must work with the exact same APIs the originals use

**Indirect sync explained:** NAVEX and the originals are "indirectly synced" because they read the same backend state. Example:
- Adam starts a No Sleep session on NTS Web → the backend starts the agent, stores state
- NAVEX reads the same backend state → shows the same countdown, same timer, same status
- No direct communication between NAVEX and NTS Web — they both just talk to the same backend
- This works for ALL features: alarms, notifications, tasks, temps, storage, usage, PAI status, etc.

### 16.2 Visual Style — Enhanced Neon

Base: NTS Web's pure black (`#000000`) + cyan (`#328cff`) palette.

**Enhancements over NTS Web:**
- **Slightly more glow/brightness** on the primary neon blue — subtle `box-shadow` and `text-shadow` with cyan on interactive elements
- **All interactive elements get neon treatment** — not just the accent color:
  - Green buttons/indicators: neon green glow (`#00c864` shadow)
  - Red alerts/errors: neon red glow (`#ff5050` shadow)
  - Amber warnings: neon amber glow (`#ffc800` shadow)
  - Cyan accents/links: enhanced neon cyan glow (`#328cff` shadow)
- **Examples:**
  ```css
  .btn-success {
      background: #00c864;
      box-shadow: 0 0 8px rgba(0, 200, 100, 0.3), 0 0 20px rgba(0, 200, 100, 0.1);
  }
  .btn-danger {
      background: #ff5050;
      box-shadow: 0 0 8px rgba(255, 80, 80, 0.3), 0 0 20px rgba(255, 80, 80, 0.1);
  }
  .indicator-active {
      color: #00c864;
      text-shadow: 0 0 6px rgba(0, 200, 100, 0.4);
  }
  ```

### 16.3 Browser-Style Tab System

Tabs work exactly like Chrome/Firefox browser tabs:

**Tab bar behavior:**
- Tabs appear on a horizontal bar at the top of the page
- Active tab is highlighted and **connects seamlessly to the page content below** (no visible border between tab and content — classic browser behavior)
- Inactive tabs are visually recessed/dimmed
- Tab width matches the tab name (no fixed width) with min/max constraints
- Close button (X) **only visible on hover** — hidden by default
- Tabs can be reordered by dragging (optional, nice-to-have)
- Tab overflow: horizontal scroll with subtle scroll indicators when too many tabs

**Opening tabs:**
- Hamburger menu (top-left or top-right) lists all available pages grouped by category
- Clicking a page in the menu opens it as a new tab on the bar
- If the page is already open, switch to that tab instead of duplicating

**Tab lifecycle:**
- New tab opens → added to bar → becomes active
- Click X (on hover) → closes tab, switches to nearest neighbor
- Click tab → switches to it
- At least one tab must remain open (can't close the last one)

### 16.4 Hamburger Menu — Grouped Pages

Pages organized by similarity in a dropdown menu with expandable groups:

**Menu structure (draft — groups TBD after full feature mapping):**
```
[Hamburger Icon]
├── Data & Monitoring
│   ├── Server Temps
│   ├── Storage Browser
│   ├── Usage & Costs
│   └── Workflows
├── AI & Sessions
│   ├── PAI Status
│   ├── Email Tagger
│   ├── Memory Graph
│   └── Task Sessions (unified NTS Web tasks + Task Analytics)
├── Phone
│   ├── Notifications
│   ├── Alarms & Timers
│   └── Phone Controls (volume, DND)
├── Server
│   ├── No Sleep
│   ├── Claude Processes
│   └── Server Health
└── Settings
```

**Menu behavior:**
- Clicking a group name expands/collapses the group (dropdown)
- Clicking a page name opens it as a tab
- Groups remember expanded/collapsed state

### 16.5 Unified Component System

**Every UI element is built from shared classes/functions.** Fix one bug → fixes everywhere.

**Philosophy (Adam's exact words):** "You're going to make a singular function that maps out an entire table structure. For a table it'd be a class. That way all bugs are local to specific things and consistent. E.g. column handling on tables is broken → fix singular function in class → everything works."

**Standardization covers:**
- How tables are presented (sorting, resizing, hiding columns, mobile viewer)
- How buttons look and behave (neon glow, staged action confirm)
- How tabs work (browser-style, consistent across all pages)
- How colors are used (neon treatment on all interactive elements)
- How charts render (fixed hover, sub-increments, axis labels)
- How modals/dialogs appear (no browser dialogs ever)
- How loading states display (skeletons)
- How filters work (pill groups, presets)

**Required shared components:**

| Component | Type | Purpose |
|-----------|------|---------|
| `DataTable` | Class | All tables: sorting, column resize, column hide/show, mobile row viewer, pagination |
| `Chart` | Class | All charts: canvas 2D, fixed-point hover, sub-increment hover, axis labels, step interpolation |
| `TabPanel` | Class | Browser-style tab bar management |
| `Modal` | Function | All dialogs: `showConfirm()`, `showPrompt()`, staged action |
| `StatusBadge` | Function | Colored badges with neon glow |
| `FilterBar` | Class | Pill button groups, presets, multi-select |
| `Skeleton` | Function | Loading skeletons for all data areas |
| `Toast` | Function | Non-blocking notifications |

**`DataTable` class must include:**
- Column sorting (click header, arrow indicators)
- Column resize (drag handle between headers)
- Column hide/show (right-click header or settings menu) — from NTS Web Tasks tab, applied to ALL tables
- Session/row naming — from NTS Web naming feature, available wherever applicable
- Mobile: double-tap row for fullscreen detail viewer
- Consistent styling across all pages

### 16.6 Chart System — Enhanced Hover & Labels

All charts use the NTS Web usage tab's graph logic as the base:
- **All-time graph** with permanently stored data (not re-fetched)
- **Dynamic increment scaling** — increments increase relative to time range (hourly → daily → weekly)
- **Step interpolation** (flat bars, no diagonal slopes)

**Enhanced hover behavior (NEW):**
- Hover line **snaps to fixed data points** — does NOT glide freely between points
- **Sub-increment hover:** Between two main data points (e.g., 12:00 AM and 1:00 AM), the hover line can snap to **10 evenly-spaced sub-positions** showing interpolated timestamps
  - Example: hourly increments → sub-increments at 6-minute intervals
  - Formula: `sub_position = main_increment / 10`
  - Sub-positions show timestamp: "12:06 AM", "12:12 AM", etc.
- **12-hour format ONLY** on all time axes — "12:00 AM", "1:00 PM", never "00:00" or "13:00"

**Axis labels (NEW — required on ALL charts):**
- **Y-axis label:** describes what's being measured (e.g., "Tokens", "Temperature (C)", "Usage (%)")
- **X-axis label:** describes time dimension (e.g., "Time", "Date")

### 16.7 Feature Unification Map

Features from individual dashboards that get unified in NAVEX:

| Feature | Source Dashboard(s) | NAVEX Behavior |
|---------|-------------------|----------------|
| Session naming | NTS Web | Available on all session/row-based views |
| Column hide/show | NTS Web Tasks tab | Available on ALL `DataTable` instances |
| Column resize | NTS Web Tasks tab | Available on ALL `DataTable` instances |
| Task sessions | NTS Web + Task Analytics | Unified view combining both data sources |
| Mobile row viewer | NTS Web + PAI Daemon | Shared `DataTable` component handles it |
| Filter presets | NTS Web | Available on all filterable views |
| Pull-to-refresh | NTS Web + PAI Daemon | Shared behavior via component |
| Staged action confirm | PAI Daemon | Used on ALL destructive buttons (replaces `ondblclick`) |
| Status badges | All 4 dashboards | Unified `StatusBadge` with neon glow |

### 16.8 Mobile Support

**For initial release:** Show an "Under Construction" banner/tag on mobile viewports. Desktop-first development.

Mobile responsive design will be added in a later phase.

### 16.9 Logo

- **Style:** Futuristic, AI, logistic, smart
- **Colors:** Neon blue (#328cff) and black (#000000) theme
- **Shape:** Circular (per Adam's hard rule)
- **Generation:** DALL-E iterative process — present options, refine based on feedback
- **Chosen concept:** 3D circuit sphere — sphere made of glowing neon blue circuit board traces, data pathways, and illuminated nodes on pure black background. Like a digital brain/cyber planet.
- **Current file:** `/tmp/navex-logo-sphere.png` (approved Mar 3, 2026)
- **DALL-E prompt used:** "Circular logo icon on pure black background. A 3D-looking sphere constructed entirely from glowing neon blue circuit board traces, data pathways, and small illuminated nodes — like a digital brain or cyber planet. The traces form a complex but clean geometric pattern across the sphere surface. Neon blue color (#328cff) with depth, subtle inner glow, and sharp contrast against the black void. No text, no letters, no words. Sleek, futuristic, high-tech. Professional quality icon."
- **Rejected concepts:** Neural network hub (too generic), circuit compass (not preferred over sphere)

### 16.10 Naming

**NAVEX** — **N**TS + **A**PAAV + E**X**tended. Sharp, navigational, futuristic. Chosen Mar 3, 2026.

### 16.11 Full-Height Layout (Viewport Fit)

NAVEX uses the same full-height flex layout as NTS Web's processes tab. Pages fill the entire viewport below the topbar — no wasted space, no document-level scrolling.

**Layout chain:**

```
body (flex column, height: 100svh, overflow: hidden)
├── .topbar (flex-shrink: 0, height: 36px)
├── .page-area (flex: 1, min-height: 0, overflow: hidden, position: relative)
│   └── .page-panel.active (position: absolute, inset: 0, display: flex, flex-direction: column, overflow-y: auto)
│       └── page content (flex-shrink: 0 — scrolling handles overflow)
└── .status-bar (fixed bottom-right pill)
```

**Critical CSS rules:**

| Rule | Purpose |
|------|---------|
| `body { display: flex; flex-direction: column; height: 100svh; }` | Root flex container, `svh` is mobile-safe |
| `.topbar { flex-shrink: 0; }` | Header never shrinks |
| `.page-area { flex: 1; min-height: 0; overflow: hidden; position: relative; }` | Takes all remaining space |
| `.page-panel { position: absolute; inset: 0; overflow-y: auto; }` | Fills page-area exactly, scrolls internally |
| `.page-panel.active { display: flex; flex-direction: column; }` | Enables flex children distribution |
| `.page-panel.active > * { flex-shrink: 0; }` | Children don't auto-shrink, scroll handles overflow |

**Key insight:** `min-height: 0` on `.page-area` is critical — without it, flex children can't shrink below their content height, breaking the layout. The `position: absolute; inset: 0` on panels makes them fill the parent exactly without affecting layout flow.

### 16.12 Theme System

NAVEX supports dark (default) and light themes via CSS custom property overrides.

**How it works:**
1. `:root` defines dark theme variables (pure black base)
2. `html[data-theme="light"]` overrides all color variables with light palette
3. Flash-prevention: inline `<script>` in `<head>` reads `navex_theme` from `localStorage` and sets `data-theme` before CSS loads
4. Settings page has a toggle switch under APPEARANCE section
5. Toggle calls `Util.lsSet('navex_theme', theme)` + sets `document.documentElement.dataset.theme`

**Files:**
- `core.css` — `:root` (dark) + `html[data-theme="light"]` (light) variable blocks
- `index.html` — flash-prevention script in `<head>`
- `settings.js` — toggle switch UI + persistence logic
