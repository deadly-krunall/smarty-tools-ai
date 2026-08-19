import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageBubble, type ChatEntry } from "@/components/ChatMessageBubble";
import { askAgent } from "@/lib/agent.functions";

const EXAMPLES = [
  "What is 25 × 16?",
  "What's the weather in Ratnagiri?",
  "Count the words in: Hello, how are you?",
  "Convert 100 USD to INR",
  "Divide 10 by 0",
];

export function AgentChat() {
  const ask = useServerFn(askAgent);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) {
      if (!message) setError("Please type a message first.");
      return;
    }
    setError(null);
    setInput("");
    const history = entries.map((e) => ({ role: e.role, content: e.content }));
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: message },
    ]);
    setLoading(true);

    try {
      const result = await ask({ data: { message, history } });
      setEntries((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          toolName: result.toolName,
          toolArgs: result.toolArgs,
          toolResult: result.toolResult,
        },
      ]);
    } catch {
      setError("Something went wrong while answering. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[min(80vh,780px)] flex-col overflow-hidden rounded-2xl border border-border bg-secondary/40 shadow-lg">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Conversation</p>
          <p className="text-xs text-muted-foreground">
            The agent always routes your request through a tool.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEntries([]);
            setError(null);
          }}
          disabled={loading || entries.length === 0}
        >
          <RotateCcw className="size-4" />
          Clear
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {entries.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Try one of these to see the tool-calling flow:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => send(example)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {entries.map((entry) => (
          <ChatMessageBubble key={entry.id} entry={entry} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Thinking and calling the right tool…
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about math, weather, text or currency…"
          aria-label="Message"
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
