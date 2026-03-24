# Project: MHub

## What This Is

Mohammad's personal hub website — a single dashboard that consolidates games, project ideas (with live Claude AI), and other websites.

---

## Stack

- **Frontend**: Vanilla HTML + CSS + JS (no frameworks) — single `index.html`
- **Backend**: Python / FastAPI (`server.py`)
- **Storage**: JSON files in `data/` (games.json, sites.json, projects.json)
- **AI**: Claude CLI via subprocess, SSE streaming back to browser

---

## Goals

- [x] Games tab — card grid, add/remove games, click opens in new tab
- [x] Projects tab — save ideas with notes, chat with Claude about them
- [x] Sites tab — card grid, add/remove websites, click opens in new tab
- [x] Theme customizer — accent color + font, persisted to localStorage
- [ ] Game thumbnail auto-fetch (future)
- [ ] Project export / share (future)

---

## Pages / Screens

| Page | File | Status |
|------|------|--------|
| Hub (all tabs) | `index.html` | done |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/games` | GET, POST | List / add games |
| `/api/games/{id}` | DELETE | Remove game |
| `/api/sites` | GET, POST | List / add sites |
| `/api/sites/{id}` | DELETE | Remove site |
| `/api/projects` | GET, POST | List / create projects |
| `/api/projects/{id}` | PATCH, DELETE | Update / delete project |
| `/api/projects/{id}/chat` | POST | Stream Claude response (SSE) |

---

## How to Run

```bash
cd "Projects/main lobby"
pip install fastapi uvicorn
uvicorn server:app --reload --port 8000
```

Then open: `http://localhost:8000`

---

## Notes / Decisions

- Accent color defaults to red `#ff1a2e` (Mohammad's choice), switchable via theme popover
- Chat history is in-memory only (lost on page refresh) — notes are persisted to disk
- Claude chat uses `--system-prompt` flag with project title + notes as context

---

## Hard Rules (inherited from global style guide)

- No browser dialogs — use custom `showConfirm()` modal
- Relative timestamps only in UI
- Dark theme, `#000000` background
- No frameworks, no CSS libraries, no charting libraries
- No emojis
