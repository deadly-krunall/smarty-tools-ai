import { TOOL_META } from "@/agent/tools";

export interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolName?: string | null;
  toolArgs?: string | null;
  toolResult?: string | null;
}

/** One chat bubble, with the tool badge shown above assistant answers. */
export function ChatMessageBubble({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";
  const meta = entry.toolName ? TOOL_META[entry.toolName] : undefined;
  const isErrorResult = Boolean(entry.toolResult?.startsWith("Error:"));

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      {!isUser && meta && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground ring-1 ring-border">
            <span aria-hidden>{meta.icon}</span>
            {meta.label}
          </span>
          {isErrorResult && (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              edge case handled
            </span>
          )}
        </div>
      )}

      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm"
            : "max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-relaxed text-card-foreground shadow-sm"
        }
      >
        {entry.content}
      </div>

      {!isUser && entry.toolResult && (
        <details className="max-w-[85%] text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none hover:text-foreground">
            View raw tool output
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] whitespace-pre-wrap">
            {entry.toolArgs ? `input: ${entry.toolArgs}\n` : ""}
            {`output: ${entry.toolResult}`}
          </pre>
        </details>
      )}
    </div>
  );
}
