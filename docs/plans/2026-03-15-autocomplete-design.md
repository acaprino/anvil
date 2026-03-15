# Intelligent Autocomplete System — Design Spec

**Date**: 2026-03-15
**Status**: Approved
**Scope**: Agent mode terminal input only

## Overview

An intelligent autocomplete system for Anvil's agent mode that provides ghost text suggestions as users type messages to Claude/Gemini. Combines instant file path completions (via Rust backend) with context-aware LLM suggestions (via Haiku). Tab cycles through alternatives, Right Arrow accepts.

## Architecture

```
+-------------------------------------+
|  Ghost Text Renderer (xterm ANSI)   |  Renders dimmed suggestion text at cursor
+-------------------------------------+
|  Suggestion Manager (React hook)    |  Manages suggestion list, cycling, debounce
+-------------------------------------+
|  Provider Pipeline                  |  File paths (Rust) + LLM (Haiku) + Cache
+-------------------------------------+
|  Settings Integration               |  Enable/disable toggle in SettingsModal
+-------------------------------------+
```

### Data Flow

1. User types in agent mode -> input buffer updates -> debounce timer starts (300ms)
2. After 300ms idle -> Suggestion Manager queries providers in parallel
3. File path provider (instant): Rust command scans project dir for matches
4. Cache provider (instant): checks for cached LLM suggestions for similar prefix
5. LLM provider (async): sends partial input + recent context to Haiku
6. Results merge into a ranked suggestion list (file paths first, then LLM)
7. Ghost text renderer writes top suggestion as dimmed ANSI text after cursor
8. Tab cycles `suggestionIndex`, updating ghost text
9. Right Arrow / Enter accepts -> suggestion text appended to input buffer
10. Any other key -> ghost text erased, normal typing continues

## Ghost Text Rendering

Since xterm.js is canvas-based, ghost text is rendered using ANSI escape codes:

1. **Save cursor position** before rendering
2. **Write dimmed ANSI text**: `\x1b[2;3;90m` (dim + italic + grey) + suggestion + `\x1b[0m` (reset)
3. **Restore cursor** to original position with `\x1b[u` or calculated `\x1b[<n>D`
4. **On next keystroke**: erase ghost text by overwriting with spaces, restore cursor

### Cycling Behavior

- `suggestions: string[]` array with `currentIdx: number`
- Tab increments `currentIdx % suggestions.length`
- Each cycle: erase previous ghost -> write new ghost
- Visual indicator: dim `(1/3)` appended to ghost text showing position in list

### Accept / Dismiss

| Key | Action |
|-----|--------|
| **Tab** | Cycle to next suggestion |
| **Right Arrow** | Accept current suggestion, append to input buffer |
| **Enter** | Accept current suggestion, append to input buffer |
| **Esc** | Dismiss all suggestions |
| **Any other key** | Dismiss ghost text, continue typing, restart debounce |

### Edge Cases

- Multi-line suggestions: show only first line as ghost, full text on accept
- Empty input: do not trigger autocomplete
- Minimum 3 characters before triggering LLM provider
- File path provider triggers on 1+ characters (instant, no cost)

## Provider Pipeline

### 1. File Path Provider (Rust Backend)

New Tauri command:

```rust
#[tauri::command]
pub fn autocomplete_files(cwd: String, prefix: String) -> Result<Vec<String>, String>
```

