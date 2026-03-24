---
name: pre-compaction
description: Emergency stop before context compaction. Saves all state to task manager, produces handoff summary.
user-invocable: true
---

# Pre-Compaction Emergency Stop

STOP. Do not finish your current tool call. Do not make one more edit. Do not complete "just one more thing." STOP RIGHT NOW.

Context is about to compact. You have ONE job: save your state and produce a handoff summary.

## Step 1: Produce Handoff Summary

Write a summary for your post-compaction self. Include:

- **Active tasks**: task IDs + one-line status each
- **What's done this session**: bullet list of completed work
- **What's in progress**: exactly where you left off, which files, what's left
- **Key context**: decisions made, gotchas, anything not in the task descriptions
- **Files modified this session**: list them so post-compaction self knows what changed

## Step 2: Save State to MCP Task Manager

1. Call `mcp__task-manager__task_list()` to see all active tasks
2. For every `in_progress` task, call `mcp__task-manager__task_update()` with a description capturing:
   - What's already done
   - What's left to do
   - Any context that would be lost (file paths, decisions made, gotchas discovered)
3. For any work you're doing that ISN'T tracked as a task yet, create it now with `mcp__task-manager__task_create()` and set status to `in_progress` with full context in the description

## Step 3: Clear the Built-In Todo List

Delete all built-in `TaskCreate` entries so they don't carry stale/duplicate state across compaction. The MCP task manager has the authoritative data — the built-in list will be rebuilt from it in post-compaction.

For each existing built-in task, call `TaskUpdate` with `status: "deleted"`.

## CRITICAL RULES

- **Do NOT recreate MCP tasks after compaction.** MCP `task_create` tasks survive compaction. Recreating them DUPLICATES tasks. After compaction, just call `mcp__task-manager__task_list()` to see what exists. The built-in task list is cleared in Step 3 above — post-compaction restores it from MCP data.
- **Do NOT continue working.** No "let me just finish this one edit." STOP.
- **Do NOT read files or explore code.** State capture only.
