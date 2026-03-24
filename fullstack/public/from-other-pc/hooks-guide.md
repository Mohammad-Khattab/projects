# Claude Code Hooks — Complete Reference

**Last updated:** 2026-03-17
**Claude Code version:** 2.1.77
**claude-agent-sdk version:** 0.1.48
**Hook events documented:** 21

> If Claude Code has been updated since the versions above, re-research before relying on this guide.
> Sources: [Official hooks reference](https://code.claude.com/docs/en/hooks) | [Changelog](https://code.claude.com/docs/en/changelog)

> Consolidated guide for nothingitis-server. Read this file first, then dive into individual docs as needed.
>
> Individual docs in this directory:
> - `hooks-system.md` — Full hook system architecture, all 21 events, config format
> - `pre-post-tool-hooks.md` — PreToolUse/PostToolUse timing, schemas, tool names
> - `session-lifecycle.md` — SDK message types, process tree, stuck detection
> - `compaction-hooks.md` — PreCompact/PostCompact, compaction event sequence

---

## All 21 Hook Events

### Blocking (can prevent/modify the action)

| Event | Fires When | Can Modify? |
|-------|-----------|-------------|
| `UserPromptSubmit` | User submits a prompt | Block prompt, inject context |
| `PreToolUse` | Before any tool executes | Block tool, modify input via `updatedInput` |
| `PermissionRequest` | Permission dialog appears | Auto-allow or deny |
| `Stop` | Claude finishes responding | Re-activate Claude (prevent stop) |
| `SubagentStop` | Subagent finishes | Prevent stop |
| `TeammateIdle` | Agent team teammate idle | Force continue |
| `TaskCompleted` | Task marked complete | Prevent completion |
| `ConfigChange` | Config file changes | Block change |
| `WorktreeCreate` | Worktree creation | Block creation |
| `Elicitation` | MCP server requests user input | Block/modify |
| `ElicitationResult` | User responds to elicitation | Block response |

### Non-Blocking (observation/side effects only)

| Event | Fires When | Key Data |
|-------|-----------|----------|
| `SessionStart` | Session begins/resumes | `source`: startup, resume, clear, compact |
| `PostToolUse` | After tool succeeds | `tool_response` with full output |
| `PostToolUseFailure` | After tool fails | `error` message, `is_interrupt` |
| `PreCompact` | Before compaction | `trigger`: manual/auto. stdout -> compaction context |
| `PostCompact` | After compaction completes | `compact_summary`, `trigger` (v2.1.76+) |
| `Notification` | Claude sends notification | `notification_type`, `message` |
| `SubagentStart` | Subagent spawned | `agent_id`, `agent_type` |
| `SessionEnd` | Session terminates | `reason`: clear, logout, etc. |
| `InstructionsLoaded` | CLAUDE.md/rules loaded | `file_path`, `memory_type`, `load_reason` |
| `WorktreeRemove` | Worktree removed | |

---

## Common Input Schema (all events receive this)

```json
{
  "session_id": "abc123",
  "transcript_path": "/home/nothingitis/.claude/projects/.../session.jsonl",
  "cwd": "/home/nothingitis/pai",
  "permission_mode": "bypassPermissions",
  "hook_event_name": "PreToolUse",
  "agent_id": "optional — only inside subagents",
  "agent_type": "optional — only inside subagents"
}
```

`session_id` is Claude Code's internal opaque ID (NOT our `YYYY-MM-DD-HHMM-XXXXXXXX` task session ID).

---

## Event-Specific Input Fields

| Event | Extra Fields |
|-------|-------------|
| `UserPromptSubmit` | `prompt` |
| `PreToolUse` | `tool_name`, `tool_input`, `tool_use_id` |
| `PostToolUse` | `tool_name`, `tool_input`, `tool_response`, `tool_use_id` |
| `PostToolUseFailure` | `tool_name`, `tool_input`, `tool_use_id`, `error`, `is_interrupt` |
| `PreCompact` | `trigger` (manual/auto), `custom_instructions` |
| `PostCompact` | `trigger`, `compact_summary` |
| `SessionStart` | `source` (startup/resume/clear/compact), `model` |
| `SessionEnd` | `reason` |
| `Stop` | `stop_hook_active`, `last_assistant_message` |
| `SubagentStart` | `agent_id`, `agent_type` |
| `SubagentStop` | `agent_id`, `agent_type`, `agent_transcript_path`, `stop_hook_active`, `last_assistant_message` |
| `Notification` | `notification_type`, `message`, `title` |
| `InstructionsLoaded` | `file_path`, `memory_type`, `load_reason`, `globs`, `trigger_file_path` |

---

## Hook Output (stdout JSON)

### PreToolUse — modify tool input or block
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": { "session_id": "injected-value" }
  }
}
```

### Stop — re-activate Claude
```json
{ "decision": "block", "reason": "Not done yet, continue working" }
```

### PostToolUse — inject context (tool already ran)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Warning: tests failed, fix before continuing"
  }
}
```

### PreCompact — text injected into compaction summary
Plain text stdout (not JSON) is injected into the compaction context. Claude reads it when writing the summary.

### Exit codes
| Code | Effect |
|------|--------|
| 0 | Success — parse stdout for decisions |
| 2 | Block action, send stderr to Claude |
| Other | Non-blocking error, continue |

