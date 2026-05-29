# Agent Instructions for playground-macos

## Project Shape
- This is a React + TypeScript + Vite portfolio that simulates the macOS UI.
- Main entry points are [src/index.tsx](src/index.tsx), [src/pages/](src/pages/), [src/components/](src/components/), [src/stores/](src/stores/), [src/configs/](src/configs/), and [src/styles/](src/styles/).
- Keep changes consistent with the existing app-shell, window, menu, dock, and app component structure.

## Environment
- Use the Node version pinned in [.nvmrc](.nvmrc) via `fnm`.
- Use `corepack` and the repo's pinned `pnpm` version from `package.json`.
- Do not introduce a different package manager or Node target unless the task explicitly requires it.

## Common Commands
- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Build production bundle: `pnpm build`
- Lint: `pnpm lint`

## Working Rules
- Prefer small, local changes over broad refactors.
- Follow existing component and store patterns instead of introducing new architectural layers.
- Keep UI changes aligned with the current macOS-inspired visual language unless the user asks for a redesign.
- Update the README when setup or usage behavior changes.

## Good Places To Check
- Setup and usage details: [README.md](README.md)
- Package scripts and tool versions: [package.json](package.json)
- Styles and visual system: [src/styles/](src/styles/)
- App configuration data: [src/configs/](src/configs/)
