/**
 * Text / word utility tool — pure local logic.
 * Supports word count, character counts and reversing text.
 */

export interface TextUtilityInput {
  operation?: string;
  text?: string;
}

export function runTextUtility(input: TextUtilityInput): string {
  const text = typeof input.text === "string" ? input.text : "";
  const operation = (input.operation ?? "").toLowerCase().trim();

  if (!text.trim()) {
    return "Error: there was no text to analyse. Please include the text you want me to work on.";
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;

  switch (operation) {
    case "word_count":
      return `The text has ${words.length} word${words.length === 1 ? "" : "s"}.`;
    case "character_count":
      return `The text has ${withSpaces} characters including spaces and ${withoutSpaces} characters excluding spaces.`;
    case "reverse":
      return `Reversed text: ${[...text].reverse().join("")}`;
    default:
      // Unknown operation: return everything useful instead of failing.
      return [
        `Words: ${words.length}`,
        `Characters (with spaces): ${withSpaces}`,
        `Characters (without spaces): ${withoutSpaces}`,
        `Reversed: ${[...text].reverse().join("")}`,
      ].join(" | ");
  }
}
