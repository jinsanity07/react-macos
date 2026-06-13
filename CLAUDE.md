# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A React + TypeScript portfolio site styled to look like macOS (login screen, boot animation, desktop, top menu bar, dock, launchpad, Spotlight, and per-app windows). No backend; the "apps" are React components rendering static/dynamic content. See `README.md` for the user-facing description. Live at https://portfolio.zxh.me.

The parent `~/apps/CLAUDE.md` covers cross-project layout. Stay inside this directory — the workspace root is not a git repo.

## Architecture in one sentence

`src/index.tsx` boots the app into one of three pages (`Boot` → `Login` → `Desktop`) → `Desktop` reads from a single Zustand store (`src/stores/index.ts`) composed of three slices (`dock`, `system`, `user`) → components in `src/components/{dock,menus,apps}` and `src/pages/` render from store state and configs in `src/configs/`.

## Stack & conventions

- **React 18 + Vite + TypeScript (strict)**, no router. Page transitions are conditional renders in `App()`.
- **State: Zustand slice pattern.** Each slice is a `create…Slice` factory combined in `src/stores/index.ts`; types are `DockSlice` & `SystemSlice` & `UserSlice`. Components consume `useStore` directly.
- **UnoCSS** for utility classes (preset in `unocss.config.ts`); **`unplugin-auto-import`** auto-imports React hooks + `src/hooks/**` + `src/stores/**` + `src/components/**` — no need to import `useState` etc. The generated types live in `src/auto-imports.d.ts` (do not hand-edit).
- **Path alias `~/*` → `src/*`** is configured in both `vite.config.ts` and `tsconfig.json`. Always import via `~/...` for in-repo modules.
- **Configs are typed.** `src/configs/*.tsx` and `*.ts` export the data for each app (Bear notebooks, Terminal commands, Launchpad apps, Music playlist, wallpapers, websites, user profile); the matching `src/types/configs/*.d.ts` declares the shapes — keep them in sync when adding an app.
- **Window chrome** lives in `src/components/AppWindow.tsx` (drag/resize via `react-rnd`, min/max/close traffic lights, z-order). All app windows wrap their content in this.
- **Hooks** in `src/hooks/`: `useWindowSize`, `useAudio`, `useBattery` (Battery API → 100% on unsupported browsers, per the README), `useInterval`, `useClickOutside`.
- **Markdown rendering** for Bear/Typora uses `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-external-links`. The `react-syntax-highlighter` is used by VS Code.
- **Deploy target** is GitHub Pages (CNAME `portfolio.zxh.me`) via `peaceiris/actions-gh-pages@v3`, triggered on push to `main` (`.github/workflows/deploy.yaml`).
- **Husky** runs `pnpm lint-staged` on pre-commit (eslint --fix on `*.{js,ts,tsx}`, `sort-package-json` on `package.json`).

## Commands

```bash
# All commands run from this directory. pnpm@9 is the package manager (see packageManager field).
pnpm install --frozen-lockfile          # CI install
pnpm dev                                # vite dev server with --host
pnpm build                              # production build to dist/
pnpm serve                              # vite preview --host
pnpm lint                               # eslint .
```

There is **no test suite** — the project doesn't ship unit tests; CI is build + deploy only. `package.json` has no `test` script.
