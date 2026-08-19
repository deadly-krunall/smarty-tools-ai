import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AskInput = z.object({
  message: z.string(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});

/** Client entry point for one agent turn. */
export const askAgent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const message = data.message.trim();
    if (!message) {
      return {
        answer: "Please type a message first.",
        toolName: null,
        toolArgs: null,
        toolResult: null,
      };
    }
    const { runAgent } = await import("@/agent/agent.server");
    return await runAgent(message, data.history);
  });
