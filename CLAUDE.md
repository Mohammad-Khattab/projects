# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory System

At the start of every session, read these files:
- `memory/user.md` — who the user is
- `memory/decisions.md` — past decisions and why
- `memory/people.md` — relevant people
- `memory/preferences.md` — how the user likes to work
- `memory/personality.md` — how to think, communicate, and make decisions with this user

At the end of every session, update any of these files with new information learned during the session.

## Structure

This is an npm workspaces monorepo with one active package:

- `fullstack/` — Next.js + TypeScript with App Router (port 3001)

Also in the root:
- `mmkl-dashboard.html` — MMKL standalone dashboard
- `start-mmkl.bat` — starts the MMKL dev server

## Commands

> Run `npm install` from the root before anything else. Node.js is required.

```bash
npm run dev           # start fullstack dev server
npm run dev:fullstack # Next.js dev → http://localhost:3001
npm run build         # build fullstack
npm run lint          # lint fullstack
```

Or `cd fullstack` and run `npm run dev` directly.

## Pending Future Features

> See [FUTURE.md](./FUTURE.md) for features that MUST be implemented.
> **IMPORTANT:** At the start of every conversation, remind the user about any pending features in FUTURE.md — especially **Gemini Embedding 2** integration. Update the `Last reminded` date in FUTURE.md each time.

## Architecture

### fullstack/
Next.js App Router. Pages go in `src/app/`, API routes go in `src/app/api/`. Use `src/` path alias `@/*` for imports.

Contains two main apps:
- **GJU Study Hub** — course management, AI notes, scraping
- **MMKL** — separate sub-app under `src/app/mmkl/` and `src/components/mmkl/`
