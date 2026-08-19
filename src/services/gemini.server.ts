/**
 * Gemini chat-completions client (server-only).
 *
 * Uses GEMINI_API_KEY against Google's OpenAI-compatible endpoint when
 * available, and otherwise falls back to the built-in Lovable AI gateway so the
 * demo keeps working without any key configuration.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?:
    | Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>
    | undefined;
  tool_call_id?: string | undefined;
}

interface ChatChoice {
  message: {
    content?: string | null;
    tool_calls?: Array<{
      id: string;
      type: "function";
      function: { name: string; arguments: string };
    }>;
  };
}

export interface ChatCompletion {
  choices?: ChatChoice[];
}

export function geminiConfig() {
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (geminiKey) {
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${geminiKey}`,
      },
      model: "gemini-2.5-flash",
    };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    return {
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
      },
      model: "google/gemini-3.7-flash",
    };
  }

  return null;
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools: unknown[],
): Promise<{ ok: true; data: ChatCompletion } | { ok: false; error: string }> {
  const config = geminiConfig();
  if (!config) {
    return {
      ok: false,
      error: "The AI is not configured yet. Please set GEMINI_API_KEY and try again.",
    };
  }

  let response: Response;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify({ model: config.model, messages, tools }),
    });
  } catch {
    return { ok: false, error: "I could not reach the AI service. Please try again." };
  }

  if (!response.ok) {
    if (response.status === 429) {
      return { ok: false, error: "The AI is busy right now — please wait a moment and retry." };
    }
    if (response.status === 402 || response.status === 403) {
      return { ok: false, error: "AI usage is currently unavailable for this project." };
    }
    if (response.status === 401) {
      return { ok: false, error: "The AI key is missing or invalid. Please check GEMINI_API_KEY." };
    }
    return { ok: false, error: "The AI service returned an error. Please try again." };
  }

  try {
    return { ok: true, data: (await response.json()) as ChatCompletion };
  } catch {
    return { ok: false, error: "The AI returned an unexpected response. Please try again." };
  }
}
