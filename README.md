# ToolPilot — Gemini Tool-Calling AI Agent

ToolPilot is a production-ready, single-page chat app that demonstrates **real AI tool use**. Ask it to calculate, check the weather, convert currency, or analyze text — and it never answers from memory. Instead, Google Gemini picks the right tool, the app executes it, and Gemini transforms the live result into a clear, friendly response.

## Features

- One agent, four independent tools (agent logic and tool logic are fully separated)
- Visible tool indicator above every answer (🔧 / 🌤️ / 📝 / 💱)
- Expandable raw tool input/output for live demos
- Loading states, clear-conversation button, responsive modern UI
- Friendly, non-technical error messages — the app never crashes

## Tools available

| Tool | Icon | Powered by | Capabilities |
| --- | --- | --- | --- |
| Calculator | 🔧 | Local logic | add, subtract, multiply, divide; safe division-by-zero handling |
| Weather | 🌤️ | Open-Meteo (no key) | temperature, conditions, wind speed; city → coordinates (incl. Ratnagiri) |
| Text Utility | 📝 | Local logic | word count, character count (with/without spaces), reverse text |
| Currency Converter | 💱 | Frankfurter (no key) | live conversion between 3-letter currency codes |

## How the AI agent works

1. The user message plus the four function declarations are sent to Gemini.
2. Gemini responds with a **tool call** (name + JSON arguments) instead of an answer.
3. The app executes the tool locally or against a public API.
4. The tool result is sent back to Gemini as a `tool` message.
5. Gemini writes the final user-facing answer, which is rendered with the tool badge.

```
User → Gemini (choose tool) → Tool execution → Gemini (final answer) → UI
```

Code map:

```
src/
  agent/          # system prompt, tool declarations, agent loop
  tools/
    calculator/   # local math
    weather/      # Open-Meteo
    textUtility/  # local text helpers
    currency/     # Frankfurter
  components/     # chat UI
  services/       # Gemini API client (server-only)
  lib/            # server function bridging UI ↔ agent
```

## Setup

```bash
bun install    # or: npm install
```

### Setting GEMINI_API_KEY

1. Create a key at https://aistudio.google.com/apikey
2. Copy `.env.example` to `.env`
3. Fill it in:

```
GEMINI_API_KEY=your_key_here
```

The key is read **only on the server** (`process.env.GEMINI_API_KEY`) and is never sent to the
browser. Never commit a real key. If the app is hosted on Lovable, the built-in Lovable AI gateway
is used automatically when `GEMINI_API_KEY` is not set, so the demo always runs.

## Run the project

```bash
bun run dev      # http://localhost:8080
bun run build    # production build
```

## Example prompts

| Tool | Prompt |
| --- | --- |
| Calculator | `What is 25 × 16?` |
| Calculator (edge case) | `Divide 10 by 0` |
| Weather | `What's the weather in Ratnagiri?` |
| Weather (edge case) | `Weather in Zzzyxville` |
| Text Utility | `Count the words in: Hello, how are you?` |
| Text Utility | `Reverse the word hackathon` |
| Currency | `Convert 100 USD to INR` |
| Currency (edge case) | `Convert 50 ABC to XYZ` |

## Hackathon demo script (2 minutes)

1. Open the app and read the one-line pitch: "the AI never answers these itself — it calls tools."
2. Click `What is 25 × 16?` → point at the 🔧 Calculator badge, answer 400.
3. Click `What's the weather in Ratnagiri?` → 🌤️ badge with live temperature and wind.
4. Click `Count the words in: Hello, how are you?` → 📝 badge, 4 words.
5. Click `Convert 100 USD to INR` → 💱 badge with live rate.
6. Finish with `Divide 10 by 0` → "edge case handled" badge and a friendly explanation.
7. Expand "View raw tool output" once to show the real tool arguments and result.
