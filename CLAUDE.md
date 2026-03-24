# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack (hot reload)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset SQLite database
```

All npm scripts require `node-compat.cjs` as a loader (set via NODE_OPTIONS automatically).

## Environment

Create a `.env` file with `ANTHROPIC_API_KEY=sk-ant-...`. If omitted, the app falls back to a `MockLanguageModel` that returns hardcoded demo components — useful for frontend work without API costs.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in natural language; Claude generates them in real-time with a live preview. The core data flow:

1. User types in `ChatInterface` → `useChat` (Vercel AI SDK) POSTs to `/api/chat`
2. `/api/chat` calls Claude with two tools: `str_replace_editor` and `file_manager`
3. Tool calls stream back and are executed by `FileSystemContext`, which mutates a `VirtualFileSystem` (in-memory, no disk I/O)
4. `PreviewFrame` detects the refresh signal, compiles files with Babel standalone, and renders into a sandboxed iframe using an esm.sh import map

### Virtual File System (`lib/file-system.ts`)

`VirtualFileSystem` is the central data structure — an in-memory tree of files/dirs. It serializes to/from plain JSON for database storage (`Project.data`). Claude's tools operate on it: `str_replace_editor` for create/replace/insert, `file_manager` for rename/delete.

### Context Hierarchy

```
FileSystemProvider  →  manages VirtualFileSystem + dispatches tool calls
  └── ChatProvider  →  wraps useChat, passes serialized FS in request body, routes tool results back
```

Both contexts are in `src/lib/contexts/`. Components access them via the corresponding hooks.

### Layout (`main-content.tsx`)

Three-panel resizable layout (client component):
- **Left (35%):** `ChatInterface` (messages + input)
- **Right (65%):** togglable between `PreviewFrame` (live iframe) and a code view split between `FileTree` and `CodeEditor` (Monaco)

### Auth

JWT tokens (7-day expiry) in httpOnly cookies. `src/middleware.ts` protects API routes. Server actions in `src/actions/` handle sign-up/sign-in via bcrypt + `jose`. Anonymous users can use the app freely but their work isn't persisted.

### Database

Prisma with SQLite (`dev.db`). Two models: `User` (email/password) and `Project` (stores `messages` and `data` as JSON strings). The Prisma client is generated to `src/generated/prisma/`. Run `npx prisma generate` after schema changes.

### AI Provider (`lib/provider.ts`)

Returns either an Anthropic provider (`claude-haiku-4-5`) or `MockLanguageModel`. The mock simulates tool calls with static component code — max 4 steps vs 40 for real provider.

### JSX Transform (`lib/transform/jsx-transformer.ts`)

Babel standalone compiles JSX/TSX to JS in the browser. External imports resolve via esm.sh CDN (import map); local virtual files resolve to blob URLs. The preview entry point is searched as `/App.jsx`, `/App.tsx`, `/index.jsx`, etc.

## Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
