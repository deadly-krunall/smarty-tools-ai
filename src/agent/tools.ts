/**
 * Tool registry + function declarations shared by the agent.
 * The agent NEVER answers domain questions itself — it picks a tool from here.
 */
import { runCalculator } from "@/tools/calculator";
import { runCurrency } from "@/tools/currency";
import { runTextUtility } from "@/tools/textUtility";
import { runWeather } from "@/tools/weather";

export interface ToolMeta {
  name: string;
  label: string;
  icon: string;
}

/** Display metadata used by the UI to show which tool ran. */
export const TOOL_META: Record<string, ToolMeta> = {
  calculator: { name: "calculator", label: "Calculator tool", icon: "🔧" },
  weather: { name: "weather", label: "Weather tool", icon: "🌤️" },
  text_utility: { name: "text_utility", label: "Text Utility", icon: "📝" },
  currency_converter: { name: "currency_converter", label: "Currency Converter", icon: "💱" },
};

/** OpenAI-compatible function declarations sent to Gemini. */
export const TOOL_DECLARATIONS = [
  {
    type: "function",
    function: {
      name: "calculator",
      description:
        "Perform arithmetic: addition, subtraction, multiplication or division of two numbers. Use for any math question.",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            description: "One of: add, subtract, multiply, divide",
          },
          a: { type: "number", description: "First number" },
          b: { type: "number", description: "Second number" },
        },
        required: ["operation", "a", "b"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weather",
      description:
        "Get the current weather (temperature, conditions, wind speed) for a city. Use for any weather question.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. Ratnagiri" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "text_utility",
      description:
        "Analyse or transform text: count words, count characters, or reverse text. Use for any text/word question.",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            description: "One of: word_count, character_count, reverse",
          },
          text: { type: "string", description: "The exact text to process" },
        },
        required: ["operation", "text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "currency_converter",
      description:
        "Convert an amount of money from one currency to another using live exchange rates.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Amount to convert" },
          from: { type: "string", description: "3-letter source currency code, e.g. USD" },
          to: { type: "string", description: "3-letter target currency code, e.g. INR" },
        },
        required: ["amount", "from", "to"],
      },
    },
  },
] as const;

/** Executes a tool by name. Always resolves to a string (never throws). */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "calculator":
        return runCalculator(args);
      case "weather":
        return await runWeather(args);
      case "text_utility":
        return runTextUtility(args);
      case "currency_converter":
        return await runCurrency(args);
      default:
        return `Error: unknown tool "${name}".`;
    }
  } catch {
    return `Error: the ${name} tool failed unexpectedly.`;
  }
}
