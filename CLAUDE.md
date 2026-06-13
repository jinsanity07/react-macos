# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A React + TypeScript portfolio site styled to look like macOS (login screen, boot animation, desktop, top menu bar, dock, launchpad, Spotlight, and per-app windows). No backend; the "apps" are React components rendering static/dynamic content. See `README.md` for the user-facing description. Live at https://portfolio.zxh.me.

The parent `~/apps/CLAUDE.md` covers cross-project layout. Stay inside this directory — the workspace root is not a git repo.

> This is the `jinsanity` branch. The most recent divergence from `origin/main` introduced a live RSS feed in the Bear app, dynamic utility apps, a SanityMenu, and UtilityFrame. See `AGENTS.md` for the full agent guidelines (hotkey practice, embedding caveats, dynamic-utility rules, RSS blogs integration rules).

## Architecture in one sentence

`src/index.tsx` boots the app into one of three pages (`Boot` → `Login` → `Desktop`) → `Desktop` reads from a single Zustand store (`src/stores/index.ts`) composed of three slices (`dock`, `system`, `user`) → components in `src/components/{dock,menus,apps}` and `src/pages/` render from store state and configs in `src/configs/`.

## Stack & conventions

- **React 18 + Vite + TypeScript (strict)**, no router. Page transitions are conditional renders in `App()`.
- **Node** is pinned in `.nvmrc` (use `fnm`); **pnpm** version is pinned in `package.json` (use `corepack`). Do not introduce a different package manager or Node target unless the task explicitly requires it.
- **State: Zustand slice pattern.** Each slice is a `create…Slice` factory combined in `src/stores/index.ts`; types are `DockSlice` & `SystemSlice` & `UserSlice`. Components consume `useStore` directly.
- **UnoCSS** for utility classes (preset in `unocss.config.ts`); **`unplugin-auto-import`** auto-imports React hooks + `src/hooks/**` + `src/stores/**` + `src/components/**` — no need to import `useState` etc. The generated types live in `src/auto-imports.d.ts` (do not hand-edit).
- **Path alias `~/*` → `src/*`** is configured in both `vite.config.ts` and `tsconfig.json`. Always import via `~/...` for in-repo modules.
- **Configs are typed.** `src/configs/*.tsx` and `*.ts` export the data for each app (Bear notebooks, Terminal commands, Launchpad apps, Music playlist, wallpapers, websites, user profile); the matching `src/types/configs/*.d.ts` declares the shapes — keep them in sync when adding an app.
- **Window chrome** lives in `src/components/AppWindow.tsx` (drag/resize via `react-rnd`, min/max/close traffic lights, z-order). All app windows wrap their content in this. Dynamic utility entries reuse the same window lifecycle (focus, z-index, maximize/minimize, close) and live in the shared `window-bound` layer — see `AGENTS.md` for the "window not clickable" debug checklist.
- **Hooks** in `src/hooks/`:
  - `useWindowSize`, `useAudio`, `useBattery` (Battery API → 100% on unsupported browsers, per the README), `useInterval`, `useClickOutside`
  - `useBearBlogs` — fetches the live RSS feed for the Bear app's "Blogs" sidebar entry. Uses `DOMParser`, a cancellation flag, and explicit loading/empty/error placeholders.
  - `useOmkpieUtilities` — fetches dynamic utility metadata for Launchpad + Spotlight + the UtilityFrame app. Keep Launchpad and Spotlight in sync via this single source of truth.
- **Markdown rendering** for Bear uses `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-external-links` (no `rehype-raw` — the RSS feed body is markdown, not HTML). `Typora` uses Milkdown (a ProseMirror-based WYSIWYG). `react-syntax-highlighter` is used by VS Code. The Bear CSS lives in `src/styles/bear.css` (scoped under `.bear .markdown`).
- **Iframe apps** (both dynamic utilities and dock-launched apps) render through the shared `src/components/apps/IframeFrame.tsx` shell. The shell applies a `key={refreshKey}` so the top-bar "Refresh Page" menu item can re-mount the embedded page by bumping the key. Dynamic utility windows are driven by `openUtility(title, src, version?)` in `Desktop`; dock apps set `iframeSrc` (and optional `iframeVersion`) on their `AppsData` entry.
- **SanityMenu** is the new top-bar plugin panel — follow the existing Control Center floating-menu shell pattern (fixed placement, `useClickOutside`, launcher button alongside other status icons; consistent sizing/border/shadow/spacing).
- **UtilityFrame** is the desktop window shell for dynamic utility entries (iframe-rendered remote pages). See `AGENTS.md` for embedding caveats — many sites block framing via `X-Frame-Options`/`CSP`; do not bypass with header-stripping proxies.
- **Deploy target** is GitHub Pages via `.github/workflows/deploy.yaml`, triggered on push to `jinsanity` (not `main`). The workflow clones `jinsanity07/jinsanity07.github.io` to publish.
- **Husky** runs `pnpm lint-staged` on pre-commit (eslint --fix on `*.{js,ts,tsx}`, `sort-package-json` on `package.json`).

