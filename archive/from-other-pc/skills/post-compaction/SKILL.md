---
name: post-compaction
description: Recover full context after compaction. Reloads task list and instructions.
user-invocable: true
---

# Post-Compaction Recovery

Context was just compacted. Your built-in todo list was cleared by pre-compaction. The MCP task manager is the **sole source of truth** — rebuild the built-in list from it.

## Step 1: Re-read CLAUDE.md

Re-read `~/.claude/CLAUDE.md` to restore full instructions. Do not rely on compressed summaries.

## Step 2: Task List Recovery (MANDATORY)

1. Call `mcp__task-manager__task_list()` to get all active tasks (pending, in_progress, blocked)
2. For each task returned, call the **built-in** `TaskCreate` with the same subject and description — this restores the visual spinner list in the terminal
3. Then call the **built-in** `TaskUpdate` to set the correct status (`in_progress`, `pending`, etc.)
4. The MCP tasks already exist and survived compaction — you are ONLY rebuilding the built-in visual list from them. **Never** call `mcp__task-manager__task_create` here — that would duplicate tasks.
5. If the MCP task list is empty or errored, check the PreCompact handoff summary for task state

**Do this silently** — no need to announce each task restoration. Just restore them and move on to what the user asked for.

## Step 3: Resume Work

Check the compaction summary (if present) and the restored task list to understand where you left off. Continue working.
