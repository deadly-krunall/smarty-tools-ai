<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent Guide — ToolPilot

## Project overview

ToolPilot is a single-page TanStack Start app that demonstrates real AI tool-calling. The UI is a chat interface; every domain-specific request is answered by a tool (Calculator, Weather, Text Utility, or Currency Converter), not by the model's internal knowledge.

## Stack & conventions

- **Framework:** TanStack Start v1 with file-based routing (`src/routes/`)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 via `src/styles.css`
- **Runtime:** Edge/Worker target — avoid Node-only APIs and packages
- **AI:** Google Gemini via `src/services/gemini.server.ts` (server-only)
- **Tools:** `src/tools/{calculator,currency,textUtility,weather}/`
- **UI components:** `src/components/AgentChat.tsx`, `src/components/ChatMessageBubble.tsx`

## Safe change rules

1. Keep `src/routes/__root.tsx`, `src/router.tsx`, and `src/routes/index.tsx` intact.
2. Never add `src/pages/` or `App.tsx`; new pages go under `src/routes/`.
3. `createServerFn` and server-only helpers live in `src/lib/` or `src/services/`; never leak `GEMINI_API_KEY` or `LOVABLE_API_KEY` to the browser.
4. Tool logic and UI logic stay separate; add new tools under `src/tools/<name>/`.
5. Run `bun run build` after meaningful changes to catch Worker-runtime issues.

## Useful commands

```bash
bun install      # install dependencies
bun run dev      # local dev server at http://localhost:8080
bun run build    # production build
bun run lint     # run ESLint
bun run format   # run Prettier
```
