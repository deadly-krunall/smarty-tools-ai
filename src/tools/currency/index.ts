/**
 * Currency converter tool — Frankfurter API (no API key required).
 */

export interface CurrencyInput {
  amount?: number | string;
  from?: string;
  to?: string;
}

export async function runCurrency(input: CurrencyInput): Promise<string> {
  const amount = typeof input.amount === "string" ? Number(input.amount) : input.amount;
  const from = (input.from ?? "").toUpperCase().trim();
  const to = (input.to ?? "").toUpperCase().trim();

  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
    return "Error: currency codes must be three letters, such as USD or INR.";
  }
  if (amount === undefined || !Number.isFinite(amount) || amount <= 0) {
    return "Error: please provide a positive amount to convert.";
  }
  if (from === to) {
    return `${amount} ${from} = ${amount} ${to} (same currency).`;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`,
    );
    if (!response.ok) {
      return `Error: I could not get a rate for ${from} → ${to}. One of the currency codes may not be supported.`;
    }
    const data = (await response.json()) as { rates?: Record<string, number>; date?: string };
    const rate = data.rates?.[to];
    if (typeof rate !== "number") {
      return `Error: no exchange rate is available for ${from} → ${to}.`;
    }
    const converted = Math.round(amount * rate * 100) / 100;
    return `${amount} ${from} = ${converted} ${to} (rate ${rate}${data.date ? `, as of ${data.date}` : ""}).`;
  } catch {
    return "Error: the currency service could not be reached. Please try again shortly.";
  }
}
