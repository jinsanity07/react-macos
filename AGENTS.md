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

## Hotkey Practice
- Treat browser hotkeys as in-page shortcuts, not host-level overrides. A global OS shortcut or another app may still win.
- Use capture-phase listeners on `window` when the active page should prioritize a shortcut, and call `preventDefault()` only for the exact chord you own.
- Provide a fallback chord for common conflicts, and prefer a focused imperative API such as `focusSearch()` when a panel is already open.
- Keep hotkeys configurable or easily swappable when they compete with common system bindings like `Ctrl+Space`.

## Multi-User Login Practice
- Keep the guest login path intact; do not repurpose it when adding switch-user auth.
- Treat remote login responses as a contract: only JSON `{ ok: true }` counts as success.
- Prefer the server-returned `username` for UI state after login, and keep the active user name/avatar in app-level state so menus and labels stay in sync.
- When using cross-origin login, require `credentials: "include"` and rely on the server to set the session cookie with the proper CORS and `Set-Cookie` headers.
- Do not assume HTML redirects or any `2xx` response means authenticated success.

## Embedding Remote Pages — Caution & Best Practices

- **Caution:** Many external sites intentionally block framing (via `X-Frame-Options` or `Content-Security-Policy`) or require authentication. Do not attempt to bypass those protections with unauthorized proxies or header-stripping — only proceed if you own the target service or have explicit permission.
- **Prefer link behavior when blocked:** If a remote page refuses to load in an iframe (redirects to login or sets `X-Frame-Options: DENY`), expose it as an external link instead of embedding. Use the app registry's `link` entry and place the item in Launchpad rather than the Dock so UX remains clear.
- **If you control the server:** enable embedding safely (Grafana example): set `allow_embedding = true` in `grafana.ini` and, if needed, configure anonymous or token-based access (`[auth.anonymous] enabled = true` for read-only viewers) or use Grafana's signed embed tokens. Also ensure reverse proxies (Cloudflare/nginx) do not inject `X-Frame-Options` headers.
- **Server-side proxy only with permission:** A proxy that authenticates to the target and serves content without frame-blocking headers can work technically, but it carries security and legal risks. Use only for self-hosted services and keep secrets off the client.
- **Alternative UX:** When full embedding isn't possible, consider using panel image renders, snapshots, or opening the dashboard in a new tab/window to preserve functionality without breaking security.
- **UI guideline:** Non-embeddable or external-link apps should not be shown as Dock desktop apps. Prefer placing them in Launchpad or marking them clearly as external links so users understand they open in a browser.

## Dynamic Utility Apps (Launchpad + Spotlight + Desktop Window)

- **Single source of truth for dynamic utilities:** When loading remote utility metadata (for example from `https://o.mkpie.me/api/utilities/status`), avoid independent fetch/mapping logic in multiple components. Prefer a shared hook or shared utility so Launchpad and Spotlight stay in sync.
- **Prefer dynamic entries over static duplicates:** If a utility exists both in static Launchpad config and in dynamic remote data, prioritize dynamic entries in search/list results and dedupe by `id`.
- **Stable utility identity:** Use a distinct id namespace for dynamic items (for example `utility-${key}`) so launch behavior can be routed reliably without colliding with static app ids.
- **Launch behavior contract:** Dynamic utility entries should open inside desktop app windows (iframe content), while regular external links can still open in a browser tab unless explicitly requested otherwise.
- **Avoid stale state clobbering:** For toggles/actions that can happen in quick succession (for example opening a utility while closing Launchpad/Spotlight), use functional state updates (`setState(prev => ...)`) instead of snapshot-based updates.
- **Window layering and clickability:** Render utility windows in the same desktop window layer/container as other app windows. Do not place them in a separate overlay container that can break pointer interaction or focus ordering.
- **Window controls parity:** Utility windows should use the same `AppWindow` lifecycle patterns as normal apps (focus, z-index, maximize, minimize, close) so traffic-light controls work consistently.
- **Spotlight launch parity:** Spotlight should use the same utility-open path as Launchpad for dynamic utility entries so behavior is identical regardless of where the user launches from.
- **Debug checklist for "window not clickable" reports:** verify z-index updates on focus, verify the window is in the shared `window-bound` layer, and verify transforms are not being overwritten by stale state updates.

## RSS Blogs Integration

- **Config shape:** Extend `BearMdData` with an optional `content` field to preserve the existing `file`-based contract and avoid breaking Profile/Projects.
- **Loader hook:** Implement `src/hooks/useBearBlogs.ts` using `DOMParser`, a cancellation flag, and graceful fallbacks (mirror `useOmkpieUtilities`).
- **Parsing order:** Prefer `content:encoded` → `description` → fallback text when mapping RSS items.
- **Sanitization:** Strip or convert embedded HTML to safe plaintext/Markdown before rendering in the Bear pane; never inject raw HTML.
- **Image URLs:** Rewrite relative GitHub raw image paths using the repo base URL (see `fixImageURL` in `Bear.tsx`).
- **State sync:** Update `midbarList`, `contentID`, and `contentMd` atomically via functional `setState` to avoid stale selection state.
- **UX resilience:** Provide explicit loading, empty, and error placeholder items for dynamic categories so the UI stays usable when the feed is slow or unavailable.
- **CORS & embedding caution:** Avoid fetching full article pages or embedding remote sites unless you control the origin or use an approved server-side proxy.
- **Performance:** Consider pagination, truncation, or lazy rendering for very large feeds.
- **Stable IDs:** Generate deterministic, namespaced IDs (e.g., `blog-${slug}`) to avoid collisions and preserve indices across updates.
- **Testing:** Add unit tests for XML parsing edge cases and an integration smoke test that simulates an unreachable feed.
- **UX expectation:** Distinguish inline RSS previews from full external articles and keep the external link visible.

## Quick Verification Steps

- **Lint:** `pnpm lint`
- **Dev server:** `pnpm dev` and open the Bear app.
- **Verify:** Profile and Projects unchanged; Blogs appears as the third sidebar; clicking a blog item renders the RSS-derived preview and external link.
- **Negative test:** Change the RSS URL to an invalid host and confirm the Blogs placeholder/error item is shown and the app remains stable.


## Good Places To Check
- Setup and usage details: [README.md](README.md)
- Package scripts and tool versions: [package.json](package.json)
- Styles and visual system: [src/styles/](src/styles/)
- App configuration data: [src/configs/](src/configs/)
