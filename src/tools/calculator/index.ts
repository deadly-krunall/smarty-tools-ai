/**
 * Calculator tool — pure local logic, no network calls.
 * Supports +, -, *, / on two numbers (and simple expressions).
 */

export type CalcOperation = "add" | "subtract" | "multiply" | "divide";

export interface CalculatorInput {
  operation?: string;
  a?: number | string;
  b?: number | string;
  expression?: string;
}

const SYMBOL_TO_OP: Record<string, CalcOperation> = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "x": "multiply",
  "×": "multiply",
  "/": "divide",
  "÷": "divide",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[, ]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Parses a very simple two-operand expression such as "25 × 16". */
function parseExpression(raw: string): { a: number; b: number; operation: CalcOperation } | null {
  const match = raw
    .replace(/[, ]/g, "")
    .match(/^(-?\d+(?:\.\d+)?)([+\-*x×/÷])(-?\d+(?:\.\d+)?)$/i);
  if (!match) return null;
  const operation = SYMBOL_TO_OP[match[2].toLowerCase()];
  if (!operation) return null;
  return { a: Number(match[1]), b: Number(match[3]), operation };
}

export function runCalculator(input: CalculatorInput): string {
  let operation = (input.operation ?? "").toLowerCase().trim();
  let a = toNumber(input.a);
  let b = toNumber(input.b);

  // Fall back to parsing a raw expression when structured args are missing.
  if ((a === null || b === null || !operation) && typeof input.expression === "string") {
    const parsed = parseExpression(input.expression);
    if (parsed) {
      a = parsed.a;
      b = parsed.b;
      operation = parsed.operation;
    }
  }

  if (SYMBOL_TO_OP[operation]) operation = SYMBOL_TO_OP[operation];

  if (a === null || b === null) {
    return "Error: I could not read two valid numbers from that request. Please give a simple calculation such as 25 * 16.";
  }

  switch (operation) {
    case "add":
      return `${a} + ${b} = ${format(a + b)}`;
    case "subtract":
      return `${a} - ${b} = ${format(a - b)}`;
    case "multiply":
      return `${a} × ${b} = ${format(a * b)}`;
    case "divide":
      if (b === 0) {
        return "Error: division by zero is not possible, so this calculation has no answer.";
      }
      return `${a} ÷ ${b} = ${format(a / b)}`;
    default:
      return "Error: unsupported operation. I can add, subtract, multiply and divide.";
  }
}

function format(value: number): string {
  if (!Number.isFinite(value)) return "undefined";
  return String(Math.round(value * 1e10) / 1e10);
}
