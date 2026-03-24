---
name: session-end
description: Wrap up a Claude Code session. Reviews work done, flags critical items, says bye.
user-invocable: true
---

# Session End

The user is leaving. Wrap up the session properly.

## 1. Review What Was Done

Check the task list (`mcp__task-manager__task_list`) and summarize:
- How many tasks completed vs pending vs cancelled
- Key results
- Any blockers hit

If working on a project with a CLAUDE.md, update it with what changed.

## 2. Critical Items Check

Review what happened THIS session. If any of the following exist, tell the user before they leave:

- **Errors encountered** that weren't resolved
- **Operations left half-done** (started but not finished)
- **Things that need follow-up** soon

If nothing critical: say nothing about it. Don't pad with "everything looks good."

## 3. Say Bye

Keep it short. If there were critical items, they come first, then bye. If nothing critical, just bye.