---

## Tool Name Reference

### Built-in tools
`Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Agent`, `WebFetch`, `WebSearch`, `TaskCreate`, `TaskUpdate`

### MCP tools
Pattern: `mcp__<server-key>__<tool-name>` (server key from mcpServers config)

Examples: `mcp__task-manager__task_create`, `mcp__navex-phone__phone_status`

---

## Critical Timing Facts

1. **PreToolUse fires BEFORE the tool runs.** PostToolUse fires ONLY AFTER the tool completes. A 60s Bash command: PreToolUse at 0s, PostToolUse at 60s+.

2. **Stop fires AFTER all PostToolUse events** for the entire turn. It means Claude's full response is done.

3. **PostCompact fires AFTER compaction completes, BEFORE SessionStart(source=compact).** This is the correct signal for "compaction is done."

4. **Compaction event sequence:**
   ```
   [PreCompact] -> compaction runs (2-10s) -> [PostCompact] -> [SessionStart source=compact]
   ```
   `session_id` stays the same through the entire sequence.

5. **Agent tool PostToolUse fires LATE** — only when the entire subagent finishes. A 5-minute subagent = PostToolUse at 5 min.

6. **Parallel tool calls** each get independent Pre/PostToolUse pairs. Use `tool_use_id` to correlate.

7. **All matching hooks for one event fire in parallel** (concurrent, not sequential).

---

## Configuration (settings.json)

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "regex_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/script.sh",
            "timeout": 5,
            "async": false
          }
        ]
      }
    ]
  }
}
```

### Matcher — what it matches per event type
| Events | Matcher Target |
|--------|---------------|
| Pre/PostToolUse, PostToolUseFailure, PermissionRequest | tool_name |
| SessionStart | source value |
| SessionEnd | reason |
| Notification | notification_type |
| SubagentStart/Stop | agent_type |
| PreCompact/PostCompact | trigger |
| ConfigChange | config source |

No matcher = matches ALL events of that type.

### Hook handler types
| Type | Field | Use |
|------|-------|-----|
| `command` | `command` | Shell scripts (primary) |
| `http` | `url` | Local HTTP endpoints |
| `prompt` | `prompt` | Claude-evaluated (no tool access) |
| `agent` | `prompt` | Subagent with tool access |

### Timeouts
| Type | Default |
|------|---------|
| command | 600s (10 min) |
| http | 30s |
| prompt | 30s |
| agent | 60s |
| SessionEnd (all) | 1.5s |

---

## Session Lifecycle (SDK)

### Message types from receive_messages()
| Message | When | Key Fields |
|---------|------|-----------|
| `SystemMessage(subtype="init")` | Session start | metadata |
| `AssistantMessage` | Claude generating | `content` blocks (Text, ToolUse) |
| `ResultMessage` | Turn complete | `session_id`, `duration_ms`, `total_cost_usd`, `subtype` |
| `SystemMessage(subtype="compact")` | Compaction starting | |

### ResultMessage subtypes
`success`, `error_max_turns`, `error_max_budget_usd`, `error_during_execution`, `error_max_structured_output_retries`

### Process tree
```
python3 daemon.py
  └── claude (ELF binary, ~18 threads)
      ├── MCP server 1 (stdio)
      ├── MCP server 2 (stdio)
      └── ... (one child per MCP server)
```

Process state is ALWAYS `S (sleeping)` — useless for activity detection.

### Stuck detection
- Inflight message age > 10 min with no ResultMessage = stuck
- `/tmp/claude-last-active-{task-session-id}` — Unix timestamp updated by PostToolUse hook. If stale for 2+ min while inflight > 0, likely stuck.
- JSONL file mtime — stops advancing when idle

---

## Environment Variables in Hooks

| Variable | Available In | Purpose |
|----------|-------------|---------|
| `CLAUDE_PROJECT_DIR` | All hooks | Project root |
| `CLAUDE_ENV_FILE` | SessionStart only | Append `export VAR=val` for Bash tool env |
| `CLAUDE_CODE_REMOTE` | All hooks | `"true"` in web environments |
| Standard shell env | All hooks | HOME, USER, PATH inherited |

---

## Gotchas

1. **Always `INPUT=$(cat)` first** — stdin is consumed once. Read it immediately.
2. **`updatedInput` requires `permissionDecision: "allow"`** — silently ignored without it.
3. **`agent_id`/`agent_type` only present inside subagents** — use `jq -r '.agent_id // empty'`.
4. **MCP tool names use the mcpServers KEY** — rename the key and all matchers break.
5. **PostToolUse can't undo the tool** — `decision: "block"` just gives Claude feedback.
6. **PreCompact stdout -> compaction context. PostCompact stdout -> NOT injected.**
7. **SessionStart(source=compact) stdout -> NOT injected** (known bug).
8. **Parallel PostToolUse hooks can race** on shared files — use atomic writes.
9. **PostCompact requires CLI v2.1.76+** — we have 2.1.77 (confirmed).
10. **`compact_complete` SystemMessage subtype is unreliable/undocumented** — use PostCompact hook instead.
11. **SessionEnd timeout is only 1.5s** — keep cleanup hooks fast.
