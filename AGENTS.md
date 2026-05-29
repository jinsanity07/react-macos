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
- For new top-bar plugin panels, reuse the existing floating-menu shell pattern from Control Center: fixed placement, `useClickOutside`, and a launcher button positioned alongside the other status icons.
- If the feature embeds a remote page, prefer a direct iframe with no extra browser chrome unless the user explicitly asks for navigation controls.
- Keep plugin panels visually consistent with the existing Control Center sizing, border, shadow, and spacing so they feel native to the app shell.

## Embedding Remote Pages — Caution & Best Practices

- **Caution:** Many external sites intentionally block framing (via `X-Frame-Options` or `Content-Security-Policy`) or require authentication. Do not attempt to bypass those protections with unauthorized proxies or header-stripping — only proceed if you own the target service or have explicit permission.
- **Prefer link behavior when blocked:** If a remote page refuses to load in an iframe (redirects to login or sets `X-Frame-Options: DENY`), expose it as an external link instead of embedding. Use the app registry's `link` entry and place the item in Launchpad rather than the Dock so UX remains clear.
- **If you control the server:** enable embedding safely (Grafana example): set `allow_embedding = true` in `grafana.ini` and, if needed, configure anonymous or token-based access (`[auth.anonymous] enabled = true` for read-only viewers) or use Grafana's signed embed tokens. Also ensure reverse proxies (Cloudflare/nginx) do not inject `X-Frame-Options` headers.
- **Server-side proxy only with permission:** A proxy that authenticates to the target and serves content without frame-blocking headers can work technically, but it carries security and legal risks. Use only for self-hosted services and keep secrets off the client.
- **Alternative UX:** When full embedding isn't possible, consider using panel image renders, snapshots, or opening the dashboard in a new tab/window to preserve functionality without breaking security.
- **UI guideline:** Non-embeddable or external-link apps should not be shown as Dock desktop apps. Prefer placing them in Launchpad or marking them clearly as external links so users understand they open in a browser.

## Good Places To Check
- Setup and usage details: [README.md](README.md)
- Package scripts and tool versions: [package.json](package.json)
- Styles and visual system: [src/styles/](src/styles/)
- App configuration data: [src/configs/](src/configs/)
