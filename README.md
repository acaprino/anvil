<p align="center">
  <img src="app/public/icon.png" width="120" alt="Anvil">
</p>

<h1 align="center">Anvil</h1>

<p align="center">
  <strong>Manage Claude Code Agent SDK sessions in a tabbed interface</strong><br>
  <sub>Pick a project. Pick a model. Hit Enter. Code.</sub>
</p>

<p align="center">
  <a href="https://github.com/acaprino/anvil/stargazers"><img src="https://img.shields.io/github/stars/acaprino/anvil?style=flat-square" alt="Stars"></a>
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" alt="Platform">
  <img src="https://img.shields.io/badge/tauri-v2-24C8D8?style=flat-square&logo=tauri" alt="Tauri 2">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

<!-- TODO: Add hero screenshot here once captured
<p align="center">
  <img src="docs/screenshots/hero.png" width="800" alt="Anvil - tabbed interface with project picker">
</p>
-->

---

## Table of Contents

- [What is Anvil?](#what-is-anvil)
- [Getting Started](#getting-started)
- [Features](#features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Configuration](#configuration)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## What is Anvil?

**Pick a project. Pick a model. Hit Enter. Code.**

Anvil is a native Windows desktop app for launching and managing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) Agent SDK sessions in a tabbed interface. It scans your project directories, lets you configure model, effort, and permission settings per session, and keeps your tabs alive across restarts.

### Why not just run `claude` in a terminal?

You can. But if you work across multiple projects, you end up juggling terminal windows, retyping paths, and losing context when you close them.

Anvil fixes that:

- **Instant project switching** &mdash; All your project directories are scanned and listed. Type to filter, press Enter to launch. No `cd`, no path typing.
- **Persistent tabs** &mdash; Close Anvil, reopen it tomorrow. Your sessions and tabs are exactly where you left them.
- **Keyboard-first** &mdash; Every action has a shortcut. Model selection, effort levels, permission modes &mdash; all without touching the mouse.
- **Dual view** &mdash; Switch between a rich markdown chat view and a compact terminal-style view without losing your session.

---

## Getting Started

### Prerequisites

- **Windows 11** (or Windows 10 with WebView2)
- **Rust** toolchain (via [rustup](https://rustup.rs/))
- **Node.js** 18+ and npm
- **Claude Code** (`npm i -g @anthropic-ai/claude-code`)

### Build &amp; Run

```bash
# Clone the repository
git clone https://github.com/acaprino/anvil.git
cd anvil/app

# Install frontend dependencies
npm install

# Run in development mode (hot-reload)
cargo tauri dev

# Production build (with LTO + strip)
cargo tauri build
```

The release binary is optimized with LTO, single codegen unit, `opt-level = 3`, and symbol stripping for minimal binary size.

---

## Features

### Multi-Tab Interface
- Run multiple concurrent AI coding sessions side by side
- See which tabs have new output without switching to them
- Exit codes display when sessions complete
- Custom window chrome &mdash; no standard title bar

### Dual-View Architecture
- **Chat view** &mdash; Rich markdown rendering with react-markdown, syntax highlighting, collapsible tool cards, and interactive permission prompts
- **Terminal view** &mdash; Compact monospace layout for fast scanning of agent output
- Switch between views without losing your session

### Project Discovery &amp; Management
- Directories are scanned automatically &mdash; your projects appear instantly
- See which branch each project is on and whether it has uncommitted changes
- Spot which projects have a CLAUDE.md at a glance
- Add custom labels to organize projects your way
- Sort by name, last used, or most used
- Type to filter &mdash; real-time search across all projects
- Create new projects or quick-launch any directory (F10)

### AI Tool Integration

**Supported Claude models:**

| Model | ID | Context |
|-------|-----|---------|
| Sonnet | `claude-sonnet-4-6` | Standard |
| Opus | `claude-opus-4-6` | Standard |
| Haiku | `claude-haiku-4-5` | Standard |
| Sonnet 1M | `claude-sonnet-4-6[1m]` | Extended |
| Opus 1M | `claude-opus-4-6[1m]` | Extended |

**Permission modes:**

| Mode | Description |
|------|-------------|
| Plan | Agent can only read and analyze |
| Accept edits | Auto-accepts file edits, prompts for other tools |
| Skip all | Bypasses all permission prompts |

### Themes

14+ themes loaded from JSON files, including dark, light, and retro variants. Switchable via Ctrl+, settings. Themes apply to the entire UI &mdash; window chrome, tabs, project list, chat, and terminal views.

<details>
<summary>View included themes</summary>

Cyberpunk 2077, DaisyUI Retro, Dracula, Gandalf, Kanagawa, Light Arctic, Light Paper, Light Sakura, Light Solarized, Lofi, Matrix, Nord, Synthwave, Tokyo Night

Custom themes can be added by placing a JSON file in `data/themes/`.

</details>

### Session Management
- Sessions persist across app restarts &mdash; pick up where you left off
- Resume or fork past sessions from the session panel (Ctrl+Shift+S)
- Browse all past sessions in the session browser (Ctrl+Shift+H)
- Dead sessions are cleaned up automatically, no orphaned processes eating memory
- Win32 Job Objects guarantee clean process termination, even on crashes

### Agent Features
- Slash commands (`/`) and @agent mentions with autocomplete
- File attachments and image paste (Ctrl+V)
- Subagent task tracking with progress notifications
- Interrupt running agents (Ctrl+C)
- Live model and permission mode switching mid-session
- System prompts with YAML frontmatter

---

## Keyboard Shortcuts

Anvil is keyboard-first. Every feature is reachable without a mouse.

| Action | Key |
|--------|-----|
| New tab | `Ctrl+T` |
| Close tab | `Ctrl+F4` |
| Launch project | `Enter` |
| Filter projects | Just type |
| Cycle permission mode | `Tab` |
| Settings | `Ctrl+,` |

<details>
<summary>View all shortcuts</summary>

### Navigation
| Key | Action |
|-----|--------|
| `Ctrl+T` | New tab |
| `Ctrl+F4` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+1-9` | Switch to tab by number |
| `F1` | Toggle keyboard shortcuts |
| `F12` | Toggle About page |
| `Ctrl+U` | Toggle Usage page |
| `Ctrl+Shift+P` | Toggle System Prompts |
| `Ctrl+Shift+H` | Toggle Sessions browser |
| `Ctrl+Shift+S` | Toggle Session panel |

### Settings (New Tab Page)
| Key | Action |
|-----|--------|
| `Tab` | Cycle permission mode (plan / accept edits / skip all) |
| `F2` | Cycle effort level |
| `F3` | Cycle sort order |
| `F4` | Cycle model |

### Actions
| Key | Action |
|-----|--------|
| `F5` | Create new project |
| `F6` | Open project in Explorer |
| `F8` | Label selected project |
| `F10` | Quick launch (any directory) |
| `Ctrl+,` | Open settings |
| `Enter` | Launch selected project |

### Project List Navigation
| Key | Action |
|-----|--------|
| Arrow keys | Navigate projects |
| `Page Up` / `Page Down` | Jump 10 items |
| `Home` / `End` | First / last project |
| Type anything | Filter projects |
| `Backspace` | Delete filter character |
| `Esc` | Clear filter / close tab |

### Agent Tab
| Key | Action |
|-----|--------|
| `Ctrl+C` | Copy selection or interrupt agent |
| `Ctrl+V` | Paste (text or image) |

</details>

---

## Configuration

Settings are persisted automatically to disk via the Rust backend.

| Setting | Default | Description |
|---------|---------|-------------|
| Model | Sonnet | Claude model variant |
| Effort | High | Reasoning effort level |
| Permission mode | Plan | Tool permission behavior |
| Sort | Alpha | Project sort order |
| Theme | Dracula | UI theme |
| Font | Cascadia Code, 14px | Terminal font |
| View style | Chat | Chat or terminal view |
| Project dirs | `D:\Projects` | Directories to scan |

---

## Tech Stack

<details>
<summary>Architecture overview</summary>

```
+---------------------------------------------+
|  Frontend                                   |
|  React 19 . TypeScript 5.7 . Vite 6        |
|  react-markdown . @tanstack/react-virtual   |
+---------------------------------------------+
|  IPC Layer                                  |
|  Tauri 2 Commands . Tauri Channels          |
+---------------------------------------------+
|  Backend                                    |
|  Rust 2021 . Tokio . Win32 APIs             |
|  Sidecar Management . JSON-lines Bridge     |
|  Project Scanner . Settings Persistence     |
+---------------------------------------------+
|  Sidecar                                    |
|  Node.js . @anthropic-ai/claude-agent-sdk   |
+---------------------------------------------+
```

### Frontend (`app/src/`)
| Module | Purpose |
|--------|---------|
| `App.tsx` | Tab orchestration, global shortcuts, resize handles |
| `AgentView.tsx` | View switcher (ChatView/TerminalView), owns session controller |
| `ChatView.tsx` | Rich markdown chat view with virtual scrolling |
| `TerminalView.tsx` | Compact monospace terminal view |
| `NewTabPage.tsx` | Project picker, settings, modals |
| `TabBar.tsx` | Custom tabs, window controls, output indicators |
| `useTabManager` | Tab lifecycle, session save/restore |
| `useProjects` | Project scanning, filtering, sorting |
| `useSessionController` | Session lifecycle, streaming, permissions, task tracking |
| `useAgentSession` | Agent SDK IPC wrappers |

### Backend (`app/src-tauri/src/`)
| Module | Purpose |
|--------|---------|
| `main.rs` | App init, Tauri setup, panic handler |
| `commands.rs` | IPC command handlers |
| `sidecar.rs` | Node.js sidecar lifecycle and JSON-lines bridge |
| `projects.rs` | Project scanning, settings, usage persistence |
| `themes.rs` | Theme loading from JSON files |
| `prompts.rs` | System prompt file CRUD |
| `usage_stats.rs` | Token usage statistics |
| `logging.rs` | File-based logging |

### Architecture Highlights

**Performance**
- Virtual scrolling via @tanstack/react-virtual for long conversations
- Streaming text stored in refs with tick counters -- avoids state churn on every chunk
- React.memo on all components -- surgical re-renders only
- Tool grouping collapses consecutive tool calls into collapsible sections

**Reliability**
- Win32 Job Objects -- child processes always cleaned up, even on crashes
- Sidecar auto-restart on failure
- Panic logging -- Rust panics caught and logged to file
- Error boundaries -- component crashes don't take down the app

**Security**
- CSP enforced -- `default-src 'self'; style-src 'self' 'unsafe-inline'`
- Input sanitization for user text
- No remote content -- fully local application, no external network calls

### Project Structure

```
anvil/
+-- app/
|   +-- src/
|   |   +-- components/       # React components
|   |   |   +-- chat/         # Chat view subcomponents
|   |   |   +-- terminal/     # Terminal view subcomponents
|   |   |   +-- modals/       # Modal dialogs
|   |   +-- contexts/         # React contexts
|   |   +-- hooks/            # Custom hooks
|   |   +-- utils/            # Utility functions
|   |   +-- App.tsx           # Root component
|   |   +-- App.css           # Design tokens + global styles
|   |   +-- themes.ts         # Theme application
|   |   +-- types.ts          # TypeScript definitions
|   +-- src-tauri/
|   |   +-- src/
|   |   |   +-- main.rs       # Tauri setup
|   |   |   +-- commands.rs   # IPC handlers
|   |   |   +-- sidecar.rs    # Sidecar management
|   |   |   +-- projects.rs   # Project scanning
|   |   |   +-- themes.rs     # Theme loading
|   |   |   +-- prompts.rs    # System prompts
|   |   |   +-- logging.rs    # File logging
|   |   +-- data/
|   |   |   +-- themes/       # Theme JSON files
|   |   |   +-- prompts/      # System prompt .md files
|   |   +-- Cargo.toml
|   |   +-- tauri.conf.json
|   +-- package.json
|   +-- vite.config.ts
+-- sidecar/
|   +-- sidecar.js            # Node.js Agent SDK bridge
|   +-- package.json
+-- docs/TECHNICAL.md          # Detailed technical docs
+-- CLAUDE.md                  # Project instructions
+-- README.md
```

</details>

---

## Contributing

Contributions are welcome. Please [open an issue](https://github.com/acaprino/anvil/issues) first to discuss what you'd like to change.

For detailed architecture and development guide, see [`docs/TECHNICAL.md`](docs/TECHNICAL.md).

---

## License

[MIT](LICENSE)

---

<p align="center">
  <sub>Windows native, keyboard-first. Built with Tauri 2, React 19, and Rust.</sub><br>
  <sub>Anvil &mdash; where code meets the hammer.</sub>
</p>
