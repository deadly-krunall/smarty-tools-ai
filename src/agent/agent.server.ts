/**
 * The agent loop: Gemini chooses a tool -> we execute it -> the tool result is
 * sent back to Gemini -> Gemini writes the final natural-language answer.
 */
import { chatCompletion, type ChatMessage } from "@/services/gemini.server";
import { TOOL_DECLARATIONS, executeTool } from "@/agent/tools";

const SYSTEM_PROMPT = `You are a tool-calling assistant with exactly four tools: calculator, weather, text_utility and currency_converter.

Rules:
- NEVER answer a math, weather, text-analysis or currency question from your own knowledge. You MUST call the matching tool.
- Call exactly one tool per user request when a tool applies.
- After the tool returns, explain the result in one or two short, friendly sentences.
- If the tool result starts with "Error:", explain the problem kindly in plain language and suggest what the user can try instead. Never show raw technical detail.
- If no tool applies (e.g. greetings), reply briefly and mention what you can help with.`;

export interface AgentTurn {
  answer: string;
  toolName: string | null;
  toolArgs: string | null;
  toolResult: string | null;
}

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export async function runAgent(userMessage: string, history: HistoryTurn[]): Promise<AgentTurn> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-8).map((turn) => ({ role: turn.role, content: turn.content }) as ChatMessage),
    { role: "user", content: userMessage },
  ];

  // Step 1: let the model decide which tool to call.
  const first = await chatCompletion(messages, TOOL_DECLARATIONS as unknown as unknown[]);
  if (!first.ok) {
    return { answer: first.error, toolName: null, toolArgs: null, toolResult: null };
  }

  const choice = first.data.choices?.[0]?.message;
  const call = choice?.tool_calls?.[0];

  if (!call) {
    return {
      answer:
        choice?.content?.trim() ||
        "I wasn't sure how to help with that. Try asking me a calculation, the weather, a text question, or a currency conversion.",
      toolName: null,
      toolArgs: null,
      toolResult: null,
    };
  }

  // Step 2: execute the selected tool locally / via a public API.
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
  } catch {
    args = {};
  }
  const toolResult = await executeTool(call.function.name, args);

  // Step 3: send the tool result back so Gemini writes the final answer.
  const second = await chatCompletion(
    [
      ...messages,
      { role: "assistant", content: choice?.content ?? null, tool_calls: choice?.tool_calls },
      { role: "tool", tool_call_id: call.id, content: toolResult },
    ],
    TOOL_DECLARATIONS as unknown as unknown[],
  );

  const finalAnswer = second.ok
    ? second.data.choices?.[0]?.message?.content?.trim() || toolResult
    : toolResult;

  return {
    answer: finalAnswer,
    toolName: call.function.name,
    toolArgs: JSON.stringify(args),
    toolResult,
  };
}
