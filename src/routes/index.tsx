import { createFileRoute } from "@tanstack/react-router";

import { AgentChat } from "@/components/AgentChat";
import { TOOL_META } from "@/agent/tools";

const TITLE = "ToolPilot — Gemini Tool-Calling AI Agent";
const DESCRIPTION =
  "A single-page AI agent that routes every request to the right tool: calculator, live weather, text utilities and currency conversion.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TOOL_CARDS = [
  { key: "calculator", desc: "Add, subtract, multiply, divide — with safe division-by-zero handling." },
  { key: "weather", desc: "Live current weather from Open-Meteo, no API key needed." },
  { key: "text_utility", desc: "Word count, character counts and text reversal." },
  { key: "currency_converter", desc: "Live rates from the Frankfurter exchange-rate API." },
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Gemini function calling
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ToolPilot AI Agent
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            One agent, four tools. The AI never answers these questions itself — it picks a tool,
            runs it, and then explains the result in plain language.
          </p>
        </header>

        <section className="mb-8 grid gap-3 sm:grid-cols-2">
          {TOOL_CARDS.map((card) => {
            const meta = TOOL_META[card.key]!;
            return (
              <article
                key={card.key}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <span aria-hidden>{meta.icon}</span>
                  {meta.label}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>
              </article>
            );
          })}
        </section>

        <AgentChat />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Tool selection is shown above every answer, and raw tool output is one click away.
        </p>
      </div>
    </main>
  );
}
