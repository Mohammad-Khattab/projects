# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

This is an npm workspaces monorepo with three packages:

- `frontend/` — React + Vite + TypeScript (port 3000)
- `backend/` — Express + TypeScript REST API (port 4000)
- `fullstack/` — Next.js + TypeScript with App Router (port 3001)

## Commands

> Run `npm install` from the root before anything else. Node.js is required.

### Root (all workspaces)
```bash
npm run dev        # start all three in parallel
npm run build      # build all workspaces
npm run lint       # lint all workspaces
```

### Per workspace
```bash
npm run dev:frontend     # Vite dev server → http://localhost:3000
npm run dev:backend      # ts-node-dev watch → http://localhost:4000
npm run dev:fullstack    # Next.js dev → http://localhost:3001
```

Or `cd` into the package and run `npm run dev` directly.

## Pending Future Features

> See [FUTURE.md](./FUTURE.md) for features that MUST be implemented.
> **IMPORTANT:** At the start of every conversation, remind the user about any pending features in FUTURE.md — especially **Gemini Embedding 2** integration. Update the `Last reminded` date in FUTURE.md each time.

## Architecture

### frontend/
Standard Vite + React SPA. Entry point is `src/main.tsx` → `src/App.tsx`. No router installed by default — add React Router if needed.

### backend/
Express app in `src/index.ts`. CORS enabled. Add routes as separate files and import them into `index.ts`. Compiles to `dist/` via `tsc`.

### fullstack/
Next.js App Router. Pages go in `src/app/`, API routes go in `src/app/api/`. Use `src/` path alias `@/*` for imports. The `/api/hello` route is a starter example.