## Commands

```bash
# All commands run from this directory. pnpm@9 is the package manager (see packageManager field).
fnm use                          # pick up the Node version pinned in .nvmrc
corepack enable                  # activate the pinned pnpm
pnpm install --frozen-lockfile   # CI install
pnpm dev                         # vite dev server with --host
pnpm build                       # production build to dist/ (and zips docs.zip)
pnpm serve                       # vite preview --host
pnpm lint                        # eslint .
```

There is **no test suite** — the project doesn't ship unit tests; CI is build + deploy only. `package.json` has no `test` script.

## Working rules (cheat sheet — full version in AGENTS.md)

- Prefer small, local changes over broad refactors.
- Follow existing component and store patterns; don't introduce new architectural layers.
- Keep UI changes aligned with the current macOS-inspired visual language unless explicitly asked for a redesign.
- Update `README.md` when setup or usage behavior changes.
- For new top-bar plugin panels, reuse the Control Center floating-menu shell.
- If a feature embeds a remote page, prefer a direct iframe with no extra browser chrome — unless the user asks for navigation controls. Many sites block framing; expose blocked ones as external Launchpad links instead.
- Treat browser hotkeys as in-page shortcuts (capture-phase on `window`); provide a fallback chord and prefer a focused imperative API like `focusSearch()`.
- Multi-user login: only `{ ok: true }` JSON counts as success; require `credentials: "include"` for cross-origin; use the server-returned `username`.
- Dynamic utilities: single source of truth (`useOmkpieUtilities`), namespace ids as `utility-${key}`, dedupe by `id`, prioritize dynamic over static, use functional `setState` updates, keep windowing parity with normal apps.
- Bear RSS blogs: extend `BearMdData` with optional `content`; parse `content:encoded` → `description` → fallback; rewrite relative GitHub raw image paths via `fixImageURL`; provide loading/empty/error placeholders; keep the external link visible.
- Per-app iframe menu: apps that render an iframe (dynamic `LaunchpadData` utilities and dock-launched `AppsData` entries with `iframeSrc`) get a top-bar app menu (Open in New Tab / Refresh / Version). Set `version` on the launchpad entry and `iframeVersion` on the dock entry; otherwise the menu falls back to `v0.0.1`. Refresh works by bumping a `refreshKey` on `<IframeFrame>` so React remounts the iframe.

## Quick verification

```bash
pnpm lint && pnpm build          # static checks
pnpm dev                         # click into Bear → "Blogs" sidebar entry
```

- Profile and Projects must be unchanged after Bear changes.
- Clicking a blog item should render the RSS-derived preview with the "Read Full Article" external link visible.
- Negative test: change `BEAR_BLOG_RSS_URL` to an invalid host and confirm the Blogs placeholder/error item is shown and the app remains stable.
- Per-app iframe menu: open a Launchpad utility (e.g. RA2 Web) and a dock app with `iframeSrc` (e.g. VSCode); the top bar should show the focused app's name with a dropdown containing Open in New Tab / Refresh Page / Version.

## Good places to check

- Agent rules, hotkey practice, embedding caveats, dynamic-utility rules, RSS blogs integration rules: [AGENTS.md](AGENTS.md)
- Setup and usage details: [README.md](README.md)
- Package scripts and tool versions: [package.json](package.json)
- Styles and visual system: [src/styles/](src/styles/)
- App configuration data: [src/configs/](src/configs/)

## Post-task completion automation

After a code-affecting task completes in this repo (`jinsanity` branch) — a bug fix, new feature, refactor, or any non-trivial code change — the agent must automatically run, in order, **before the turn ends**:

1. **Bump the version by one point in `package.json`** (semver patch, e.g. `1.2.4` → `1.2.5`).
2. **Commit all changes** (staged + unstaged, including the version bump) with a descriptive message. End the message with a `Co-Authored-By: Claude <noreply@anthropic.com>` trailer.
3. **Push to `origin/jinsanity`** (the deploy target per `.github/workflows/deploy.yaml`).

A `Stop` hook in `.claude/settings.local.json` injects a reminder into the model's context on every turn end. The hook is **state-gated**: it scans the current turn's transcript for any `Write|Edit|MultiEdit` tool call, and only injects the reminder if one is found. For pure conversation, doc-only replies, or plan-mode work, the hook returns a silent `{"continue":true}` and the turn ends cleanly — no infinite reminder loop. **Skip this for:** doc-only edits, single-comment or single-line changes, pure conversation, plan-mode work, or turns that only inspected code. If unsure whether the task qualifies as "major", ask the user before bumping/pushing.

Manual exceptions (e.g. squash-merge strategy changes, force-push) require explicit user instruction — never force-push `jinsanity` without confirmation, since the GitHub Pages deploy workflow is triggered on push.