- Walks project directory, matches partial paths
- Detects path context: input contains `/` or `\` or starts with known dirs (`src/`, `app/`, etc.)
- Returns up to 5 matches, sorted by relevance (exact prefix > fuzzy)
- Ignores: `.git`, `node_modules`, `target`, hidden directories
- New file: `app/src-tauri/src/autocomplete.rs`
- **Latency**: <5ms

### 2. LLM Provider (Sidecar -> Haiku)

New sidecar command:

```json
{ "cmd": "autocomplete", "tabId": "...", "input": "partial text", "context": [...] }
```

- Uses `@anthropic-ai/sdk` directly (transitive dependency of agent SDK, already installed)
- Makes a non-streaming `messages.create()` call to `claude-haiku-4-5-20251001`
- `max_tokens: 150`
- Context: last 2-3 messages from the session, trimmed to ~500 tokens
- System prompt: "You are an autocomplete engine. Given the user's partial input and recent conversation, suggest 3 short completions. Return a JSON array of strings. Be concise."
- Returns: `{ evt: "autocomplete", tabId, suggestions: string[] }`
- **Latency**: ~200-400ms

### 3. Cache Layer

- In-memory `Map<string, { suggestions: string[], timestamp: number }>`
- Key: first 10 characters of input (normalized, lowercase)
- TTL: 30 seconds
- On cache hit, skip LLM call entirely
- Cache lives in the `useAutocomplete` hook (frontend-side)

### Result Merging

- File path matches arrive instantly -> shown as ghost text immediately
- LLM suggestions arrive async -> appended to suggestion list when ready
- File paths always come first in cycle order
- If no file paths match, ghost text waits for LLM with dim `...` loading indicator

## Integration Points

### Terminal.tsx (Agent Mode Only)

1. **Tab interception** in `attachCustomKeyEventHandler()`: when agent state is `awaiting_input` and suggestions exist, cycle instead of passing to xterm
2. **Right Arrow interception**: when ghost text is showing, accept suggestion
3. **Input buffer listener**: on each character added to `agentInputBufRef`, reset debounce timer

### New Hook: useAutocomplete

```typescript
// app/src/hooks/useAutocomplete.ts
function useAutocomplete(
  xtermRef: React.RefObject<Terminal>,
  sessionRef: React.RefObject<string>,
  inputBufRef: React.RefObject<string>,
  settings: Settings
): {
  suggestions: string[];
  currentIdx: number;
  isLoading: boolean;
  accept: () => string;    // Returns accepted text
  cycle: () => void;       // Tab pressed
  dismiss: () => void;     // Esc or typing
  onInputChange: () => void; // Reset debounce
}
```

Encapsulates all autocomplete logic. When `settings.autocomplete_enabled` is false, all methods are no-ops.

### Tab Key Conflict Resolution

- **NewTabPage**: Tab cycles models — no conflict (autocomplete is agent-mode only)
- **PTY mode**: Tab passes to CLI's own completion — no conflict (autocomplete is agent-mode only)
- **Agent mode**: Tab is currently unused — no conflict

### Settings

New field in `Settings` interface:

```typescript
autocomplete_enabled: boolean;  // default: true
```

Toggle in `SettingsModal.tsx` under a new "Autocomplete" section. Simple on/off switch.

## New Files

| File | Purpose |
|------|---------|
| `app/src/hooks/useAutocomplete.ts` | Main autocomplete hook |
| `app/src-tauri/src/autocomplete.rs` | File path provider (Rust) |

## Modified Files

| File | Change |
|------|--------|
| `app/src/components/Terminal.tsx` | Hook integration, key interception |
| `app/src/types.ts` | `autocomplete_enabled` in Settings |
| `app/src/components/modals/SettingsModal.tsx` | Toggle UI |
| `sidecar/sidecar.js` | New `autocomplete` command handler |
| `app/src-tauri/src/main.rs` | Register `autocomplete_files` command |
| `app/src-tauri/src/lib.rs` or equivalent | Module declaration |

## Not Changed

- PTY mode behavior
- NewTabPage / project filtering
- Existing keyboard shortcuts
- Agent SDK session flow
- Gemini CLI integration

## Configuration Summary

| Parameter | Value |
|-----------|-------|
| Debounce delay | 300ms idle |
| Min chars (file paths) | 1 |
| Min chars (LLM) | 3 |
| Max suggestions | 5 file paths + 3 LLM = 8 total |
| LLM model | claude-haiku-4-5-20251001 |
| LLM max_tokens | 150 |
| Cache TTL | 30 seconds |
| Cache key length | 10 chars |
| Ghost text style | Dim + italic + grey (SGR 2;3;90) |
| Loading indicator | Dim `...` after cursor |
| Cycle indicator | Dim `(1/3)` appended to ghost text |
